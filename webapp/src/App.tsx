import { BrowserRouter } from 'react-router-dom';
import { PopupModal } from './components';
import Routing from './routes/router';

import './app.scss';

function App() {
  return (
    <>
      <BrowserRouter>
        <Routing />
      </BrowserRouter>
      <PopupModal />
    </>
  );
}

export default App;
