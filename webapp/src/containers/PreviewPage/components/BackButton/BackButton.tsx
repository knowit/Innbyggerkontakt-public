import ArrowBack from '@mui/icons-material/ArrowBack';
import { Text } from '../../../../components';

import './BackButton.scss';
import { useNavigate } from 'react-router';

const BackButton = () => {
  const navigate = useNavigate();

  return (
    <button className="backButtonContainer" onClick={() => navigate(-1)}>
      <ArrowBack />
      <Text className="semibold18">Tilbake</Text>
    </button>
  );
};

export default BackButton;
