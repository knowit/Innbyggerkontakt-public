import Sort from '@mui/icons-material/Sort';

import { Text } from '../../../../components';
import './SortDropdownButton.scss';

export enum SortOptions {
  NEWEST = 'Nyest først',
  OLDEST = 'Eldst først',
  ALPHA = 'Alfabetisk A-Å',
  REVERSE_ALPHA = 'Alfabetisk Å-A',
}

type Props = {
  setSortBy: React.Dispatch<React.SetStateAction<SortOptions>>;
};

const SortDropdownButton = ({ setSortBy }: Props) => {
  return (
    <div className="sortDropdownContainer">
      <select defaultValue={SortOptions.NEWEST} onChange={(event) => setSortBy(event.target.value as SortOptions)}>
        {Object.values(SortOptions).map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      <Sort />
      <Text>Sorter</Text>
    </div>
  );
};

export default SortDropdownButton;
