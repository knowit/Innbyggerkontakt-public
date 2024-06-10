import { Navigate, Route, Routes } from 'react-router';
import { TemplateProvider } from '../../containers/CreateTemplatePage/contexts/TemplateContext';
import { EditorHome } from '../../containers/EditorHome/EditorHome';
import PreviewPage from '../../containers/PreviewPage/PreviewPage';

export const EditorHomeRoutes = () => {
  return (
    <Routes>
      <Route path="*" element={<Navigate to="/hjem" replace />} />
      <Route path="hjem" element={<EditorHome />} />
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
