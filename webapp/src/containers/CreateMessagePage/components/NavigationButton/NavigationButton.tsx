import { DetailedHTMLProps } from 'react';

import { Button } from 'innbyggerkontakt-design-system';
import { ButtonProps } from 'innbyggerkontakt-design-system/dist/components/Button';

import CheckIcon from '@mui/icons-material/Check';
import NavigateNextOutlinedIcon from '@mui/icons-material/NavigateNextOutlined';

import { SaveOptions } from '../../util';

import './NavigationButton.scss';

interface Props extends ButtonProps {
  submit?: boolean;
  saveState?: SaveOptions;
  className?: string;
  type?: ButtonProps['type'];
  divProps?: DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>;
}

export const NavigationButton: React.FC<Props> = ({ type = 'submit', saveState, className, divProps, ...rest }) => {
  return (
    <div className={`buttonAndSaveContainer ${className || ''}`} {...divProps}>
      {saveState === SaveOptions.SAVED && (
        <div className="loadContainer regular14">
          <CheckIcon /> <p>Lagret</p>
        </div>
      )}
      <Button type={type} svg={[15, 25]} {...rest}>
        Videre
        <NavigateNextOutlinedIcon />
      </Button>
    </div>
  );
};

export default NavigationButton;
