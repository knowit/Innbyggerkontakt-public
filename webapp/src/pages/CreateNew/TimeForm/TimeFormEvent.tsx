import { useContext } from 'react';
import { StoreContext } from '../../../contexts';

import { RadioButton, TimeSelectionPicker } from '../../../components';
import DateSelection from '../../../components/DateSelection/DateSelection';
import { CreateMessageHeader } from '../../../containers/CreateMessagePage/components';

import { eventTypeText } from '../../../containers/CreateMessagePage/util';
import { Bulletin, BulletinExecution } from '../../../models';

interface Props {
  send: BulletinExecution['type'];
  setSend: React.Dispatch<React.SetStateAction<BulletinExecution['type']>>;
  executionDate: Date | undefined;
  setExecutionDate: React.Dispatch<React.SetStateAction<Date | undefined>>;
  scheduleTime: Date | null;
  setScheduleTime: React.Dispatch<React.SetStateAction<Date | null>>;
}

const TimeFormEvent: React.FC<Props> = ({
  send,
  setSend,
  executionDate,
  setExecutionDate,
  scheduleTime,
  setScheduleTime,
}) => {
  const store = useContext(StoreContext);
  const currentBulletin = store.currentBulletin;

  return (
    <>
      <CreateMessageHeader title="Tidspunkt" />
      <div className="radioAndTextContainer darkBrightBlue">
        <p className="regular18 descriptionText">
          Vil du velge når meldingen skal starte å sendes til de som {eventTypeText(currentBulletin as Bulletin)}?
        </p>
        <p className="regular14 descriptionText">
          Svarer du nei vil meldingen starte å sendes rett etter du har bekreftet at du er ferdig med meldingen.
        </p>
        <RadioButton
          onChange={(e) => setSend(e.target.value as BulletinExecution['type'])}
          value={'instant'}
          title={'Nei'}
          checked={send === 'instant'}
          className="radioButtonsTimeForm regular18"
        />
        <RadioButton
          onChange={(e) => setSend(e.target.value as BulletinExecution['type'])}
          value={'schedule'}
          title={'Ja'}
          checked={send === 'schedule'}
          className="radioButtonsTimeForm regular18"
        />
        {send === 'schedule' && (
          <div className="dataAndTimeBox">
            <DateSelection
              title={'Dato'}
              showTitle={true}
              date={executionDate}
              onChange={setExecutionDate}
              dateFormat="dd/MM/yyyy"
              minDate={new Date()}
            />
          </div>
        )}
        {send === 'schedule' && (
          <div className="dataAndTimeBox dataAndTimeBox--clock">
            <p className="dataAndTimeBox--title">Klokkeslett</p>
            <TimeSelectionPicker scheduleTime={scheduleTime} setScheduleTime={setScheduleTime} />
          </div>
        )}
      </div>
    </>
  );
};
export default TimeFormEvent;
