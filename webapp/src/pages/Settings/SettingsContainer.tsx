import { useLocation } from 'react-router';
import useUser from '../../hooks/useUser';
import { USER_ROLES } from '../../models';
import EditorSettingsRoutes from '../../routes/Settings/EditorSettingsRoutes';
import Settings from '../../routes/Settings/Settings';
import SettingsRoutes from '../../routes/Settings/SettingsRoutes';

const SettingsContainer = () => {
  const location = useLocation();
  const { role } = useUser();

  if (!role) return <></>;

  return (
    <>
      {location.pathname.includes('innstillinger') ? (
        <div className="settingsPage">
          <Settings />
          {role === USER_ROLES.EDITOR ? <EditorSettingsRoutes /> : <SettingsRoutes />}
        </div>
      ) : null}
    </>
  );
};

export default SettingsContainer;
