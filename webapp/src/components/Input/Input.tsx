import { ReactNode, useState } from 'react';
import { RegisterOptions } from 'react-hook-form';
import { v4 as uuid } from 'uuid';
import { FormWrapper } from '../';
import { Text } from '../../components';
import { FieldWrapperProps } from '../../models';

import './Input.scss';

export interface InputComponent extends React.InputHTMLAttributes<HTMLInputElement>, FieldWrapperProps {
  id?: string;
  className?: string;
  iconClassName?: string;
  placeholder?: string;
  value?: string;
  defaultValue?: string;
  valueValidationFunc?: (value: string | undefined) => string | number | readonly string[] | undefined;
  style?: React.CSSProperties | undefined;
  pattern?: string;
  name?: string;
  icon?: ReactNode;
  rules?: RegisterOptions;
  inputRef?: React.Ref<HTMLInputElement>;
  errorText?: string;
  labelIcon?: ReactNode;
  // onFocus?: () => void;
}

export const Input: React.FC<InputComponent> = ({
  className,
  iconClassName,
  placeholder,
  value,
  style,
  disabled = false,
  info,
  mandatory,
  title,
  pattern,
  showTitle = true,
  titleComponent,
  additionalTitleClassName,
  id,
  icon,
  errorMessage,
  children,
  inputRef,
  errorText,
  labelIcon,
  ...rest
}) => {
  const [uniqueId] = useState<string>(uuid());
  const inputId = id || uniqueId;

  return (
    <div className={`inputFieldComponent ${className || ''}`} style={style}>
      <FormWrapper
        labelForId={id}
        errorMessage={errorMessage}
        title={title}
        mandatory={mandatory}
        info={info}
        showTitle={showTitle}
        disabled={disabled}
        icon={labelIcon}
        titleComponent={titleComponent}
        additionalTitleClassName={additionalTitleClassName}
      >
        <Text className="infoTextfalse">{errorText as string}</Text>

        {icon !== 'null' ? <div className={`${iconClassName}`}>{icon}</div> : <></>}
        <input
          id={inputId}
          className={`formInput ${disabled ? ' formInputDisabled' : ''}`}
          placeholder={placeholder}
          value={value}
          pattern={pattern}
          disabled={disabled}
          {...rest}
          ref={inputRef}
        />
      </FormWrapper>
      {children}
    </div>
  );
};

export default Input;
