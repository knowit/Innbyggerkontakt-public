import DateRangeIcon from '@mui/icons-material/DateRange';
import './SummaryInput.scss';

interface Props extends React.InputHTMLAttributes<HTMLDivElement> {
  actionText: string;
  changeText: string;
}

/* custom input component for date selection in the ProgressSummary */
const SummaryInput: React.FC<Props> = ({ onClick, value, changeText, actionText }) => {
  return (
    <div
      role="button"
      tabIndex={0}
      className={`summaryDateInput ${value ? 'summaryDateInput--active' : ''}`}
      onClick={onClick}
    >
      <p>{value ? changeText : actionText}</p>
      <DateRangeIcon className="summaryDateInput--icon" />
    </div>
  );
};

export default SummaryInput;
