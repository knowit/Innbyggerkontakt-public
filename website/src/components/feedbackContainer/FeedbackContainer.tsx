import React from 'react';
import './FeedbackContainer.scss';
import vidarbilde from '../../images/vidarbilde.jpg';
import Feedback from './feedback/FeedBack';

type feedBackObject = {
  quote: string;
  name: string;
  kommune: string;
  imageRef: string;
  imageRefAlt: string;
};

const FEEDBACS: feedBackObject[] = [
  {
    quote: 'Skreddersydd, effektiv innbyggerinformasjon. Vi er stolte av å ha vært med på å forme dette produktet!',
    name: 'Vidar Karlsen',
    kommune: 'Tingvoll Kommune',
    imageRef: vidarbilde,
    imageRefAlt: 'Bilde av Vidar',
  },
  // {
  //   quote: 'Skreddersydd, effektiv innbyggerinformasjon. Vi er stolte av å ha vært med på å forme dette produktet!',
  //   name: 'Vidar Karlsen',
  //   kommune: 'Tingvoll Kommune',
  //   imageRef: vidarbilde,
  //   imageRefAlt: 'Bilde av Vidar',
  // },
  // {
  //   quote: 'Sitat fra en kunde som er fornøyd ikke misfornøyd',
  //   name: 'Ola Olaisen',
  //   kommune: 'Strandefjord',
  //   imageRef: vidarbilde,
  //   imageRefAlt: 'Bilde av Vidar',

  // },
  //   {
  //     quote: 'Sitat fra kunde om hvor bra innbyggerkontakt fungerer',
  //     name: 'Kari Karinsen',
  //     kommune: 'Tyrifjord',
  //     imageRef: testbilde
  // },
  // {
  //     quote: 'Sitat fra en kunde som er fornøyd ikke misfornøyd',
  //     name: 'Ola Olaisen',
  //     kommune: 'Strandefjord',
  //     imageRef: testbilde
  // },
];

const FeedbackContainer: React.FC = () => {
  return (
    <div className="feedbackContainer">
      <div className="feedbackContent">
        <h4 className="heading subHeading">Andre kommuner om Innbyggerkontakt</h4>
        <div className="feedbackList">
          {FEEDBACS.map((feedback) => {
            return (
              <Feedback
                key={feedback.name}
                quote={feedback.quote}
                name={feedback.name}
                kommune={feedback.kommune}
                imageRef={feedback.imageRef}
                imageRefAlt={feedback.imageRefAlt}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default FeedbackContainer;
