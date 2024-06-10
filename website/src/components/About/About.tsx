import React from 'react';
import './About.scss';
import system from '../../images/system.svg';
import InformationPageContainer from '../../containers/informationPageContainer/InformationPageContainer';
import LinkButton from '../Buttons/LinkButton/LinkButton';

// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const About: React.FC = () => {
  const heading = 'Om Innbyggerkontakt';
  const descriptionParagraphs: string[] = [
    'Innbyggerkontakt er en tjeneste levert av KF og Knowit og er utviklet for og med kommuner. Tjenesten ble først sluppet i mars 2021 og er i stadig utvikling.',
  ];
  const buttons: JSX.Element[] = [
    <LinkButton to="/support" className="tertiary" key="0">
      Support
    </LinkButton>,
    <LinkButton to="/kontakt" className="tertiary" key="1">
      Kontakt
    </LinkButton>,
    <LinkButton to="/dokumentasjon" className="tertiary" key="2">
      Dokumentasjon
    </LinkButton>,
  ];

  return (
    <InformationPageContainer
      heading={heading}
      descriptionParagraphs={descriptionParagraphs}
      buttons={buttons}
      illustrationRef={system}
      illustrationRefAlt={'Personer som deles opp i grupper'}
    />
  );
};

export default About;
