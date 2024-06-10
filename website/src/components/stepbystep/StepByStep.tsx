import React from 'react';
import './StepByStep.scss';
import playImage from '../../images/play.svg';
import colorChoiceImage from '../../images/fargevalg.svg';
import connectImage from '../../images/connect.svg';

// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const StepByStep: React.FC = () => {
  return (
    <div className="stepByStepContainer" id="stepByStep">
      <h4 className="heading stepByStepHeading">Kom i gang med Innbyggerkontakt</h4>
      <div className="step">
        <div className="stepImage">
          <img className="stepConnectImage" src={connectImage} alt="Person som kobler sammen to ledninger." />
        </div>
        <div className="stepText">
          <p>
            Det er enkelt. Vi kan hjelpe deg med å få tilgang til FIKS folkeregister, kontakt- og
            reservasjonsregisteret. Nå er du klar til å opprette en bruker i Innbyggerkontakt.
          </p>
        </div>
      </div>
      <div className="step middleStep">
        <div className="stepText">
          <p>
            Når dere har fått tilgang kan dere gå i gang med å legge inn kommunens grafiske profil. Det skal være lett å
            se hvor meldingen kommer fra!
          </p>
        </div>
        <div className="stepImage">
          <img className="stepColorChoiceImage" src={colorChoiceImage} alt="Person som velger i farger." />
        </div>
      </div>
      <div className="step">
        <div className="stepImage">
          <img className="stepPlayImage" src={playImage} alt="Person mottar mail" />
        </div>
        <div className="stepText">
          <p>
            Da er dere klare til å lage den første meldingen! Du kan sette opp på forhånd akkurat den stilen og det
            formatet som hver hendelse krever. Vil du hjelpe en som nylig har flyttet til kommunen din? Eller vil du
            gratulere nybakte foreldre?
          </p>
        </div>
      </div>
    </div>
  );
};

export default StepByStep;
