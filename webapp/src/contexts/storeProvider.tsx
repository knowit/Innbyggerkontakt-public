import { createContext, ReactNode } from 'react';
import Store from './store';

export const StoreContext = createContext(Store);

export const StoreProvider = ({ children }: { children: ReactNode }) => {
  return <StoreContext.Provider value={Store}>{children}</StoreContext.Provider>;
};
