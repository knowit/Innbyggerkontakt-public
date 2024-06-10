import { AlleFilter, FolkeregisterFilter, KartFilter, ManualFilter, MatrikkelFilter, RelasjonsFilter } from '..';
import { Bulletin, FilterTypes, FilterValues, RECIPIENT_STAGE } from '../../../../../../models';

interface Props {
  // setActiveFilter: React.Dispatch<React.SetStateAction<FilterValues['recipientFilter']>>;
  activeFilter: FilterValues['recipientFilter'];
  onCancel: () => void;
  stage: RECIPIENT_STAGE;
  onSubmit: (bulletinToPost: Bulletin) => void;
  evaluatedFilter: FilterTypes | null;
}

export const EditFilterMenu: React.FC<Props> = ({ activeFilter, onCancel, stage, onSubmit, evaluatedFilter }) => (
  <>
    {activeFilter === 'alle' && (
      <AlleFilter
        onCancel={onCancel}
        activeFilter={activeFilter}
        editMode={stage === RECIPIENT_STAGE.EDIT_GROUP}
        onSubmit={onSubmit}
        evaluatedFilter={evaluatedFilter}
      />
    )}
    {activeFilter === 'folkeregister' && (
      <FolkeregisterFilter
        onCancel={onCancel}
        activeFilter={activeFilter}
        editMode={stage === RECIPIENT_STAGE.EDIT_GROUP}
        onSubmit={onSubmit}
        evaluatedFilter={evaluatedFilter}
      />
    )}
    {activeFilter === 'relasjon' && (
      <RelasjonsFilter
        onCancel={onCancel}
        activeFilter={activeFilter}
        editMode={stage === RECIPIENT_STAGE.EDIT_GROUP}
        onSubmit={onSubmit}
        evaluatedFilter={evaluatedFilter}
      />
    )}
    {activeFilter === 'matrikkel' && (
      <MatrikkelFilter
        onCancel={onCancel}
        activeFilter={activeFilter}
        editMode={stage === RECIPIENT_STAGE.EDIT_GROUP}
        onSubmit={onSubmit}
        evaluatedFilter={evaluatedFilter}
      />
    )}
    {activeFilter === 'manual' && (
      <ManualFilter
        onCancel={onCancel}
        activeFilter={activeFilter}
        editMode={stage === RECIPIENT_STAGE.EDIT_GROUP}
        onSubmit={onSubmit}
        evaluatedFilter={evaluatedFilter}
      />
    )}
    {activeFilter === 'kart' && (
      <KartFilter
        onCancel={onCancel}
        activeFilter={activeFilter}
        editMode={stage === RECIPIENT_STAGE.EDIT_GROUP}
        onSubmit={onSubmit}
        evaluatedFilter={evaluatedFilter}
      />
    )}
  </>
);

export default EditFilterMenu;
