import ClearIcon from '@mui/icons-material/Clear';
import EditIcon from '@mui/icons-material/Edit';
import { useContext, useEffect, useState } from 'react';
import { StoreContext } from '../../../../../../contexts';
import { Bulletin, BulletinRecipients, FilterTypes, FilterValues, RECIPIENT_STAGE } from '../../../../../../models';
import { getFilterTypeFromFilter } from '../../../../../../utils/util';
import { getRecipientFilters } from '../../../../util';
import FilterItem from '../../../components/FilterItem/FilterItem';
import { getFilterItemContent } from '../../searchUtil';

interface Props {
  recipients: BulletinRecipients;
  onDeleteFilter: (bulletin: Bulletin) => void;
  currentBulletinId: string | null;
  setActiveFilter?: React.Dispatch<React.SetStateAction<FilterValues['recipientFilter']>>;
  expandToEdit?: (group: FilterTypes) => void;
  emptyRecipients?: boolean;
  setStage?: React.Dispatch<React.SetStateAction<RECIPIENT_STAGE>>;
}

const RecipientsDisplay: React.FC<Props> = ({
  recipients,
  onDeleteFilter,
  currentBulletinId,
  setActiveFilter,
  emptyRecipients,
  setStage,
  expandToEdit,
}) => {
  const store = useContext(StoreContext);
  const dbAccess = store.dbAccess;

  const [filterList, setFilterList] = useState<FilterTypes[]>([]);

  useEffect(() => {
    if (recipients) {
      const recipientFilters = getRecipientFilters(recipients);
      setFilterList(recipientFilters);
    }
  }, [recipients]);

  const deleteFilter = (deletedFilter: FilterTypes) => {
    currentBulletinId &&
      dbAccess
        .deleteFieldInBulletin(sessionStorage.organizationId, currentBulletinId, deletedFilter)
        .then((res) => res && onDeleteFilter && onDeleteFilter(res));
    if (getFilterTypeFromFilter(deletedFilter) === 'manual') {
      dbAccess.deleteMmlBulletinFilterList(currentBulletinId, deletedFilter?.id as string);
    }
  };

  const deleteButton = (filter: FilterTypes) => (
    <div
      className="clickable"
      onClick={() => {
        if (setActiveFilter) setActiveFilter('');
        deleteFilter(filter);
        if (emptyRecipients && setStage) {
          setStage(RECIPIENT_STAGE.START);
        }
      }}
    >
      <ClearIcon />
    </div>
  );

  const editButton = (filterItem: FilterTypes) => (
    <div
      className="clickable"
      onClick={() => {
        if (expandToEdit && filterItem) {
          expandToEdit(filterItem);
        } else {
          throw new Error("Shit's broke, yo!");
        }
      }}
    >
      <EditIcon />
    </div>
  );

  return (
    <div className="recipientsContentWrapper">
      {filterList.length > 0 ? (
        filterList.map((filter, i) => (
          <div className="recipientsContent" key={i}>
            {setActiveFilter ? (
              filter.recipientFilter !== 'manual' ? (
                <FilterItem
                  filterContent={getFilterItemContent(filter)}
                  onDelete={deleteButton(filter)}
                  onEdit={editButton(filter)}
                />
              ) : (
                <FilterItem filterContent={getFilterItemContent(filter)} onDelete={deleteButton(filter)} />
              )
            ) : (
              <FilterItem filterContent={getFilterItemContent(filter)} />
            )}
          </div>
        ))
      ) : (
        <></>
      )}
    </div>
  );
};

export default RecipientsDisplay;
