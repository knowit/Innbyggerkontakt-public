import { Navigate, Route, Routes } from 'react-router-dom';
import Users from '../../organisms/Settings/Users';
import ChangeUser from '../../pages/Settings/UserProfile/ChangeUser';
import PasswordChange from '../../pages/Settings/UserProfile/PasswordChange/PasswordChange';

import MultifactorAuthentication from '../../pages/Settings/UserProfile/MFA/MultifactorAuthentication';

const EditorSettingsRoutes = () => {
  return (
    <Routes>
      <Route path="brukere" element={<Users />} />
      <Route path="endre-passord" element={<PasswordChange />} />
      <Route path="endre-bruker" element={<ChangeUser />} />
      <Route path="mfa" element={<MultifactorAuthentication />} />
      <Route path="*" element={<Navigate to="brukere" replace />} />
    </Routes>
  );
};

export default EditorSettingsRoutes;
