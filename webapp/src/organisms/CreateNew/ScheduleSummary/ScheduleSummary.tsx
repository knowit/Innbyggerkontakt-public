import store from 'contexts/store';
import { useEffect, useState } from 'react';

import SummaryItem from 'molecules/CreateNew/SummaryItem/SummaryItem';

import { determinIfBulletinDateIsInvalid } from 'containers/CreateMessagePage/util';

import { DateRange } from '@mui/icons-material';
import { SummaryProps } from '../Summary/types';

import './ScheduleSummary.scss';

export const ScheduleSummary: React.FC<SummaryProps> = ({ changeSummaryStep, setSummaryStepIsFinished }) => {
  const currentBulletin = store.currentBulletin;
  const [finished, setFinished] = useState<boolean>(false);

  const [scheduleDateAndTime, setScheduleDateAndTime] = useState<Date | undefined>(undefined);
  const [invalidDate, setInvalidDate] = useState<boolean>(false);
  const timeOptions: Intl.DateTimeFormatOptions = { timeStyle: 'short' };

  useEffect(() => {
    if (currentBulletin?.execution?.type === 'instant' && currentBulletin.execution.datetime) {
      setScheduleDateAndTime(new Date(currentBulletin.execution.datetime));
      setFinished(true);
    } else if (currentBulletin?.execution?.datetime && !determinIfBulletinDateIsInvalid(currentBulletin)) {
      setScheduleDateAndTime(new Date(currentBulletin.execution.datetime));
      setFinished(true);
    } else if (currentBulletin?.execution?.datetime && !(currentBulletin.status === 'draft')) {
      setScheduleDateAndTime(new Date(currentBulletin.execution.datetime));
      setFinished(true);
    } else {
      setInvalidDate(true);
    }
  }, [currentBulletin]);

  useEffect(() => {
    setSummaryStepIsFinished?.(finished);

    return () => {
      setSummaryStepIsFinished?.(finished);
    };
  }, [finished]);

  return (
    <SummaryItem overskrift="Utsendingstidspunkt" finished={finished} buttonProps={{ onClick: changeSummaryStep }}>
      <div className="schedule-summary summaryItemContent">
        <div className="schedule-summary__textContent">
          <DateRange className="schedule-summary__icon" />
          {invalidDate ? (
            !(currentBulletin?.status === 'draft') && scheduleDateAndTime ? (
              <div className="summaryInnerTextBox">
                <p className="regular14">
                  Utsendingen ble sendt ut{' '}
                  {new Date(scheduleDateAndTime).toLocaleDateString('no-NO', { dateStyle: 'short' })}
                  &nbsp; kl. {new Date(scheduleDateAndTime).toLocaleTimeString('no-NO', timeOptions)}
                </p>
              </div>
            ) : (
              <div className="summaryInnerTextBox">
                <p className="regular14">Utsendingstidspunktet er ugyldig, oppdater den til et senere tidspunkt.</p>
              </div>
            )
          ) : scheduleDateAndTime ? (
            <div>
              {currentBulletin?.execution?.type === 'schedule' ? (
                <p className="schedule-summary__send-time">
                  {new Date(scheduleDateAndTime).toLocaleDateString('no-NO', { dateStyle: 'short' })}
                  &nbsp; kl. {new Date(scheduleDateAndTime).toLocaleTimeString('no-NO', timeOptions)}
                </p>
              ) : (
                <p className="schedule-summary__send-time">Utsendingen vil begynne med en gang</p>
              )}
              <p className="schedule-summary__help-text">
                Tidspunktet e-posten vil starte å sendes ut til mottakerne. Det kan ta litt tid før alle har mottatt
                e-posten, opp til en time.
              </p>
            </div>
          ) : (
            <p>Velg tidspunktet du vil meldingen skal sendes.</p>
          )}
        </div>
      </div>
    </SummaryItem>
  );
};

export default ScheduleSummary;
