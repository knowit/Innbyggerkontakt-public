import React from 'react';
import './Support.scss';
import Connect from '../../images/connect.svg';
import InformationPageContainer from '../../containers/informationPageContainer/InformationPageContainer';
import LinkButton from '../Buttons/LinkButton/LinkButton';

// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const Support: React.FC = () => {
  const heading = 'Support';
  const descriptionParagraphs: string[] = [
    'Dersom du allerede bruker innbyggerkontakt har vi et support-team som er klar for alle henvendelsene deres. Vi har og mye informasjon som ligger klart på dokumentasjons-sidene våre, så dersom du ønsker å finne utav litt selv kan du finne mer informasjon der.',
    'Dersom du ikke er kunde enda kan sende oss epost på salg@innbyggerkontakt.no så kan vi kontakte deg og finne en løsning for deg og din kommune.',
  ];
  const buttons: JSX.Element[] = [
    <LinkButton to="/dokumentasjon" className="tertiary" key="0">
      Dokumentasjon
    </LinkButton>,
    <LinkButton to="/kontakt" className="tertiary" key="1">
      Kontakt
    </LinkButton>,
  ];
  const email = ' innbyggerkontakt@kf.no';
  const phone = '324346456';

  return (
    <InformationPageContainer
      heading={heading}
      descriptionParagraphs={descriptionParagraphs}
      buttons={buttons}
      illustrationRef={Connect}
      illustrationRefAlt="Mann kobler sammen to ledninger"
      email={email}
      phone={phone}
    />
  );
};

export default Support;
