import store from 'contexts/store';
import Linkify from 'linkify-react';
import { useEffect, useState } from 'react';

import SummaryItem from 'molecules/CreateNew/SummaryItem/SummaryItem';

import { SummaryProps } from '../types';

import './SMSContentSummary.scss';

const SMSContentSummary: React.FC<SummaryProps> = ({ changeSummaryStep, setSummaryStepIsFinished }) => {
  const currentBulletin = store.currentBulletin;
  const [finished, setFinished] = useState<boolean>(false);

  useEffect(() => {
    if (currentBulletin?.smsContent?.nb) {
      setFinished(true);
      setSummaryStepIsFinished?.(true);
    }

    return () => {
      setFinished(false);
    };
  }, [currentBulletin]);

  return (
    <SummaryItem overskrift="Utseende og innhold" finished={finished} buttonProps={{ onClick: changeSummaryStep }}>
      <div className="smsContentSummary--blue">
        <div className="smsContentSummary__wrapper">
          <Linkify>
            <p className="smsContentSummary__sms">{currentBulletin?.smsContent?.nb}</p>
          </Linkify>
        </div>
      </div>
    </SummaryItem>
  );
};

export default SMSContentSummary;
