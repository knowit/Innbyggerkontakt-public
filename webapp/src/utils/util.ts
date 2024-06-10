import { Bulletin, BulletinContent, FilterTypes } from '../models';

export const generateUrl = (feedbackValue: string, lang: string, currentBulletinId: string, orgId: string) =>
  `${process.env.REACT_APP_APP_BASE_URL}/feedback/?orgId=${orgId}&lang=${lang}&bulletin=${currentBulletinId}&opt=${feedbackValue}`;

export const setBulletinForSummaryPage = (
  active: boolean,
  currentBulletin: Bulletin,
  content: BulletinContent,
): Bulletin | undefined => {
  const currentDate = new Date().toString();
  switch (currentBulletin.channel.type) {
    case 'event':
      return {
        ...currentBulletin,
        execution: {
          ...currentBulletin.execution,
          type: currentBulletin?.execution?.type || 'schedule',
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

// query has been the default alternative previously, so this is a failsafe for new filters
export const getFilterTypeFromFilter = (filter: FilterTypes) => {
  switch (filter.recipientFilter) {
    case 'manual':
      return filter.recipientFilter;
    case 'matrikkel':
      return filter.recipientFilter;
    case 'kart':
      return filter.recipientFilter;
    default:
      return 'query';
  }
};

export const toCapitalCase = (str: string) => {
  return str.charAt(0).toUpperCase() + str.slice(1).toLocaleLowerCase();
};
