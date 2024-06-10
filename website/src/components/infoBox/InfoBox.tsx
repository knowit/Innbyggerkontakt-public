import React from 'react';
import './InfoBox.scss';

interface Props {
  children: React.ReactNode;
}

export const InfoBox: React.FC<Props> = ({ children }: Props) => {
  return (
    <div className="infoBoxContainer">
      <div className="innerContainer">{children}</div>
    </div>
  );
};

export default InfoBox;
