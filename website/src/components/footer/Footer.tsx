import React from 'react';
import './Footer.scss';
import Logo from '../../logo.svg';
import LinkButton from '../Buttons/LinkButton/LinkButton';
import { Link } from 'gatsby';

const Footer: React.FC = () => {
  return (
    <div className="footerContainer">
      <div className="footerContent">
        <div className="footerRow">
          <div className="footerHeading">Få tilgang</div>
          {/* <div>Kontakt oss</div> */}
          <Link className="navbarLink" to="/kontakt">
            Kontakt oss
          </Link>
          <a className={'navLogin navbarLink'} href="https://app.innbyggerkontakt.no/" target="_blank" rel="noreferrer">
            Logg inn
          </a>
        </div>
        {/* <div className="footerRow">
            <div className="footerHeading">Dokumentasjon</div>
            <div>Produktspesifikasjoner</div>
            <div>Hvordan bruke innbyggerkontakt</div>
          </div> */}
        <div className="footerRow">
          <div className="footerHeading">Kontakt oss</div>
          <Link className="navbarLink" to="/om">
            Om innbyggerkontakt
          </Link>
          <Link className="navbarLink" to="/support">
            Support
          </Link>
          <Link className="navbarLink" to="/personvern">
            Personvern
          </Link>
        </div>
        <div className="footerRightRow">
          <LinkButton to="/kontakt" className="fTryOutButton">
            Kom i kontakt med oss
          </LinkButton>
          <div className="footerLogoAndName">
            <img className="footerLogo" src={Logo} alt="Innbyggerkontakt Logo" />
            <div className="footerName">
              <div>Knowit | KF</div>
              <div>2021</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Footer;
