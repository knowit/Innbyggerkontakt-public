import { SetStateAction } from 'react';
import { components, OptionProps } from 'react-select';
import { Dropdown } from '../../components';
import { OptionType } from '../../models';

export const fontOptions = [
  { value: 'Arial', label: 'Arial' },
  { value: 'Arial Black', label: 'Arial Black' },
  { value: 'Comic Sans MS', label: 'Comic Sans MS' },
  { value: 'Courier New', label: 'Courier New' },
  { value: 'Droid Sans', label: 'Droid Sans' },
  { value: 'Georgia', label: 'Georgia' },
  { value: 'Helvetica', label: 'Helvetica' },
  { value: 'Impact', label: 'Impact' },
  { value: 'Lato', label: 'Lato' },
  { value: 'Lucida Console', label: 'Lucida Console' },
  { value: 'Lucida Sans Unicode', label: 'Lucida Sans Unicode' },
  { value: 'Open Sans', label: 'Open Sans' },
  { value: 'Roboto', label: 'Roboto' },
  { value: 'Tahoma', label: 'Tahoma' },
  { value: 'Times New Roman', label: 'Times New Roman' },
  { value: 'Trebuchet MS', label: 'Trebuchet MS' },
  { value: 'Ubuntu', label: 'Ubuntu' },
  { value: 'Verdana', label: 'Verdana' },
];
interface FontDropdown {
  value: OptionType;
  onChange: (value: SetStateAction<OptionType>) => void;
}
const inputStyle = {
  control: () => ({
    border: 0,
    boxShadow: 'none',
    display: 'flex',
  }),
};

const Option = (props: unknown) => {
  const { data } = props as OptionProps<OptionType, false>;
  return (
    <div style={{ fontFamily: data.value }}>
      <components.Option {...(props as OptionProps<OptionType, false>)} />
    </div>
  );
};

export const FontDropdown: React.FC<FontDropdown> = ({ value, onChange }) => {
  return (
    <Dropdown
      style={{ width: '40%', minWidth: '250px' }}
      components={{ Option }}
      onChange={(e) => onChange(e as OptionType)}
      value={value}
      placeholder={'Fonter'}
      options={fontOptions}
      styles={inputStyle}
      isClearable
      className={'dropdown'}
      isSearchable={true}
      title="Font"
      openMenuOnFocus
    />
  );
};
export default FontDropdown;
