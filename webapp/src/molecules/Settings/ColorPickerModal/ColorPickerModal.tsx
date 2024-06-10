import { ChromePicker } from 'react-color';
import { Button, Text } from '../../../components';
import './ColorPickerModal.scss';

interface Props extends React.InputHTMLAttributes<HTMLInputElement> {
  colorHexCode: string;
  setColorHexCode: React.Dispatch<React.SetStateAction<string>>;
  open: boolean;
  onSave: () => void;
  cancel: () => void;
  error?: string;
}

export const ColorPickerModal: React.FC<Props> = ({ onSave, cancel, open, colorHexCode, setColorHexCode, error }) => {
  return (
    <>
      {open && (
        <>
          <div className="colorPickerWrapper">
            <div className="colorPickerModal" tabIndex={0}>
              <ChromePicker color={colorHexCode} onChange={(e) => setColorHexCode(e.hex)} disableAlpha />
              <div className="popUpButtons">
                <Button
                  className="primary"
                  onClick={() => {
                    onSave();
                  }}
                >
                  Legg til farge
                </Button>
                <Button
                  className="teriary"
                  onClick={() => {
                    cancel();
                  }}
                >
                  Avbryt
                </Button>
                {error ? <Text className="textError">{error}</Text> : ''}
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default ColorPickerModal;
