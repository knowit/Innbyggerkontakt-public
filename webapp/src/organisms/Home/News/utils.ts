import { Bulletin } from '../../../models';

export const translateBulletinType = (type: string) => {
  switch (type) {
    case 'event':
      return 'Automatisk';
    case 'search':
      return 'Enkel';
    default:
      return type;
  }
};

export const translateBulletinName = (channel: Bulletin['channel']) => {
  switch (channel.name) {
    case 'sms':
      return 'SMS';
    case 'email':
      return 'Email';
    default:
      return 'Feil har oppstått';
  }
};
