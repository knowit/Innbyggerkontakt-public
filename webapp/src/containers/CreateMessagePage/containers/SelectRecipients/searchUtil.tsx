import {
  AgeFilter,
  Bulletin,
  FilterTypes,
  RecipientsManual,
  RecipientsMatrikkel,
  RecipientsQuery,
} from '../../../../models';
import { getFilterTypeFromFilter } from '../../../../utils/util';
import {
  capitalizeFirst,
  checkCivilStatusToText,
  civilStatusAlternatives,
  getRecipientFilters,
  getShortAgeFilter,
} from '../../util';
import Group from '@mui/icons-material/Group';
import RecordVoiceOver from '@mui/icons-material/RecordVoiceOver';
import Person from '@mui/icons-material/Person';
import ViewList from '@mui/icons-material/ViewList';
import Home from '@mui/icons-material/Home';
import Map from '@mui/icons-material/Map';

/*======================================================================
DETTE HER GJELDER BARE BULLETIN AV TYPEN SEARCH
========================================================================*/

export const getAppropriateIconAndText = (filterType: string) => {
  switch (filterType) {
    // All these or-cases are here due to backwards compatability
    case 'alle':
      return (
        <div className="recipientsIcon">
          <RecordVoiceOver style={{ color: '0E72ED' }} fontSize="large" />
          <p className="recipientsIconText medium14">Alle i din kommune</p>
        </div>
      );

    case 'folkeregister':
      return (
        <div className="recipientsIcon">
          <Person style={{ color: '0E72ED' }} fontSize="large" />
          <p className="recipientsIconText medium14">Folkeregisteret</p>
        </div>
      );
    case 'relasjon':
      return (
        <div className="recipientsIcon">
          <Group style={{ color: '0E72ED' }} fontSize="large" />
          <p className="recipientsIconText medium14">Relasjon</p>
        </div>
      );
    case 'manual':
      return (
        <div className="recipientsIcon">
          <ViewList style={{ color: '0E72ED' }} fontSize="large" />
          <p className="recipientsIconText medium14">Egendefinert liste</p>
        </div>
      );
    case 'matrikkel':
      return (
        <div className="recipientsIcon">
          <Home style={{ color: '0E72ED' }} fontSize="large" />
          <p className="recipientsIconText medium14">Matrikkelen</p>
        </div>
      );
    case 'kart':
      return (
        <div className="recipientsIcon">
          <Map style={{ color: '0E72ED' }} fontSize="large" />
          <p className="recipientsIconText medium14">Kart</p>
        </div>
      );
    default:
      return <Person style={{ color: '0E72ED' }} fontSize="large" />;
  }
};

export const getAppropriateIcon = (filterType: string, className = '') => {
  switch (filterType) {
    case 'alle':
      return <RecordVoiceOver className={className} />;
    case 'folkeregister':
      return <Person className={className} />;
    case 'relasjon':
      return <Group className={className} />;
    case 'manual':
      return <ViewList className={className} />;
    case 'matrikkel':
      return <Home className={className} />;
    case 'kart':
      return <Map className={className} />;
    default:
      return <Person className={className} />;
  }
};

export const getFregText = (filter: RecipientsQuery) => {
  const filterValue: RecipientsQuery = filter;
  const allArray = [
    filterValue.postnummer?.length === 0 ? 'Postnummer' : '',
    !filterValue.kjoenn ? 'Kjønn' : '',
    !filterValue.alder || filterValue?.alder?.filter === 'everyone' ? 'Alder' : '',
    filterValue.sivilstandtype?.length === civilStatusAlternatives.length ? 'Sivilstatus' : '',
  ].filter((item) => item.length !== 0);

  return (
    <>
      {filterValue.mottager === 'parent' && <p className="recipientItemContentItem">Mottakere: Foreldre</p>}
      {filterValue.alder && filterValue?.alder?.filter !== 'everyone' && (
        <p className="recipientItemContentItem">
          Alder: {capitalizeFirst(getShortAgeFilter(filterValue.alder as AgeFilter))}
        </p>
      )}
      <p className="recipientItemContentItem">
        Ikke permanente innbyggere: {filterValue.inkludererOppholdsadresse ? 'Ja' : 'Nei'}
      </p>

      {filterValue.kjoenn && <p className="recipientItemContentItem">Kjønn: {capitalizeFirst(filterValue.kjoenn)}</p>}

      {filterValue.sivilstandtype && filterValue.sivilstandtype?.length !== civilStatusAlternatives.length && (
        <p className="recipientItemContentItem">
          Sivilstatus: {checkCivilStatusToText(filterValue.sivilstandtype as string[])}
        </p>
      )}
      {filterValue.postnummer && filterValue.postnummer.length > 0 && (
        <p className="recipientItemContentItem">Postnummer: {filterValue.postnummer.join(', ')}</p>
      )}
      {allArray.length > 0 ? <p className="recipientItemContentItem">{allArray.join(', ')}: Alle</p> : null}
    </>
  );
};

const getMmlText = (filter: FilterTypes) => {
  const filterValue: RecipientsManual = filter as RecipientsManual;
  let listTypeVisual;
  switch (filterValue.listType) {
    case 'email':
      listTypeVisual = 'epostadresser';
      break;
    case 'emailAndName':
      listTypeVisual = 'epostadresser';
      break;
    case 'identifier':
      listTypeVisual = 'fødselsnummer';
      break;
    default:
      listTypeVisual = 'mottakere';
      break;
  }

  return (
    <div>
      <p className="recipientItemContentItem">Navn: {filterValue.listName || 'Ikke gitt navn.'}</p>
      <p className="recipientItemContentItem">
        Liste med {filterValue.recipientsCount || '0'} {listTypeVisual}.
      </p>
    </div>
  );
};

const getAppropriateText = (filter: FilterTypes) => {
  switch (filter.recipientFilter) {
    case 'alle':
      const alleValue: RecipientsQuery = filter;
      return (
        <div>
          <p className="recipientItemContentItem">Permanente innbyggere: Ja</p>
          <p className="recipientItemContentItem">
            Ikke permanente innbyggere: {alleValue.inkludererOppholdsadresse ? 'Ja' : 'Nei'}
          </p>
        </div>
      );
    case 'folkeregister':
      return <div>{getFregText(filter)}</div>;
    case 'relasjon':
      return <div>{getFregText(filter)}</div>;
    case 'manual':
      // const ManualValue: BulletinManualFilter = filter;
      return <>{getMmlText(filter)}</>;
    case 'matrikkel':
      const matrikkelValue = filter as RecipientsMatrikkel;
      return (
        <div>
          <p className="recipientItemContentItem">
            Inkluderer: {matrikkelValue.fritidsbolig && `fritidsboliger`}
            {matrikkelValue.fritidsbolig && matrikkelValue.osloReg && ' og '}
            {matrikkelValue.osloReg && `Oslo REG soner`}
          </p>
        </div>
      );
    case 'kart':
      return <p className="recipientItemContentItem">Egendefinert område med mottakere</p>;
    default:
      return <Person style={{ color: '0E72ED' }} fontSize="large" />;
  }
};

export const getFilterItemContent = (filterType: FilterTypes) => {
  return (
    <>
      {getAppropriateIconAndText(filterType.recipientFilter)}
      {getAppropriateText(filterType)}
    </>
  );
};

/* The following function is about checking the length of any types of recipientsfilters */
export const getRecipientsIsEmptyValue = (bulletin: Bulletin['recipients']): boolean => {
  if (bulletin) {
    return getRecipientFilters(bulletin).length === 0;
  } else {
    return false;
  }
};

export const onFilterEdit = (
  evaluatedFilter: FilterTypes,
  newFilter: FilterTypes,
  initialBulletin: Bulletin,
): Bulletin => {
  const filterObjectType = getFilterTypeFromFilter(evaluatedFilter);
  const filters = initialBulletin?.recipients?.[filterObjectType] || [];
  // Sjekker for id p.g.a backwardscomp
  const indexOfEvaluatedFilter = evaluatedFilter.id
    ? filters.findIndex((filtersOnInital) => filtersOnInital.id === evaluatedFilter.id)
    : filters.findIndex((filtersOnInital) => JSON.stringify(filtersOnInital) === JSON.stringify(evaluatedFilter));
  filters?.splice(indexOfEvaluatedFilter, 1, newFilter);
  const bulletin = {
    ...initialBulletin,
    recipients: {
      ...initialBulletin?.recipients,
      [filterObjectType]: filters,
    },
  };
  return bulletin;
};
