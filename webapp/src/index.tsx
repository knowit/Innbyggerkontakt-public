import { createRoot } from 'react-dom/client';
import App from './App';
import { StoreProvider } from './contexts';
import { UserProvider } from './hooks/useUser';
import { PopUpStoreProvider } from './contexts/PopUpStore/PopUpStore';
import { FirebaseProvider } from './utils/Firebase';
import StyledEngineProvider from '@mui/material/StyledEngineProvider';
import { MapProvider } from 'contexts/MapContext';

const container = document.getElementById('root');
// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const root = createRoot(container!);

root.render(
  <FirebaseProvider>
    <UserProvider>
      <MapProvider>
        <StoreProvider>
          <StyledEngineProvider injectFirst>
            <PopUpStoreProvider>
              <App />
            </PopUpStoreProvider>
          </StyledEngineProvider>
        </StoreProvider>
      </MapProvider>
    </UserProvider>
  </FirebaseProvider>,
);
