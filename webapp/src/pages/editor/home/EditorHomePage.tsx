import { useLocation } from 'react-router';
import { EditorHomeRoutes } from '../../../routes/Home/EditorHomeRoutes';

import './EditorHomePage.scss';

const EditorHomePage = () => {
  const location = useLocation();

  return (
    <>
      {location.pathname.includes('oversikt') ? (
        <div className="editorHomePage">
          <EditorHomeRoutes />
        </div>
      ) : null}
    </>
  );
};

export default EditorHomePage;
