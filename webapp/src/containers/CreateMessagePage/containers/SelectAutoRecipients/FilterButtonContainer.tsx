import { Dispatch, FC, SetStateAction } from 'react';
import { Button, Text } from '../../../../components';
import CheckIcon from '@mui/icons-material/Check';
import AddIcon from '@mui/icons-material/Add';

interface Props {
  filterButtons: {
    label: string;
    state: boolean | undefined;
    setState: Dispatch<SetStateAction<boolean | undefined>>;
  }[];
}

export const FilterButtonContainer: FC<Props> = ({ filterButtons }) => {
  return (
    <div>
      <h2 className="regular18">Legg til filtre</h2>
      <div className="filterButtonContainer">
        {filterButtons.map((filter, i) => (
          <Button
            className={`btn_rounded_small_${filter.state ? 'secondary' : 'primary'}`}
            onClick={() => filter.setState(!filter.state)}
            key={i}
          >
            {filter.state ? <CheckIcon /> : <AddIcon />}
            <Text className="textButton">{filter.label}</Text>
          </Button>
        ))}
      </div>
    </div>
  );
};

export default FilterButtonContainer;
