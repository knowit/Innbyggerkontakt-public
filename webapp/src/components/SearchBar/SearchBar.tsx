import Search from '@mui/icons-material/Search';
import { Input } from 'innbyggerkontakt-design-system';

import './SearchBar.scss';

interface Props extends React.InputHTMLAttributes<HTMLInputElement> {
  value?: string;
}

const SearchBar = ({ onChange, value }: Props) => (
  <Input
    className="searchBarInput"
    id=""
    label=""
    icon={<Search />}
    placeholder="Søk"
    hideLabel={true}
    onChange={onChange}
    value={value}
    type="text"
    appearence="blue"
  />
);

export default SearchBar;
