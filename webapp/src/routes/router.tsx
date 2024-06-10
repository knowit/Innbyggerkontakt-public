import { Loading } from 'innbyggerkontakt-design-system';
import { Navigate, Routes, useLocation } from 'react-router';
import { Route } from 'react-router-dom';
import NavBar from '../components/NavBar/NavBar';
import CreateNew from '../containers/CreateMessagePage/CreateNew/CreateNew';
import { TemplateProvider } from '../containers/CreateTemplatePage/contexts/TemplateContext';
import CreateNewTemplatePage from '../containers/CreateTemplatePage/CreateNewTemplatePage';
import FeedbackPage from '../containers/Feedback/FeedbackPage';
import useUser from '../hooks/useUser';
import { USER_ROLES } from '../models';
import EditorHomePage from '../pages/editor/home/EditorHomePage';
import HomeContainer from '../pages/Home/HomeContainer';
import PageNotFound from '../pages/PageNotFound/PageNotFound';
import GlobalSearch from '../pages/SearchPage/GlobalSearch';
import SettingsContainer from '../pages/Settings/SettingsContainer';
import ForgottenPasswordPage from '../pages/signin/ForgottenPassword/ForgottenPasswordPage';
import ResetPasswordPage from '../pages/signin/ResetPassword/ResetPasswordPage';
import SignIn from '../pages/signin/SignIn';

function Routing() {
  const location = useLocation();
  const { user, role } = useUser();

  if (user !== undefined && !!user && role) {
    return (
      <div>
        <NavBar />
        <div className="content">
          <Routes>
            <Route path="/" element={<Navigate to="/oversikt/hjem" replace />} />
            <Route path="/oversikt" element={<Navigate to="/oversikt/hjem" replace />} />
            <Route path="logg-inn" element={<Navigate to="/oversikt/hjem" replace />} />
            <Route path="/innstillinger/*" element={<SettingsContainer />} />
            <Route path="endre-passord/*" element={<Navigate to="/logg-inn" replace />} />
            <Route path="404" element={<PageNotFound />} />
            <Route path="/*" element={<Navigate to="404" replace />} />

            {role === USER_ROLES.EDITOR ? (
              <>
                <Route
                  path="opprett/*"
                  element={
                    <TemplateProvider>
                      <CreateNewTemplatePage key="opprett" />
                    </TemplateProvider>
                  }
                />
                <Route
                  path="editer/:id/*"
                  element={
                    <TemplateProvider>
                      <CreateNewTemplatePage key={'editer'} />
                    </TemplateProvider>
                  }
                />
                <Route path="oversikt/*" element={<EditorHomePage />} />
              </>
            ) : (
              <>
                <Route path="oversikt/*" element={<HomeContainer />} />
                <Route path="opprett/*" element={<CreateNew key={'opprett'} />} />
                <Route path="editer/:id/*" element={<CreateNew key={'editer'} />} />
                <Route path="finn" element={<GlobalSearch />} />
                <Route path="feedback/*" element={<FeedbackPage hidePublicNavbar />} />
              </>
            )}
          </Routes>
        </div>
      </div>
    );
  } else if (user !== undefined && !user) {
    const originalLocation = location.pathname;

    const loginPath =
      ['/logg-inn', '/glemt-passord'].includes(originalLocation) ||
      !originalLocation.startsWith('/feedback') ||
      !originalLocation.startsWith('/endre-passord')
        ? `/logg-inn?retUrl=${encodeURIComponent(originalLocation)}`
        : '/logg-inn';
    return (
      <Routes>
        <Route path="logg-inn" element={<SignIn />} />
        <Route path="feedback/*" element={<FeedbackPage />} />
        <Route path="glemt-passord" element={<ForgottenPasswordPage />} />
        <Route path="endre-passord/:types" element={<ResetPasswordPage />} />
        <Route path="*" element={<Navigate to={loginPath} replace />} />
      </Routes>
    );
  } else {
    return <Loading />;
  }
}

export default Routing;
