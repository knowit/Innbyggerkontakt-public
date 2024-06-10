import ChevronLeft from '@mui/icons-material/ChevronLeft';
import NavigateNextOutlined from '@mui/icons-material/NavigateNextOutlined';
import { Button } from 'innbyggerkontakt-design-system';
import { Text } from '../../../../../../components';

import './NavigationButtons.scss';

interface Props extends React.HTMLAttributes<HTMLDivElement> {
  submit?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  exitButton?: boolean;
  onNavigate?: (back: boolean, sendToPath?: string) => void;
}

const NavigationButtons: React.FC<Props> = ({
  disabled,
  submit = true,
  exitButton = false,
  onClick,
  onNavigate,
  className,
  ...rest
}) => {
  return (
    <div {...rest} className={`navigationButtonsContainer ${className || ''}`}>
      <Button
        color="tertiary"
        variant="square"
        type="button"
        svg={[25, 15]}
        onClick={() => onNavigate && onNavigate(true)}
      >
        <ChevronLeft />
        <Text>{exitButton ? 'Gå tilbake til forsiden' : 'Tilbake'}</Text>
      </Button>
      <Button
        className="primary navigationButton"
        type={submit ? 'submit' : 'button'}
        disabled={disabled}
        onClick={onClick}
      >
        <Text className="textButton">Videre</Text>
        <NavigateNextOutlined fontSize="small" />
      </Button>
    </div>
  );
};

export default NavigationButtons;
