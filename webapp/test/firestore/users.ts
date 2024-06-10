import {
  createAuthUser,
  getFirestoreAdminClient,
  getFirestoreClient,
  getFirestoreClientWithAuth,
  PROJECT_ID,
} from './utils';
import { assertFails, assertSucceeds, clearFirestoreData } from '@firebase/rules-unit-testing';

const myUser = { rolle: 'bruker', orgId: 'lillevik' };
const myUserAuth = createAuthUser({ uid: 'test', email: 'test@example.no' });

const anotherUser = { rolle: 'bruker', orgId: 'ikke_lillevik' };
const anotherUserAuth = createAuthUser({ uid: 'another_user', email: 'another@example.no' });

const myEditor = { rolle: 'editor', orgId: 'kf' };
const myEditorAuth = createAuthUser({ uid: 'testEditor', email: 'testEditor@example.no' });

describe('users test', () => {
  before(async () => {
    await clearFirestoreData({ projectId: PROJECT_ID });
  });

  beforeEach(async () => {
    const firestoreAdmin = getFirestoreAdminClient();

    await firestoreAdmin.collection('users').doc('test').set(myUser, { merge: true });
    await firestoreAdmin.collection('users').doc('another_user').set(anotherUser, { merge: true });
    await firestoreAdmin.collection('users').doc('testEditor').set(myEditor, { merge: true });
    await firestoreAdmin
      .collection('organization')
      .doc('kf')
      .collection('users')
      .doc('testEditor')
      .set({ rolle: 'editor' });

    await firestoreAdmin.collection('users').doc('nKOA1TjHP5OCB93YUXGyaoS8Nnb2').set({ rolle: 'editor', orgId: 'kf' });
    await firestoreAdmin
      .collection('organization')
      .doc('kf')
      .collection('users')
      .doc('nKOA1TjHP5OCB93YUXGyaoS8Nnb2')
      .set({ rolle: 'editor' });
    await firestoreAdmin.collection('organization').doc('kf').set({ navn: 'kf' });

    // Creating template organizations
    await firestoreAdmin
      .collection('templates')
      .doc('test1')
      .set({ type: 'draft', contentArray: [], orgId: 'kf', tags: [], name: '' });
    await firestoreAdmin
      .collection('templates')
      .doc('test2')
      .set({ type: 'published', contentArray: [], orgId: 'kf', tags: [], name: '' });
    await firestoreAdmin
      .collection('templates')
      .doc('test3')
      .set({ type: 'archived', contentArray: [], orgId: 'kf', tags: [], name: '' });
    await firestoreAdmin
      .collection('templates')
      .doc('test4')
      .set({ type: 'draft', contentArray: [], orgId: 'lillevik', tags: [], name: '' });
    await firestoreAdmin
      .collection('templates')
      .doc('test5')
      .set({ type: 'published', contentArray: [], orgId: 'lillevik', tags: [], name: '' });
    await firestoreAdmin
      .collection('templates')
      .doc('test6')
      .set({ type: 'archived', contentArray: [], orgId: 'lillevik', tags: [], name: '' });
  });

  it('should allow reads to users if user is signed in', async () => {
    const firestore = getFirestoreClientWithAuth(myUserAuth);

    const docToGet = firestore.collection('users').doc('test');
    await assertSucceeds(docToGet.get());
  });

  it('should prevent reads to users if user is not signed in', async () => {
    const firestore = getFirestoreClient();

    const docToGet = firestore.collection('users').doc('test');
    await assertFails(docToGet.get());
  });

  it('a user should be able to read itself ', async () => {
    const firestore = getFirestoreClientWithAuth(myUserAuth);

    const docToGet = firestore.collection('users').doc('test');
    await assertSucceeds(docToGet.get());
  });

  it('a user should not be able to read another user', async () => {
    const firestore = getFirestoreClientWithAuth(myUserAuth);

    const docToGet = firestore.collection('users').doc('another_user');
    await assertFails(docToGet.get());
  });

  it('a user should be able to read another user if it has the role support', async () => {
    const firestoreAdmin = getFirestoreAdminClient();
    await firestoreAdmin.collection('users').doc('test').update({ rolle: 'support' });

    const firestore = getFirestoreClientWithAuth(myUserAuth);

    const docToGet = firestore.collection('users').doc('another_user');
    await assertSucceeds(docToGet.get());
  });

  it('a user should not be able to change another user if it has the support role', async () => {
    const firestoreAdmin = getFirestoreAdminClient();
    await firestoreAdmin.collection('users').doc('test').update({ rolle: 'support' });

    const firestore = getFirestoreClientWithAuth(myUserAuth);

    const docToGet = firestore.collection('users').doc('another_user');
    await assertFails(docToGet.update({ orgId: 'noe' }));
  });

  it('a user should be able to read anoother user if it has the superadmin role', async () => {
    const firestoreAdmin = getFirestoreAdminClient();
    await firestoreAdmin.collection('users').doc('test').update({ rolle: 'superadmin' });

    const firestore = getFirestoreClientWithAuth(myUserAuth);

    const docToGet = firestore.collection('users').doc('another_user');
    await assertSucceeds(docToGet.get());
  });

  it('a user should be able to change another user if it has the superadmin role', async () => {
    const firestoreAdmin = getFirestoreAdminClient();
    await firestoreAdmin.collection('users').doc('test').update({ rolle: 'superadmin' });

    const firestore = getFirestoreClientWithAuth(myUserAuth);

    const docToGet = firestore.collection('users').doc('another_user');
    await assertSucceeds(docToGet.get());
  });

  it('a user from an organization should be able to add another user to their organization', async () => {
    const firestoreAdmin = getFirestoreAdminClient();
    await firestoreAdmin
      .collection('organization')
      .doc(myUser.orgId)
      .collection('users')
      .doc('test')
      .set({ rolle: 'admin' }, { merge: true });

    const firestore = getFirestoreClientWithAuth(myUserAuth);
    const userCollection = firestore.collection('users');

    await assertSucceeds(userCollection.doc('new_user').set({ rolle: 'bruker', orgId: myUser.orgId }, { merge: true }));
  });

  it('a user from one organization should not be able to add a user to a different organization', async () => {
    const firestoreAdmin = getFirestoreAdminClient();
    await firestoreAdmin
      .collection('organization')
      .doc(anotherUser.orgId)
      .collection('users')
      .doc('another_user')
      .set({ rolle: 'admin' }, { merge: true });

    const firestore = getFirestoreClientWithAuth(anotherUserAuth);
    const userCollection = firestore.collection('users');
    await assertFails(userCollection.doc('new_user').set({ rolle: 'bruker', orgId: myUser.orgId }, { merge: true }));
  });

  it('Editor can create a template', async () => {
    const firestore = getFirestoreClientWithAuth(myEditorAuth);

    const templateCollection = firestore.collection('templates');
    await assertSucceeds(
      templateCollection.doc('testTemplate').set({ type: 'draft', contentArray: [], orgId: 'kf', tags: [], name: '' }),
    );
  });

  it('Editor can update a template', async () => {
    const firestore = getFirestoreClientWithAuth(myEditorAuth);

    const templateCollection = firestore.collection('templates');
    await assertSucceeds(templateCollection.doc('testTemplate').update({ type: 'published' }));
  });

  it('Editor can not create a template for another organization', async () => {
    const firestore = getFirestoreClientWithAuth(myEditorAuth);

    const templateCollection = firestore.collection('templates');
    await assertFails(
      templateCollection
        .doc('testTemplate2')
        .set({ type: 'draft', contentArray: [], orgId: 'lillevik', tags: [], name: '' }),
    );
  });

  it('Editor can not update a template from another organization', async () => {
    const firestore = getFirestoreClientWithAuth(myEditorAuth);

    const templateCollection = firestore.collection('templates');
    await assertFails(templateCollection.doc('test4').update({ type: 'published' }));
  });

  it('User can not create template', async () => {
    const firestore = getFirestoreClientWithAuth(myUserAuth);

    const templateCollection = firestore.collection('templates');
    await assertFails(
      templateCollection
        .doc('testTemplate3')
        .set({ type: 'draft', contentArray: [], orgId: 'lillevik', tags: [], name: '' }),
    );
  });

  it('A user can read published template', async () => {
    const firestore = getFirestoreClientWithAuth(myUserAuth);

    const docToGet = firestore.collection('templates').doc('test2');
    await assertSucceeds(docToGet.get());
  });

  it('A user can not read draft templates', async () => {
    const firestore = getFirestoreClientWithAuth(myUserAuth);

    const docToGet = firestore.collection('templates').doc('test4');
    await assertFails(docToGet.get());
  });

  it('Editor can delete a template', async () => {
    const firestore = getFirestoreClientWithAuth(myEditorAuth);

    const docRef = firestore.collection('templates').doc('testTemplate');
    await assertSucceeds(docRef.delete());
  });

  it('A editor can read draft templates', async () => {
    const firestore = getFirestoreClientWithAuth(myEditorAuth);

    const docToGet = firestore.collection('templates').doc('test1');
    await assertSucceeds(docToGet.get());
  });

  it('A editor can not read draft templates from another organizations', async () => {
    const firestore = getFirestoreClientWithAuth(myEditorAuth);

    const docToGet = firestore.collection('templates').doc('test4');
    await assertFails(docToGet.get());
  });

  it('A user can query published templates', async () => {
    const firestore = getFirestoreClientWithAuth(myUserAuth);

    const docToGet = firestore.collection('templates').where('type', '==', 'published');
    await assertSucceeds(docToGet.get());
  });

  it('A user can not query all templates', async () => {
    const firestore = getFirestoreClientWithAuth(myUserAuth);

    const docToGet = firestore.collection('templates').where('type', 'in', ['draft', 'archived']);
    await assertFails(docToGet.get());
  });

  it('A editor can query all templates in their organization', async () => {
    const firestore = getFirestoreClientWithAuth(myEditorAuth);

    const docToGet = firestore.collection('templates').where('orgId', '==', 'kf');
    await assertSucceeds(docToGet.get());
  });

  it('A editor can not query templates not in their organization', async () => {
    const firestore = getFirestoreClientWithAuth(myEditorAuth);

    const docToGet = firestore.collection('templates').where('orgId', '!=', 'kf');
    await assertFails(docToGet.get());
  });
});
