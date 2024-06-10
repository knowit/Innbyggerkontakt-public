import React from 'react';
import Text from '../../Text';
import './SalesPoint.scss';
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
interface Props extends React.InputHTMLAttributes<HTMLDivElement> {
  heading: string;
  text: string;
  svgLink: string;
  altText: string;
}

export const SalesPoint: React.FC<Props> = ({ heading, text, svgLink, altText }: Props) => {
  return (
    <div className="salesPoint">
      <img className="spImage" src={svgLink} alt={altText} />
      <div className="spInformation">
        <h4 className="spHeading">{heading}</h4>
        <Text className="spText">{text}</Text>
      </div>
    </div>
  );
};

export default SalesPoint;
