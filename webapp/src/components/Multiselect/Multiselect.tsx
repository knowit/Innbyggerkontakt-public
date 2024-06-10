import { Dropdown } from '../';
import { DropdownProps } from '../Dropdown/Dropdown';
import './Multiselect.scss';

export const Multiselect: React.FC<DropdownProps> = ({ className = '', ...rest }) => {
  return (
    <>
      <Dropdown className={`multiselect ${className}`} isSearchable isMulti {...rest} />
    </>
  );
};

export default Multiselect;
