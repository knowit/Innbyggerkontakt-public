import { useEffect, useState } from 'react';
import { Button, FormWrapper } from '../';
import { OptionType } from '../../models';
import './ChoiceSlider.scss';

interface Props {
  children?: React.ReactNode;
  info?: string;
  title?: string;
  className?: string;
  options: OptionType[];
  onClick: (e: string) => void;
  value?: string;
  id?: string;
  showTitle?: boolean;
}

export const ChoiceSlider: React.FC<Props> = ({ info, title, className, options, onClick, value, id, showTitle }) => {
  // TODO: Veldig rar interaksjon her, virker for at verdier satt i useState her er litt løk kanskje?
  const [activeValue, setActiveValue] = useState<string | undefined>(value);

  useEffect(() => {
    setActiveValue(value);
  }, [value]);

  return (
    <div id={id} className={`choiceSlider ${className || ''}`}>
      <FormWrapper title={title} info={info} showTitle={showTitle}>
        <div className="choiceSliderButtons">
          {options.map((option) => (
            <Button
              key={option.value}
              className={`choiceButton ${activeValue === option.value && 'activeChoiceButton'}`}
              onClick={() => {
                onClick(option.value);
                setActiveValue(option.value);
              }}
            >
              {option.label}
            </Button>
          ))}
        </div>
      </FormWrapper>
    </div>
  );
};

export default ChoiceSlider;
