import { createContext, ReactNode } from 'react';
import Firebase from './firebase';

export const FirebaseContext = createContext(Firebase);

export const FirebaseProvider = ({ children }: { children: ReactNode }) => {
  return <FirebaseContext.Provider value={Firebase}>{children}</FirebaseContext.Provider>;
};
