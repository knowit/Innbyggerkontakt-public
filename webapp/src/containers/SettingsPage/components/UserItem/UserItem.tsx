import Close from '@mui/icons-material/Close';
import Create from '@mui/icons-material/Create';
import { Link } from 'react-router-dom';

import './UserItem.scss';

interface User {
  id: string;
  name: string;
  email: string;
  onClick?: ((event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void) | undefined;
  resetPassord?: ((event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void) | undefined;
  currentUser: boolean;
}

export const UserItem: React.FC<User> = ({ id, name, email, onClick, currentUser }) => {
  return (
    <div className="usersWrapper">
      <p className={currentUser ? 'regular18 gray' : 'regular18'}>
        {name ? name + ', ' : ''} {email}
      </p>
      {!currentUser ? (
        <div>
          <Link className="clickableIcon" to={`/innstillinger/endre-bruker/${id}`}>
            <Create />
          </Link>
          <div className="clickableIcon" onClick={onClick}>
            <Close className="userIcon" />
          </div>
        </div>
      ) : (
        <div>
          <p className="regular14 gray">Innlogget bruker</p>
        </div>
      )}
    </div>
  );
};
export default UserItem;
