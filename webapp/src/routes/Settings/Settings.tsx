import firebase from 'firebase/compat/app';
import { useContext, useEffect, useState } from 'react';
import { SideMenu } from '../../components/SideMenu/SideMenu';
import { StoreContext } from '../../contexts';
import { FirebaseContext } from '../../utils/Firebase';
import './Settings.scss';

export const Settings: React.FC = () => {
  const firebase = useContext(FirebaseContext);
  const user = firebase.user;
  const store = useContext(StoreContext);
  const dbAccess = store.dbAccess;
  const [userDoc, setuserDoc] = useState<firebase.firestore.DocumentData>();

  useEffect(() => {
    if (user) {
      dbAccess.getUserInOrganization(user?.uid, sessionStorage.organizationId).then((user) => {
        setuserDoc(user);
      });
    }
  }, [dbAccess, user]);

  const breadcrumbPaths = [
    { icon: 'settings', name: 'Generelt', url: '/innstillinger/generelt', roles: ['bruker', 'admin'] },
    {
      icon: 'brush',
      name: 'Stiler',
      url: '/innstillinger/stiler',
      roles: ['bruker', 'admin'],
    },
    {
      icon: 'person',
      name: 'Brukere',
      url: '/innstillinger/brukere',
    },
  ];

  return (
    <div className="settingsMenu">
      <SideMenu path={breadcrumbPaths} currentUserRoles={[userDoc?.rolle]} />
    </div>
  );
};
export default Settings;
