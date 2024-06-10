import { initializeTestApp, initializeAdminApp } from '@firebase/rules-unit-testing';
import { TokenOptions } from '@firebase/rules-unit-testing/dist/src/api';

export const PROJECT_ID = 'innbyggerkontakt-dev';

export const getFirestoreClient = () => {
  return getFirestoreClientWithAuth();
};

export const getFirestoreClientWithAuth = (auth?: TokenOptions) => {
  return initializeTestApp({ projectId: PROJECT_ID, auth: auth }).firestore();
};

export const getFirestoreAdminClient = () => {
  return initializeAdminApp({ projectId: PROJECT_ID }).firestore();
};

export const createAuthUser = (options?: Partial<TokenOptions>) => {
  return {
    ...options,
  };
};
