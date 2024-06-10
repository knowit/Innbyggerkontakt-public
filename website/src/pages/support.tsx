import * as React from 'react';
import '../styles/index.scss';
import MainContainer from '../containers/mainContainer/MainContainer';
import Support from '../components/Support/Support';

// markup
const SupportPage: React.FC = () => {
  return (
    <MainContainer pagename="Support">
      <Support />
    </MainContainer>
  );
};

export default SupportPage;
