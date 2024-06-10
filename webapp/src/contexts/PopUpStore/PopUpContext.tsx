import { createContext, ReactNode } from 'react';

interface PopUpContextType {
  popUp?: ReactNode;
  setPopUp: (popUp: ReactNode) => void;
  clearPopUp: () => void;
}

export const initialState: PopUpContextType = { setPopUp: (e) => e, clearPopUp: () => null };

export const PopUpContext = createContext(initialState);

export default PopUpContext;
