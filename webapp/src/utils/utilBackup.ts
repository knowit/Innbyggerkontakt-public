/*
import { AGEFILTER_OPTIONS, OptionType } from './types';
import { OnChangeValue } from 'react-select';
import { Bulletin, AgeFilter, BulletinContent, FilterTypes } from './DbAccess';
import { Store } from './ContextStore/store';

export const getDropDownValue = (dropDownOptions: OptionType[], value: string | number | undefined) =>
  dropDownOptions.find((option) => value === option.value) || null;

export const getAgeFilter = (age: {
  filter: string;
  label: string;
  ageFrom?: string;
  ageTo?: string;
  age?: string;
  date?: string;
  fromDate?: string;
  toDate?: string;
}) => {
  let filter = '';

  (() => {
    switch (age?.filter) {
      case AGEFILTER_OPTIONS.OLDER_THAN:
        filter = age ? ' og som er ' + age.label + ' ' + age + ' år' : '';
        break;
      case AGEFILTER_OPTIONS.AGE_BETWEEN:
        filter = age ? ' og som er ' + age.label + ' ' + age.ageFrom + ' og ' + age.ageTo + ' år' : '';
        break;
      case AGEFILTER_OPTIONS.YOUNGER_THAN:
        filter = ' og som er ' + age.label + ' ' + age.age + ' år';
        break;
      case AGEFILTER_OPTIONS.AFTER_DATE:
        filter = age ? ' og som er ' + age.label + ' ' + age?.date + '.' : '';
        break;
      case AGEFILTER_OPTIONS.BEFORE_DATE:
        filter = age ? ' og som er ' + +age.label + ' ' + age?.date + '.' : '';
        break;
      case AGEFILTER_OPTIONS.BETWEEN_DATE:
        filter = age ? ' og som er ' + age?.label + ' ' + age?.fromDate + ' og ' + age?.toDate + '.' : '';
        break;

      case AGEFILTER_OPTIONS.BETWEEN_YEARS:
        filter = age ? ' og som er ' + age.label + ' ' + age?.fromDate + ' og ' + age?.toDate + '.' : '';
        break;
    }
  })();
  return filter;
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

  return (
    (!undefinedAge &&
      !undefinedAgeBetween &&
      !ageBetweenValid &&
      !dateBetweenValid &&
      !yearBetweenValid &&
      !negativeAge) ||
    '! Må være gyldig intervall/alder'
  );
};

export const setAgeValue = (age: AgeFilter) => {
  switch (age?.filter) {
    case 'olderThan':
      return {
        filter: age?.filter,
        label: 'eldre enn',
        age: age.olderThan,
      };

    case 'ageBetween':
      return {
        filter: age?.filter,
        label: 'mellom',
        ageFrom: age.fromAge,
        ageTo: age.toAge,
      };
    case 'youngerThan':
      return {
        filter: age?.filter,
        label: 'yngre enn',
        age: age.youngerThan,
      };
    case 'afterDate':
      return {
        filter: age?.filter,
        label: 'født etter dato',
        date: age.afterDate,
      };
    case 'beforeDate':
      return {
        filter: age?.filter,
        label: 'født før dato',
        date: age.beforeDate,
      };
    case 'betweenDate':
      return {
        filter: age?.filter,
        label: 'født mellom datoer',
        fromDate: age.fromDate,
        toDate: age.toDate,
      };
    case 'betweenYears':
      return {
        filter: age?.filter,
        label: 'født mellom årstall',
        fromDate: age.fromYear,
        toDate: age.toYear,
      };
  }
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

      case 'betweenYears':
        filter = 'født mellom ' + age.fromYear + ' og ' + age.toYear;
        break;
    }
  })();
  return filter;
};

export const getDefaultLanguage = () => {
  const organization = sessionStorage.getItem('organization');
  if (organization) {
    const data = JSON.parse(organization);
    return data.defaultLanguage;
  }
};

export const getLanguageOptions = [
  { value: 'nb', label: 'Bokmål' },
  { value: 'nn', label: 'Nynorsk' },
  { value: 'en', label: 'Engelsk' },
  { value: 'se', label: 'Samisk' },
];

export const setDropDownValue = (setValue: (value: ((prevState: string) => string) | string) => void) => {
  return (e: OnChangeValue<OptionType, false>) => {
    if (e) {
      setValue((e as OptionType).value);
    } else {
      setValue('');
    }
  };
};

export const setNumberDropDownValue = (setValue: (value: number | null) => void) => {
  return (e: OnChangeValue<OptionType, false>) => {
    if (e) {
      setValue(parseInt((e as OptionType).value));
    } else {
      setValue(null);
    }
  };
};

export const labelNumberArray = (numberArray: number[]): OptionType[] =>
  numberArray.map((item) => ({ value: item.toString(), label: item.toString() }));

const monthShortHandArray = ['jan', 'feb', 'mar', 'apr', 'mai', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'des'];

export const labelMonths = (monthArray: number[]): OptionType[] =>
  monthArray.map((monthItem) => ({ value: monthItem.toString(), label: monthShortHandArray[monthItem] }));

export const eventAlternatives = [
  { value: 'flyttingTilKommune', label: 'Noen flytter til kommunen' },
  { value: 'endringIAlder', label: 'Noen fyller år eller månder' },
  { value: 'flyttingInnenKommune', label: 'Noen flytter innad i kommunen' },
];

export const getEvent = (eventValue: string | undefined) => {
  const event = eventAlternatives.find((alternative) => alternative.value === eventValue);
  if (event) {
    return event.label;
  } else {
    return '';
  }
};

export const getEventFromValue = (eventValue: string | undefined) => {
  const event = eventAlternatives.find((alternative) => alternative.value === eventValue);
  return event ? event : eventAlternatives[0];
};

export const roleAlternatives = [
  { value: 'self', label: 'Person som fyller' },
  { value: 'parent', label: 'Foreldre til person som fyller' },
];

export const personStatusAlternatives = [
  { value: 'aktiv', label: 'Aktiv' },
  { value: 'bosatt', label: 'Bosatt' },
  { value: 'utflyttet', label: 'Utflyttet' },
  { value: 'doed', label: 'Død' },
  { value: 'inaktiv', label: 'Inaktiv' },
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

export const genderAlternatives = [
  { value: 'mann', label: 'Mann' },
  { value: 'kvinne', label: 'Kvinne' },
];

export const generateUrl = (feedbackValue: string, lang: string, currentBulletinId: string, orgId: string) =>
  `${process.env.REACT_APP_APP_BASE_URL}/feedback/?orgId=${orgId}&lang=${lang}&bulletin=${currentBulletinId}&opt=${feedbackValue}`;

export const generateUrlObject = (lang: string, currentBulletinId: string, orgId: string, feedback: boolean) =>
  feedback
    ? ['positive', 'neutral', 'negative'].reduce(
        (accum, feedbackValue) => ({
          ...accum,
          [feedbackValue + '_smiley']: generateUrl(feedbackValue, lang, currentBulletinId, orgId),
        }),
        {},
      )
    : { positive_smiley: '', neutral_smiley: '', negative_smiley: '' };

export const getUserId = (sessionStorage: Storage) =>
  sessionStorage.getItem('user') !== null && JSON.parse(sessionStorage.getItem('user') as string).uid;

export const fontOptions = [
  { value: 'Arial', label: 'Arial' },
  { value: 'Arial Black', label: 'Arial Black' },
  { value: 'Comic Sans MS', label: 'Comic Sans MS' },
  { value: 'Courier New', label: 'Courier New' },
  { value: 'Droid Sans', label: 'Droid Sans' },
  { value: 'Georgia', label: 'Georgia' },
  { value: 'Helvetica', label: 'Helvetica' },
  { value: 'Impact', label: 'Impact' },
  { value: 'Lato', label: 'Lato' },
  { value: 'Lucida Console', label: 'Lucida Console' },
  { value: 'Lucida Sans Unicode', label: 'Lucida Sans Unicode' },
  { value: 'Open Sans', label: 'Open Sans' },
  { value: 'Roboto', label: 'Roboto' },
  { value: 'Tahoma', label: 'Tahoma' },
  { value: 'Times New Roman', label: 'Times New Roman' },
  { value: 'Trebuchet MS', label: 'Trebuchet MS' },
  { value: 'Ubuntu', label: 'Ubuntu' },
  { value: 'Verdana', label: 'Verdana' },
];

export const formatDateyyyymmdd = (date: Date) => `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;

export const getValues = (valueTypeElement: OnChangeValue<OptionType, true>) =>
  valueTypeElement ? (valueTypeElement as OptionType[]).map((option) => option.value) : [];

export const setBulletinForSummaryPage = (
  active: boolean,
  currentBulletin: Bulletin,
  content: BulletinContent,
): Bulletin | undefined => {
  const currentDate = new Date().toString();
  switch (currentBulletin.type) {
    case 'event':
      return {
        ...currentBulletin,
        execution: {
          ...currentBulletin.execution,
          type: currentBulletin.type,
          active,
        },
        content,
        status: active ? 'active' : 'draft',
        startDate: currentBulletin.execution?.datetime || currentDate,
      };
    case 'search':
      return {
        ...currentBulletin,
        execution: {
          ...currentBulletin.execution,
          type: currentBulletin.execution?.datetime ? 'schedule' : 'instant',
          datetime: currentBulletin.execution?.datetime,
          active,
        },
        content,
        status: active ? 'active' : 'draft',
      };
  }
};

export const capitalizeFirst = (sentence: string) => sentence.charAt(0).toUpperCase() + sentence.slice(1);

export const checkCivilStatusToText = (civilStatusValues: string[]) => {
  if (civilStatusAlternatives.length === civilStatusValues.length) {
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

export const ageTypeAlternatives = [
  { value: 'turnXYears', label: 'År' },
  { value: 'turnXMonths', label: 'Måneder' },
];

// query has been the default alternative previously, so this is a failsafe for new filters
export const getFilterTypeFromFilter = (filter: FilterTypes) => {
  switch (filter.recipientFilter) {
    case 'manual':
      return filter.recipientFilter;
    case 'matrikkel':
      return filter.recipientFilter;
    default:
      return 'query';
  }
};

export enum RECIPIENT_STAGE {
  START,
  RECIPIENTS,
  CHOOSE_SOURCE,
  CHOOSE_CRITERIA,
  EDIT_GROUP,
}

export const postBasedOn = (basedOnBulletin: Bulletin, store: Store) => {
  const basedOnExecution = basedOnBulletin.execution;
  const bulletin: Bulletin = {
    ...basedOnBulletin,
    execution: {
      ...basedOnExecution,
      datetime: undefined,
      active: false,
      type: basedOnExecution?.type || 'search',
    },
    name: '',
    lastChangedBy: 'client',
  };
  store.setBulletin(bulletin);
};
*/
export {};
