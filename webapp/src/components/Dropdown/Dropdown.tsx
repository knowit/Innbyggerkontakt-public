import { useState } from 'react';
import Select, { OnChangeValue, Props } from 'react-select';
import { v4 as uuid } from 'uuid';
import { FormWrapper } from '../';
import { FieldWrapperProps, OptionType } from '../../models';
import './Dropdown.scss';

export interface DropdownProps extends Omit<Props, 'isMulti'>, FieldWrapperProps {
  options: Array<OptionType>;
  style?: React.CSSProperties | undefined;
  className?: string;
  id?: string;
  onFocus?: () => void;
  errorMessage?: string;
  isMulti?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  inputRef?: (instance: HTMLSelectElement | OnChangeValue<any, boolean> | null) => void;
}

export const Dropdown: React.FC<DropdownProps> = ({
  options,
  className = '',
  isSearchable = false,
  value,
  onChange,
  id,
  disabled = false,
  info,
  mandatory,
  title,
  style,
  errorMessage,
  showTitle = true,
  isMulti = false,
  inputRef,
  isClearable = true,
  ...rest
}) => {
  const [uniqueId] = useState<string>(uuid());
  const inputId = id || uniqueId;
  return (
    <div className={`inputDropdownComponent ${className}`} style={style}>
      <div className="formDropdown">
        <FormWrapper
          labelForId={id}
          errorMessage={errorMessage}
          title={title}
          mandatory={mandatory}
          info={info}
          disabled={disabled}
          showTitle={showTitle}
        >
          <Select
            id={inputId}
            onChange={onChange}
            value={value}
            options={options}
            isDisabled={disabled}
            isClearable={isClearable}
            className="dropdown"
            isSearchable={isSearchable}
            openMenuOnFocus
            classNamePrefix="reactSelect"
            isMulti={isMulti}
            ref={inputRef}
            {...rest}
          />
        </FormWrapper>
      </div>
    </div>
  );
};

export default Dropdown;
