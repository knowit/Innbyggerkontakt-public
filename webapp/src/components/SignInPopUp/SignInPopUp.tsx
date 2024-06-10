import Info from '@mui/icons-material/Info';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import firebase from 'firebase/compat/app';
import { ReactNode, useContext, useEffect, useState } from 'react';
import { PopUpContext } from '../../contexts';
import { FirebaseContext } from '../../utils/Firebase';
import {
  getMultifactorHint,
  getVerificationId,
  MFAVerifier,
  submitVerificationCode,
} from '../../utils/Firebase/firebase';
import { Button, Input, Loader } from '../index';

import './SignInPopUp.scss';

interface Props extends React.InputHTMLAttributes<HTMLDivElement>, SignInPopUpData {}

export type SignInPopUpData = {
  popUpMessage?: ReactNode;
  onPopUpAccept?: () => void;
  onCancel?: () => void;
  acceptButtonText: string;
  cancelButtonText?: string;
  icon?: JSX.Element;
};

const SignInForm: React.FC<{
  handleSignIn: (email: string, password: string) => void;
  onCancel?: () => void;
  email: string;
  errorMessage: string;
  acceptButtonText: string;
  cancelButtonText?: string;
  handleKeyDown: (handler: () => void) => React.KeyboardEventHandler<HTMLInputElement>;
}> = ({ handleSignIn, email, errorMessage, onCancel, acceptButtonText, cancelButtonText, handleKeyDown }) => {
  const [password, setPassword] = useState('');
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);
  const [showPassword, toggleShowPassword] = useState(false);

  useEffect(() => {
    if (password.trim()) {
      setIsButtonDisabled(false);
    } else {
      setIsButtonDisabled(true);
    }
  }, [password]);

  return (
    <>
      <Input
        title="Passord"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        onKeyDown={handleKeyDown(() => isButtonDisabled || handleSignIn(email, password))}
        type={showPassword ? 'text' : 'password'}
        className="SignInPopUp__password-input"
        errorMessage={errorMessage}
        autoFocus
      >
        <i
          role="button"
          tabIndex={0}
          onClick={() => toggleShowPassword(!showPassword)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              toggleShowPassword(!showPassword);
            }
          }}
          className="SignInPopUp__password-input-icon SignInPopUp__password-input-icon--position-end-center"
        >
          {showPassword ? <Visibility /> : <VisibilityOff />}
        </i>
      </Input>

      <SignInButtons
        acceptButtonText={acceptButtonText}
        onAccept={() => handleSignIn(email, password)}
        acceptDisabled={isButtonDisabled}
        onCancel={onCancel}
        cancelButtonText={cancelButtonText}
      />
    </>
  );
};

const MfaForm: React.FC<{
  handleMfaSubmit: (code: string) => void;
  phoneNumber: string;
  acceptButtonText: string;
  cancelButtonText?: string;
  onCancel?: () => void;
  handleKeyDown: (handler: () => void) => React.KeyboardEventHandler<HTMLInputElement>;
}> = ({ handleMfaSubmit, acceptButtonText, cancelButtonText, onCancel, handleKeyDown }) => {
  const [verificationCode, setVerificationCode] = useState('');
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);

  useEffect(() => {
    if (verificationCode.trim()) {
      setIsButtonDisabled(false);
    } else {
      setIsButtonDisabled(true);
    }
  }, [verificationCode]);

  return (
    <>
      <Input
        className="inputField"
        title="Skriv inn koden du mottok på SMS"
        value={verificationCode}
        onChange={(event) => setVerificationCode(event.target.value)}
        onKeyDown={handleKeyDown(() => isButtonDisabled || handleMfaSubmit(verificationCode))}
        autoFocus
      />

      <SignInButtons
        onAccept={() => handleMfaSubmit(verificationCode)}
        acceptDisabled={isButtonDisabled}
        acceptButtonText={acceptButtonText}
        onCancel={onCancel}
        cancelButtonText={cancelButtonText}
      />
    </>
  );
};

const SignInButtons: React.FC<{
  cancelButtonText?: string;
  onCancel?: () => void;
  acceptButtonText?: string;
  onAccept: () => void;
  acceptDisabled: boolean;
}> = ({ cancelButtonText, onCancel, acceptButtonText, onAccept, acceptDisabled }) => {
  return (
    <div className="SignInButtons">
      {onCancel && (
        <Button className="tertiary SignInButtons--abort" onClick={onCancel}>
          {cancelButtonText || 'Avbryt'}
        </Button>
      )}
      <Button className="primary" onClick={onAccept} disabled={acceptDisabled}>
        {acceptButtonText || 'Logg inn'}
      </Button>
    </div>
  );
};

export const SignInPopUp: React.FC<Props> = ({
  className,
  popUpMessage,
  acceptButtonText,
  cancelButtonText,
  onCancel,
  onPopUpAccept,
  icon,
  ...rest
}) => {
  const { clearPopUp } = useContext(PopUpContext);
  const Firebase = useContext(FirebaseContext);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const [verificationId, setVerificationId] = useState('');
  const [loginResolver, setLoginResolver] = useState<firebase.auth.MultiFactorResolver>();
  const [renderMfa, setRenderMfa] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState<string>('');

  const MfaVerifier = new MFAVerifier(
    getVerificationId('authenticate-captcha', {
      size: 'invisible',
      'expired-callback': () => {
        resetLoginState();
        setErrorMessage('Timeout: Vennligst prøv å logge inn på nytt!');
      },
    }),
  );

  const resetLoginState = () => {
    setVerificationId('');
    setLoginResolver(undefined);
    setRenderMfa(false);
  };

  const handleSuccessfulAuthentication = () => {
    onPopUpAccept && onPopUpAccept();
    clearPopUp();
  };

  const handleAuthentication = (email: string, password: string) => {
    Firebase.reauthenticate(email, password)
      .then(handleSuccessfulAuthentication)
      .catch((error) => {
        switch (error.code) {
          case 'auth/wrong-password':
            setErrorMessage('Passordet er feil, vennligst prøv på nytt');
            break;
          case 'auth/user-not-found':
            setErrorMessage('En feil har oppstått, vennligst logg helt ut og prøv på nytt!');
            break;
          case 'auth/multi-factor-auth-required':
            setRenderMfa(true);
            MfaVerifier.apply(error.resolver, undefined).then((id) => {
              setVerificationId(id);
              setLoginResolver(error.resolver);
              setPhoneNumber((getMultifactorHint(error.resolver) as firebase.auth.PhoneMultiFactorInfo).phoneNumber);
            });
            break;
          default:
            setErrorMessage('Ukjent feil, vennligst ta kontakt med support!');
            console.error(error);
        }
      });
  };

  const handleMfaSubmit = (code: string) => {
    if (loginResolver) {
      submitVerificationCode(loginResolver, verificationId, code)
        .then(handleSuccessfulAuthentication)
        .catch((error) => {
          if (error.code === 'auth/invalid-verification-code') {
            setErrorMessage(
              `Koden du har oppgitt stemmer ikke med koden vi har sendt på sms til "${phoneNumber}", vennligst prøv igjen!`,
            );
          } else {
            console.error(error);
          }
          resetLoginState();
        });
    } else {
      setErrorMessage('Something failed, please try again');
      resetLoginState();
    }
  };

  const keyDownHandler =
    (handlerFunc: () => void): React.KeyboardEventHandler<HTMLInputElement> =>
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.keyCode === 13 || event.which === 13) {
        handlerFunc();
      }
    };

  const cancelHandler = () => {
    onCancel && onCancel();
    clearPopUp();
  };

  return (
    <>
      <div className={`SignInPopUp ${className || ''}`} {...rest}>
        <div className="SignInPopUp__icon">{icon || <Info fontSize="inherit" className="lightBlue" />}</div>
        {popUpMessage}

        {!renderMfa && (
          <SignInForm
            handleSignIn={handleAuthentication}
            email={Firebase.user?.email as string}
            errorMessage={errorMessage}
            onCancel={cancelHandler}
            acceptButtonText={acceptButtonText}
            cancelButtonText={cancelButtonText}
            handleKeyDown={keyDownHandler}
          />
        )}
        {renderMfa && !phoneNumber && <Loader />}
        {renderMfa && phoneNumber && (
          <MfaForm
            handleMfaSubmit={handleMfaSubmit}
            phoneNumber={phoneNumber}
            acceptButtonText="Verifiser kode"
            onCancel={cancelHandler}
            cancelButtonText={cancelButtonText}
            handleKeyDown={keyDownHandler}
          />
        )}
        {<div id="authenticate-captcha" />}
      </div>
    </>
  );
};

export default SignInPopUp;
