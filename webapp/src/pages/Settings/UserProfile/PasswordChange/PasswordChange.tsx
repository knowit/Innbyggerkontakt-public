import Create from '@mui/icons-material/Create';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import 'firebase/compat/auth';
import { useContext, useEffect, useState } from 'react';
import { Button, Input, Text } from '../../../../components';
import { FirebaseContext } from '../../../../utils/Firebase';

import './PasswordChange.scss';

export const Profile: React.FC = () => {
  const firebase = useContext(FirebaseContext);
  const user = firebase.user;

  const [password, setPassword] = useState('');
  const [passwordCopy, setPasswordCopy] = useState('');
  const [showPassword, toggleShowPassword] = useState(false);
  const [showPasswordCopy, toggleShowPasswordCopy] = useState(false);

  const [errorMessage, setErrorMessage] = useState('');
  const [error, setError] = useState<boolean>(false);

  const [success, setSuccess] = useState<boolean>(false);

  const [validation, setValidation] = useState<{
    length: boolean;
    letters: boolean;
    digit: boolean;
    special: boolean;
  }>();

  useEffect(() => {
    checkPassword(password);
  }, [password]);

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
    if (password === passwordCopy) {
      if (checkPassword(password)) {
        user?.updatePassword(password).then(() => {
          setSuccess(true);
        });
      }
    } else {
      setError(true);
      setErrorMessage('Passordene er ikke like');
    }
  };

  return (
    <div className="item item--width">
      <div className="settings__header">
        <Create className="itemIcon_title" />
        <h1>Endre passord</h1>
      </div>
      <form onSubmit={submit} className="settingsWrapper">
        <Input
          placeholder="Nytt passord"
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
          value={password}
          type={showPassword ? 'text' : 'password'}
          className="userInput"
          iconClassName="inputicon"
          icon={
            showPassword ? (
              <Visibility onClick={() => toggleShowPassword(!showPassword)} />
            ) : (
              <VisibilityOff onClick={() => toggleShowPassword(!showPassword)} />
            )
          }
        ></Input>

        <Input
          placeholder="Gjenta nytt passord"
          value={passwordCopy}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPasswordCopy(e.target.value)}
          type={showPasswordCopy ? 'text' : 'password'}
          className="userInput"
          iconClassName="inputicon"
          icon={
            showPasswordCopy ? (
              <Visibility onClick={() => toggleShowPasswordCopy(!showPasswordCopy)} />
            ) : (
              <VisibilityOff onClick={() => toggleShowPasswordCopy(!showPasswordCopy)} />
            )
          }
        ></Input>
        <Button
          className="primary"
          type="button"
          onClick={() => submit()}
          disabled={!validation?.length || !validation?.digit || !validation?.letters || !validation?.special}
        >
          <Text className="textButton">Endre passord</Text>
        </Button>
        <div className="settingsWrapper--error--margin">
          {error ? <Text className="textError">{errorMessage}</Text> : null}
        </div>

        <div className="settingsWrapper--success--margin">
          {success ? <Text className="textSucess">Passord er endret</Text> : null}
        </div>
        <div className="settingsWrapper--info--margin">
          <Text className={validation?.length !== undefined ? 'infoText' + validation?.length.toString() : 'infoText'}>
            * Minimum 12 tegn
          </Text>

          <Text
            className={validation?.letters !== undefined ? 'infoText' + validation?.letters.toString() : 'infoText'}
          >
            * Må inneholde både store og små bokstaver
          </Text>
          <Text className={validation?.digit !== undefined ? 'infoText' + validation?.digit.toString() : 'infoText'}>
            * Må inneholde siffer
          </Text>
          <Text
            className={validation?.special !== undefined ? 'infoText' + validation?.special.toString() : 'infoText'}
          >
            * Må inneholde spesialtegn (f.eks ? % # &){' '}
          </Text>
        </div>
      </form>
    </div>
  );
};
export default Profile;
