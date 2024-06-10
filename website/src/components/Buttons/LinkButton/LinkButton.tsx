import { Link } from 'gatsby';
import React from 'react';
import './LinkButton.scss';

interface Props {
  className: string;
  children: string;
  to: string;
}

const LinkButton: React.FC<Props> = ({ className, children, to }: Props) => {
  return (
    <Link to={to} className={'linkButton ' + className}>
      {children}
    </Link>
  );
};

export default LinkButton;
