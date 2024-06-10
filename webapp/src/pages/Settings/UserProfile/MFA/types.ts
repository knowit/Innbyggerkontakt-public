import firebase from 'firebase/compat/app';

export interface MFAPropTypes {
  onError: firebase.ErrorFn<firebase.FirebaseError | firebase.auth.Error>;
}

export interface MFAEnrollmentState {
  phonenumberValid: boolean;
  phonenumber: string;
  mfaVerificationId: string;
  mfaCode: string;
  mfaEnabled: boolean;
}
