import { ChangeEvent } from 'react';
import './RadioButton.scss';

interface Props {
  className?: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onKeyPress?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  value: string;
  id?: string;
  style?: React.CSSProperties | undefined;
  disabled?: boolean;
  title: string;
  checked: boolean;
}

export const RadioButton: React.FC<Props> = ({ value, onChange, disabled = false, title, checked }) => {
  return (
    <label className="radioButton">
      <input type="radio" value={value} checked={checked} onChange={onChange} disabled={disabled} />
      {title}
    </label>
  );
};

export default RadioButton;
