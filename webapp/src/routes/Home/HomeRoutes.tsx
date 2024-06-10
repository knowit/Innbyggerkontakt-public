import MessageSummary from 'pages/Home/SortedBulletins/SingleBulletinSummary/MessageSummary';
import TitleSummaryBox from 'pages/Home/SortedBulletins/TitleSummaryBox';
import { Navigate, Route, Routes } from 'react-router';
import { TemplateProvider } from '../../containers/CreateTemplatePage/contexts/TemplateContext';
import PreviewPage from '../../containers/PreviewPage/PreviewPage';
import Home from '../../pages/Home/HomePage/Home';
import InspirationPage from '../../pages/Home/InspirationPage/InspirationPage';
import LatestNewsPage from '../../pages/Home/LatestNewsPage/LatestNewsPage';

export const HomeRoutes = () => {
  return (
    <Routes>
      <Route path="*" element={<Navigate to="/hjem" replace />} />
      <Route path="hjem" element={<Home />} />
      <Route path="siste-nytt" element={<LatestNewsPage />} />
      <Route path="aktive-utsendelser" element={<TitleSummaryBox status="active" />} />
      <Route path="planlagte-utsendelser" element={<TitleSummaryBox status="planned" />} />
      <Route path="utkast" element={<TitleSummaryBox status="draft" />} />
      <Route path="historikk" element={<TitleSummaryBox status={'finished'} />} />
      <Route path="inspirasjon" element={<InspirationPage />} />
      <Route path=":type/:id" element={<MessageSummary />} />
      <Route
        path="forhaandsvisning/:id/*"
        element={
          <TemplateProvider>
            <PreviewPage />
          </TemplateProvider>
        }
      />
      <Route path="/*" element={<Navigate to="/404" />} />
    </Routes>
  );
};
