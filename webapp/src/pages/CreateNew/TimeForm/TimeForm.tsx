import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router';

import { PopUpContext, StoreContext } from '../../../contexts';
import { Bulletin, BulletinExecution } from '../../../models';

import { ButtonLineContainer, Loader } from '../../../components';
import { CreateMessageError, NavigationButton } from '../../../containers/CreateMessagePage/components';

import { ErrorMessage } from 'innbyggerkontakt-design-system';

import './TimeForm.scss';
import TimeFormEvent from './TimeFormEvent';
import TimeFormSearch from './TimeFormSearch';

interface Props {
  onClickNext: () => void;
}

const TimeForm: React.FC<Props> = ({ onClickNext }) => {
  const { setPopUp } = useContext(PopUpContext);
  const store = useContext(StoreContext);
  const navigate = useNavigate();
  const currentBulletin = store.currentBulletin;
  const dbAccess = store.dbAccess;
  const currentBulletinId = store.currentBulletinId;
  const bulletinChannelType = currentBulletin?.channel.type;
  //const [option, setOption] = useState<string>('instant');
  const [send, setSend] = useState<BulletinExecution['type']>('schedule');

  const [executionDate, setExecutionDate] = useState<Date | undefined>(undefined);
  const [scheduleTime, setScheduleTime] = useState<Date | null>(null);

  const [buttonDisabled, setButtonDisabled] = useState<boolean>(true);
  const [showError, setShowError] = useState<boolean>(false);

  useEffect(() => {
    if (currentBulletin?.execution?.datetime) {
      setExecutionDate(new Date(currentBulletin?.execution?.datetime));
      setScheduleTime(new Date(currentBulletin?.execution?.datetime));
      if (currentBulletin.execution.type) {
        setSend(currentBulletin.execution.type);
      } else {
        setSend('schedule');
      }
    } else {
      const now = new Date();
      now.getMinutes() === 0 // round up to closest whole hour (?)
        ? (setScheduleTime(now), setExecutionDate(now))
        : (now.setHours(now.getHours() + 1), now.setMinutes(0), setScheduleTime(now), setExecutionDate(now));
    }
  }, []);

  useEffect(() => {
    if (scheduleTime && executionDate && scheduleTime.toString() !== 'Invalid Date') {
      executionDate.setHours(scheduleTime.getHours());
      executionDate.setMinutes(scheduleTime.getMinutes());
      new Date() > executionDate && send !== 'instant'
        ? (setButtonDisabled(true), setShowError(true))
        : (setButtonDisabled(false), setShowError(false));
    } else {
      setButtonDisabled(true);
    }
  }, [scheduleTime, executionDate, send]);

  const postBulletin = () => {
    if (currentBulletin && bulletinChannelType) {
      const currentExecution = currentBulletin.execution;
      const immediately = new Date().toISOString();
      const execution: BulletinExecution = {
        ...currentExecution,
        type: send,
        //delay: option === 'delay' ? (data.delayDropdown as OptionType).value : undefined,
        datetime:
          bulletinChannelType === 'search'
            ? executionDate?.toISOString()
            : send === 'instant'
            ? immediately
            : executionDate?.toISOString(),
      };
      const bulletin: Bulletin = {
        ...currentBulletin,
        execution,
      };
      store.setBulletin(bulletin);
      if (currentBulletinId) {
        dbAccess.persistBulletin(bulletin, currentBulletinId);
      }
    }
    onClickNext();
  };

  const post = () => {
    dbAccess
      .checkForPotentialOverwrite(currentBulletinId)
      .then(() => postBulletin())
      .catch((reason: string) =>
        setPopUp(<CreateMessageError popUpMessage={reason} onPopUpAccept={() => navigate('/oversikt')} />),
      );
  };

  return (
    <form
      className="timeForm"
      onSubmit={(event) => {
        post();
        event.preventDefault();
      }}
    >
      {bulletinChannelType ? (
        bulletinChannelType === 'event' ? (
          <TimeFormEvent
            send={send}
            setSend={setSend}
            executionDate={executionDate}
            setExecutionDate={setExecutionDate}
            scheduleTime={scheduleTime}
            setScheduleTime={setScheduleTime}
          />
        ) : (
          <TimeFormSearch
            executionDate={executionDate}
            setExecutionDate={setExecutionDate}
            scheduleTime={scheduleTime}
            setScheduleTime={setScheduleTime}
          />
        )
      ) : (
        <Loader />
      )}
      {/*TODO: bytte ut med NavigationButton når branchen feature/design_create-auto_save blir merga inn*/}
      <ButtonLineContainer style={{ marginBottom: '50px' }}>
        <NavigationButton />
      </ButtonLineContainer>
      {showError && buttonDisabled && (
        <ErrorMessage
          color={'error'}
          errorTitle={'Ugyldig tidspunkt'}
          errorMessage={'Tidspunktet for utsendelsen må være senere enn nåværende tidspunkt'}
          onClose={() => setShowError((showError) => !showError)}
        />
      )}
    </form>
  );
};

export default TimeForm;
