import Add from '@mui/icons-material/Add';
import CheckCircle from '@mui/icons-material/CheckCircle';
import ChevronLeft from '@mui/icons-material/ChevronLeft';
import HighlightOff from '@mui/icons-material/HighlightOff';
import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Text } from '../../../../components';
import { FirebaseContext } from '../../../../utils/Firebase';
import { MFAPropTypes } from './types';

export const MFAEnabled: React.FC<MFAPropTypes> = ({ onError }) => {
  const firebase = useContext(FirebaseContext);
  const user = firebase.user;
  const navigate = useNavigate();
  const [mfaRemoved, setMfaRemoved] = useState<boolean>(false);

  useEffect(() => {
    if (user?.multiFactor.enrolledFactors.length !== 0) {
      setMfaRemoved(false);
    }
  }, []);

  const removeMfa = () => {
    user?.multiFactor
      .unenroll(user?.multiFactor.enrolledFactors[0])
      .then(() => {
        setMfaRemoved(true);
      })
      .catch(onError);
  };

  return (
    <div className="item item--width">
      <div className="settings__header regular14">
        <Add className="itemIcon_title" />
        <h1 className="settings__header">To-faktor autentisering</h1>
      </div>
      <div className="settingsWrapper">
        {mfaRemoved ? (
          <Text className="multifactor__info">
            <HighlightOff />
            <p>Du har skrudd av to-faktor autentisering</p>
          </Text>
        ) : (
          <Text className="multifactor__info multifactor__info--errror">
            <CheckCircle />
            <p>Du har satt opp to-faktor autentisering</p>
          </Text>
        )}
        <Button
          className="multifactor__navigate-button multifactor__navigate-button--center multifactor__navigate-button--secondary"
          type="button"
          disabled={mfaRemoved}
          onClick={removeMfa}
        >
          <span>Slå av to-faktor autentisering</span>
        </Button>

        <Button
          className="multifactor__navigate-button multifactor__navigate-button--center multifactor__navigate-button--tertiary"
          onClick={() => navigate('/oversikt/hjem')}
        >
          <ChevronLeft />
          <span>Tilbake til oversikten</span>
        </Button>
      </div>
    </div>
  );
};
export default MFAEnabled;
