import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import Replay from '@mui/icons-material/Replay';
import SearchIcon from '@mui/icons-material/Search';

import { Button, FilterGroup, Input, Pagination } from 'innbyggerkontakt-design-system';
import { ListObject } from 'molecules';
import { DateSelection } from '../../components';

import { StoreContext } from '../../contexts';
import { Bulletin, BulletinMessage, SEARCH_FILTER_OPTIONS } from '../../models';
import { filterBulletin, sortBulletins } from './util';

import './Search.scss';

interface Props {
  placeholder?: string;
  list: BulletinMessage[];
  type?: string;
  onClick?: (e: BulletinMessage) => void;
  activeId?: string;
  extended?: boolean;
  rowclassName?: string;
  maxSearchResult?: number;
}

/**
 * General bulletin search component
 * @param extended includes additional filtering (types and date)
 */
export const Search: React.FC<Props> = ({
  list,
  type,
  onClick,
  activeId,
  extended,
  rowclassName = 'listRow',
  maxSearchResult = 6,
}) => {
  const navigate = useNavigate();

  const store = useContext(StoreContext);

  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<BulletinMessage[]>([]);

  const [toggledFilters, setToggledFilters] = useState<string[]>([]);
  const [fromDate, setFromDate] = useState<Date | undefined>(undefined);
  const [toDate, setToDate] = useState<Date | undefined>(undefined);

  const [currentPage, setCurrentPage] = useState(1);
  const [sliceStart, setSliceStart] = useState(0);
  const [sliceEnd, setSliceEnd] = useState(maxSearchResult);

  const handlePageClickLeft = () => {
    setCurrentPage(currentPage - 1 > 0 ? currentPage - 1 : 1);
    setSliceStart(sliceStart - maxSearchResult);
    setSliceEnd(sliceEnd - maxSearchResult);
  };
  const handlePageClickRight = () => {
    setCurrentPage(currentPage + 1);
    setSliceStart(sliceStart + maxSearchResult);
    setSliceEnd(sliceEnd + maxSearchResult);
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  useEffect(() => {
    /* reset page on filter change */
    setCurrentPage(1);
    setSliceStart(0);
    setSliceEnd(maxSearchResult);

    /* filter and sort list by last changed */
    const results = list
      .filter((bulletin) => filterBulletin(bulletin.bulletin as Bulletin, searchTerm, toggledFilters, fromDate, toDate))
      .sort((a, b) => sortBulletins(a.bulletin as Bulletin, b.bulletin as Bulletin));

    setSearchResults(results);
  }, [searchTerm, toggledFilters, fromDate, toDate, list]);

  const defaultOnClick = (type: string, firestoreBulletinWithId: BulletinMessage) => {
    switch (type) {
      case 'event':
        navigate(`/oversikt/aktive/${firestoreBulletinWithId.id}`);
        break;
      case 'draft':
        store.setBulletinId(firestoreBulletinWithId.id);
        store.setBulletin(firestoreBulletinWithId.bulletin as Bulletin);
        navigate(`/oversikt/utkast/${firestoreBulletinWithId.id}`);
        break;
      case 'finished':
        navigate(`/oversikt/utsendte/${firestoreBulletinWithId.id}`);
        break;
      case 'search':
        store.setBulletinId(firestoreBulletinWithId.id);
        store.setBulletin(firestoreBulletinWithId.bulletin as Bulletin);
        navigate(`/oversikt/planlagte/${firestoreBulletinWithId.id}`);
        break;
    }
  };

  const resetFilters = () => {
    setSearchTerm('');
    setFromDate(undefined);
    setToDate(undefined);
    setToggledFilters([]);
  };

  return (
    <>
      {extended ? (
        <>
          <div className="search__headerContainer">
            <Input
              className="searchInput"
              icon={<SearchIcon />}
              onChange={handleChange}
              value={searchTerm}
              appearence="blue"
              label=""
              hideLabel={true}
              placeholder="Søk"
              id=""
              type="text"
            />
            <Button
              className="search__resetButton"
              color="tertiary"
              fontWeight="bold"
              svg={[25, 15]}
              onClick={resetFilters}
            >
              <Replay /> Tøm alle filtre
            </Button>
          </div>
          <div className="filterContainer">
            <div className="filterContainer__filters">
              <p>Filtre: </p>
              <FilterGroup
                options={Object.values(SEARCH_FILTER_OPTIONS)}
                toggled={toggledFilters}
                exclusivity={[
                  ['SMS', 'Epost'],
                  ['SMS', 'Automatisk'],
                  ['Automatisk', 'Enkel'],
                  ['Planlagt', 'Kladd', 'Aktiv', 'Fullført'],
                  ['Enkel', 'Aktiv'],
                ]}
                setToggled={setToggledFilters}
              />
            </div>
            <div className="filterContainer__date">
              <DateSelection
                date={fromDate}
                onChange={setFromDate}
                title={'Sist endret fra og med'}
                showTitle
                dateFormat="dd.MM.yyyy"
                maxDate={new Date()}
                placeholderText="Dato"
              />
              <p className="separator">-</p>
              <DateSelection
                date={toDate}
                onChange={setToDate}
                title={'Sist endret til og med'}
                showTitle
                maxDate={new Date()}
                minDate={fromDate}
                dateFormat="dd.MM.yyyy"
                placeholderText="Dato"
              />
            </div>
            <div className="filterContainer__counter">{searchResults.length} treff</div>
          </div>
        </>
      ) : (
        <Input
          className="searchInput"
          icon={<SearchIcon />}
          onChange={handleChange}
          value={searchTerm}
          appearence="blue"
          label=""
          hideLabel={true}
          placeholder="Søk"
          id=""
          type="text"
        />
      )}

      <div className={rowclassName}>
        {searchResults.length ? (
          searchResults.slice(sliceStart, sliceEnd).map((e) => {
            return (
              <ListObject
                object={e}
                type={e.bulletin.status}
                key={e.id}
                overskrift={e.bulletin.name}
                onClick={onClick ? () => onClick(e) : () => defaultOnClick(type || e?.bulletin?.status, e)}
                className={e.id === activeId ? 'basedOnBulletin--active' : 'basedOnBulletin'}
              />
            );
          })
        ) : (
          <p className="search__notFoundMessage">Ingen utsendinger funnet.</p>
        )}
      </div>
      {searchResults.length > maxSearchResult && (
        <div className="pagination">
          <Pagination
            disabledLeft={sliceStart === 0}
            disabledRight={currentPage === Math.ceil(searchResults.length / maxSearchResult)}
            activePage={currentPage}
            totalPage={Math.ceil(searchResults.length / maxSearchResult)}
            handlePageClickLeft={handlePageClickLeft}
            handlePageClickRight={handlePageClickRight}
          />
        </div>
      )}
    </>
  );
};

export default Search;
