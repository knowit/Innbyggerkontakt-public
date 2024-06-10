import { Link, LinkProps, matchPath, useLocation } from 'react-router-dom';

import './NavButton.scss';

interface Props extends LinkProps {
  text: string;
  className?: string;
  icon: React.ReactNode;
}

export const NavButton: React.FC<Props> = ({ text, icon, className, to, ...rest }) => {
  const location = useLocation();
  return (
    <Link
      {...rest}
      to={to}
      className={`navButtonContainer ${
        matchPath(to + '/*', location.pathname) ? 'navButtonContainer--active' : ''
      } ${className}`}
    >
      {icon}
      <span>{text}</span>
    </Link>
  );
};

export default NavButton;
