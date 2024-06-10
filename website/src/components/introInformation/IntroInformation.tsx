import React from 'react';
import './IntroInformation.scss';
import mailwhite from '../../images/mailwhite.svg';
import InfoBox from '../infoBox/InfoBox';
import LinkButton from '../Buttons/LinkButton/LinkButton';
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

export const IntroInformation: React.FC = () => {
  return (
    <div className="introInformationContainer" id="introInformation">
      <InfoBox>
        <div className="textBlock">
          <div className="heading">Vær der for dine innbyggere</div>
          <div className="iiDescription">
            <p>
              Med Innbyggerkontakt har du muligheten til å bli bedre kjent med innbyggerne i din kommune. Du kan ønske
              velkommen til nye innbyggere, informere foreldre om søknad til barnehageplass, og du kan ønske alle
              18-åringer til lykke med dagen (og informere om deres muligheter og rettigheter).
            </p>
            <p>Innbyggerkontakt er knyttet sammen med Folkeregisteret og har alltid oppdatert og riktig informasjon.</p>
            <p>Du kan alltid være trygg på at tjenesten ivaretar personvernet til innbyggerne.</p>
          </div>
        </div>
        <div className="actionButtons">
          <img className="mailwhiteImage" src={mailwhite} alt="Bilde av brev" />
          <LinkButton to="/dokumentasjon" className="seDokumentasjon">
            Se dokumentasjon
          </LinkButton>
          <LinkButton to="/kontakt" className="iiTryOutButton">
            Kom i kontakt med oss
          </LinkButton>
        </div>
      </InfoBox>
    </div>
  );
};

export default IntroInformation;
