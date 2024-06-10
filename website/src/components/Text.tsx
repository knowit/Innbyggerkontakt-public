import React from 'react';

interface Props {
  className: string;
  children: string | string[];
  style?: React.CSSProperties | undefined;
}

export const Text: React.FC<Props> = ({ className, children, style }: Props) => {
  return (
    <div className={className} style={style}>
      {children}
    </div>
  );
};

export default Text;
