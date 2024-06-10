import * as React from 'react';
import '../styles/index.scss';
import MainContainer from '../containers/mainContainer/MainContainer';
import About from '../components/About/About';

// markup
const AboutPage: React.FC = () => {
  return (
    <MainContainer pagename="Om innbyggerkontakt">
      <About />
    </MainContainer>
  );
};

export default AboutPage;
