import React from 'react';
// import Text from '../../Text';
import './SalesPointsContainer.scss';
import infosvg from '../../images/info.svg';
import connectsvg from '../../images/system.svg';
import grafsvg from '../../images/graf.svg';
import SalesPoint from './salespoint/SalesPoint';
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

export const SalesPointContainer: React.FC = () => {
  return (
    <div className="salesPointContainer" id="salespoints">
      <div className="salesPointContent">
        {/* <SalesPoint svgLink={infosvg} heading="Nå innbyggerne dine" text="Send informasjon og varslinger direkte til innbygger. Dette kan du lese mer om her."/>
        <SalesPoint svgLink={connectsvg} heading="Finn de rette" text="Tjenesten bruker blant annet folkeregisteret som gjør at du kan gi målrettet informasjon. Les mer om kildene her."/>
        <SalesPoint svgLink={grafsvg} heading="Ha kontroll og lær" text="Vi tilbyr enkel og oversiktlig statistikk, sånn at du kan lære hvordan informasjonen treffer innbyggerne dine. Du kan lese mer her." /> */}
        <SalesPoint
          svgLink={infosvg}
          heading="Nå innbyggerne dine"
          text="Send informasjon og varslinger direkte til innbygger."
          altText="Dame som får informasjon"
        />
        <SalesPoint
          svgLink={connectsvg}
          heading="Finn de rette"
          text="Tjenesten bruker blant annet folkeregisteret som gjør at du kan gi målrettet informasjon."
          altText="Personer som deles opp i grupper."
        />
        <SalesPoint
          svgLink={grafsvg}
          heading="Ha kontroll og lær"
          text="Vi tilbyr enkel og oversiktlig statistikk, sånn at du kan lære hvordan informasjonen treffer innbyggerne dine."
          altText="Person som studerer en graf."
        />
      </div>
    </div>
  );
};

export default SalesPointContainer;
