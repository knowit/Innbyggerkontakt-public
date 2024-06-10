import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import firebase from 'firebase/compat/app';
import { Organization, OrganizationUser, UserContextType, USER_ROLES } from '../models';
import { FirebaseContext } from '../utils/Firebase';
import store from '../contexts/store';

const UserContext = createContext<UserContextType>({} as UserContextType);

export function UserProvider({ children }: { children: ReactNode }) {
  const firebase = useContext(FirebaseContext);
  const [user, setUser] = useState<firebase.User | null>();
  const [role, setRole] = useState<USER_ROLES>();
  const [organizationId, setOrganizationId] = useState<string | undefined>(undefined);
  const [organization, setOrganization] = useState<Organization | null>(null);

  /* observes authenticated user, fetches related data, and unsubscribes on cleanup */
  useEffect(() => {
    async function fetchUserAndOrganization(userId: string) {
      const { rolle, orgId } = (await store.dbAccess.getUser(userId)) as OrganizationUser;
      setRole(rolle);
      setOrganizationId(orgId);

      if (orgId) {
        const org: Organization = (await store.dbAccess.getorganization(orgId)) as Organization;
        setOrganization(org);
      }
    }

    return firebase.auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);

      if (currentUser?.uid) {
        fetchUserAndOrganization(currentUser.uid);
      }
    });
  }, [firebase]);

  return <UserContext.Provider value={{ user, role, organizationId, organization }}>{children}</UserContext.Provider>;
}

export default function useUser() {
  return useContext(UserContext);
}
