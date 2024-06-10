import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useUser } from '../../hooks';
import { USER_ROLES } from '../../models';
import Firebase from '../../utils/Firebase';
import BurgerButton from './components/BurgerButton/BurgerButton';
import CreateNewButton from './components/CreateNewButton/CreateNewButton';
import NavButton from './components/NavButton/NavButton';

import Add from '@mui/icons-material/Add';
import ArrowForward from '@mui/icons-material/ArrowForward';
import Search from '@mui/icons-material/Search';
import Settings from '@mui/icons-material/Settings';
import ViewList from '@mui/icons-material/ViewList';
import Logo from '../../assets/NewLogo.svg';

import './NavBar.scss';

type Props = React.HTMLAttributes<HTMLDivElement>;

export const NavBar = (props: Props) => {
  const { role, user } = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const isEditor = role === USER_ROLES.EDITOR;

  const getDisplayName = (): string => user?.displayName || user?.email || 'Guest';

  const handleLogout = () => {
    try {
      Firebase.signOut()
        .then(() => {
          sessionStorage.clear();
        })
        .catch((error) => {
          alert(error.message);
        });
    } catch (error: unknown) {
      alert((error as Record<string, string>).message);
    }
  };

  const generateButtons = () => {
    return (
      <>
        {isEditor ? null : <NavButton to={'/finn'} text="Finn" icon={<Search />} />}
        <NavButton to={'/innstillinger'} text="Innstillinger" icon={<Settings />} />
        <NavButton to={'/logg-inn'} text="Logg ut" icon={<ArrowForward />} onClick={handleLogout} />
      </>
    );
  };

  const generateMobileNavButtons = () => {
    return (
      <div>
        <NavButton to={'/oversikt'} text="Oversikt" icon={<ViewList />} onClick={() => setIsOpen(false)} />
        <NavButton to={'/opprett'} text="Lag ny" icon={<Add />} onClick={() => setIsOpen(false)} />
        {isEditor ? null : <NavButton to={'/finn'} text="Finn" icon={<Search />} onClick={() => setIsOpen(false)} />}
        <NavButton to={'/innstillinger'} text="Innstillinger" icon={<Settings />} onClick={() => setIsOpen(false)} />
        <NavButton to={'/logg-inn'} text="Logg ut" icon={<ArrowForward />} onClick={handleLogout} />
      </div>
    );
  };

  return (
    <div className="navBarContainer" {...props}>
      <div>
        <div>
          <Link to={'/oversikt/hjem'}>
            <img src={Logo} alt="Innbyggerkontakt Logo" />
          </Link>
          {isEditor ? <span>Redaktør</span> : <CreateNewButton />}
        </div>
        <div className="navBarButtonContainer">{generateButtons()}</div>
        <BurgerButton isOpen={isOpen} onClick={() => setIsOpen((prev) => !prev)} />
        <div className={`navBarMobileMenuContainer navBarMobileMenuContainer--${isOpen ? 'open' : 'closed'}`}>
          {generateMobileNavButtons()}
          <p>
            Logget inn som <span>{getDisplayName()}</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default NavBar;
