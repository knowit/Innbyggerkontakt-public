import * as React from 'react';
import '../styles/index.scss';
import MainContainer from '../containers/mainContainer/MainContainer';
// import ContactForm from '../components/ContactForm/ContactForm';
import Contact from '../components/ContactPage/Contact';

// markup
const ContactPage: React.FC = () => {
  return (
    <MainContainer pagename="Kontakt">
      {/* <ContactForm/> */}
      <Contact />
    </MainContainer>
  );
};

export default ContactPage;
