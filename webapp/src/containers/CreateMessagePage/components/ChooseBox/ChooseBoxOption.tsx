import DoneIcon from '@mui/icons-material/Done';
import './ChooseBoxOption.scss';

interface ChooseBoxOptionProps {
  text: string;
  active?: boolean;
  checked?: boolean;
  seen?: boolean;
}

export const ChooseBoxOption: React.FC<ChooseBoxOptionProps> = ({ text, active, checked, seen }) => {
  let className = 'chooseBox option';
  if (active) {
    className += ' active';
  }
  if (seen) {
    className += ' seen';
  } else {
    className += ' unseen';
  }
  return (
    <div className={className.toString()}>
      <div className="chooseBox__icon">{checked ? <DoneIcon className="doneIcon" /> : ''}</div>
      <div>{text}</div>
    </div>
  );
};

export default ChooseBoxOption;
