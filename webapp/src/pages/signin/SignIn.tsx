import { useContext, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import firebase from 'firebase/compat/app';
import queryString from 'query-string';
import { StoreContext } from '../../contexts';
import { FirebaseContext } from '../../utils/Firebase';
import {
  getMultifactorHint,
  getVerificationId,
  MFAVerifier,
  submitVerificationCode,
} from '../../utils/Firebase/firebase';

import { Button, Input, Loading } from 'innbyggerkontakt-design-system';
import './SignIn.scss';

const SignInForm: React.FC<{
  handleSignIn: (email: string, password: string) => void;
  handleKeyDown: (handler: () => void) => React.KeyboardEventHandler<HTMLInputElement>;
  helperText: string;
  helperTextTitle: string;
}> = ({ handleSignIn, handleKeyDown, helperText, helperTextTitle }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (email.trim() && password.trim()) {
      setIsButtonDisabled(false);
    } else {
      setIsButtonDisabled(true);
    }
  }, [email, password]);

  return (
    <>
      <Input
        type={'email'}
        id={'epost'}
        className="signin__input"
        label={'Epost'}
        value={email}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
        onKeyDown={handleKeyDown(() => isButtonDisabled || handleSignIn(email, password))}
      />

      <Input
        id={'Passord'}
        className="signin__input"
        label={'Passord'}
        value={password}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
        onKeyDown={handleKeyDown(() => isButtonDisabled || handleSignIn(email, password))}
        type={'password'}
      />

      {helperTextTitle && <h5 className="helperText">{helperTextTitle}</h5>}
      {helperText && <h6 className="helperText">{helperText}</h6>}
      <div className="signin__button--wrapper">
        <Button className="signin__button" onClick={() => navigate('/glemt-passord')} color="tertiary">
          Glemt passord?
        </Button>
        <Button className="signin__button" onClick={() => handleSignIn(email, password)} disabled={isButtonDisabled}>
          Logg inn
        </Button>
      </div>
    </>
  );
};

const MfaForm: React.FC<{
  handleMfaSubmit: (code: string) => void;
  handleKeyDown: (handler: () => void) => React.KeyboardEventHandler<HTMLInputElement>;
  phoneNumber: string;
}> = ({ handleMfaSubmit, handleKeyDown }) => {
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
        id={'verifikasjon'}
        className="signin__input"
        label={'Skriv inn koden du fikk på sms'}
        value={verificationCode}
        onChange={(event) => setVerificationCode(event.target.value)}
        onKeyDown={handleKeyDown(() => isButtonDisabled || handleMfaSubmit(verificationCode))}
        autoFocus
      />

      <Button onClick={() => handleMfaSubmit(verificationCode)} disabled={isButtonDisabled} style={{ width: '100%' }}>
        Verifiser kode
      </Button>
    </>
  );
};

const SignIn: React.FC = () => {
  const Firebase = useContext(FirebaseContext);
  const store = useContext(StoreContext);
  const dbAccess = store.dbAccess;
  const navigate = useNavigate();
  const location = useLocation();
  const [helperTextTitle, setHelperTextTitle] = useState('');
  const [helperText, setHelperText] = useState('');

  const [verificationId, setVerificationId] = useState('');
  const [loginResolver, setLoginResolver] = useState<firebase.auth.MultiFactorResolver>();
  const [renderMfa, setRenderMfa] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState<string>('');

  const MfaVerifier = new MFAVerifier(
    getVerificationId('sign-in-captcha', {
      size: 'invisible',
      'expired-callback': () => {
        resetLoginState();
        setHelperText('Timeout: Vennligst prøv å logge inn på nytt!');
      },
    }),
  );

  useEffect(() => {
    resetLoginState();
    return () => resetLoginState();
  }, []);

  const resetLoginState = () => {
    setVerificationId('');
    setLoginResolver(undefined);
    setPhoneNumber('');
    setRenderMfa(false);
  };

  const keyDownHandler =
    (handlerFunc: () => void): React.KeyboardEventHandler<HTMLInputElement> =>
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.keyCode === 13 || event.which === 13) {
        handlerFunc();
      }
    };

  const handleSuccessfulLogin = () => {
    localStorage.setItem('activeLink', 'home');

    if (sessionStorage.getItem('user') === null) {
      sessionStorage.setItem('user', JSON.stringify(Firebase.user));
    }

    if (sessionStorage.getItem('organizationId') === null && Firebase.user) {
      dbAccess.getUser(Firebase.user.uid).then((val) => {
        if (val) {
          sessionStorage.setItem('organizationId', val.orgId);
          dbAccess.getorganization(val.orgId).then((organization) => {
            sessionStorage.setItem('organization', JSON.stringify(organization));
            navigateAfterLogin();
          });
        }
      });
    }
    navigateAfterLogin();
  };

  const navigateAfterLogin = () => {
    if (location.search) {
      const parsedQuery = queryString.parse(location.search);
      if (typeof parsedQuery.retUrl == 'string') {
        navigate(parsedQuery.retUrl);
      }
    }
    navigate('/oversikt/hjem');
  };

  const handleSignIn = (email: string, password: string) => {
    Firebase.signIn(email, password)
      .then(handleSuccessfulLogin)
      .catch((error) => {
        switch (error.code) {
          case 'auth/user-not-found':
          case 'auth/wrong-password':
            setHelperTextTitle('Oi, brukernavnet eller passordet er feil.');
            setHelperText(
              'Dersom du har glemt passordet ditt kan du trykke på knappen under for å få tilsendt nytt passord.',
            );
            break;
          case 'auth/multi-factor-auth-required':
            setRenderMfa(true);
            setHelperText('');
            MfaVerifier.apply(error.resolver, undefined).then((id) => {
              setVerificationId(id);
              setLoginResolver(error.resolver);
              setPhoneNumber((getMultifactorHint(error.resolver) as firebase.auth.PhoneMultiFactorInfo).phoneNumber);
            });
            break;
          case 'auth/invalid-email':
            setHelperText('Ugyldig e-post adresse');
            break;
          default:
            setHelperText('Ukjent feil, vennligst ta kontakt med support!');
            console.error(error);
        }
      });
  };

  const handleMfaSubmit = (code: string) => {
    if (loginResolver) {
      setHelperText('');
      submitVerificationCode(loginResolver, verificationId, code)
        .then(handleSuccessfulLogin)
        .catch((error) => {
          if (error.code === 'auth/invalid-verification-code') {
            setHelperText(
              `Koden du har oppgitt stemmer ikke med koden vi har sendt på sms til "${phoneNumber}", vennligst prøv igjen!`,
            );
          } else {
            console.error(error);
          }
          resetLoginState();
        });
    } else {
      setHelperText('En ukjent feil har oppstått, vennligst prøv igjen');
      resetLoginState();
    }
  };

  return (
    <>
      <div className="signIn">
        <h1>Logg inn</h1>
        {!renderMfa && (
          <SignInForm
            handleSignIn={handleSignIn}
            handleKeyDown={keyDownHandler}
            helperText={helperText}
            helperTextTitle={helperTextTitle}
          />
        )}
        {renderMfa && !phoneNumber && <Loading />}
        {renderMfa && phoneNumber && (
          <MfaForm handleMfaSubmit={handleMfaSubmit} handleKeyDown={keyDownHandler} phoneNumber={phoneNumber} />
        )}
      </div>
      {<div id="sign-in-captcha" />}
    </>
  );
};

export default SignIn;
