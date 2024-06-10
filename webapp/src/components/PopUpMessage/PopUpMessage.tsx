import { useContext } from 'react';
import { PopUpContext } from '../../contexts';
import PopUpButton from './components/PopUpButton';

import './PopUpMessage.scss';

interface Props extends React.InputHTMLAttributes<HTMLDivElement>, PopUpData {}

type PopUpData = {
  popUpTitle: string;
  popUpMessage?: string;
  popUpHeading?: string;
  onPopUpAccept: () => void;
  onCancel?: () => void;
  acceptButtonText: string;
  cancelButton?: string;
  danger?: boolean;
  icon?: JSX.Element;
};

export const PopUpMessage: React.FC<Props> = ({
  popUpTitle,
  popUpMessage,
  acceptButtonText,
  cancelButton,
  onCancel,
  onPopUpAccept,
  children,
  ...rest
}) => {
  const { clearPopUp } = useContext(PopUpContext);

  return (
    <div className={`popUpMessageContainer`} {...rest}>
      {children}
      <h1>{popUpTitle}</h1>
      <p>{popUpMessage}</p>
      <div>
        {cancelButton && (
          <PopUpButton
            onClick={() => {
              onCancel && onCancel();
              clearPopUp();
            }}
          >
            {cancelButton}
          </PopUpButton>
        )}
        <PopUpButton
          onClick={() => {
            onPopUpAccept();
            clearPopUp();
          }}
        >
          {acceptButtonText}
        </PopUpButton>
      </div>
    </div>
  );
};

export default PopUpMessage;
