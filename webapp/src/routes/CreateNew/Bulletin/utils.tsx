import {
  EventForm,
  PreviewMail,
  SelectAutoRecipients,
  SelectRecipients,
  TimeForm,
} from 'containers/CreateMessagePage/containers';
import { Invoice, SelectStyleForm, Start, Summary, SummaryPage } from 'pages/CreateNew';
import * as React from 'react';

import { Bulletin, BulletinRecipients, InvoiceType } from 'models';
import ContentPage from 'pages/CreateNew/Content/ContentPage';

/* So far we need 3 different menu types: email-event, email-search and sms.
Hence ChannelType that gives also possibility to expand it later if needed */
export interface RoutesType {
  path: string;
  title: string;
  component: JSX.Element | string;
  channel: ChannelType;
  filled: boolean;
}

interface ChannelType {
  email?: 'event' | 'search' | 'felles';
  sms?: 'search';
}
interface RoutesProps {
  brregInfo?: InvoiceType;
  currentBulletin: Bulletin | null;
  onClickNext: () => void;
  channel: Bulletin['channel'];
  setChannel: React.Dispatch<React.SetStateAction<Bulletin['channel']>>;
  invoice: InvoiceType | null;
}

const validateExecutionTime = (executionTime?: string): boolean => {
  if (executionTime) {
    const today = new Date();
    const bulletinTime = new Date(executionTime);
    return bulletinTime > today;
  } else {
    return false;
  }
};
const excludeEvent = (recipients: BulletinRecipients): boolean => {
  return Object.keys(recipients).filter((key) => !key.includes('event')).length != 0 ? true : false;
};

// routes is collection of all components and paths that occur in innbyggerkontakt/ create new bulletin
export const routes = ({ currentBulletin, onClickNext, channel, setChannel, invoice }: RoutesProps): RoutesType[] => [
  {
    path: 'start',
    title: 'Start',
    component: <Start onClickNext={onClickNext} channel={channel} setChannel={setChannel} />,
    channel: { email: 'felles', sms: 'search' },
    filled: !!currentBulletin?.name,
  },
  {
    path: 'hendelse',
    title: 'Hendelse',
    component: <EventForm onClickNext={onClickNext} />,
    channel: { email: 'event' },
    filled: !!currentBulletin?.recipients?.event,
  },
  {
    path: 'mottakere-auto',
    title: 'Mottakere',
    component: <SelectAutoRecipients onClickNext={onClickNext} />,
    channel: { email: 'event' },
    filled: !!currentBulletin?.recipients && excludeEvent(currentBulletin.recipients),
  },
  {
    path: 'mottakere',
    title: 'Mottakere',
    component: <SelectRecipients onClickNext={onClickNext} />,
    channel: { email: 'search', sms: 'search' },
    filled: !!currentBulletin?.recipients && Object.keys(currentBulletin.recipients).length != 0,
  },
  {
    path: 'utseende',
    title: 'Utseende',
    component: <SelectStyleForm onClickNext={onClickNext} />,
    channel: { email: 'felles' },
    filled: !!currentBulletin?.templateApplicationStyleId,
  },
  {
    path: 'innhold',
    title: 'Innhold',
    component: <ContentPage onClickNext={onClickNext} />,
    channel: { email: 'felles', sms: 'search' },
    filled: !!currentBulletin?.content || !!currentBulletin?.smsContent,
  },
  {
    path: 'forhaandsvisning',
    title: 'Forhåndsvisning',
    component: <PreviewMail onClickNext={onClickNext} />,
    channel: { email: 'felles' },
    filled: false, // må huske på å lagre om man er fornøyd med perview
  },
  {
    path: 'tidspunkt',
    title: 'Tidspunkt',
    component: <TimeForm onClickNext={onClickNext} />,
    channel: { email: 'felles', sms: 'search' },
    filled:
      currentBulletin?.execution?.type === 'instant' ||
      (currentBulletin?.execution?.type === 'schedule' && validateExecutionTime(currentBulletin.execution.datetime)),
  },
  {
    path: 'fakturering',
    title: 'Fakturering',
    component: <Invoice onClickNext={onClickNext} />,
    channel: { sms: 'search' },
    filled: !!invoice,
  },
  {
    path: 'oppsummering',
    title: 'Oppsummering',
    component:
      currentBulletin?.channel.name === 'sms' ? (
        <Summary onClickNext={onClickNext} />
      ) : (
        <SummaryPage onClickNext={onClickNext} />
      ),
    channel: { email: 'felles', sms: 'search' },
    filled: false,
  },
];
