import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import { useNavigate } from 'react-router-dom';

import { Button } from 'components';

import Connect from 'assets/Connect.svg';

import './PageNotFound.scss';

const PageNotFound: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="page-not-found">
      <div className="page-not-found__content">
        <h1 className="page-not-found__heading page-not-found__heading--h1">404</h1>
        <h2 className="page-not-found__heading page-not-found__heading--h2">
          Dette er ikke siden <br /> du leter etter
        </h2>
        <h3 className="page-not-found__heading page-not-found__heading--h3">Og det er vår feil, beklager!</h3>
        <Button className="page-not-found__navigation-button" type="button" onClick={() => navigate('/oversikt/hjem')}>
          <ChevronLeftIcon />
          <p>Tilbake til oversikten</p>
        </Button>
      </div>
      <img className="page-not-found__illustration" src={Connect} alt="Connection failed" />
    </div>
  );
};

export default PageNotFound;
