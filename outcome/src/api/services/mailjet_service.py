"""Mailjet API service."""
import logging
from datetime import date, datetime, timedelta
from multiprocessing.dummy import Pool

import requests
from api.models.mailjet_response import (
    CampaignOverviewResponse,
    CampaignResponse,
    DateToEvaluate,
    LinkStatisticsResponse,
    StatCounterData,
    StatCounterResponse,
)
from innbyggerkontakt import firebase
from innbyggerkontakt.gcp import utils
from mailjet_rest import Client
from pydantic import ValidationError
from requests import HTTPError


class MailjetService:
    """Mailjet API service."""

    def __init__(self, user: firebase.User):
        self.api_key = utils.get_secret(f'{user.organization_id}_mailjet_key')
        self.api_secret = utils.get_secret(f'{user.organization_id}_mailjet_secret')
        self.mailjet = Client(auth=(self.api_key, self.api_secret))

    def get_campaign_id(self, bulletin_id: str):
        """Return campaign id from mailjet."""
        response = self.mailjet.campaign.get(id=bulletin_id)
        response.raise_for_status()
        campaign_overview = CampaignResponse(**response.json())
        return next(iter(campaign_overview.data)).id

    def get_campaign_statistics(  # noqa: CCR001 bug with try-catch
        self, bulletin_id: str
    ):
        """Return StatCounterData for bulletin."""
        try:
            campaign_id = self.get_campaign_id(bulletin_id)
            filters = {
                'CounterSource': 'Campaign',
                'CounterTiming': 'Message',
                'CounterResolution': 'Lifetime',
                'SourceID': campaign_id,
            }
            response = self.mailjet.statcounters.get(filters=filters)
            response.raise_for_status()

            stats = StatCounterResponse(**response.json())
            response = next(iter(stats.data or []), StatCounterData())
            return response
        except HTTPError as e:
            logging.warning(str(e))
        return StatCounterData()

    def get_campaign_statistics_for_api_key(self):
        """Return List[StatCounterData] for api key."""
        try:
            filters = {
                'CounterSource': 'APIKey',
                'CounterTiming': 'Message',
                'CounterResolution': 'Lifetime',
                'SourceID': self.api_key,
            }
            result = self.mailjet.statcounters.get(filters=filters)
            stats = StatCounterResponse(**result.json())

            return stats.data
        except ValidationError as e:
            logging.warning(e)
            return []

    def get_campaign_statistic_over_time_for_bulletin(
        self,
        bulletin_id: str,
        from_date: datetime,
        to_date: datetime,
        counter_resolution: str,
    ):
        """Return List[StatCounterData] for a buletin."""
        try:
            campaign_id = self.get_campaign_id(bulletin_id)

            filters = {
                'CounterSource': 'Campaign',
                'CounterTiming': 'Message',
                'CounterResolution': counter_resolution,
                'SourceID': campaign_id,
                'FromTS': from_date.strftime('%Y-%m-%dT%H:%M:%S'),
                'ToTS': to_date.strftime('%Y-%m-%dT%H:%M:%S'),
            }

            response = self.mailjet.statcounters.get(filters=filters)
            response.raise_for_status()
            stats = StatCounterResponse(**response.json())
            return stats.data
        except HTTPError as e:
            logging.warning(e)
        return []

    def get_link_statistics(self, bulletin_id: str):
        """Return LinkStatisticsData for a bulletin."""
        try:
            campaign_id = self.get_campaign_id(bulletin_id)
            payload = {'CampaignID': campaign_id}

            response = requests.get(
                'https://api.mailjet.com/v3/REST/statistics/link-click/',
                auth=(self.api_key, self.api_secret),
                params=payload,
            )
            response.raise_for_status()
            stats = LinkStatisticsResponse(**response.json())
            return stats.data
        except HTTPError as e:
            logging.warning(e)
        return []

    def get_campaign_statistic_over_time_for_apikey(
        self, from_date: datetime, to_date: datetime, counter_resolution: str
    ):
        """Return List[StatCounterData] for apikey."""
        try:

            filters = {
                'CounterSource': 'ApiKey',
                'CounterTiming': 'Message',
                'CounterResolution': counter_resolution,
                'FromTS': from_date.strftime('%Y-%m-%dT%H:%M:%S'),
                'ToTS': to_date.strftime('%Y-%m-%dT%H:%M:%S'),
            }

            response = self.mailjet.statcounters.get(filters=filters)
            response.raise_for_status()
            stats = StatCounterResponse(**response.json())
            return stats.data
        except HTTPError as e:
            logging.warning(e)
        return []

    def get_campaign_statistic_over_time_days_from_date(
        self,
        evaluated_object: DateToEvaluate,
    ):
        """Return List[StatCounterData] for between dates."""
        evaluated_date = evaluated_object.date_to_evaluate
        time_delta = evaluated_object.time_delta
        campaign_id = evaluated_object.campaign_id
        if time_delta > 100:
            raise Exception('Mailjet only supports timedelta of 100 days')
        from_date = evaluated_date - timedelta(days=time_delta)
        if campaign_id:
            return self.get_campaign_statistic_over_time_for_bulletin(
                campaign_id, from_date, evaluated_date, 'Day'
            )
        return self.get_campaign_statistic_over_time_for_apikey(
            from_date, evaluated_date, 'Day'
        )

    def get_first_sendt_campaign_date(self):
        """Find date of the first sendt campaign email."""
        campaign_overview = CampaignOverviewResponse(
            **self.mailjet.campaignoverview.get().json()
        ).data
        return date.fromtimestamp(
            min([campaign.send_time_start for campaign in campaign_overview])
        )

    def get_statistcs_for_period(
        self, initial_date: date, to_date: date = date.today(), bulletin_id: str = ''
    ):
        """Return statistics for period for apikey, or given bulletin/campaign id."""
        evaluated_date = to_date
        from_dates = []

        while (evaluated_date - initial_date).days > 0:
            time_delta = (
                (evaluated_date - initial_date).days
                if (evaluated_date - initial_date).days <= 100
                else 100
            )
            from_dates.append(
                DateToEvaluate(
                    date_to_evaluate=evaluated_date,
                    time_delta=time_delta,
                    campaign_id=bulletin_id,
                )
            )
            evaluated_date = evaluated_date - timedelta(days=100)

        thread_pool = Pool(10)

        responses = thread_pool.map(
            self.get_campaign_statistic_over_time_days_from_date, from_dates
        )
        statistics_for_period = [item for sublist in responses for item in sublist]
        return sorted(
            statistics_for_period, key=lambda element: element.timeslice, reverse=True
        )
