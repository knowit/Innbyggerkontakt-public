import { Bulletin, SMSContent } from 'models';

export const setFinishedBulletin = (
  activate: boolean,
  currentBulletin: Bulletin,
  content: SMSContent,
): Bulletin | undefined => {
  return {
    ...currentBulletin,
    execution: {
      ...currentBulletin.execution,
      type: currentBulletin.execution?.type === 'schedule' ? 'schedule' : 'instant',
      datetime: currentBulletin.execution?.datetime,
      active: activate,
    },
    smsContent: content,
    status: activate ? 'active' : 'draft',
  };
};
