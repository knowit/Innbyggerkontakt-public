import Add from '@mui/icons-material/Add';
import { useContext, useEffect, useState } from 'react';
import { Button, Input, Loader /*EditorComponent*/, Text } from '../../components';
import { StoreContext } from '../../contexts';
import * as firebase from '../../utils/Firebase/firebase';

export const Invite: React.FC = () => {
  const store = useContext(StoreContext);
  const dbAccess = store.dbAccess;

  //const [melding, setMelding] = useState('');
  const [inputFields, setInputField] = useState([{ email: '', displayname: '' }]);
  const [emails, setEmails] = useState<string[]>([]);
  const [errorMessage, setErrorMessage] = useState<{ email: string; error: string }[]>([]);
  const [error, setError] = useState<boolean>();
  const [disabled, setDisabled] = useState<boolean>(false);

  const submit = () => {
    createUser();
  };

  useEffect(() => {
    if (error || emails.length > 0) {
      setDisabled(true);
      const interval = setInterval(() => {
        window.location.href = '/innstillinger/ny-bruker';
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [error, emails]);

  const createUser = () => {
    inputFields.map((field, index) => {
      const temporaryApp = firebase.createTemporaryApp('app' + index.toString());
      if (field.email !== '') {
        const password = Math.random().toString(36).slice(-8);
        temporaryApp
          .auth()
          .createUserWithEmailAndPassword(field.email.trim(), password)
          .then(function (firebaseUser) {
            firebaseUser.user
              ?.updateProfile({
                displayName: field.displayname,
              })
              .then(() => {
                temporaryApp.auth().signOut();
                firebase.sendPasswordResetEmail(field.email);
                setEmails((emails) => [...emails, field.email]);

                if (firebaseUser.user) {
                  dbAccess.saveNewUser(firebaseUser.user, sessionStorage.organizationId);
                }
              });
          })
          .catch((error) => {
            switch (error.code) {
              case 'auth/email-already-in-use':
                setErrorMessage((error) => [...error, { email: field.email, error: 'eksisterer allerede.' }]);
                setError(true);
                break;

              case 'auth/invalid-email':
                setErrorMessage((error) => [...error, { email: field.email, error: 'er dårlig formatert.' }]);
                setError(true);
                break;
              default:
            }
          });
      }
      return true;
    });
  };

  function handleEmailChange(i: number, event: React.ChangeEvent<HTMLInputElement>) {
    const values = [...inputFields];
    values[i].email = event.target.value;
    setInputField(values);
  }
  function handleDisplayName(i: number, event: React.ChangeEvent<HTMLInputElement>) {
    const values = [...inputFields];
    values[i].displayname = event.target.value;
    setInputField(values);
  }

  const addFields = () => {
    const values = [...inputFields];
    values.push({ email: '', displayname: '' });
    setInputField(values);
  };

  return (
    <div className="item item--width">
      <div className="styles__header">
        <div className="settings__header regular14">
          <Add className="itemIcon_title" />
          <h1>Legg til ny bruker</h1>
        </div>
        <p className="regular14 darkBlue">
          Inviter nye brukere inn i din kommune. Brukere kan se, lage, endre og sende ut meldinger.
        </p>
      </div>

      <form
        onSubmit={(e) => {
          submit();
          e.preventDefault();
        }}
        className="settingsWrapper"
      >
        <h3>Gi tilgang til</h3>
        {inputFields.map((felt, id) => {
          return (
            <div key={`${felt}-${id}`}>
              {inputFields.length > 1 ? <Text style={{ marginTop: '2%' }}>{(id + 1).toString()}</Text> : null}
              <div className="regular18">Email</div>
              <Input
                className={`userInput ${disabled}`}
                type="text"
                title="Epost"
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleEmailChange(id, e)}
                value={felt.email}
                disabled={disabled}
              />
              <div className="regular18">Visningsnavn</div>
              <Input
                className={`userInput ${disabled}`}
                type="text"
                title="Visningsnavn"
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleDisplayName(id, e)}
                value={felt.displayname}
                disabled={disabled}
              />
            </div>
          );
        })}
        <div className="newUserButtonRow">
          <Button className="primary" type="submit" style={{ marginLeft: '1%', marginTop: '1%', float: 'right' }}>
            <Text className="textButton">Send</Text>
          </Button>
          <Button onClick={() => addFields()} className="secondary" style={{ marginTop: '1%', float: 'right' }}>
            <Text className="textButton">+ Legg til flere</Text>
          </Button>
          {disabled ? (
            <Loader style={{ marginTop: '1%', marginRight: '1%', float: 'right', width: '10px', height: '10px' }} />
          ) : null}
        </div>

        <div style={{ marginTop: '1%' }}>
          {error
            ? errorMessage.map((e, id) => {
                return (
                  <Text key={id} className="textError">
                    Epostadresse {e.email} {e.error}
                  </Text>
                );
              })
            : null}

          {emails.map((e, id) => {
            return (
              <Text key={id} className="textSucess">
                Bruker {e} opprettet.
              </Text>
            );
          })}
        </div>
      </form>
    </div>
  );
};
export default Invite;
