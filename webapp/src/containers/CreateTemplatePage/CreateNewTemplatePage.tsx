import { useEffect } from 'react';
import { createBrowserHistory } from 'history';
import { matchPath, useNavigate, useParams, useLocation } from 'react-router';

import store from '../../contexts/store';

import { RoutesType } from '../../routes/CreateNew/Bulletin/utils';
import { findIndexFromPath } from 'containers/CreateMessagePage/CreateNew/utils';

import { CreateTemplateRotues } from '../../routes/CreateNew/Template/CreateTemplateRoutes';
import CreateNewMenu from '../CreateMessagePage/CreateNew/components/CreateNewMenu/CreateNewMenu';
import { useTemplate } from './contexts/TemplateContext';
import { NewTemplateRoutes } from '../../routes/CreateNew/Template/NewTemplateRoutes';

const CreateNewTemplatePage = () => {
  // hooks for react router
  const navigate = useNavigate();
  const history = createBrowserHistory();

  const { id } = useParams();
  const { template, clearTemplate, setValues } = useTemplate();
  const { pathname } = useLocation();
  const dbAccess = store.dbAccess;

  useEffect(() => {
    //NEW
    if (matchPath('/opprett/*', pathname)) {
      if (template?.id) {
        clearTemplate();
      }
    }
    //EDIT
    else if (matchPath('/editer/*', pathname) && id && id !== template?.id) {
      dbAccess.getTemplate(id).then((data) => {
        setValues({ ...data });
      });
    }
    return () => {
      setValues({ id: undefined });
    };
  }, [id]);

  const onClickNext = (back = false, sendToPath?: string) => {
    const path: number = findIndexFromPath(routes, history.location.pathname);
    if (sendToPath) {
      navigate(sendToPath);
    } else if (!back) {
      const nextPath = routes[path + 1].path;
      navigate(nextPath);
    } else {
      if (path > 0) {
        const previousPath = routes[path - 1].path;
        navigate(previousPath);
      } else {
        navigate('/oversikt/hjem');
      }
    }
  };

  const routes: RoutesType[] = NewTemplateRoutes({ currentTemplate: template, onClickNext });

  useEffect(() => {
    const routeNotdone: RoutesType = routes.find((route) => route.filled === false) as RoutesType;
    navigate(routeNotdone.path);
  }, []);

  return (
    <div className="createNew">
      <CreateNewMenu key={'sidemenu'} routes={routes} currentPath={history.location.pathname} />
      <CreateTemplateRotues routes={routes} />
    </div>
  );
};

export default CreateNewTemplatePage;
