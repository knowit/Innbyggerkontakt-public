import CloseIcon from '@mui/icons-material/Close';
import { Text } from '../..';
import './../ImageUploader.scss';

interface Props extends React.InputHTMLAttributes<HTMLInputElement> {
  onClick: () => void;
}

export const UploadButton: React.FC<Props> = ({ onClick }) => {
  return (
    <div className="closeImageButton" onClick={onClick}>
      <Text className="textPlaceholder">Fjern bildet</Text>
      <CloseIcon />
    </div>
  );
};

export default UploadButton;
