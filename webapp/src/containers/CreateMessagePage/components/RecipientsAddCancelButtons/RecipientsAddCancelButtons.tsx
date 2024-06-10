import CheckIcon from '@mui/icons-material/Check';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import { Button, Text } from '../../../../components';
import './RecipientsAddCancelButtons.scss';

interface Props {
  onCancel: () => void;
  editMode: boolean;
  disabled?: boolean;
}

const RecipientsAddCancelButtons: React.FC<Props> = ({ onCancel, editMode, disabled }) => (
  <div className="recipientsAddCancelButtons">
    <Button className="tertiary addCancelButton" onClick={onCancel}>
      {!editMode && <ChevronLeftIcon />}
      <Text className="textButton">{editMode ? 'Avbryt endring' : 'Tilbake til valg av kilde'}</Text>
    </Button>

    <Button className="secondary addCancelButton" type="submit" disabled={disabled ? disabled : false}>
      <Text className="textButton">{editMode ? 'Endre gruppen' : 'Legg til gruppen'}</Text>
      <CheckIcon />
    </Button>
  </div>
);

export default RecipientsAddCancelButtons;
