import { ReactNode, useState } from 'react';
import PopUpContext from './PopUpContext';

export const PopUpStoreProvider = ({ children }: { children: ReactNode }) => {
  const [popUpData, setPopUpData] = useState<ReactNode>(null);

  const clearPopUp = () => setPopUpData(null);

  return (
    <PopUpContext.Provider value={{ popUp: popUpData, setPopUp: setPopUpData, clearPopUp }}>
      {children}
    </PopUpContext.Provider>
  );
};
