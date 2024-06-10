import { useState } from 'react';
import { civilStatusAlternatives } from '../../containers/CreateMessagePage/util';
import { OptionType } from '../../models';
import { Checkbox, CheckboxFields } from '../index';

interface Props {
  onChange: (e: string[]) => void;
  initialValues?: string[];
  className?: string;
}

export const PersonStatusPicker: React.FC<Props> = ({ onChange, initialValues, className }) => {
  const [values, setValues] = useState<string[]>(
    initialValues && initialValues.length > 0
      ? initialValues
      : civilStatusAlternatives.map((statusPickerOption) => statusPickerOption.value),
  );

  const setState = (value: string | undefined, statusOption: OptionType): void => {
    setValues((prevValues) => {
      const newValueState = value
        ? [...new Set(prevValues.concat([value]))]
        : prevValues.filter((chekcedValue) => chekcedValue !== statusOption.value);
      onChange(newValueState);
      return newValueState;
    });
  };

  // TODO: virker for at checked ikke registreres her
  return (
    <div className={`personStatusPicker ${className || ''}`}>
      <CheckboxFields title="Sivilstatus">
        {civilStatusAlternatives.map((statusPickerOption) => {
          return (
            <Checkbox
              key={statusPickerOption.value}
              {...statusPickerOption}
              onChange={(value) => {
                setState(value, statusPickerOption);
              }}
              checked={!!values.find((val) => val === statusPickerOption.value)}
            />
          );
        })}
      </CheckboxFields>
    </div>
  );
};

export default PersonStatusPicker;
