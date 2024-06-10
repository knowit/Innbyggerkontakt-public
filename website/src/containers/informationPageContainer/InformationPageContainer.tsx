import React from 'react';
import './InformationPageContainer.scss';

interface Props {
  heading: string;
  descriptionParagraphs: string[];
  buttons?: JSX.Element[];
  illustrationRef: string;
  illustrationRefAlt: string;
  email?: string;
  // phone?: string;
}

const InformationPageContainer: React.FC<Props> = ({
  heading,
  descriptionParagraphs,
  buttons,
  illustrationRef,
  illustrationRefAlt,
  email,
}: Props) => {
  return (
    <div className="informationPageContainer">
      <h1 className="iPageHeading">{heading}</h1>
      {descriptionParagraphs.map((p, index) => (
        <p key={index}>{p}</p>
      ))}
      {email ? (
        <div className="iPageContact">
          <div className="iPageEmail">
            <b>E-post:</b>
            <a className="iPageEmail" href={'mailto:' + email}>
              {' '}
              {email}
            </a>
          </div>
          {/* <div className="iPagePhone"><b>Mobil</b> {phone}</div> */}
        </div>
      ) : null}
      <div className="iPageButtons">{buttons}</div>
      <img className="informationPageIllustration" src={illustrationRef} alt={illustrationRefAlt} />
    </div>
  );
};

export default InformationPageContainer;
