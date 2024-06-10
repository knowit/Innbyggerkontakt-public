import { FilterGroup, FilterToggle } from 'innbyggerkontakt-design-system';
import { useEffect, useState } from 'react';
import { Template } from '../../models';
import {
  filterTemplate,
  sortTemplatesAfterDates,
  sortTemplatesAfterNames,
  translateTemplateTypes,
} from '../../utils/Template/util';
import SortDropdownButton, { SortOptions } from './components/SortDropdownButton/SortDropdownButton';

import { useNavigate } from 'react-router';
import CardList from '../CardList/CardList';
import SearchBar from '../SearchBar/SearchBar';
import './SearchTemplate.scss';

interface Props {
  list: Template[];
  rowclassName?: string;
  maxSearchResult?: number;
}

const TemplateTypes = ['Utkast', 'Publisert', 'Arkiverte'];

/**
 * General bulletin search component
 * @param extended includes additional filtering (types and date)
 */
export const SearchTemplate = ({ list }: Props) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Template[]>(list);
  const [toggledFilters, setToggledFilters] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<SortOptions>(SortOptions.NEWEST);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  useEffect(() => {
    /* filter and sort list by last changed */

    const sortList = (list: Template[], sortBy: SortOptions): Template[] => {
      switch (sortBy) {
        case SortOptions.OLDEST:
          return list.sort((a, b) => sortTemplatesAfterDates(b, a));
        case SortOptions.ALPHA:
          return list.sort((a, b) => sortTemplatesAfterNames(a, b));
        case SortOptions.REVERSE_ALPHA:
          return list.sort((a, b) => sortTemplatesAfterNames(b, a, true));
        default:
          return list.sort((a, b) => sortTemplatesAfterDates(a, b));
      }
    };

    const filteredList = list.filter((template) =>
      filterTemplate(template, searchTerm, translateTemplateTypes(toggledFilters)),
    );
    const sortedList = sortList(filteredList, sortBy);

    setSearchResults(sortedList);
  }, [searchTerm, toggledFilters, sortBy, list]);

  const handleElementClick = (template: Template) => {
    navigate(`/oversikt/forhaandsvisning/${template.id}`);
  };

  return (
    <div className={'searchTemplateContainer'}>
      <div className="search__headerContainer">
        <SearchBar value={searchTerm} onChange={handleChange} />
        <SortDropdownButton setSortBy={setSortBy} />
      </div>
      <div className="filterContainer">
        <div className="filterContainer__filters">
          <FilterGroup
            options={TemplateTypes}
            toggled={toggledFilters}
            setToggled={setToggledFilters}
            exclusivity={[TemplateTypes]}
          />
        </div>
        <FilterToggle label="Velg alle" onClick={() => setToggledFilters([])} toggled={toggledFilters.length === 0} />
      </div>

      <CardList
        list={searchResults}
        maxSearchResult={Infinity}
        onClick={handleElementClick}
        noFoundText={'Ingen maler funnet.'}
      />
    </div>
  );
};

export default SearchTemplate;
