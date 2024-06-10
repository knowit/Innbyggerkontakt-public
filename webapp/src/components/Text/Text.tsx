import { CSSProperties, ReactNode } from 'react';

interface Props {
  className?: string;
  children: string | string[] | ReactNode;
  style?: CSSProperties;
}

export const Text: React.FC<Props> = ({ children, ...rest }) => {
  return <div {...rest}>{children}</div>;
};

export default Text;
