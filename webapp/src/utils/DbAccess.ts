import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import { v4 } from 'uuid';
import { getFilterTypeFromFilter } from './util';
import {
  Bulletin,
  BulletinData,
  DeepPartial,
  FilterTypes,
  InvoiceType,
  OptionType,
  Organization,
  RecipientsManual,
  Style,
  Template,
  TemplateApplication,
} from '../models';

export const getUserId = (sessionStorage: Storage) =>
  sessionStorage.getItem('user') !== null && JSON.parse(sessionStorage.getItem('user') as string).uid;

export type MunicipalityType = {
  id: string;
  name: string;
  municipalityNumber: number;
};
class DbAccess {
  db: firebase.firestore.Firestore;
  sessionStorage: Storage;

  constructor(firestore: firebase.firestore.Firestore | null) {
    if (firestore) {
      this.db = firestore;
      this.sessionStorage = window.sessionStorage;
    } else throw new Error('Firestore not initialized');
  }

  async getTemplateApplications(organizationId: string): Promise<OptionType[]> {
    return this.getAllAsIdNamePair(organizationId, 'template_application');
  }

  async getAllAsIdNamePair(organizationId: string, collectionPath: string): Promise<OptionType[]> {
    const result: OptionType[] = [];
    const snapshot = await this.db.collection('organization').doc(organizationId).collection(collectionPath).get();
    snapshot.forEach((doc) => {
      const p: OptionType = { value: doc.id, label: doc.get('name') };
      result.push(p);
    });
    return result;
  }

  async getStylesAsListFromTemplateApplicationDoc(
    organizationId: string,
    collectionId: string,
  ) /*: Promise<TemplateApplicationsStyles[]>*/ {
    const result: string[] = [];
    const snapshot = await this.db
      .collection('organization')
      .doc(organizationId)
      .collection('template_application')
      .doc(collectionId)
      .collection('mailjet_template_ids')
      .get();

    snapshot.forEach(async (doc) => {
      result.push(doc.id);
    });
    return result;
  }

  /**
   * Fetches the MJ id of the styled version of a template
   * @param {string} templateId           Name of the template_application in db
   * @param {string} styledTemplateId     Name of the styled template within the given template
   */
  async getStyledTemplateId(orgId: string, templateId: string, styledTemplateId: string) {
    const templateDoc = await this.db
      .collection('organization')
      .doc(orgId)
      .collection('template_application')
      .doc(templateId)
      .collection('mailjet_template_ids')
      .doc(styledTemplateId)
      .get();

    if (!templateDoc.exists) {
      return;
    }
    const data = templateDoc.data();

    if (data?.id) return data.id;
  }

  async getTemplateApplicationStylesOptionList(organizationId: string, collectionId?: string): Promise<OptionType[]> {
    // Get all styleobjects in organization to verify if they are done processing
    const styleObjects: Record<string, string> = {};
    await this.getAllDocumentsInCollection(organizationId, 'styles').then((style) => {
      style.forEach((doc) => {
        const data = doc.data();
        styleObjects[data.name] = data.status;
      });
    });

    // Only return the options that are done according to styles
    return this.getStylesAsListFromTemplateApplicationDoc(organizationId, collectionId || '')
      .then((res) => {
        // Filtering away all elements that are not finished processing succesfully
        const filtered = res.filter((templateApplicationStyle) => styleObjects[templateApplicationStyle] === 'done');
        filtered.push('default');
        return filtered.map((templateApplicationStyle) => ({
          label: templateApplicationStyle === 'default' ? 'Standard' : templateApplicationStyle,
          value: templateApplicationStyle,
        }));
      })
      .catch(() => {
        return [];
      });
  }

  private async getMailjetTemplateIdsCollection(
    dbPath: firebase.firestore.CollectionReference<firebase.firestore.DocumentData>,
    docId: string,
  ) {
    const styleNames: string[] = [];
    const collection = await dbPath.doc(docId).collection('mailjet_template_ids').get();

    collection.forEach((name) => {
      styleNames.push(name.id);
    });

    return styleNames;
  }

  async checkForPotentialOverwrite(id: string | null, status = 'draft'): Promise<boolean> {
    const organizationId = this.sessionStorage.getItem('organizationId') as string;
    const bulletinIdsStatusExcluded = await this.getAllBulletinsFromOrganization(organizationId).then((docs) => {
      //map og filter eksisterer verken på QuerySnapshot eller QueryDocumentSnapshot. Hence foreach, let og if-setning under
      let tempBulletinIds: string[] = [];
      docs.forEach((snapshot) =>
        snapshot?.forEach((doc) => {
          const data = doc.data();
          if (data.status !== status) {
            tempBulletinIds = [...tempBulletinIds, doc.id];
          }
        }),
      );
      return tempBulletinIds;
    });

    return new Promise<boolean>((resolve, reject) => {
      if (bulletinIdsStatusExcluded.includes(id || '____noId')) {
        const errorMessage = 'Utsendingen er allerede ute av kladd, du vil bli sendt tilbake til oversiktsiden';
        reject(errorMessage);
      }
      resolve(true);
    });
  }

  async getMmlFilter(orgId: string, bulletinId: string, existingBulletin: Bulletin) {
    const returnPromise = await this.getBulletin(orgId, bulletinId, 'draft').then((newBulletin) => {
      if (newBulletin && newBulletin.recipients && newBulletin.recipients.manual) {
        const newRecipients = {
          ...existingBulletin.recipients,
          manual: existingBulletin.recipients?.manual?.map((mmlFilter: RecipientsManual) => {
            const newList = newBulletin.recipients.manual;
            const newElement = newList.find((oldFilter: RecipientsManual) => oldFilter.id === mmlFilter.id);
            return { ...mmlFilter, ...newElement };
          }),
        };
        return { ...existingBulletin, recipients: newRecipients };
      } else {
        return existingBulletin;
      }
    });
    return returnPromise;
  }

  async persistBulletin(
    bulletin: Bulletin,
    id: string | undefined | null = undefined,
    fromPath?: string,
    toPath?: string,
  ): Promise<string> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const bulletinAny: any = bulletin;
    const organizationId = this.sessionStorage.getItem('organizationId') as string;
    const userId = getUserId(this.sessionStorage);
    const todayDate = new Date().toString();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const removeEmpty = (obj: any) => {
      Object.keys(obj).forEach((key) => {
        if (obj[key] && typeof obj[key] === 'object') removeEmpty(obj[key]);
        else if (obj[key] === undefined || obj[key] === '') delete obj[key];
      });
      return obj;
    };

    const filteredBulletin = removeEmpty(bulletinAny);
    const verifiedBulletin = await this.getMmlFilter(organizationId, id as string, filteredBulletin);

    const updatedBulletin = {
      ...verifiedBulletin,
      userId,
      lastChangedBy: 'client',
      lastChanged: todayDate,
    };
    const path = this.db
      .collection('organization')
      .doc(organizationId)
      .collection('bulletin')
      .doc(bulletin.status)
      .collection(bulletin.status === 'active' ? bulletin.channel.type : 'default');
    if (id) {
      if (fromPath && toPath) {
        await this.db
          .collection('organization')
          .doc(organizationId)
          .collection('bulletin')
          .doc(toPath)
          .collection(toPath === 'active' ? bulletin.channel.type : 'default')
          .doc(id)
          .set(updatedBulletin, { merge: true });

        await this.db
          .collection('organization')
          .doc(organizationId)
          .collection('bulletin')
          .doc(fromPath)
          .collection(fromPath === 'active' ? bulletin.channel.type : 'default')
          .doc(id)
          .delete();
        return id;
      } else {
        await path.doc(id).set(updatedBulletin, { merge: true });
        return id;
      }
    } else {
      const docRef = await path.add(updatedBulletin);
      return docRef.id;
    }
  }

  async persistMmlBulletinFilterList(
    bulletinId: string | undefined | null = undefined,
    filterId: string,
    content: Record<string, unknown>,
  ): Promise<string | boolean> {
    const organizationId = this.sessionStorage.getItem('organizationId') as string;

    const path = this.db
      .collection('organization')
      .doc(organizationId)
      .collection('bulletin')
      .doc('draft')
      .collection('default');

    if (bulletinId) {
      await path.doc(bulletinId).collection('manualRecipients').doc(filterId).set(content, { merge: true });
      return filterId;
    }
    return new Promise<boolean>((resolve, reject) => {
      if (!bulletinId) {
        const errorMessage = 'Utsendingen ble ikke funnet, vennligst prøv igjen senere.';
        reject(errorMessage);
      }
      resolve(true);
    });
  }

  async deleteMmlBulletinFilterList(
    bulletinId: string | undefined | null = undefined,
    filterId: string,
  ): Promise<void> {
    const organizationId = this.sessionStorage.getItem('organizationId') as string;

    const path = this.db
      .collection('organization')
      .doc(organizationId)
      .collection('bulletin')
      .doc('draft')
      .collection('default');

    if (bulletinId) {
      await path
        .doc(bulletinId)
        .collection('manualRecipients')
        .doc(filterId)
        .delete()
        .catch((error) => console.error(error));
    }
  }

  private async getDocumentById(
    collectionPath: string,
    fieldPath: string,
    organizationId: string,
  ): Promise<firebase.firestore.DocumentSnapshot<firebase.firestore.DocumentData>> {
    const docRef = this.db.collection('organization').doc(organizationId).collection(collectionPath).doc(fieldPath);
    return docRef.get();
  }

  async getBulletinTemplate(fieldPath: string, organizationId: string): Promise<Bulletin | null> {
    return this.getDocumentById('bulletin_template', fieldPath, organizationId)
      .then((doc) => {
        if (doc.exists) {
          return doc.data() as Bulletin;
        }
        return null;
      })
      .catch((e) => {
        console.error(e);
        return null;
      });
  }

  async getTemplateApplication(fieldPath: string, organizationId: string): Promise<TemplateApplication | null> {
    return this.getDocumentById('template_application', fieldPath, organizationId)
      .then((doc) => {
        if (doc.exists) {
          return doc.data() as TemplateApplication;
        }
        console.error(`No template found for templateId ${fieldPath}`);
        return null;
      })
      .catch((e) => {
        console.error(e);
        return null;
      });
  }

  async getBulletin(organizationId: string, id: string, status: string, typeName?: string | undefined) {
    return (
      await this.db
        .collection('organization')
        .doc(organizationId)
        .collection('bulletin')
        .doc(status)
        .collection(typeName || 'default')
        .doc(id)
        .get()
    ).data();
  }

  async getBulletins(organizationId: string, status: string, typeName = 'default') {
    const type = status === 'draft' ? 'lastChanged' : 'execution.datetime';
    const order = status === 'finished' || status === 'draft' ? 'desc' : 'asc';

    return this.db
      .collection('organization')
      .doc(organizationId)
      .collection('bulletin')
      .doc(status)
      .collection(typeName)
      .orderBy(type, order);
  }

  async getAllBulletinWithParam(organizationId: string, status: string, typeName = 'default') {
    const orderdBulletins = await this.getBulletins(organizationId, status, typeName);
    return orderdBulletins.get();
  }

  async getUpdatingBulletins(onChangeCallback: (e: BulletinData[]) => void, status: string, typeName = 'default') {
    const organizationId = this.sessionStorage.getItem('organizationId') as string;
    const orderdBulletins = await this.getBulletins(organizationId, status, typeName);
    return orderdBulletins.onSnapshot(
      (col) => {
        onChangeCallback(col.docs.map((document) => ({ id: document.id, bulletin: document.data() as Bulletin })));
      },
      (error) => {
        console.error(error);
      },
    );
  }

  async getAllBulletinsFromOrganizationWithQuerySnapshotCallback(
    querySnapShotCallback: Array<
      (organizationId: string) => Promise<firebase.firestore.QuerySnapshot<firebase.firestore.DocumentData>>
    >,
    organizationId: string,
  ) {
    return await Promise.allSettled(querySnapShotCallback.map((callback) => callback(organizationId))).then((results) =>
      results
        .filter((result) => result.status !== 'rejected')
        .map((result) => {
          if (
            result != null &&
            typeof (result as PromiseFulfilledResult<firebase.firestore.QuerySnapshot<firebase.firestore.DocumentData>>)
              .value === 'object'
          ) {
            return (result as PromiseFulfilledResult<firebase.firestore.QuerySnapshot<firebase.firestore.DocumentData>>)
              .value;
          }
        }),
    );
  }

  async getAllBulletinsFromOrganization(organizationId: string) {
    return await this.getAllBulletinsFromOrganizationWithQuerySnapshotCallback(
      [
        (organizationId: string) => this.getAllBulletinWithParam(organizationId, 'active', 'search'),
        (organizationId: string) => this.getAllBulletinWithParam(organizationId, 'active', 'event'),
        (organizationId: string) => this.getAllBulletinWithParam(organizationId, 'draft'),
        (organizationId: string) => this.getAllBulletinWithParam(organizationId, 'finished'),
      ],
      organizationId,
    );
  }

  /* will set the current bulletin from active to draft */
  async setBulletinToDraft(bulletin: Bulletin, bulletinId: string) {
    if (!bulletin) return;

    const currentExecution = bulletin.execution ? { ...bulletin.execution, active: false } : undefined;
    const draftBulletin = {
      ...bulletin,
      status: 'draft' as Bulletin['status'],
      execution: currentExecution,
    };
    await this.persistBulletin(draftBulletin, bulletinId, 'active', 'draft');
  }

  /* will set the current bulletin from draft to active */
  async setBulletinToActive(bulletin: Bulletin, bulletinId: string) {
    if (!bulletin) return;

    const currentExecution = bulletin.execution ? { ...bulletin.execution, active: true } : undefined;
    const activeBulletin = {
      ...bulletin,
      status: 'active' as Bulletin['status'],
      execution: currentExecution,
    };
    await this.persistBulletin(activeBulletin, bulletinId, 'draft', 'active');
  }

  async deleteBulletin(organizationId: string, bulletinId: string) {
    this.db
      .collection('organization')
      .doc(organizationId)
      .collection('bulletin')
      .doc('draft')
      .collection('default')
      .doc(bulletinId)
      .delete()
      .catch((error) => console.error(error));
  }

  /*
  addExecutionToBulletin(execution: BulletinExecution, bulletinId: string) {
    //TODO store as sub structure
  }
  */

  /*
  saveUserInCollection = (user: firebase.User, municipality: MunicipalityType) => {
    const collectionUser = { uid: user.uid, municipality: municipality };
    const newUser = this.db.collection('users').add(collectionUser);
    return newUser;
  };
  */

  async saveNewUser(user: firebase.User, organizationId: string) {
    const newUser = await this.db
      .collection('users')
      .doc(user.uid)
      .set({ rolle: 'bruker', orgId: organizationId }, { merge: true });
    await this.db
      .collection('organization')
      .doc(organizationId)
      .collection('users')
      .doc(user.uid)
      .set({ rolle: 'bruker' }, { merge: true });
    return newUser;
  }

  async updateOrganizationUser(userId: string, organizationId: string, userRole: string) {
    await this.db
      .collection('organization')
      .doc(organizationId)
      .collection('users')
      .doc(userId)
      .update({ rolle: userRole });
  }

  async getUser(userId: string) {
    const user = await this.db.collection('users').doc(userId).get();

    return user.data();
  }

  async getUserInOrganization(userId: string, organizationId: string) {
    const user = await this.db.collection('organization').doc(organizationId).collection('users').doc(userId).get();

    return user.data();
  }

  async getorganization(organizationId: string) {
    const organization = await this.db.collection('organization').doc(organizationId).get();

    return organization.data();
  }

  async setOrganization(
    organizationId: string,
    data: {
      defaultLanguage: string;
      kommuneVaapen: string;
      kommunevaapenWithName: string;
      navn: string;
      webside: string;
      feedbackText: string;
    },
  ) {
    const organization = sessionStorage.getItem('organization');
    if (organization) {
      const org = JSON.parse(organization);

      this.db
        .collection('organization')
        .doc(organizationId)
        .set(
          {
            annet: org.annet || '',
            defaultEmailAddress: org.defaultEmailAddress || '',
            defaultLanguage: data.defaultLanguage || '',
            kommuneVaapen: data.kommuneVaapen || '',
            kommunevaapenWithName: data.kommunevaapenWithName || '',
            municipalityNumber: org.municipalityNumber || '',
            navn: data.navn || '',
            type: org.type || '',
            webside: data.webside,
            feedbackText: data.feedbackText || '',
          },
          { merge: true },
        );
    }
  }

  async getorganizationRole(organizationId: string, userId: string) {
    const organizationUser = await this.db
      .collection('organization')
      .doc(organizationId)
      .collection('users')
      .doc(userId)
      .get();

    return organizationUser.data();
  }

  async getAllDocumentsInCollection(organizationId: string, collectionPath: string) {
    return this.db.collection('organization').doc(organizationId).collection(collectionPath).get();
  }

  async getDocument(organizationId: string, collectionPath: string, docId: string) {
    return (
      await this.db.collection('organization').doc(organizationId).collection(collectionPath).doc(docId).get()
    ).data();
  }

  async saveStyle(style: Style, organizationId: string, styleId?: string) {
    if (!styleId) {
      await this.db.collection('organization').doc(organizationId).collection('styles').add(style);
    } else {
      await this.db
        .collection('organization')
        .doc(organizationId)
        .collection('styles')
        .doc(styleId)
        .set(style, { merge: true });
    }
  }

  async getColors(organizationId: string) {
    return (
      await this.db.collection('organization').doc(organizationId).collection('styles').doc('colors').get()
    ).data();
  }

  async addColors(organizationId: string, colors: Array<string>) {
    const ref = this.db.collection('organization').doc(organizationId).collection('styles').doc('colors');

    colors.map((color) => {
      ref.set(
        {
          colors: firebase.firestore.FieldValue.arrayUnion(color),
        },
        { merge: true },
      );
    });
  }

  async deleteDocument(organizationId: string, collectionPath: string, documentId: string) {
    await this.db
      .collection('organization')
      .doc(organizationId)
      .collection(collectionPath)
      .doc(documentId)
      .delete()
      .catch(function (error) {
        console.error('Error removing document: ', error);
      });
  }
  async deleteFieldInBulletin(organizationId: string, documentId: string, filter: FilterTypes) {
    const ref = this.db
      .collection('organization')
      .doc(organizationId)
      .collection('bulletin')
      .doc('draft')
      .collection('default')
      .doc(documentId?.toString());

    await ref.update({
      [`recipients.${getFilterTypeFromFilter(filter)}`]: firebase.firestore.FieldValue.arrayRemove(filter),
    });
    return this.getBulletin(organizationId, documentId, 'draft') as Promise<Bulletin | undefined>;
  }

  async getBulletinInvoiceId(bulletinId: string, orgId: string): Promise<string> {
    let id: string;
    const res = await this.db
      .collection('organization')
      .doc(orgId)
      .collection('bulletin')
      .doc('draft')
      .collection('default')
      .doc(bulletinId)
      .collection('fakturaInfo')
      .get()
      .then((query) => {
        query.forEach((e) => (id = e.id));
        return id;
      });

    return res;
  }

  async getBulletinInvoice(bulletinId: string): Promise<InvoiceType | undefined> {
    const organizationId = this.sessionStorage.getItem('organizationId') as string;
    if (organizationId) {
      const id = await this.getBulletinInvoiceId(bulletinId, organizationId);
      const invoiceInfo = await this.db
        .collection('organization')
        .doc(organizationId)
        .collection('bulletin')
        .doc('draft')
        .collection('default')
        .doc(bulletinId)
        .collection('fakturaInfo')
        .doc(id)
        .get()
        .then((invoiceData) => {
          return invoiceData.data() as InvoiceType;
        });
      return invoiceInfo;
    }
  }

  async addBulletinInvoice(bulletinId: string, invoice: InvoiceType): Promise<void> {
    if (this.sessionStorage.getItem('organization')) {
      const organizationId = this.sessionStorage.getItem('organizationId') as string;
      const invoiceId = await this.getBulletinInvoiceId(bulletinId, organizationId);
      if (invoiceId !== 'Error') {
        if (invoiceId) {
          await this.db
            .collection('organization')
            .doc(organizationId)
            .collection('bulletin')
            .doc('draft')
            .collection('default')
            .doc(bulletinId)
            .collection('fakturaInfo')
            .doc(invoiceId)
            .update(invoice);
        } else {
          await this.db
            .collection('organization')
            .doc(organizationId)
            .collection('bulletin')
            .doc('draft')
            .collection('default')
            .doc(bulletinId)
            .collection('fakturaInfo')
            .add(invoice);
        }
      }
    }
  }

  addNewMunicipality = (municipalityName: string, municipalityNumber: number): MunicipalityType => {
    const municipalityId = v4();
    const municipalityObject: MunicipalityType = {
      id: municipalityId,
      name: municipalityName,
      municipalityNumber: municipalityNumber,
    };
    return municipalityObject;
  };

  async getPostalCodes(): Promise<string[]> {
    const organization = JSON.parse(sessionStorage.getItem('organization') || '');
    const doc = await this.db.collection('postalCodeData').doc(organization?.municipalityNumber).get();
    return (doc.data()?.['postalCodes'] as string[]) || [];
  }

  async createNewTemplate(organizationId: string) {
    const path = this.db.collection('templates');
    const emptyTemplate = { contentArray: [], name: 'Ny mal', orgId: organizationId, tags: [], type: 'draft' };
    return path
      .add(emptyTemplate)
      .then((doc) => doc.id)
      .catch((error) => {
        console.error('Error creating template: ', error);
        return undefined;
      });
  }

  async createTemplateCopy(organizationId: string, template: DeepPartial<Template>) {
    const path = this.db.collection('templates');
    const lastChanged = new Date().toString();

    const newTemplate: DeepPartial<Template> = {
      contentArray: template.contentArray ?? [],
      orgId: organizationId,
      type: 'draft',
      name: `${template.name} - kopi`,
      description: template.description,
      tags: template.tags,
      recipientDescription: template.recipientDescription,
      lastChanged,
    };
    return path
      .add(newTemplate)
      .then(async (doc) => {
        await this.updateTemplate(doc.id, { id: doc.id });
        return doc.id;
      })
      .catch((error) => {
        console.error('Error creating template: ', error);
        return undefined;
      });
  }

  async addNewTemplate(template: DeepPartial<Template>) {
    const path = this.db.collection('templates');
    const lastChanged = new Date().toString();
    return path
      .add({ ...template, lastChanged })
      .then((doc) => {
        return doc.id;
      })
      .catch((error) => console.error('Error creating template: ', error));
  }

  async deleteTemplate(templateId: string) {
    return this.db
      .collection('templates')
      .doc(templateId)
      .delete()
      .catch((error) => console.error('Error deleting template: ', error));
  }

  async updateTemplate(templateId: string, template: Omit<DeepPartial<Template>, 'orgId'>) {
    const docRef = this.db.collection('templates').doc(templateId);
    const lastChanged = new Date().toString();
    return docRef
      .set({ ...template, lastChanged }, { merge: true })
      .catch((error) => console.error('Error updating template: ', error));
  }

  async getTemplate(templateId: string) {
    return this.db
      .collection('templates')
      .doc(templateId)
      .get()
      .then((doc) => doc.data())
      .catch((error) => {
        console.error('Error getting template: ', error);
        return undefined;
      });
  }

  async getOrganizationTemplates(orgId: string) {
    const templates: Template[] = [];
    await this.db
      .collection('templates')
      .where('orgId', '==', orgId)
      .get()
      .then((snapshot) => snapshot.forEach((doc) => templates.push(doc.data() as Template)))
      .catch((error) => console.error('Error getting templates: ', error));
    return templates;
  }

  async getPublishedTemplates(organizationId?: string) {
    const templates: Template[] = [];

    if (organizationId) {
      await this.db
        .collection('templates')
        .where('orgId', '==', organizationId)
        .where('type', '==', 'published')
        .get()
        .then((snapshot) => snapshot.forEach((doc) => templates.push(doc.data() as Template)))
        .catch((error) => console.error('Error getting templates: ', error));
    } else {
      await this.db
        .collection('templates')
        .where('type', '==', 'published')
        .get()
        .then((snapshot) => snapshot.forEach((doc) => templates.push(doc.data() as Template)))
        .catch((error) => console.error('Error getting templates: ', error));
    }
    return templates;
  }

  async getAllButArchivedTemplates(organizationId?: string) {
    const templates: Template[] = [];

    if (organizationId) {
      await this.db
        .collection('templates')
        .where('orgId', '==', organizationId)
        .where('type', '!=', 'archived')
        .get()
        .then((snapshot) => snapshot.forEach((doc) => templates.push(doc.data() as Template)))
        .catch((error) => console.error('Error getting templates: ', error));
    } else {
      await this.db
        .collection('templates')
        .where('type', '!=', 'archived')
        .get()
        .then((snapshot) => snapshot.forEach((doc) => templates.push(doc.data() as Template)))
        .catch((error) => console.error('Error getting templates: ', error));
    }
    return templates;
  }

  async getArchivedTemplates(organizationId?: string) {
    const templates: Template[] = [];

    if (organizationId) {
      await this.db
        .collection('templates')
        .where('orgId', '==', organizationId)
        .where('type', '==', 'archived')
        .get()
        .then((snapshot) => snapshot.forEach((doc) => templates.push(doc.data() as Template)))
        .catch((error) => console.error('Error getting templates: ', error));
    } else {
      await this.db
        .collection('templates')
        .where('type', '==', 'archived')
        .get()
        .then((snapshot) => snapshot.forEach((doc) => templates.push(doc.data() as Template)))
        .catch((error) => console.error('Error getting templates: ', error));
    }
    return templates;
  }

  async createBulletinOnTemplate(bulletin: Bulletin, userId: string, orgId: string, organization: Organization) {
    const bulletinDefault: Bulletin = {
      sandboxMode: process.env.REACT_APP_PROJECT_ID !== 'innbyggerkontakt',
      kommunenummer: (organization.type === 'kommune' && organization.municipalityNumber.toString()) || undefined,
      ...bulletin,
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const bulletinAny: any = bulletinDefault;
    const organizationId = orgId;
    const todayDate = new Date().toString();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const removeEmpty = (obj: any) => {
      Object.keys(obj).forEach((key) => {
        if (obj[key] && typeof obj[key] === 'object') removeEmpty(obj[key]);
        else if (obj[key] === undefined || obj[key] === '') delete obj[key];
      });
      return obj;
    };

    const verifiedBulletin = removeEmpty(bulletinAny);
    const updatedBulletin = {
      ...verifiedBulletin,
      userId,
      lastChangedBy: 'client',
      lastChanged: todayDate,
    };
    const path = this.db
      .collection('organization')
      .doc(organizationId)
      .collection('bulletin')
      .doc(bulletin.status)
      .collection(bulletin.status === 'active' ? bulletin.channel.type : 'default');

    const docRef = await path.add(updatedBulletin);
    return docRef.id;
  }

  async getBulletinsBasedOnTemplate(templateId: string, organizationId: string) {
    const bulletins = await this.getAllBulletinsFromOrganization(organizationId);

    if (!bulletins) return [];

    const bulletinsBasedOnTemplate: Bulletin[] = [];

    bulletins.forEach((snapshot) => {
      snapshot?.forEach((doc) => {
        const data = doc.data() as Bulletin;
        if (data.basedOn?.id === templateId) {
          bulletinsBasedOnTemplate.push(data);
        }
      });
    });
    return bulletinsBasedOnTemplate;
  }
}

export default DbAccess;
