"""
Freg search integration.

Exports
-------
FregService(bulletin_id: str, organization_id: str, municipality_number: str,
            span_context_header: str, bulletin_type: str)
    A service to interact with freg
"""
from datetime import datetime
from typing import List

import pytz
from innbyggerkontakt import common

import freg_config
from models import freg_model, query_model
from services import gcp_client
from services.freg import freg_client, query_generator
from services.freg.filters import filter_function


class FregService:
    """
    Used to search and process freg data.

    Attributes
    ----------
    municipality_number: str
        The municipality_number used in freg queries
    bulletin_type: str
        The current bulletin type, "search|event"

    Methods
    -------
    search(queries: List[query_model.Query, freg_identifier: List[str] = None)
        Search freg for queries
    """

    def __init__(
        self,
        bulletin_id: str,
        organization_id: str,
        municipality_number: str,
        bulletin_type: query_model.BulletinType = None,
    ):
        """
        __init__.

        Parameters
        ----------
        bulletin_id: str
            The current bulletin being processed
        organization_id: str
            The organization making the request
        municipality_number: str
            The municipality number of the organization
        bulletin_type: str
            The current bulletin type, "search|event"
        """
        self.municipality_number = municipality_number
        self.bulletin_type = bulletin_type
        self.__freg_client = freg_client.FregClient(organization_id)
        self.__gcp_client = gcp_client.GcpClient(organization_id, bulletin_id)

    def __get_parent(
        self, children: List[freg_model.Person]
    ) -> List[freg_model.Person]:
        parents_identifiers = [
            parent.responsible
            for sublist in [
                child.freg_person.parental_responsibility for child in children
            ]
            for parent in sublist
            if parent.are_ruling
        ]
        return self.__freg_client.get_person_info(
            [identifier for identifier in parents_identifiers if identifier], {'navn'}
        )

    def __process_extraction_result(
        self,
        queries: List[query_model.Query],
        extract_result: List[str],
        use_oppholdsadresse: bool = False,
    ) -> List[freg_model.Person]:
        parts = {
            part for query in queries for part in query.get_needed_parts_for_filter()
        }
        if False in [query.find_parent for query in queries]:
            parts.add('navn')
        if use_oppholdsadresse and 'bostedsadresse' in parts:
            parts.add('oppholdsadresse')
            parts.remove('bostedsadresse')

        freg_persons = self.__freg_client.get_person_info(extract_result, parts)
        filtered_result = [
            list(
                filter(
                    lambda person, ff=freg_filter: filter_function(person, ff),
                    freg_persons,
                )
            )
            for freg_filter in queries
        ]
        query_result = []
        for query, result in zip(queries, filtered_result):
            if not query.find_parent:
                query_result.append((query, result))
            else:
                query_result.append((query, self.__get_parent(result)))
        return query_result

    def __handle_status(self, metadata: dict, complete_list: list):
        if self.bulletin_type == query_model.BulletinType.SEARCH:
            self.__gcp_client.upload_metadata(metadata)
            for index, batch in enumerate(
                common.divide_list(complete_list, freg_config.FREG_BATCH_SIZE)
            ):
                self.__gcp_client.upload_persons(index, batch)
            self.__gcp_client.publish_status(
                bulletin_type=self.bulletin_type, hits=len(complete_list)
            )
        elif self.bulletin_type == query_model.BulletinType.EVENT:
            for person in complete_list:
                self.__gcp_client.publish_status(
                    bulletin_type=self.bulletin_type,
                    person=person.convert_to_storage(),
                )

        self.__gcp_client.outcome(len(complete_list))

    def search(
        self,
        queries: List[query_model.Query],
        freg_identifier: List[str] = None,
        dry_run=False,
    ):
        """
        Search freg for queries.

        Parameters
        ----------
        queries: List[query_model.Query]
            Queries used to filter freg data
        freg_identifier: List[str], optional
            A list of freg identifiers. If present filter these freg identifiers by queries
            instead of querying freg for identifiers (default is None)
        dry_run: bool
            If True, not post pubsub messages (default is None)

        Returns
        -------
        dict
            A dictionary of metadata: {
                "query_date": str,
                "hits": int,
                "queries": List[{'result': int, 'query': query_model.Query}]
            }
        """
        extract_result = freg_identifier or self.__freg_client.extract(
            query_generator.get_query_for_freg(queries, self.municipality_number)
        )
        query_result = self.__process_extraction_result(queries, extract_result)
        queries_including_residing = [
            query for query in queries if query.include_residing_address
        ]
        if queries_including_residing and not freg_identifier:
            extract_result = self.__freg_client.extract(
                query_generator.get_query_for_freg(
                    queries_including_residing,
                    self.municipality_number,
                    residing_address=True,
                )
            )
            residing_query_result = self.__process_extraction_result(
                queries_including_residing, extract_result, use_oppholdsadresse=True
            )
            for query, result in residing_query_result:
                query_result[[query for query, result in query_result].index(query)][
                    1
                ].extend(result)
        complete_list = [person for query, result in query_result for person in result]
        total = len(complete_list)
        complete_list = list(set(complete_list))
        tz = pytz.timezone('Europe/Oslo')
        metadata = {
            'query_date': tz.localize(datetime.now()).isoformat(),
            'hits': len(complete_list),
            'queries': [
                {'result': len(result), 'query': query.dict()}
                for query, result in query_result
            ],
        }
        print(f'Found {total} with {total - len(complete_list)} duplicates for a final')
        print(f'result of {len(complete_list)}')

        if not dry_run:
            self.__handle_status(metadata, complete_list)
        return metadata
