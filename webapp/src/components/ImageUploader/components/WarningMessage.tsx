import CloseIcon from '@mui/icons-material/Close';
import { Text } from '../..';
import './../ImageUploader.scss';

interface Props extends React.InputHTMLAttributes<HTMLInputElement> {
  shortMessage: string;
  longMessage: string;
  warning: boolean;
  setMinimized: () => void;
}

export const WarningMessage: React.FC<Props> = ({ shortMessage, longMessage, warning, setMinimized }) => {
  return (
    <>
      <div className={(warning ? '' : 'noDisplay ') + 'messageBoxWarning'}>
        <Text className="textLabel errorTitle">Obs! {shortMessage}</Text>
        <Text className="textObligatory">{longMessage}</Text>
        <CloseIcon className="removeWarningBox" onClick={setMinimized} />
      </div>
    </>
  );
};

export default WarningMessage;
