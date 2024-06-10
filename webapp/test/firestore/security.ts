import {
  createAuthUser,
  getFirestoreAdminClient,
  getFirestoreClient,
  getFirestoreClientWithAuth,
  PROJECT_ID,
} from './utils';
import { assertFails, clearFirestoreData } from '@firebase/rules-unit-testing';
import { v4 } from 'uuid';

const myUser = { rolle: 'bruker', orgId: 'lillevik' };
const myUserAuth = createAuthUser({ uid: 'test', email: 'test@example.no' });

describe('anonymous security test', () => {
  before(async () => {
    await clearFirestoreData({ projectId: PROJECT_ID });
  });

  beforeEach(async () => {
    const firestoreAdmin = getFirestoreAdminClient();

    await firestoreAdmin.collection('test').doc('test').set(myUser, { merge: true });
  });

  it('an anonymous user should not be able to read any collection or document', async () => {
    const firestore = getFirestoreClient();

    const docToGet = firestore.collection('users').doc('test');
    await assertFails(docToGet.get());
  });

  it('an anonymous user should not be be able to write to any collection or document', async () => {
    const firestore = getFirestoreClient();

    const docToChange = firestore.collection('test').doc('test');
    await assertFails(docToChange.update({ rolle: 'superadmin' }));
  });

  it('a user should not be able to create any random collection or document at root', async () => {
    const firestore = getFirestoreClientWithAuth(myUserAuth);

    await assertFails(firestore.collection(v4().toString()).add({ [v4().toString()]: 'test' }));
  });
});
