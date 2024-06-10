import * as React from 'react';
import '../styles/index.scss';
import MainContainer from '../containers/mainContainer/MainContainer';
import { Cookies } from '../components/Cookies/Cookies';

// markup
const Personvern: React.FC = () => {
  return (
    <MainContainer pagename="Personvern">
      <Cookies />
    </MainContainer>
  );
};

export default Personvern;
