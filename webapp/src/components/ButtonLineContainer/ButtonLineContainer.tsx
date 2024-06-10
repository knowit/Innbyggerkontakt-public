import * as React from 'react';
import { ReactNode } from 'react';

interface Props {
  children: ReactNode;
  style?: React.CSSProperties;
  className?: string;
}

export const ButtonLineContainer: React.FC<Props> = ({ children, style, className }) => {
  return (
    <div className={`buttonLineContainer ${className}`} style={style}>
      {children}
    </div>
  );
};

export default ButtonLineContainer;
