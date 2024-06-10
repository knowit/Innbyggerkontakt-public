import React from 'react';
import './ContactBox.scss';
import InfoBox from '../infoBox/InfoBox';
import contactsvg from '../../images/contact.svg';
import LinkButton from '../Buttons/LinkButton/LinkButton';
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

export const ContactBox: React.FC = () => {
  return (
    <div className="contactBoxContainer" id="contactBox">
      <InfoBox>
        <div className="contactBoxTextBlock">
          <div className="heading">Lurer du på noe?</div>
          <div className="contactBoxDescription">
            <p>
              Ønsker du pristilbud og presentasjon, eller trenger du hjelp til å komme i gang med Innbyggerkontakt? Vi
              er klare til å hjelpe deg!
            </p>
          </div>
        </div>
        <div className="contactBoxActionButtons">
          <img className="contactImage" src={contactsvg} alt="Snakkebobler" />

          <LinkButton to="/kontakt" className="contactBoxTryOutButton">
            Kom i kontakt med oss
          </LinkButton>
        </div>
      </InfoBox>
    </div>
  );
};

export default ContactBox;
