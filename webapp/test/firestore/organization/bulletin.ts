import {
  createAuthUser,
  getFirestoreAdminClient,
  getFirestoreClient,
  getFirestoreClientWithAuth,
  PROJECT_ID,
} from '../utils';
import { assertFails, assertSucceeds, clearFirestoreData } from '@firebase/rules-unit-testing';
import { firestore } from 'firebase-admin';
import { v4 } from 'uuid';
import Timestamp = firestore.Timestamp;
import UpdateData = firestore.UpdateData;

const myUser = { rolle: 'bruker', orgId: 'lillevik' };
const myUserAuth = createAuthUser({ uid: 'test', email: 'test@example.no' });
const anotherUser = { rolle: 'bruker', orgId: 'ikke_lillevik' };
const anotherUserAuth = createAuthUser({ uid: 'another_user', email: 'another@example.com' });

const testkommune = 'lillevik';
const myMunicipality = {
  name: testkommune,
  support: {
    allowExternalSupportUntil: Timestamp.fromMillis(0),
    allowExternalSupport: false,
  },
};

describe('bulletin test', () => {
  before(async () => {
    await clearFirestoreData({ projectId: PROJECT_ID });
  });

  beforeEach(async () => {
    const firestoreAdmin = getFirestoreAdminClient();

    const org = firestoreAdmin.collection('organization').doc(testkommune);
    await org.set(myMunicipality, { merge: true });
    const bulletinCollection = org.collection('bulletin');
    await bulletinCollection.doc(v4().toString()).set({ status: 'active' }, { merge: true });
    await bulletinCollection.doc(v4().toString()).set({ status: 'draft' }, { merge: true });
    await bulletinCollection.doc(v4().toString()).set({ status: 'finished' }, { merge: true });

    const activeDoc = bulletinCollection.doc('active');
    await activeDoc
      .collection('search')
      .doc(v4().toString())
      .set({ status: 'active', type: 'search' }, { merge: true });
    await activeDoc.collection('event').doc(v4().toString()).set({ status: 'active', type: 'event' }, { merge: true });

    const draftDoc = bulletinCollection.doc('draft');
    await draftDoc.collection('default').doc(v4().toString()).set({ status: 'draft', type: 'search' }, { merge: true });

    const finishedDoc = bulletinCollection.doc('finished');
    await finishedDoc
      .collection('default')
      .doc(v4().toString())
      .set({ status: 'finished', type: 'search' }, { merge: true });

    const orgUsersCollection = org.collection('users');
    await orgUsersCollection.doc('test').set(myUser, { merge: true });

    await firestoreAdmin.collection('users').doc('test').set(myUser, { merge: true });
    await firestoreAdmin.collection('users').doc('another_user').set(anotherUser, { merge: true });
  });

  it('an anonymous user should not be able to read bulletins', async () => {
    const firestore = getFirestoreClient();

    const docToGet = firestore.collection('organization').doc(testkommune);
    await assertFails(docToGet.collection('bulletin').where('status', '==', 'finished').get());
  });

  it('an anonymous user should not be able to write bulletins', async () => {
    const firestore = getFirestoreClient();

    const collectionToWrite = firestore.collection('organization').doc(testkommune).collection('bulletin');
    await assertFails(collectionToWrite.doc(v4()).set({ status: 'draft', author: 'test' }, { merge: true }));
  });

  it('a user in the organization should be able to read bulletins', async () => {
    const firestore = getFirestoreClientWithAuth(myUserAuth);

    const docToGet = firestore.collection('organization').doc(testkommune);
    await assertSucceeds(docToGet.collection('bulletin').where('status', '==', 'finished').get());
  });

  it('a user in the organization should be able to write bulletins', async () => {
    const firestore = getFirestoreClientWithAuth(myUserAuth);

    const collectionToWrite = firestore.collection('organization').doc(testkommune).collection('bulletin');
    await assertSucceeds(collectionToWrite.doc(v4()).set({ status: 'draft', author: 'test' }, { merge: true }));
  });

  it('a user outside the organization should not be able to read bulletins', async () => {
    const firestore = getFirestoreClientWithAuth(anotherUserAuth);

    const docToGet = firestore.collection('organization').doc(testkommune);
    await assertFails(docToGet.collection('bulletin').where('status', '==', 'finished').get());
  });

  it('a user outside the organization should not be able to write bulletins', async () => {
    const firestore = getFirestoreClientWithAuth(anotherUserAuth);

    const collectionToWrite = firestore.collection('organization').doc(testkommune).collection('bulletin');
    await assertFails(collectionToWrite.doc(v4()).set({ status: 'draft', author: 'test' }, { merge: true }));
  });

  it('a user with the role "support" should be able to read bulletins', async () => {
    const firestoreAdmin = getFirestoreAdminClient();
    await firestoreAdmin.collection('users').doc('another_user').update({ rolle: 'support' });

    const firestore = getFirestoreClientWithAuth(anotherUserAuth);
    const docToGet = firestore.collection('organization').doc(testkommune);

    await assertSucceeds(docToGet.collection('bulletin').where('status', '==', 'finished').get());
  });

  it('a user with the role "support" should be able to write bulletins if support is allowed and within time', async () => {
    const firestoreAdmin = getFirestoreAdminClient();
    await firestoreAdmin.collection('users').doc('another_user').update({ rolle: 'support' });
    await firestoreAdmin
      .collection('organization')
      .doc(testkommune)
      .update({
        support: {
          allowExternalSupport: true,
          allowExternalSupportUntil: Timestamp.fromDate(new Date(2099, 0, 1)),
        },
      });

    const firestore = getFirestoreClientWithAuth(anotherUserAuth);

    const collectionToWrite = firestore.collection('organization').doc(testkommune).collection('bulletin');
    await assertSucceeds(
      collectionToWrite.doc(v4().toString()).set({ status: 'draft', author: 'test' }, { merge: true }),
    );
  });

  it('a user with the role "support" should not be able to write bulletins if support is not allowed', async () => {
    const firestoreAdmin = getFirestoreAdminClient();
    await firestoreAdmin.collection('users').doc('another_user').update({ rolle: 'support' });

    const firestore = getFirestoreClientWithAuth(anotherUserAuth);

    const collectionToWrite = firestore.collection('organization').doc(testkommune).collection('bulletin');
    await assertFails(collectionToWrite.doc(v4().toString()).set({ status: 'draft', author: 'test' }, { merge: true }));
  });

  it('a user with the role "support" should not be able to write bulletins if support timer is expired', async () => {
    const firestoreAdmin = getFirestoreAdminClient();
    await firestoreAdmin.collection('users').doc('another_user').update({ rolle: 'support' });
    await firestoreAdmin
      .collection('organization')
      .doc(testkommune)
      .update({
        support: {
          allowExternalSupport: true,
          allowExternalSupportUntil: Timestamp.fromDate(new Date(2020, 0, 1)),
        },
      });

    const firestore = getFirestoreClientWithAuth(anotherUserAuth);

    const collectionToWrite = firestore.collection('organization').doc(testkommune).collection('bulletin');
    await assertFails(collectionToWrite.doc(v4()).set({ status: 'draft', author: 'test' }, { merge: true }));
  });

  it('a user with the role "superadmin" should be able to read bulletins', async () => {
    const firestoreAdmin = getFirestoreAdminClient();
    await firestoreAdmin.collection('users').doc('another_user').update({ rolle: 'superadmin' });

    const firestore = getFirestoreClientWithAuth(anotherUserAuth);
    const docToGet = firestore.collection('organization').doc(testkommune);

    await assertSucceeds(docToGet.collection('bulletin').where('status', '==', 'finished').get());
  });

  it('a user with the role "superadmin" should be able to write bulletins', async () => {
    const firestoreAdmin = getFirestoreAdminClient();
    await firestoreAdmin.collection('users').doc('another_user').update({ rolle: 'superadmin' });

    const firestore = getFirestoreClientWithAuth(anotherUserAuth);

    const collectionToWrite = firestore.collection('organization').doc(testkommune).collection('bulletin');
    await assertSucceeds(collectionToWrite.doc(v4()).set({ status: 'draft', author: 'test' }, { merge: true }));
  });

  it('a user should not be able to change a protected document', async () => {
    const firestore = getFirestoreClientWithAuth(myUserAuth);

    const collectionToWrite = firestore.collection('organization').doc(testkommune).collection('bulletin');
    await assertFails(collectionToWrite.doc('active').update({ status: 'draft', author: 'test' }));
  });

  const bulletinDocumentWriteTests = [
    {
      args: { auth: myUserAuth, org: testkommune, bulletinDoc: 'active', bulletinCollection: 'event' },
    },
    {
      args: { auth: myUserAuth, org: testkommune, bulletinDoc: 'active', bulletinCollection: 'search' },
    },
    {
      args: { auth: myUserAuth, org: testkommune, bulletinDoc: 'draft', bulletinCollection: 'default' },
    },
    {
      args: { auth: myUserAuth, org: testkommune, bulletinDoc: 'finished', bulletinCollection: 'default' },
    },
    {
      args: { auth: anotherUserAuth, org: testkommune, bulletinDoc: 'active', bulletinCollection: 'event' },
      mutate: {
        users: [{ uid: 'another_user', data: { rolle: 'support' } }],
        org: {
          support: { allowExternalSupport: true, allowExternalSupportUntil: Timestamp.fromDate(new Date(2099, 0, 1)) },
        },
      },
      prefixDescription: ' with the role "support"',
      postfixDescription: ' when support is allowed',
    },
    {
      args: { auth: anotherUserAuth, org: testkommune, bulletinDoc: 'active', bulletinCollection: 'search' },
      mutate: {
        users: [{ uid: 'another_user', data: { rolle: 'support' } }],
        org: {
          support: { allowExternalSupport: true, allowExternalSupportUntil: Timestamp.fromDate(new Date(2099, 0, 1)) },
        },
      },
      prefixDescription: ' with the role "support"',
      postfixDescription: ' when support is allowed',
    },
    {
      args: { auth: anotherUserAuth, org: testkommune, bulletinDoc: 'draft', bulletinCollection: 'default' },
      mutate: {
        users: [{ uid: 'another_user', data: { rolle: 'support' } }],
        org: {
          support: { allowExternalSupport: true, allowExternalSupportUntil: Timestamp.fromDate(new Date(2099, 0, 1)) },
        },
      },
      prefixDescription: ' with the role "support"',
      postfixDescription: ' when support is allowed',
    },
    {
      args: { auth: anotherUserAuth, org: testkommune, bulletinDoc: 'finished', bulletinCollection: 'default' },
      mutate: {
        users: [{ uid: 'another_user', data: { rolle: 'support' } }],
        org: {
          support: { allowExternalSupport: true, allowExternalSupportUntil: Timestamp.fromDate(new Date(2099, 0, 1)) },
        },
      },
      prefixDescription: ' with the role "support"',
      postfixDescription: ' when support is allowed',
    },
    {
      args: { auth: anotherUserAuth, org: testkommune, bulletinDoc: 'active', bulletinCollection: 'event' },
      mutate: { users: [{ uid: 'another_user', data: { rolle: 'superadmin' } }] },
      prefixDescription: ' with the role "superadmin"',
    },
    {
      args: { auth: anotherUserAuth, org: testkommune, bulletinDoc: 'active', bulletinCollection: 'search' },
      mutate: { users: [{ uid: 'another_user', data: { rolle: 'superadmin' } }] },
      prefixDescription: ' with the role "superadmin"',
    },
    {
      args: { auth: anotherUserAuth, org: testkommune, bulletinDoc: 'draft', bulletinCollection: 'default' },
      mutate: { users: [{ uid: 'another_user', data: { rolle: 'superadmin' } }] },
      prefixDescription: ' with the role "superadmin"',
    },
    {
      args: { auth: anotherUserAuth, org: testkommune, bulletinDoc: 'finished', bulletinCollection: 'default' },
      mutate: { users: [{ uid: 'another_user', data: { rolle: 'superadmin' } }] },
      prefixDescription: ' with the role "superadmin"',
    },
  ];
  // TODO change org to list of MutationDatav
  interface Mutation {
    users?: MutationData[];
    org?: UpdateData<any>;
  }

  interface MutationData {
    uid: string;
    data: UpdateData<any>;
  }

  // TODO move this to the utils file
  const mutateFirestoreData = async (mutation: Partial<Mutation>) => {
    const firestoreAdmin = getFirestoreAdminClient();
    if (mutation.org) {
      await firestoreAdmin
        .collection('organization')
        .doc(testkommune)
        .update({ ...mutation.org });
    }
    if (mutation.users && mutation.users.length > 0) {
      for (const { uid, data } of mutation.users) {
        await firestoreAdmin.collection('users').doc(uid).update(data);
      }
    }
  };

  bulletinDocumentWriteTests.forEach(
    ({ prefixDescription, postfixDescription, args: { auth, org, bulletinDoc, bulletinCollection }, mutate }) => {
      it(`a user${
        prefixDescription || ''
      } should be able to write a bulletin in the the "${bulletinDoc}" documents "${bulletinCollection}"-collection${
        postfixDescription || ''
      }`, async () => {
        if (mutate) {
          // Apply mutations to firestore data
          await mutateFirestoreData(mutate);
        }

        //Initialize tests
        const firestore = getFirestoreClientWithAuth(auth);

        const collectionToWrite = firestore
          .collection('organization')
          .doc(org)
          .collection('bulletin')
          .doc(bulletinDoc)
          .collection(bulletinCollection);

        await assertSucceeds(
          collectionToWrite.doc(v4().toString()).set({ status: 'draft', author: 'test' }, { merge: true }),
        );
      });
    },
  );

  const bulletinDocumentReadTests = [
    {
      args: { auth: myUserAuth, org: testkommune, bulletinDoc: 'active', bulletinCollection: 'event' },
    },
    {
      args: { auth: myUserAuth, org: testkommune, bulletinDoc: 'active', bulletinCollection: 'search' },
    },
    {
      args: { auth: myUserAuth, org: testkommune, bulletinDoc: 'draft', bulletinCollection: 'default' },
    },
    {
      args: { auth: myUserAuth, org: testkommune, bulletinDoc: 'finished', bulletinCollection: 'default' },
    },
    {
      args: { auth: anotherUserAuth, org: testkommune, bulletinDoc: 'active', bulletinCollection: 'event' },
      mutate: { users: [{ uid: 'another_user', data: { rolle: 'support' } }] },
      prefixDescription: ' with the role "support"',
      postfixDescription: '',
    },
    {
      args: { auth: anotherUserAuth, org: testkommune, bulletinDoc: 'active', bulletinCollection: 'search' },
      mutate: { users: [{ uid: 'another_user', data: { rolle: 'support' } }] },
      prefixDescription: ' with the role "support"',
    },
    {
      args: { auth: anotherUserAuth, org: testkommune, bulletinDoc: 'draft', bulletinCollection: 'default' },
      mutate: { users: [{ uid: 'another_user', data: { rolle: 'support' } }] },
      prefixDescription: ' with the role "support"',
    },
    {
      args: { auth: anotherUserAuth, org: testkommune, bulletinDoc: 'finished', bulletinCollection: 'default' },
      mutate: { users: [{ uid: 'another_user', data: { rolle: 'support' } }] },
      prefixDescription: ' with the role "support"',
    },
    {
      args: { auth: anotherUserAuth, org: testkommune, bulletinDoc: 'active', bulletinCollection: 'event' },
      mutate: { users: [{ uid: 'another_user', data: { rolle: 'superadmin' } }] },
      prefixDescription: ' with the role "superadmin"',
    },
    {
      args: { auth: anotherUserAuth, org: testkommune, bulletinDoc: 'active', bulletinCollection: 'search' },
      mutate: { users: [{ uid: 'another_user', data: { rolle: 'superadmin' } }] },
      prefixDescription: ' with the role "superadmin"',
    },
    {
      args: { auth: anotherUserAuth, org: testkommune, bulletinDoc: 'draft', bulletinCollection: 'default' },
      mutate: { users: [{ uid: 'another_user', data: { rolle: 'superadmin' } }] },
      prefixDescription: ' with the role "superadmin"',
    },
    {
      args: { auth: anotherUserAuth, org: testkommune, bulletinDoc: 'finished', bulletinCollection: 'default' },
      mutate: { users: [{ uid: 'another_user', data: { rolle: 'superadmin' } }] },
      prefixDescription: ' with the role "superadmin"',
    },
  ];

  bulletinDocumentReadTests.forEach(
    ({ prefixDescription, postfixDescription, args: { auth, org, bulletinDoc, bulletinCollection }, mutate }) => {
      it(`a user${
        prefixDescription || ''
      } should be able to read a bulletin in the the "${bulletinDoc}" documents "${bulletinCollection}"-collection${
        postfixDescription || ''
      }`, async () => {
        if (mutate) {
          // Apply mutations to firestore data
          await mutateFirestoreData(mutate);
        }

        //Initialize tests
        const firestore = getFirestoreClientWithAuth(auth);

        const collectionToRead = firestore
          .collection('organization')
          .doc(org)
          .collection('bulletin')
          .doc(bulletinDoc)
          .collection(bulletinCollection);

        await assertSucceeds(collectionToRead.where('status', '==', bulletinDoc).get());
      });
    },
  );
});
