import {
  AgeFilter,
  Bulletin,
  BulletinRecipients,
  FilterTypes,
  OptionType,
  RecipientsManual,
  RecipientsQuery,
} from '../../models/';
import DbAccess from '../../utils/DbAccess';

export const getDropDownValue = (dropDownOptions: OptionType[], value: string | number | undefined) =>
  dropDownOptions.find((option) => value === option.value) || null;

//TODO: Denne kan gjøres mye bedre
export const filterValueText = (filter: RecipientsQuery, initialString: string) =>
  `${initialString || ''}${filter.alder ? `, ${getShortAgeFilter(filter.alder)}` : ''}${
    filter.kjoenn ? `, ${filter.kjoenn}` : ''
  }${filter.sivilstandtype ? `, Sivilstatus: ${checkCivilStatusToText(filter.sivilstandtype)}` : ''}${
    filter.postnummer && filter.postnummer?.length > 0 ? `, postnummer: ${filter.postnummer.join(', ')}` : ''
  }`;

export const replaceState = (url: string, title: string) => window.history.replaceState(url, title, url);

export enum SaveOptions {
  NONE,
  SAVING,
  SAVED,
}

export const eventTypeText = (currentBulletin: Bulletin) => {
  switch (currentBulletin.recipients?.event?.eventType) {
    case 'flyttingTilKommune':
      return 'flytter til kommunen';
    case 'endringIAlder':
      const query = currentBulletin?.recipients?.query;
      const age = query ? query[0]?.alder?.age : 'X';
      const filter = query ? query[0]?.alder?.filter : undefined;
      if (filter === 'turnXMonths') return `fyller ${age} månder`;
      return `fyller ${age} år`;
    case 'flyttingInnenKommune':
      return 'endrer bostedsadresse';
    default:
      return 'flytter til kommunen';
  }
};

export const determinIfBulletinDateIsInvalid = (currentBulletin: Bulletin) => {
  if (currentBulletin.execution?.type === 'instant') {
    return false;
  }

  const now = new Date();
  return (
    !!currentBulletin?.execution?.datetime && new Date(currentBulletin?.execution?.datetime).getTime() <= now.getTime()
  );
};

export const getRecipientFilters = (recipients: BulletinRecipients): FilterTypes[] => {
  return Object.values(recipients)
    .filter((value) => !value.hasOwnProperty('eventType'))
    .reduce((acc, val) => acc.concat(val), []) as FilterTypes[];
};

export const getOldestManualFilterDateInDraft = async (bulletinId: string | null, db: DbAccess) => {
  let date;
  if (bulletinId) {
    await db.getBulletin(sessionStorage.organizationId, bulletinId, 'draft').then((bulletin) => {
      if (bulletin && bulletin.recipients && bulletin.recipients.manual) {
        date = bulletin.recipients.manual.sort((a: RecipientsManual, b: RecipientsManual) => {
          return (
            (a.createdTimestamp != null ? a.createdTimestamp : 0) -
            (b.createdTimestamp != null ? b.createdTimestamp : 0)
          );
        })[0].createdTimestamp;
      } else {
        return 0;
      }
    });
  } else {
    return 0;
  }
  return date;
};

export const validateAgeSelector = (ageValue: AgeFilter | undefined) => {
  const ageBetweenValid = ageValue?.filter === 'ageBetween' && Number(ageValue.fromAge) > Number(ageValue.toAge);

  const negativeAge =
    Number(ageValue?.toAge) < 0 ||
    Number(ageValue?.fromAge) < 0 ||
    Number(ageValue?.youngerThan) < 0 ||
    Number(ageValue?.olderThan) < 0;

  const dateBetweenValid =
    ageValue?.filter === 'betweenDate' &&
    ageValue.fromDate &&
    ageValue.toDate &&
    new Date(ageValue.fromDate).getTime() > new Date(ageValue.toDate).getTime();

  const undefinedAge =
    (ageValue?.filter === 'olderThan' && (ageValue.olderThan === undefined || ageValue.olderThan === '')) ||
    (ageValue?.filter === 'youngerThan' && (ageValue.youngerThan === undefined || ageValue.youngerThan === '')) ||
    (ageValue?.filter === 'afterDate' && (ageValue.afterDate === undefined || ageValue?.afterDate === '')) ||
    (ageValue?.filter === 'beforeDate' && (ageValue.beforeDate === undefined || ageValue?.beforeDate === ''));

  const undefinedAgeBetween =
    (ageValue?.filter === 'ageBetween' &&
      (ageValue.fromAge === undefined ||
        ageValue?.fromAge === '' ||
        ageValue.toAge === undefined ||
        ageValue?.toAge === '')) ||
    (ageValue?.filter === 'betweenDate' &&
      (ageValue.fromDate === undefined ||
        ageValue?.fromDate === '' ||
        ageValue.toDate === undefined ||
        ageValue?.toDate === '')) ||
    (ageValue?.filter === 'betweenYears' &&
      (ageValue.fromYear === undefined ||
        ageValue?.fromYear === '' ||
        ageValue.toYear === undefined ||
        ageValue?.toYear === ''));

  const yearBetweenValid = ageValue?.filter === 'betweenYears' && Number(ageValue.fromYear) > Number(ageValue.toYear);

  const foedselsaarFraOgTilOgMedValid =
    ageValue?.filter === 'foedselsaarFraOgTilOgMed' &&
    (ageValue?.foedselsaarFraOgMed === undefined || ageValue?.foedselsaarFraOgMed === '') &&
    (ageValue?.foedselsaarTilOgMed === undefined || ageValue?.foedselsaarTilOgMed === '');

  return (
    (!undefinedAge &&
      !undefinedAgeBetween &&
      !ageBetweenValid &&
      !dateBetweenValid &&
      !yearBetweenValid &&
      !foedselsaarFraOgTilOgMedValid &&
      !negativeAge) ||
    '! Må være gyldig intervall/alder'
  );
};

export const genderAlternatives = [
  { value: 'mann', label: 'Mann' },
  { value: 'kvinne', label: 'Kvinne' },
];

export const roleAlternatives = [
  { value: 'self', label: 'Person som fyller' },
  { value: 'parent', label: 'Foreldre til person som fyller' },
];

export const civilStatusAlternatives = [
  { value: 'uoppgitt', label: 'Uoppgitt' },
  { value: 'ugift', label: 'Ugift' },
  { value: 'gift', label: 'Gift' },
  { value: 'enkeEllerEnkemann', label: 'Enke eller enkemann' },
  { value: 'skilt', label: 'Skilt' },
  { value: 'separert', label: 'Separert' },
  { value: 'registrertPartner', label: 'Registrert partner' },
  { value: 'skiltPartner', label: 'Skilt partner' },
  { value: 'separertPartner', label: 'Separert partner' },
  { value: 'gjenlevendePartner', label: 'Gjenlevende partner' },
];

export const capitalizeFirst = (sentence: string) => sentence.charAt(0).toUpperCase() + sentence.slice(1);

export const checkCivilStatusToText = (civilStatusValues: string[]) => {
  if (civilStatusAlternatives.length === civilStatusValues.length || civilStatusValues.length === 0) {
    return 'Alle';
  }
  const statusLabels = civilStatusValues
    .map((civilStatusValue) => civilStatusAlternatives.find((option) => option.value === civilStatusValue))
    .map((option) => option?.label);
  const statusText =
    statusLabels?.length > 1
      ? `${statusLabels.slice(0, -1).join(',')} og ${statusLabels.slice(-1)}`
      : statusLabels.toString();
  return capitalizeFirst(statusText.toLowerCase());
};

export const getShortAgeFilter = (age: AgeFilter) => {
  const dateOptions: Intl.DateTimeFormatOptions = { dateStyle: 'short' };
  let filter = '';

  (() => {
    switch (age?.filter) {
      case 'olderThan':
        filter = 'eldre enn ' + age.olderThan + ' år';
        break;

      case 'ageBetween':
        filter = 'mellom ' + age.fromAge + ' og ' + age.toAge + ' år';
        break;

      case 'youngerThan':
        filter = 'yngre enn ' + age.youngerThan + ' år';
        break;

      case 'afterDate':
        filter = 'født etter ' + new Date(age.afterDate as string).toLocaleDateString('no-NO', dateOptions);
        break;

      case 'beforeDate':
        filter = 'født før ' + new Date(age.beforeDate as string).toLocaleDateString('no-NO', dateOptions);
        break;

      case 'betweenDate':
        filter =
          'født mellom ' +
          new Date(age.fromDate as string).toLocaleDateString('no-NO', dateOptions) +
          ' og ' +
          new Date(age.toDate as string).toLocaleDateString('no-NO', dateOptions);
        break;

      case 'foedselsaarFraOgTilOgMed':
        filter = setfoedselsaarFraOgMedFilterText(age.foedselsaarFraOgMed, age.foedselsaarTilOgMed);
        break;

      case 'betweenYears':
        filter = 'født mellom ' + age.fromYear + ' og ' + age.toYear;
        break;
    }
  })();
  return filter;
};

const setfoedselsaarFraOgMedFilterText = (
  foedselsaarFraOgMed: string | undefined,
  foedselsaarTilOgMed: string | undefined,
) => {
  if (foedselsaarFraOgMed && foedselsaarTilOgMed) {
    return `fødselsår fra og med ${foedselsaarFraOgMed} og til og med ${foedselsaarTilOgMed}`;
  } else if (foedselsaarFraOgMed) {
    return `fødselsår fra og med ${foedselsaarFraOgMed}`;
  } else if (foedselsaarTilOgMed) {
    return `fødselsår til og med ${foedselsaarTilOgMed}`;
  }
  return '';
};
