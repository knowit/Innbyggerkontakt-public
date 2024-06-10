import Menu from '@mui/icons-material/Menu';

import './BurgerButton.scss';

type Props = {
  onClick: () => void;
  isOpen: boolean;
};

export const BurgerButton = ({ isOpen, onClick }: Props) => {
  return (
    <Menu className={`burgerButtonContainer burgerButtonContainer--${isOpen ? 'open' : 'closed'}`} onClick={onClick} />
  );
};

export default BurgerButton;
