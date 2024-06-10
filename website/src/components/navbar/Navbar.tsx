import React, { useState, useEffect, useRef } from 'react';
import './Navbar.scss';
import Logo from '../../logo.svg';
import KFLogo from '../../images/kf-logo-rgb-blue.svg';
import { Link } from 'gatsby';
import MenuIcon from '@mui/icons-material/Menu';
import LinkButton from '../Buttons/LinkButton/LinkButton';
import PersonIcon from '@mui/icons-material/Person';
import ExternalLinkButton from '../Buttons/LinkButton/ExternalLinkButton/ExternalLinkButton';

interface Props {
  pagename?: string;
}

export const Navbar: React.FC<Props> = ({ pagename }: Props) => {
  const [activeLink, setActiveLink] = useState('');
  const [openBurgerMenu, setOpenBurgerMenu] = useState<boolean>(false);

  useEffect(() => {
    const storageActiveLink = String(localStorage.getItem('activeLink') || 'home');
    setActiveLink(storageActiveLink);

    document.addEventListener('click', handleClickOutside, false);
    return () => {
      document.removeEventListener('click', handleClickOutside, false);
    };
  }, []);

  useEffect(() => {
    localStorage.setItem('activeLink', activeLink);
  }, [activeLink]);

  const navbarDropdownRef = useRef(null);
  const menuIconRef = useRef(null);

  const handleClickOutside = (event) => {
    if (
      navbarDropdownRef.current &&
      !navbarDropdownRef.current.contains(event.target) &&
      menuIconRef.current &&
      !menuIconRef.current.contains(event.target)
    ) {
      setOpenBurgerMenu(false);
    }
  };

  return (
    <div className="header">
      <div className="navBar">
        <div className="left">
          <Link to={'/'} className="homelink">
            <img className="navLogo" src={Logo} alt="Innbyggerkontakt Logo" />
          </Link>

          {/* <img className="navLogo" src={Logo} alt="Innbyggerkontakt Logo" /> */}
          {pagename ? (
            <div className="pagename">{pagename}</div>
          ) : (
            <div className="navbuttons">
              <Link to="/#introInformation" className={'navButton alink'}>
                Hva er innbyggerkontakt?
              </Link>
              <Link to="/#stepByStep" className={'navButton alink'}>
                Kom i gang
              </Link>
              <Link to="/#contactBox" className={'navButton alink'}>
                Kontakt
              </Link>
            </div>
          )}
        </div>
        <div className="rightSmall">
          <img className="kfLogo" src={KFLogo} alt="Kommune Forlaget logo" />
          {pagename ? null : (
            <>
              <MenuIcon className="burgerMenu" onClick={() => setOpenBurgerMenu(!openBurgerMenu)} ref={menuIconRef} />
              {openBurgerMenu && (
                <>
                  <div className="navbarDropdown" ref={navbarDropdownRef}>
                    <Link
                      onClick={() => setOpenBurgerMenu(false)}
                      to="/#introInformation"
                      title="Hva er innbyggerkontakt?"
                      className={activeLink === 'introinformation' ? 'activePage dropdownSmall' : ' dropdownSmall'}
                    >
                      Hva er innbyggerkontakt
                    </Link>
                    <Link
                      onClick={() => setOpenBurgerMenu(false)}
                      to="/#stepByStep"
                      title="Kom i gang"
                      className={activeLink === 'stepbystep' ? 'activePage dropdownSmall' : 'dropdownSmall'}
                    >
                      Kom i gang
                    </Link>
                    <Link
                      onClick={() => setOpenBurgerMenu(false)}
                      to="/#contactBox"
                      title="Kontakt"
                      className={activeLink === 'contact' ? 'activePage dropdownSmall' : ' dropdownSmall'}
                    >
                      Kontakt
                    </Link>
                    <div className="navbarDropdownButtonContainer">
                      <LinkButton to="/dokumentasjon" className="tertiary">
                        Dokumentasjon
                      </LinkButton>
                      <ExternalLinkButton
                        href="https://app.innbyggerkontakt.no/"
                        className="tertiary"
                        icon={<PersonIcon />}
                      >
                        Logg inn
                      </ExternalLinkButton>
                    </div>
                  </div>
                </>
              )}
            </>
          )}
        </div>
        <div className="right">
          <img className="kfLogo" src={KFLogo} alt="Kommune Forlaget logo" />
          <div className="navButton">
            <LinkButton to="/dokumentasjon" className="tertiary">
              Dokumentasjon
            </LinkButton>
          </div>
          <div className="navButton">
            <ExternalLinkButton href="https://app.innbyggerkontakt.no/" className="tertiary" icon={<PersonIcon />}>
              Logg inn
            </ExternalLinkButton>
          </div>
          <div className="navButton">
            <LinkButton to="/kontakt" className="primary">
              Kom i kontakt med oss
            </LinkButton>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
