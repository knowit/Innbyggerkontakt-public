import InfoCircle from '@mui/icons-material/Info';
import { useContext } from 'react';
import { PopUpContext } from '../../contexts';
import Button from '../Button/Button';
import './StandardPopUp.scss';

interface Props extends React.InputHTMLAttributes<HTMLDivElement>, PopUpData {}

export type PopUpData = {
  popUpMessage?: string;
  popUpHeading?: string;
  onPopUpAccept: () => void;
  onCancel?: () => void;
  acceptButtonText: string;
  cancelButton?: string;
  danger?: boolean;
  icon?: JSX.Element;
};

export const StandardPopUp: React.FC<Props> = ({
  className,
  popUpMessage,
  acceptButtonText,
  cancelButton,
  onCancel,
  onPopUpAccept,
  icon,
  children,
  ...rest
}) => {
  const { clearPopUp } = useContext(PopUpContext);

  return (
    <div className={`popUp ${className || ''}`} {...rest}>
      {icon ? <span className="genericPopUpIcon">{icon}</span> : <InfoCircle className="popUpIcon" />}
      {popUpMessage && <p>{popUpMessage}</p>}
      {children}
      <div className="standard__popUpButtons">
        {cancelButton && (
          <Button
            className="standard__popUpButton tertiary cancel"
            onClick={() => {
              onCancel && onCancel();
              clearPopUp();
            }}
          >
            {cancelButton}
          </Button>
        )}
        <Button
          className="secondary"
          onClick={() => {
            onPopUpAccept();
            clearPopUp();
          }}
        >
          {acceptButtonText}
        </Button>
      </div>
    </div>
  );
};

export default StandardPopUp;
