import firebase from 'firebase/compat/app';
import DbAccess from '../utils/DbAccess';
import Firebase from '../utils/Firebase';
import { Bulletin, InvoiceType, Style } from '../models';

export class Store {
  // Her lager vi alle verdien som storen skal inneholde
  sessionStorage: Storage;
  auth: firebase.auth.Auth | null;
  user: firebase.User | null;
  dbAccess: DbAccess;

  currentBulletinId: string | null;
  currentBulletin: Bulletin | null;

  invoice: InvoiceType | null;

  templateStyle: Style | null;

  // Initialiserer alle variablene, så lenge brukeren er logget inn
  constructor() {
    this.sessionStorage = window.sessionStorage;

    this.auth = this.sessionStorage.getItem('auth')
      ? JSON.parse(this.sessionStorage.getItem('auth') as string)
      : Firebase.auth;
    this.user = this.sessionStorage.getItem('user')
      ? JSON.parse(this.sessionStorage.getItem('user') as string)
      : Firebase.user;
    this.dbAccess = new DbAccess(Firebase.db);

    this.currentBulletinId = this.sessionStorage.getItem('currentBulletinId');
    this.currentBulletin = this.sessionStorage.getItem('currentBulletin')
      ? JSON.parse(this.sessionStorage.getItem('currentBulletin') as string)
      : null;

    this.templateStyle = this.sessionStorage.getItem('templateStyle')
      ? JSON.parse(this.sessionStorage.getItem('templateStyle') as string)
      : null;

    this.invoice = this.sessionStorage.getItem('invoice')
      ? JSON.parse(this.sessionStorage.getItem('invoice') as string)
      : null;
  }

  setBulletin(bulletin: Bulletin | null) {
    if (bulletin) {
      const bulletinChannel: Bulletin = {
        ...bulletin,
        type: bulletin?.type ? bulletin.type : 'search',
        channel: bulletin.channel
          ? bulletin.channel.name === 'email'
            ? { name: 'email', type: bulletin.channel.type }
            : { name: 'sms', type: 'search' }
          : { name: 'email', type: bulletin.type },
      };
      this.currentBulletin = bulletinChannel;
      this.sessionStorage.setItem('currentBulletin', JSON.stringify(bulletinChannel));
    } else {
      this.currentBulletin = null;
      this.sessionStorage.removeItem('currentBulletin');
    }
  }

  setInvoice(invoice: InvoiceType | null) {
    this.invoice = invoice;
    if (invoice) {
      this.sessionStorage.setItem('invoice', JSON.stringify(invoice));
    } else {
      this.invoice = null;
      this.sessionStorage.removeItem('invoice');
    }
  }

  setTemplateStyle(style: Style | null, id: string) {
    if (style) {
      const s: Style = {
        id: id,
        font: style.font,
        footer: style.footer,
        name: style.name,
        primaryColor: style.primaryColor,
        secondaryColor: style.secondaryColor,
        status: style.status,
        lastChangedBy: style.lastChangedBy,
      };
      this.sessionStorage.setItem('templateStyle', JSON.stringify(s));
    } else {
      this.sessionStorage.removeItem('templateStyle');
    }
  }

  setBulletinId(bulletinId: string | null) {
    this.currentBulletinId = bulletinId;
    if (bulletinId) {
      this.sessionStorage.setItem('currentBulletinId', bulletinId);
    } else {
      this.sessionStorage.removeItem('currentBulletinId');
    }
  }

  // Setter de korrekte verdiene etter at brukeren er initalisert
  setValues(auth: firebase.auth.Auth, user: firebase.User) {
    this.auth = auth;
    this.user = user;
  }

  userIsVerified() {
    return !!this.auth;
  }
}

export default new Store();
