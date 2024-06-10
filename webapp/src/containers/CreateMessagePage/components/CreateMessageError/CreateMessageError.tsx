import PriorityHighIcon from '@mui/icons-material/PriorityHigh';
import { StandardPopUp } from '../../../../components';
import './CreateMessageError.scss';

interface Props {
  popUpMessage: string;
  onPopUpAccept: () => void;
}

export const CreateMessageError: React.FC<Props> = ({ popUpMessage, onPopUpAccept }) => {
  return (
    <StandardPopUp
      popUpMessage={popUpMessage}
      onPopUpAccept={onPopUpAccept}
      icon={<PriorityHighIcon className="error" />}
      acceptButtonText="Ok"
    />
  );
};

export default CreateMessageError;
