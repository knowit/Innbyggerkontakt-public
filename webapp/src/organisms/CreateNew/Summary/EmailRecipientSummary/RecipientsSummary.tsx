import store from 'contexts/store';
import { Bulletin, RecipientsKart } from 'models';
import { useEffect, useState } from 'react';

import FilterItem from 'containers/CreateMessagePage/containers/components/FilterItem/FilterItem';
import { getEventFilter } from 'containers/CreateMessagePage/containers/SelectRecipients/eventUtil';
import { getRecipientFilters } from 'containers/CreateMessagePage/util';

import {
  getFilterItemContent,
  getRecipientsIsEmptyValue,
} from 'containers/CreateMessagePage/containers/SelectRecipients/searchUtil';

import SummaryItem from 'molecules/CreateNew/SummaryItem/SummaryItem';
import { SummaryProps } from 'organisms/CreateNew/Summary/types';

import { MapSummary } from 'components/MapSummary/MapSummary';
import './RecipientSummary.scss';

export const RecipientsSummary: React.FC<SummaryProps> = ({ changeSummaryStep, setSummaryStepIsFinished }) => {
  const currentBulletin = store.currentBulletin;

  const [finished, setFinished] = useState<boolean>(false);
  const recipientFilters = currentBulletin?.recipients ? getRecipientFilters(currentBulletin?.recipients) : [];

  useEffect(() => {
    if (currentBulletin) {
      setFinished(!getRecipientsIsEmptyValue(currentBulletin.recipients as Bulletin['recipients']));
      setSummaryStepIsFinished?.(!getRecipientsIsEmptyValue(currentBulletin.recipients as Bulletin['recipients']));
    }

    return () => {
      setFinished(false);
      setSummaryStepIsFinished?.(false);
    };
  }, [finished, currentBulletin]);

  return (
    <SummaryItem overskrift="Mottakere" finished={finished} buttonProps={{ onClick: changeSummaryStep }}>
      {recipientFilters &&
        recipientFilters.map((filter, i) => (
          <FilterItem
            key={i}
            filterContent={
              currentBulletin?.channel.type === 'search' ? (
                filter.recipientFilter === 'kart' ? (
                  <MapSummary filter={filter as RecipientsKart} />
                ) : (
                  getFilterItemContent(filter)
                )
              ) : (
                getEventFilter(currentBulletin as Bulletin)
              )
            }
          />
        ))}
    </SummaryItem>
  );
};

export default RecipientsSummary;
