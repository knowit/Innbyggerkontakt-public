import { TimeSelectionPicker } from '../../../components';
import DateSelection from '../../../components/DateSelection/DateSelection';
import { CreateMessageHeader } from '../../../containers/CreateMessagePage/components';

interface Props {
  executionDate: Date | undefined;
  setExecutionDate: React.Dispatch<React.SetStateAction<Date | undefined>>;
  scheduleTime: Date | null;
  setScheduleTime: React.Dispatch<React.SetStateAction<Date | null>>;
}

const TimeFormSearch: React.FC<Props> = ({ executionDate, setExecutionDate, scheduleTime, setScheduleTime }) => {
  return (
    <>
      <CreateMessageHeader title="Tidspunkt" />
      <div className="searchText">
        <p className="regular18 descriptionText">Når vil du at meldingen skal sendes ut?</p>
        <p className="regular14 descriptionText">Tidspunktet kan endres senere</p>
      </div>

      <div className="timeForm--contentWrapper">
        <div className="dataAndTimeBox">
          <DateSelection
            title="Dato"
            date={executionDate}
            onChange={setExecutionDate}
            dateFormat="dd/MM/yyyy"
            minDate={new Date()}
          />
        </div>
        <div className="dataAndTimeBox dataAndTimeBox--clock">
          <p className="dataAndTimeBox--title">Klokkeslett</p>
          <TimeSelectionPicker scheduleTime={scheduleTime} setScheduleTime={setScheduleTime} />
        </div>
      </div>
    </>
  );
};

export default TimeFormSearch;
