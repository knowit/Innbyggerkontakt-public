import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { StoreContext } from '../../contexts';
import * as api from '../../utils/api';

export const useOrganizationUser = (id: string) => {
  const store = useContext(StoreContext);
  const dbAccess = store.dbAccess;
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) {
      api.getUser(id).then((user) => {
        if (user === undefined) {
          navigate('/innstillinger/brukere');
        } else {
          setName(user.displayName);
          setEmail(user.email);
          setIsLoading(false);
        }
      });
      dbAccess.getUserInOrganization(id, sessionStorage.organizationId).then((user) => {
        setIsAdmin(user?.rolle === 'admin');
      });
    } else {
      setIsLoading(true);
    }
  }, []);

  return { name, email, isAdmin, isLoading, setIsAdmin, setIsLoading };
};
