import { useContext, useEffect, useLayoutEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { StoreContext } from '../../../contexts';

import CreateNewRoutes from '../../../routes/CreateNew/Bulletin/CreateNewRoutes';
import CreateNewMenu from './components/CreateNewMenu/CreateNewMenu';

import { Bulletin } from '../../../models';

import { routes, RoutesType } from '../../../routes/CreateNew/Bulletin/utils';
import { findIndexFromPath, makeEventRoute, makeSearchRoute, makeSMSEventRoute } from './utils';

import { useUser } from 'hooks';
import './CreateNew.scss';

const CreateNew: React.FC = () => {
  // hooks for react router
  const navigate = useNavigate();

  const store = useContext(StoreContext);
  const currentBulletinId = store.currentBulletinId;
  const { organizationId } = useUser();
  const invoice = store.invoice;

  const [currentBulletin, setCurrentBulletin] = useState<Bulletin | null>(store.currentBulletin);

  const [channel, setChannel] = useState<Bulletin['channel']>(
    currentBulletin?.channel || { name: 'email', type: 'search' },
  );

  const onClickNext = (sendToPath?: string): void => {
    if (sendToPath) {
      navigate(sendToPath);
    } else {
      const path: number = findIndexFromPath(getRouteType(), window.location.pathname);
      const nextPath = getRouteType()[path + 1].path;
      navigate(nextPath);
    }
  };

  const getRoutes: RoutesType[] = routes({ currentBulletin, onClickNext, channel, setChannel, invoice });

  const getRouteType = () => {
    if (channel.name === 'email') {
      return channel.type === 'search' ? makeSearchRoute(getRoutes) : makeEventRoute(getRoutes);
    } else if (channel.name === 'sms') {
      return makeSMSEventRoute(getRoutes);
    } else {
      return [];
    }
  };

  const [typeRoute, setTypeRoute] = useState<RoutesType[]>(getRouteType());

  useLayoutEffect(() => {
    if (currentBulletinId && organizationId && !(currentBulletin && store.currentBulletin)) {
      store.dbAccess
        .getBulletin(organizationId, currentBulletinId, 'draft')
        .then((res) => {
          if (res) {
            store.setBulletin(res as Bulletin);
            setCurrentBulletin(store.currentBulletin);
          }
        })
        .finally(() => setCurrentBulletin(store.currentBulletin));
    }
  }, [store.currentBulletin]);

  useEffect(() => {
    setTypeRoute(getRouteType());
  }, [channel, currentBulletin]);

  useEffect(() => {
    navigate('start');
  }, []);

  return (
    <div className="createNew" key={`container`}>
      <CreateNewMenu key={`sidemenu`} routes={typeRoute} currentPath={window.location.pathname} />
      <CreateNewRoutes typeRoute={typeRoute} />
    </div>
  );
};

export default CreateNew;
