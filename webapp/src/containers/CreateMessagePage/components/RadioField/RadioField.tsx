import { ChangeEvent, DetailedHTMLProps } from 'react';
import './RadioField.scss';

interface Props extends DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement> {
  className?: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onKeyPress?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  id?: string;
  style?: React.CSSProperties | undefined;
  disabled?: boolean;
  title: string;
}

export const RadioField: React.FC<Props> = ({ className, onChange, style, disabled = false, title, ...props }) => {
  return (
    <label className={`radioFields ${className || ''}`} htmlFor={title} style={style}>
      <input type="radio" id={title} onChange={onChange} {...props} />
      <h3 className={'radioText ' + `${disabled ? 'disabledText' : ''}`}>{title}</h3>
    </label>
  );
};

export default RadioField;
