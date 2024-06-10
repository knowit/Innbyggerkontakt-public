import firebase from 'firebase/compat/app';
import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SignInPopUp } from '../../../../components';
import { PopUpContext } from '../../../../contexts';
import { FirebaseContext } from '../../../../utils/Firebase';
import MFAEnabled from './MFAEnabled';
import MFAEnrollment from './MFAEnrollment';
import './MultifactorAuthentication.scss';

export const MultifactorAuthentication: React.FC = () => {
  const firebase = useContext(FirebaseContext);
  const { setPopUp } = useContext(PopUpContext);
  const navigate = useNavigate();
  const [enrolled, setEnrolled] = useState<boolean>(false);

  useEffect(() => {
    if (firebase.user?.multiFactor.enrolledFactors.length !== 0) {
      setEnrolled(true);
    }
  }, []);

  const onMfaError: firebase.ErrorFn<firebase.FirebaseError | firebase.auth.Error> = (error) => {
    switch (error.code) {
      case 'auth/requires-recent-login':
        setPopUp(createSignInPopUp(firebase.user?.email));
        break;
      default:
        console.error(error);
        break;
    }
  };

  const CurrentlyLoggedInUser: React.FC<{ email: string | null | undefined }> = ({ email }) => {
    return (
      <p className="multifactor__sign-in-popup-info">
        Du er logget inn med <span className="semibold18">{email || 'UKJENT_EPOST'}</span> og må autentisere deg igjen
        ved å skrive inn passord, for å kunne {enrolled ? 'skru av' : 'legge til'} to-faktor autentisering.
      </p>
    );
  };

  const createSignInPopUp = (email: string | null | undefined) => (
    <SignInPopUp
      popUpMessage={<CurrentlyLoggedInUser email={email} />}
      acceptButtonText="Autentiser"
      cancelButtonText="Avbryt"
      onCancel={() => navigate('/innstillinger/brukere')}
    />
  );

  useEffect(() => {
    setPopUp(createSignInPopUp(firebase.user?.email));
  }, [enrolled]);

  return <>{enrolled ? <MFAEnabled onError={onMfaError} /> : <MFAEnrollment onError={onMfaError} />}</>;
};

export default MultifactorAuthentication;
