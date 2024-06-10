import { Person } from '@mui/icons-material';
import { AgeFilter, Bulletin, RecipientsQuery } from '../../../../models';
import {
  capitalizeFirst,
  checkCivilStatusToText,
  civilStatusAlternatives,
  eventTypeText,
  getShortAgeFilter,
} from '../../util';

export const getEventFilter = (bulletin: Bulletin) => {
  if (bulletin.recipients?.query) {
    return (
      <>
        {getEventText(bulletin)}
        {getEventQuery(bulletin.recipients?.query[0])}
      </>
    );
  } else {
    return <div>Finner ikke mottakere</div>;
  }
};
const getEventText = (bulletin: Bulletin) => {
  return (
    <div className="recipientsIcon">
      <Person style={{ color: '0E72ED' }} fontSize="large" />
      <p className="recipientsIconText medium14">{capitalizeFirst(eventTypeText(bulletin))}</p>
    </div>
  );
};

const getEventQuery = (filterValue: RecipientsQuery) => {
  const allArray = [
    filterValue.postnummer?.length === 0 ? 'Postnummer' : '',
    !filterValue.kjoenn ? 'Kjønn' : '',
    !filterValue.alder || filterValue?.alder?.filter === 'everyone' ? 'Alder' : '',
    filterValue.sivilstandtype?.length === civilStatusAlternatives.length ? 'Sivilstatus' : '',
  ].filter((item) => item.length !== 0);

  return (
    <div>
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
    </div>
  );
};
