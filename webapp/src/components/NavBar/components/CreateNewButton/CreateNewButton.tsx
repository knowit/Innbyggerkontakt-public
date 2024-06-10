import { Link } from 'react-router-dom';
import Add from '@mui/icons-material/Add';
import store from '../../../../contexts/store';

import './CreateNewButton.scss';

export const CreateNewButton = () => {
  return (
    <Link
      to={'/opprett/start'}
      className="createNewButtonContainer"
      onClick={() => {
        store.setBulletinId(null);
        store.setBulletin(null);
        store.setInvoice(null);
      }}
      key="opprett"
    >
      <Add />
      <span>Lag ny</span>
    </Link>
  );
};

export default CreateNewButton;
