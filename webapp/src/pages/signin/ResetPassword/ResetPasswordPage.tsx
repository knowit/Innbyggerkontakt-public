import { useContext, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';

import 'firebase/compat/auth';
import queryString from 'query-string';
import { FirebaseContext } from '../../../utils/Firebase';

import DoneIcon from '@mui/icons-material/Done';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

import { Button, Input, Text } from '../../../components';

import './ResetPasswordPage.scss';

export const Profile: React.FC = () => {
  const firebase = useContext(FirebaseContext);

  const location = useLocation();
  const navigate = useNavigate();
  const parsedQuery = queryString.parse(location.search);

  const [password, setPassword] = useState('');
  const [passwordCopy, setPasswordCopy] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [error, setError] = useState<boolean>(false);
  const [validateText, setValidateText] = useState(false);
  const [invalidCode, setInvalidCode] = useState(false);
  const [success, setSuccess] = useState<boolean>(false);

  const [validation, setValidation] = useState<{
    length: boolean;
    letters: boolean;
    digit: boolean;
    special: boolean;
  }>();

  useEffect(() => {
    const oobCode = parsedQuery['oobCode'] as string | undefined;
    if (oobCode === undefined) {
      setInvalidCode(true);
    } else {
      firebase.auth.verifyPasswordResetCode(oobCode).catch((error) => {
        if (error.code == 'auth/invalid-action-code') {
          setInvalidCode(true);
        } else if (error.code == 'auth/expired-action-code') {
          setInvalidCode(true);
        } else if (error.code == 'auth/argument-error') {
          setInvalidCode(true);
        }
      });
    }
  }, []);

  const checkPassword = (password: string) => {
    const re = {
      length: /(?=.{12,})/,
      letters: /(?=.*[A-Z])(?=.*[a-z])/,
      digit: /(?=.*[0-9])/,
      special: /(?=.*[#?!@$%^&*-])/,
      full: /^(?=.{12,})(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[#?!@$%^&*-])/,
    };

    setValidation({
      length: re.length.test(password),
      letters: re.letters.test(password),
      digit: re.digit.test(password),
      special: re.special.test(password),
    });

    return re.full.test(password);
  };

  const submit = () => {
    const oobCode = parsedQuery['oobCode'] as string;

    firebase.auth
      .verifyPasswordResetCode(oobCode)
      .then(() => {
        if (password === passwordCopy) {
          setError(false);
          if (checkPassword(password)) {
            firebase.auth
              .confirmPasswordReset(oobCode, password)
              .then(() => {
                firebase.auth.signOut();
                setSuccess(true);
                setError(false);
              })
              .catch(() => {
                setInvalidCode(true);
              });
          } else {
            setValidateText(true);
            setPassword('');
            setPasswordCopy('');
          }
        } else {
          setError(true);
          setErrorMessage('Passordene er ikke like');
          setPassword('');
          setPasswordCopy('');
        }
      })
      .catch((error) => {
        if (error.code == 'auth/invalid-action-code') {
          setInvalidCode(true);
        } else if (error.code == 'auth/expired-action-code') {
          setInvalidCode(true);
        }
      });
  };

  const passwordValidationText = () => {
    if (error) {
      return errorMessage;
    } else if (!validation?.length) {
      return 'Passordet må ha minst 12 tegn';
    } else if (!validation?.letters) {
      return 'Passordet må inneholde både store og små bokstaver';
    } else if (!validation?.digit) {
      return 'Passordet må inneholde siffer';
    } else if (!validation?.special) {
      return 'Passordet må inneholde spesialtegn (f.eks ? % # &)';
    }
  };

  if (success) {
    return (
      <div className="passwordChangeConfirmation">
        <div className="passwordText">
          <DoneIcon className="passwordCheck" />
          <Text className="semibold24">Passordet ditt er endret!</Text>
        </div>

        <Button className="primary" type="button" onClick={() => navigate('/')}>
          <Text className="textButton">Logg inn</Text>
        </Button>
      </div>
    );
  } else if (invalidCode) {
    return (
      <div className="invalidPasswordLink">
        <div className="invalidRow">
          <ErrorOutlineIcon className="invalidIcon" />
          <h1 className="invalidText">Linken er ugyldig, har utgått eller har allerede blitt brukt. Prøv igjen</h1>
        </div>

        <Button className="primary" type="button" onClick={() => navigate('/glemt-passord')}>
          <Text className="textButton">Gå tilbake</Text>
        </Button>
      </div>
    );
  } else {
    return (
      <div className="passwordContainer">
        <div className="item">
          <div className="settings__header">
            <h1>Endre passordet ditt</h1>
            <p className="settingsExplainText">
              Det nye passordet må ha minst 12 tegn, inneholde store og små bokstaver og inneholde tall.
            </p>
          </div>
          <form onSubmit={submit}>
            <div className="passwordChange">
              <Input
                className={validateText || error ? 'formInputError' : ''}
                value={password}
                title="Nytt passord"
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                type="password"
                errorText={validateText || error ? passwordValidationText() : ''}
              ></Input>

              <Input
                className={validateText || error ? 'formInputError' : ''}
                value={passwordCopy}
                title="Gjenta nytt passord"
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPasswordCopy(e.target.value)}
                type="password"
              ></Input>

              <Button
                className="primary"
                type="button"
                onClick={() => submit()}
                disabled={!password.trim() || !passwordCopy.trim()}
              >
                <Text className="textButton">Endre</Text>
              </Button>
            </div>
          </form>
        </div>
      </div>
    );
  }
};
export default Profile;
