import { Button, Input } from 'innbyggerkontakt-design-system';
import { useState } from 'react';
import { useNavigate } from 'react-router';
import * as firebase from '../../../utils/Firebase/firebase';

import './ForgottenPasswordPage.scss';

export const ForgottenPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState<string>('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const submit = () => {
    setError('');
    setSuccess('');
    let redo = false;
    const resetPassord = firebase.sendPasswordResetEmail(email);
    resetPassord
      .then((item) => {
        if (item) {
          if (item.code === 'auth/invalid-email') {
            redo = true;
            setError('E-postadressen er dårlig formatert.');
          }
        }
      })
      .finally(() => {
        if (!redo) {
          setSuccess(
            'Hvis brukeren eksisterer blir en e-post med instruksjoner for å resette passord sendt til ' + email,
          );
          setTimeout(() => navigate('/'), 8000);
        }
      });
  };

  return (
    <div className="passwordPageForm">
      <h1>Glemt passord?</h1>
      Skriv inn e-postadressen din, så får du tilsendt en lenke som gir deg tilgang til kontoen din.{' '}
      <Input
        id={'epost'}
        className="forgotten__input"
        label={''}
        hideLabel={true}
        placeholder="Skriv inn e-postadressen din"
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
        value={email}
        type={'email'}
      />
      <div className="forgotten__button--wrapper">
        <Button className="forgotten__button" type="button" onClick={() => navigate('/')} color="secondary">
          Avbryt
        </Button>
        <Button className="forgotten__button" type="button" disabled={email === ''} onClick={() => submit()}>
          Send passord
        </Button>
      </div>
      <div key="regular11" style={{ marginTop: '5px' }}>
        {success && <span className="textSucess">{success}</span>}
        {error && <span className="textError">{error}</span>}
      </div>
    </div>
  );
};

export default ForgottenPasswordPage;
