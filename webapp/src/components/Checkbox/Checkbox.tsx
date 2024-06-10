import { ReactNode, useState } from 'react';
import './Checkbox.scss';

export interface Props extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  children?: ReactNode;
  label?: string;
  checked?: boolean;
  key?: string;
  onChange?: (value?: string) => void;
  value?: string;
}

export const Checkbox: React.FC<Props> = ({ children, label, checked, key, onChange, value, ...rest }) => {
  const [dropdownChecked, setDropdownChecked] = useState<boolean>(checked || false);

  const checkboxChange = () => {
    setDropdownChecked((prevState) => {
      const currentState = !prevState;
      onChange && onChange(currentState ? value : undefined);
      return currentState;
    });
  };

  return (
    <div key={key} className="checkboxField">
      <input {...rest} checked={dropdownChecked} type="checkbox" onChange={() => checkboxChange()} />
      <p className="checkboxLabel" onClick={() => checkboxChange()}>
        {label}
      </p>
      {children}
    </div>
  );
};

export default Checkbox;
