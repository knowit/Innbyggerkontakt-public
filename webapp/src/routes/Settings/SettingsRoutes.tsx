import CreateStyle from 'pages/Settings/Styles/CreateStyle';
import PasswordChange from 'pages/Settings/UserProfile/PasswordChange/PasswordChange';
import { Navigate, Route, Routes } from 'react-router-dom';
import Invite from '../../molecules/Settings/Invite';
import Users from '../../organisms/Settings/Users';
import General from '../../pages/Settings/General';
import Styles from '../../pages/Settings/Styles/Styles';
import ChangeUser from '../../pages/Settings/UserProfile/ChangeUser';
import MultifactorAuthentication from '../../pages/Settings/UserProfile/MFA/MultifactorAuthentication';

const SettingsRoutes = () => {
  return (
    <Routes>
      <Route path="*" element={<Navigate to="generelt" replace />} />
      <Route path="generelt" element={<General />} />
      <Route path="stiler" element={<Styles />} />
      <Route path="brukere" element={<Users />} />
      <Route path="ny-stil" key="ny_stil" element={<CreateStyle />} />
      <Route path="stiler/:id" key="endre_stil" element={<CreateStyle />} />
      <Route path="endre-passord" element={<PasswordChange />} />
      <Route path="endre-bruker" element={<ChangeUser />} />
      <Route path="endre-bruker/:id" element={<ChangeUser />} />
      <Route path="ny-bruker" element={<Invite />} />
      <Route path="mfa" element={<MultifactorAuthentication />} />
    </Routes>
  );
};

export default SettingsRoutes;
