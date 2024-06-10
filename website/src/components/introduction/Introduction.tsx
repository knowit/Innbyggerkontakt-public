import React from 'react';
import './Introduction.scss';
import MailImage from '../../images/mail.svg';
import Button from '../Buttons/Button';
import LinkButton from '../Buttons/LinkButton/LinkButton';
import ReactModal from 'react-modal';

import Video from '../Video';

// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const Introduction: React.FC = () => {
  const [open, setOpen] = React.useState(false);

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <div className="introductionContainer">
      <div className="introductionContent">
        <img className="mailImage" src={MailImage} alt="Person mottar mail" />
        {/* <img className="mailImage" src={mailtest} alt="Person mottar mail"/> */}
        <div className="informationTextContainer">
          <h1 className="introHeading">Innbyggerkontakt</h1>
          <h2 className="description">
            Gi <b>relevant informasjon</b> til innbyggere i din kommune <b>når de trenger det</b>
            {/* TODO find a better way of handeling buttons */}
            <div className="descriptionButtons">
              <LinkButton to="/kontakt" className="iTryOutBytton">
                Kom i kontakt med oss
              </LinkButton>
              <Button onClick={handleOpen} className="seVideo">
                Se video
              </Button>
            </div>
          </h2>
          <ReactModal
            className="videoModal"
            isOpen={open}
            onRequestClose={handleClose}
            contentLabel="Example Modal In Gatsby"
          >
            <Video
              width="80%"
              className="modalVideo"
              videoSrcURL="https://www.youtube.com/embed/zhmyNMAhwdE"
              videoTitle="Innbyggerkontakt"
            />
          </ReactModal>
        </div>
      </div>
    </div>
  );
};

export default Introduction;
