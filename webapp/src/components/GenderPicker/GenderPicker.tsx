import { useState } from 'react';
import { genderAlternatives } from '../../containers/CreateMessagePage/util';
import { OptionType } from '../../models';
import { Checkbox, CheckboxFields } from '../index';

interface Props {
  onChange: (e: string[]) => void;
  initialValues?: string[];
  className?: string;
}

export const GenderPicker: React.FC<Props> = ({ onChange, initialValues, className }) => {
  const [values, setValues] = useState<string[]>(
    initialValues && initialValues.length > 0 ? initialValues : genderAlternatives.map((gender) => gender.value),
  );

  const setState = (value: string | undefined, genderOption: OptionType): void => {
    setValues((prevValues) => {
      const newValueState = value
        ? [...new Set(prevValues.concat([value]))]
        : prevValues.filter((chekcedValue) => chekcedValue !== genderOption.value);
      onChange(newValueState);
      return newValueState;
    });
  };

  return (
    <div className={`genderPicker ${className || ''}`}>
      <CheckboxFields title="Kjønn">
        {genderAlternatives.map((genderOption) => {
          return (
            <Checkbox
              key={genderOption.value}
              {...genderOption}
              onChange={(value) => setState(value, genderOption)}
              checked={!!values.find((val) => val === genderOption.value)}
            />
          );
        })}
      </CheckboxFields>
    </div>
  );
};

export default GenderPicker;
