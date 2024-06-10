import { assertSucceeds, assertFails, clearFirestoreData, loadFirestoreRules } from '@firebase/rules-unit-testing';
import { createAuthUser, getFirestoreAdminClient, getFirestoreClientWithAuth, PROJECT_ID } from './utils';
import { firestore } from 'firebase-admin';
import Timestamp = firestore.Timestamp;

const myAuth = createAuthUser({ uid: 'test', email: 'test@example.no' });
const myUser = { rolle: 'bruker', orgId: 'lillevik' };
const testkommune = 'lillevik';
const myMunicipality = {
  name: testkommune,
  support: {
    allowExternalSupportUntil: Timestamp.fromMillis(0),
    allowExternalSupport: false,
  },
};

describe('organization tests', () => {
  before(async () => {
    await clearFirestoreData({ projectId: PROJECT_ID });
  });

  beforeEach(async () => {
    const firestoreAdmin = getFirestoreAdminClient();

    await firestoreAdmin.collection('organization').doc(testkommune).set(myMunicipality, { merge: true });

    await firestoreAdmin.collection('users').doc('test').set(myUser, { merge: true });
  });

  it('should allow reads if organization user is signed in', async () => {
    const firestore = getFirestoreClientWithAuth(myAuth);

    const docToGet = firestore.collection('organization').doc(testkommune);
    await assertSucceeds(docToGet.get());
  });

  it('should allow reads if user is support and allowed access', async () => {
    const firestoreAdmin = getFirestoreAdminClient();
    await firestoreAdmin
      .collection('users')
      .doc('test')
      .set({ ...myUser, rolle: 'support', orgId: 'admin' }, { merge: true });

    await firestoreAdmin
      .collection('organization')
      .doc(testkommune)
      .update({
        support: {
          allowExternalSupport: true,
          allowExternalSupportUntil: Timestamp.fromDate(new Date(2099, 0, 1)),
        },
      });

    const firestore = getFirestoreClientWithAuth(myAuth);

    const docToGet = firestore.collection('organization').doc(testkommune);
    await assertSucceeds(docToGet.get());
  });

  it('should prevent reads if user is support and not allowed access', async () => {
    const firestoreAdmin = getFirestoreAdminClient();
    await firestoreAdmin.collection('users').doc('test').update({ rolle: 'support', orgId: 'admin' });

    await firestoreAdmin
      .collection('organization')
      .doc(testkommune)
      .update({
        support: {
          allowExternalSupport: false,
          allowExternalSupportUntil: Timestamp.fromDate(new Date(2099, 0, 1)),
        },
      });

    const firestore = getFirestoreClientWithAuth(myAuth);

    const docToGet = firestore.collection('organization').doc(testkommune);
    await assertFails(docToGet.get());
  });

  it('should prevent reads if user is support and time has expired', async () => {
    const firestoreAdmin = getFirestoreAdminClient();
    await firestoreAdmin.collection('users').doc('test').update({ rolle: 'support', orgId: 'admin' });

    await firestoreAdmin
      .collection('organization')
      .doc(testkommune)
      .update({
        support: {
          allowExternalSupport: true,
          allowExternalSupportUntil: Timestamp.fromDate(new Date(2020, 0, 1)),
        },
      });

    const firestore = getFirestoreClientWithAuth(myAuth);

    const docToGet = firestore.collection('organization').doc(testkommune);
    await assertFails(docToGet.get());
  });

  it('should allow reads if user has role superadmin', async () => {
    const firestoreAdmin = getFirestoreAdminClient();
    await firestoreAdmin.collection('users').doc('test').update({ rolle: 'superadmin', orgId: 'admin' });

    const firestore = getFirestoreClientWithAuth(myAuth);

    const docToGet = firestore.collection('organization').doc(testkommune);
    await assertSucceeds(docToGet.get());
  });
});
