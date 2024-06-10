import React, { ReactNode } from 'react';
import '../LinkButton.scss';

interface Props {
  className: string;
  children: string;
  href: string;
  icon?: ReactNode;
}

const ExternalLinkButton: React.FC<Props> = ({ className, children, href, icon }: Props) => {
  return (
    <a className={'linkButton externalLinkButton ' + className} href={href} target="_blank" rel="noreferrer">
      {icon}
      {children}
    </a>
  );
};

export default ExternalLinkButton;
