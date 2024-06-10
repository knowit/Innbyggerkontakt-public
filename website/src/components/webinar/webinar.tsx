import React from 'react';
import './webinar.scss';
import InfoBox from '../infoBox/InfoBox';

export const Webinar: React.FC = () => {
  return (
    <div className="webinarBoxContainer" id="webinarBox">
      <InfoBox>
        <div className="webinarBoxTextBlock">
          <div className="webinarBoxHeading">Se opptak fra webinar 14. mars!</div>
          <div className="webinarBoxDescription">
            <p>
              Produktansvarlig, Kristin Sørdal, forteller om <b>Innbyggerkontakt</b> og svarer på spørsmål fra publikum.
              Med <b>Innbyggerkontakt</b> har du muligheten til å enkelt kommunisere med innbyggerne i kommunen - og
              ikke minst; bli bedre kjent med de!
            </p>
          </div>
        </div>
        <div className="webinarBoxActionButtons">
          <a className="webinarlink" href="https://my.demio.com/recording/DoWEYgeu" target="_blank" rel="noreferrer">
            Se webinaret her!
          </a>
        </div>
      </InfoBox>
    </div>
  );
};

export default Webinar;
