import { RecipientsManual, RecipientsMatrikkel, RecipientsQuery } from '../Recipient/Recipient';

import firebase from 'firebase/compat/app';
import { RecipientsKart } from 'models/Mapbox';

export type BulletinData = {
  id: string;
  bulletin: Bulletin;
};

export interface Bulletin {
  basedOn?: {
    id: string;
    type: 'bulletin' | 'template';
  };
  type: BulletinEmail['type'];
  channel: BulletinSMS | BulletinEmail;
  content?: BulletinContent;
  smsContent?: SMSContent;
  execution?: BulletinExecution;
  recipients?: BulletinRecipients;
  status: 'draft' | 'finished' | 'active';
  name: string;
  kommunenummer?: string;
  userId?: string;
  sandboxMode?: boolean;
  lastChangedBy?: string;
  lastChanged?: string;
  startDate?: string;
  templateApplicationId?: string;
  templateApplicationStyleId?: string;
}

export interface BulletinSMS {
  name: 'sms';
  type: 'search';
}
export interface BulletinEmail {
  name: 'email';
  type: 'search' | 'event';
}

export interface BulletinRecipients {
  recipientFilter?: string;
  query?: RecipientsQuery[];
  event?: BulletinEvent;
  matrikkel?: RecipientsMatrikkel[];
  manual?: RecipientsManual[];
  kart?: RecipientsKart[];
}

export interface BulletinContent {
  from: { email: string; name: string };
  contentInLanguage: ContentInLanguage[];
  defaultLanguage: string;
}

export interface SMSContent {
  nb: string;
}

export interface BulletinEvent {
  eventType?: string;
  reason?: string[];
}

export interface ContentInLanguage {
  language: string;
  subject: string;
  previewText?: string;
  variables: Record<string, string>;
}

export interface BulletinExecution {
  type: 'schedule' | 'instant';
  datetime?: string;
  active?: boolean;
  delay?: string;
}

export type BulletinMessage = { id: string; bulletin: firebase.firestore.DocumentData };

export enum SEARCH_FILTER_OPTIONS {
  SMS = 'SMS',
  EMAIL = 'Epost',
  AUTO = 'Automatisk',
  SINGLE = 'Enkel',
  DRAFT = 'Kladd',
  ACTIVE = 'Aktiv',
  PLANNED = 'Planlagt',
  FINISHED = 'Fullført',
}
