import * as React from 'react';
import '../styles/index.scss';
import Introduction from '../components/introduction/Introduction';
import SalesPointContainer from '../components/salespoinsContainer/SalesPointsContainer';
import IntroInformation from '../components/introInformation/IntroInformation';
import StepByStep from '../components/stepbystep/StepByStep';
import ContactBox from '../components/contactBox/ContactBox';
import FeedbackContainer from '../components/feedbackContainer/FeedbackContainer';
import MainContainer from '../containers/mainContainer/MainContainer';
import { Helmet } from 'react-helmet';
import { Webinar } from '../components/webinar/webinar';

// markup
const IndexPage: React.FC = () => {
  return (
    <MainContainer>
      <Helmet>
        <title>Innbyggerkontakt</title>
        <meta property="og:title" content="Innbyggerkontakt" />
        <meta property="og:type" content="website" />
        <meta property="og:url " content="https://www.innbyggerkontakt.no" />
        <meta
          property="og:description "
          content="Gi relevant informasjon til innbyggere i din kommune når de trenger det"
        />
      </Helmet>
      <Introduction />
      <Webinar />
      <SalesPointContainer />
      <IntroInformation />
      <StepByStep />
      <ContactBox />
      <FeedbackContainer />
    </MainContainer>
  );
};

export default IndexPage;
