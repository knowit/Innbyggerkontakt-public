import { FirebaseError } from '@firebase/util';
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import 'firebase/compat/storage';

const config = {
  apiKey: process.env.REACT_APP_API_KEY,
  authDomain: process.env.REACT_APP_AUTH_DOMAIN,
  databaseURL: process.env.REACT_APP_DATABASE_URL,
  projectId: process.env.REACT_APP_PROJECT_ID,
  storageBucket: process.env.REACT_APP_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_APP_ID,
  measurementId: process.env.REACT_APP_MEASUREMENT_ID,
};

const actionCodeSettings = {
  //Når passordet tilbakestilles får brukere mulighet til å gå tilbake til denne siden
  url: process.env.REACT_APP_APP_BASE_URL as string,
  handleCodeInApp: false,
};

/* Mirror the firebase.FirebaseError as it's not accessible */
class NoAuthenticatedUserError extends Error implements FirebaseError {
  readonly code: string;

  constructor(code: string, message: string) {
    super(message);
    this.code = code;
    this.message = 'FirebaseError';
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

class Firebase {
  auth: firebase.auth.Auth;
  user: firebase.User | null;
  db: firebase.firestore.Firestore | null;
  storage: firebase.storage.Storage;
  storageRef: firebase.storage.Reference;
  constructor() {
    firebase.initializeApp(config);
    this.auth = firebase.auth();
    this.user = this.getUser();
    this.db = firebase.firestore();
    this.storage = firebase.storage();
    this.storageRef = firebase.storage().ref();

    if (process.env.NODE_ENV === 'development' && process.env.REACT_APP_USE_EMULATOR == 'true') {
      this.db.useEmulator('0.0.0.0', 8080);
    }
  }

  newUser = (email: string, password: string) => {
    const returnVal = this.auth.createUserWithEmailAndPassword(email, password);
    this.isInitialized();

    return returnVal;
  };

  async signIn(email: string, password: string): Promise<firebase.auth.UserCredential> {
    await this.auth.setPersistence(firebase.auth.Auth.Persistence.SESSION).catch((error) => {
      alert(error.code + ', ' + error.message);
    });

    return this.auth.signInWithEmailAndPassword(email, password);
  }

  async reauthenticate(email: string, password: string): Promise<firebase.auth.UserCredential> {
    if (this.auth.currentUser) {
      return this.auth.currentUser.reauthenticateWithCredential(
        firebase.auth.EmailAuthProvider.credential(email, password),
      );
    }
    throw new NoAuthenticatedUserError('auth/user-not-found', 'The user is no longer signed in');
  }

  signOut = () => {
    return this.auth.signOut();
  };

  passwordReset = (email: string) => this.auth.sendPasswordResetEmail(email);

  passwordUpdate = (password: string) => this.auth.currentUser?.updatePassword(password);

  getIdToken = () => {
    return this.user?.getIdToken().catch((error) => {
      throw new Error(error);
    });
  };

  getUser = () => {
    this.isInitialized();
    return this.user;
  };

  isInitialized = () => {
    this.auth.onIdTokenChanged((user) => {
      if (user) {
        this.user = user;
      } else {
        this.user = null;
      }
      sessionStorage.setItem('user', JSON.stringify(this.user));
      return this.user;
    });
    return this.user;
  };

  updateDisplayName = (name: string) => {
    return this.user?.updateProfile({ displayName: name });
  };
}

export const createTemporaryApp = (app: string) => {
  return firebase.initializeApp(config, app);
};

export const sendPasswordResetEmail = (email: string) => {
  return firebase
    .auth()
    .sendPasswordResetEmail(email, actionCodeSettings)
    .catch((error) => {
      console.error(error);
      return error;
    });
};

/**
 * This stuff below here is for doing MFA-auths
 * with supporting methods and functions.
 * */

/* MFAVerifier abstracts the verfication and gives a functional method mental simplification */
export class MFAVerifier<
  T = firebase.auth.MultiFactorSession | firebase.auth.MultiFactorResolver,
  U = string | undefined,
> {
  verifier: (mfaRmfaSessionResolver: T, resolvedWith: U) => Promise<string>;

  /**
   *  verifier is the function we get back from either getVerificationId() or getEnrollmentVerificationId()
   *  this has either the function typing of:
   *
   *  ```typescript
   *  (mfaSessionResolver: firebase.auth.MultifactorResolver, resolvedWith: string|undefined) => Promise<String>
   *  ```
   *  or
   *  ```typescript
   *  (mfaSessionResolver: firebase.auth.MultifactorSession, resolvedWith: string) => Promise<String>
   *  ```
   *
   *  If you're enrolling a user, then use `getEnrollmentVerificationId()` when instantiating this class.
   *  If you're just doing the auth part, use `getVerificationId()` when instantiating this class.
   */
  constructor(verifier: (mfaSessionResolver: T, resolvedWith: U) => Promise<string>) {
    this.verifier = verifier;
  }

  async apply(mfaSessionResolver: T, resolvedWith: U) {
    return await this.verifier(mfaSessionResolver, resolvedWith);
  }
}

export const createPhoneInfoOptionsFromPhoneNumber = (
  session: firebase.auth.MultiFactorSession,
  phoneNumber: string,
): firebase.auth.PhoneMultiFactorEnrollInfoOptions => {
  return {
    session,
    phoneNumber,
  };
};

export const createPhoneInfoOptionsFromMfaResolver = (
  mfaResolver: firebase.auth.MultiFactorResolver,
  selectedHintUid?: string,
): firebase.auth.PhoneMultiFactorSignInInfoOptions => {
  return {
    session: mfaResolver.session,
    multiFactorHint: getMultifactorHint(mfaResolver, selectedHintUid),
  };
};

export const getMultifactorHint = (resolver: firebase.auth.MultiFactorResolver, selectedHintUid?: string) => {
  if (selectedHintUid) {
    return resolver.hints.find((value) => value.uid === selectedHintUid);
  }
  return resolver.hints.find((value) => value.factorId === firebase.auth.PhoneMultiFactorGenerator.FACTOR_ID);
};

export const createCaptchaWithOptions = (
  captchaContainerId: string,
  captchaOptions: Record<string, unknown> = { size: 'invisible' },
) => {
  return new firebase.auth.RecaptchaVerifier(captchaContainerId, captchaOptions);
};

export const getVerificationId =
  (captchaContainerId: string, captchaOptions: Record<string, unknown>) =>
  async (mfaResolver: firebase.auth.MultiFactorResolver, selectedHintUid: string | undefined) => {
    return await new firebase.auth.PhoneAuthProvider().verifyPhoneNumber(
      createPhoneInfoOptionsFromMfaResolver(mfaResolver, selectedHintUid),
      createCaptchaWithOptions(captchaContainerId, captchaOptions),
    );
  };

export const getEnrollmentVerificationId =
  (captchaContainerId: string, captchaOptions: Record<string, unknown>) =>
  async (session: firebase.auth.MultiFactorSession, phoneNumber: string) => {
    return await new firebase.auth.PhoneAuthProvider().verifyPhoneNumber(
      createPhoneInfoOptionsFromPhoneNumber(session, phoneNumber),
      createCaptchaWithOptions(captchaContainerId, captchaOptions),
    );
  };

export const createMultifactorAssertion = (
  verificationId: string,
  verificationCode: string,
): firebase.auth.PhoneMultiFactorAssertion => {
  const credential = firebase.auth.PhoneAuthProvider.credential(verificationId, verificationCode);
  return firebase.auth.PhoneMultiFactorGenerator.assertion(credential);
};

export const submitVerificationCode = async (
  mfaResolver: firebase.auth.MultiFactorResolver,
  verificationId: string,
  verificationCode: string,
) => {
  return await mfaResolver.resolveSignIn(createMultifactorAssertion(verificationId, verificationCode));
};

export default new Firebase();
