import { RecipientsKart } from 'models/Mapbox';

export interface FilterValues {
  recipientFilter: '' | 'alle' | 'relasjon' | 'folkeregister' | 'manual' | 'matrikkel' | 'event' | 'kart';
  id?: string;
}

export interface RecipientsQuery extends FilterValues {
  kjoenn?: string;
  foedselsdato?: string;
  // foedselsaarFraOgMed?: string;
  // foedselsaarTilOgMed?: string;
  alder?: AgeFilter;
  adressenavn?: string;
  husnummer?: string;
  postnummer?: string[];
  kommunenummer?: string;
  fylkesnummer?: string;
  inkludererOppholdsadresse?: boolean;
  sivilstandtype?: string[];
  personstatustyper?: string[];
  // midlertidig, ikke i backend enda
  rolleFraDato?: string;
  rolleTilDato?: string;
  mottager?: string;
}

export interface RecipientsMatrikkel extends FilterValues {
  fritidsbolig: boolean;
  osloReg: boolean;
}
export interface RecipientsManual extends FilterValues {
  listType: '' | 'email' | 'emailAndName' | 'identifier';
  listName: string;
  recipientsList?: Record<string, string>[];
  recipientsCount?: number;
  listPath?: string;
  createdTimestamp?: number;
}

export interface AgeFilter {
  filter: AGEFILTER_OPTIONS;
  label: string;
  age?: string;
  olderThan?: string;
  youngerThan?: string;
  fromAge?: string;
  toAge?: string;
  afterDate?: string;
  beforeDate?: string;
  fromDate?: string;
  toDate?: string;
  fromYear?: string;
  toYear?: string;
  foedselsaarFraOgMed?: string;
  foedselsaarTilOgMed?: string;
}

export type FilterTypes = RecipientsQuery | RecipientsManual | RecipientsMatrikkel | RecipientsKart;

export enum AGEFILTER_OPTIONS {
  EVERYONE = 'everyone',
  OLDER_THAN = 'olderThan',
  YOUNGER_THAN = 'youngerThan',
  AGE_BETWEEN = 'ageBetween',
  AFTER_DATE = 'afterDate',
  BEFORE_DATE = 'beforeDate',
  BETWEEN_DATE = 'betweenDate',
  BETWEEN_YEARS = 'betweenYears',
  TURN_X_YEARS = 'turnXYears',
  TURN_X_MONTHS = 'turnXMonths',
  TURN_X_DAYS = 'turnXDays',
  BORN_BETWEEN = 'foedselsaarFraOgTilOgMed',
}

export enum RECIPIENT_STAGE {
  START,
  RECIPIENTS,
  CHOOSE_SOURCE,
  CHOOSE_CRITERIA,
  EDIT_GROUP,
}
