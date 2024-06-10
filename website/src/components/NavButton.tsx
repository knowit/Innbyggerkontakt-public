import React from 'react';

import { Link } from 'gatsby';
import { Text } from '../components/Text';
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import { IconName } from '@fortawesome/free-solid-svg-icons';
interface Props {
  text: string;
  link: string;
  className: string;
  icon?: string;
  onClick?: ((event: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => void) | undefined;
}

export const NavButton: React.FC<Props> = ({ text, link, className, icon = '', onClick }: Props) => {
  return (
    <>
      <Link to={link} className={className + ' navButton'} onClick={onClick}>
        {/* {icon !== '' ? <FontAwesomeIcon icon={icon as IconName} style={{ paddingRight: '7px' }} /> : <></>} */}
        <Text className="textNav">{text}</Text>
      </Link>
      {/* <Link to={link} className={className + ' navButton'} onClick={onClick}>
        {icon !== '' ? <FontAwesomeIcon icon={icon as IconName} style={{ paddingRight: '7px' }} /> : <></>}
        <Text className="textNav">{text}</Text>
      </Link> */}
    </>
  );
};

export default NavButton;
