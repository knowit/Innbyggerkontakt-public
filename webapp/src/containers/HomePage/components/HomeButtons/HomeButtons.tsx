import Add from '@mui/icons-material/Add';
import Search from '@mui/icons-material/Search';
import { Button } from 'innbyggerkontakt-design-system';
import { Link } from 'react-router-dom';

import store from '../../../../contexts/store';

import './HomeButtons.scss';

const HomeButtons = () => {
  return (
    <div className="homePageButtons">
      <Link to="/opprett" key={'1'}>
        <Button
          color="secondary"
          variant="rounded"
          svg={[25, 15]}
          onClick={() => {
            store.setBulletinId(null);
            store.setBulletin(null);
            store.setInvoice(null);
          }}
        >
          <Add />
          Lag ny
        </Button>
      </Link>
      <Link to="/finn">
        <Button color="tertiary" variant="rounded" svg={[25, 15]}>
          <Search />
          Finn
        </Button>
      </Link>
    </div>
  );
};

export default HomeButtons;
