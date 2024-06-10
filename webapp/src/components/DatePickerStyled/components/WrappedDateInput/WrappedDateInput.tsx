import DateRangeIcon from '@mui/icons-material/DateRange';
import './WrappedDateInput.scss';

interface Props extends React.InputHTMLAttributes<HTMLDivElement> {
  placeholderText?: string;
  dateError?: string;
}

const WrappedDateInput: React.FC<Props> = ({ id, onClick, value, placeholderText, dateError, ...props }) => {
  return (
    <>
      {dateError && <p className="errorMessage regular11">{dateError}</p>}
      <div className={`wrappedDateInput ${dateError ? 'dateError' : ''}`} onClick={onClick}>
        <DateRangeIcon className="calendarIcon" />
        {placeholderText && !value && <p className="datePlaceholderText">{placeholderText}</p>}
        <input id={id} value={value} {...props} />
      </div>
    </>
  );
};

export default WrappedDateInput;
