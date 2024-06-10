import React from 'react';
import './Contact.scss';
import MailImage from '../../images/mail.svg';

// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const Contact: React.FC = () => {
  // const heading = 'Ta kontakt med oss på e-post, så vil du bli kontaktet av teamet vårt';
  // const descriptionParagraphs: string[] = [''];
  // let buttons : JSX.Element[] = [<SupportButton/>, <ContactButton/>, <DocumentationButton/>]

  const email = ' salg@innbyggerkontakt.no';

  return (
    // <InformationPageContainer
    //     heading={heading}
    //     descriptionParagraphs={descriptionParagraphs}
    //     // buttons={buttons}
    //     illustrationRef={MailImage}
    //     email={email}
    // />
    <div className="contactFormContainer">
      <div className="contactFormContent">
        <img className="formMailImage" src={MailImage} alt="Person mottar mail" />
        <div className="informationTextContainer">
          <div className="contactFormDescription">
            Ta kontakt med oss på <b>e-post</b>, så vil du bli kontaktet av teamet vårt.
          </div>
          {/* //value={email} onChange={handleChange}/> */}
          <div className="iPageContact">
            <div className="iPageEmail">
              <b>E-post </b>
              <a className="iPageEmail" href={'mailto:' + email}>
                {email}
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
