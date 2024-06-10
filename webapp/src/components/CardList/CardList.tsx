import { useEffect, useState } from 'react';
import { Card, Pagination } from 'innbyggerkontakt-design-system';
import { Template } from '../../models';
import { getTemplateImage, translateTemplateTypesToNorwegian } from '../../utils/Template/util';

import './CardList.scss';

type Props<T> = {
  list: T[];
  maxSearchResult?: number;
  onClick: (item: T) => void;
  activeId?: string;
  showTags?: boolean;
  noFoundText?: string;
};

type CardTypes = 'published' | 'draft' | 'finished' | 'active' | 'archived' | 'planned';

const CardList = <T extends { id?: string; type?: CardTypes; name?: string; lastChanged?: string }>({
  list,
  maxSearchResult = 6,
  onClick,
  activeId,
  showTags = false,
  noFoundText = 'Ingen utsendinger funnet.',
}: Props<T>) => {
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

  useEffect(() => {
    setCurrentPage(1);
    setSliceStart(0);
    setSliceEnd(maxSearchResult);
  }, [list]);

  const getTags = (e: T) => {
    if (!showTags) {
      return e.type ? translateTemplateTypesToNorwegian([e.type]) : ['Publisert'];
    } else {
      return (e as Template).tags;
    }
  };

  return (
    <div className="cardListContainer">
      <div>
        {list.length ? (
          list.slice(sliceStart, sliceEnd).map((e: T) => {
            return (
              <Card
                key={e.id}
                title={e.name ?? ''}
                lastChanged={e.lastChanged ? new Date(e.lastChanged) : new Date()}
                size="large"
                tags={getTags(e)}
                image={getTemplateImage(e as Template)}
                onClick={() => onClick && onClick(e)}
                active={e.id === activeId}
              />
            );
          })
        ) : (
          <p className="search__notFoundMessage">{noFoundText}</p>
        )}
      </div>
      {list.length > maxSearchResult && (
        <div className="pagination">
          <Pagination
            disabledLeft={sliceStart === 0}
            disabledRight={currentPage === Math.ceil(list.length / maxSearchResult)}
            activePage={currentPage}
            totalPage={Math.ceil(list.length / maxSearchResult)}
            handlePageClickLeft={handlePageClickLeft}
            handlePageClickRight={handlePageClickRight}
          />
        </div>
      )}
    </div>
  );
};

export default CardList;
