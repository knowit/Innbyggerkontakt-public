import { Text } from 'components';
import CardList from 'components/CardList/CardList';
import SearchBar from 'components/SearchBar/SearchBar';
import SortDropdownButton, {
  SortOptions,
} from 'components/SearchTemplate/components/SortDropdownButton/SortDropdownButton';
import store from 'contexts/store';
import { FilterGroup } from 'innbyggerkontakt-design-system';
import { CategoryTagNames, Template } from 'models';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { filterTemplate, sortTemplatesAfterDates, sortTemplatesAfterNames } from 'utils/Template/util';

import './InspirationPage.scss';

const InspirationPage = () => {
  const navigate = useNavigate();
  const [list, setList] = useState<Template[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Template[]>([]);
  const [toggledFilters, setToggledFilters] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<SortOptions>(SortOptions.NEWEST);
  const dbAccess = store.dbAccess;

  // Fetching the templates from the database
  useEffect(() => {
    dbAccess.getPublishedTemplates().then((templates) => setList(templates));
  }, []);

  useEffect(() => {
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

    const filteredList = list.filter((template) => filterTemplate(template, searchTerm, toggledFilters, false));
    const sortedList = sortList(filteredList, sortBy);

    setSearchResults(sortedList);
  }, [searchTerm, toggledFilters, sortBy, list]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleElementClick = (template: Template) => {
    navigate(`/oversikt/forhaandsvisning/${template.id}`);
  };

  return (
    <div className="inspirationPageContainer">
      <h1>Inspirasjon</h1>
      <Text>På denne siden finner du maler laget av vår redaktør som du kan bruke som utgangspunkt i utsendinger.</Text>

      <div>
        <SearchBar onChange={handleChange} />
        <SortDropdownButton setSortBy={setSortBy} />
      </div>
      <div>
        <p>Kategori:</p>
        <FilterGroup
          options={Object.values(CategoryTagNames)}
          toggled={toggledFilters}
          setToggled={setToggledFilters}
        />
      </div>
      <CardList list={searchResults} maxSearchResult={Infinity} onClick={handleElementClick} showTags />
    </div>
  );
};

export default InspirationPage;
