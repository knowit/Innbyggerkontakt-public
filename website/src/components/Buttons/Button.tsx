import React from 'react';
import './Button.scss';
interface Props {
  className: string;
  onClick?: ((event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void) | undefined;
  children?: React.ReactNode;
  disabled?: boolean;
  style?: React.CSSProperties | undefined;
  type?: 'button' | 'submit' | 'reset' | undefined;
}

export const Button: React.FC<Props> = ({
  onClick,
  children,
  className,
  disabled = false,
  style,
  type = 'button',
}: Props) => {
  return (
    <button disabled={disabled} className={className} onClick={onClick} style={style} type={type}>
      {children}
    </button>
  );
};

export default Button;
