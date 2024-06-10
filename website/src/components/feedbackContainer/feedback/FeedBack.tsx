import React from 'react';
import './FeedBack.scss';

interface Props {
  quote: string;
  name: string;
  kommune: string;
  imageRef: string;
  imageRefAlt: string;
}

const Feedback: React.FC<Props> = ({ quote, name, kommune, imageRef, imageRefAlt }: Props) => {
  // List of feedbacks

  return (
    <div className="feedback">
      <img className="feedbackImage" src={imageRef} alt={imageRefAlt} />
      <div className="feedbackQuote">{quote}</div>
      <div className="feedbackInformation">
        {name}, {kommune}
      </div>
    </div>
  );
};

export default Feedback;
