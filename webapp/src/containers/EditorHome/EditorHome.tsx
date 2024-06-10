import { useContext, useEffect, useState } from 'react';
import { Button } from 'innbyggerkontakt-design-system';
import { Template } from '../../models';
import { StoreContext } from '../../contexts';
import { useUser } from '../../hooks';
import { Loader } from '../../components';
import { Link } from 'react-router-dom';
import SearchTemplate from '../../components/SearchTemplate/SearchTemplate';
import Add from '@mui/icons-material/Add';

import './EditorHome.scss';

export const EditorHome = () => {
  const store = useContext(StoreContext);
  const dbAccess = store.dbAccess;
  const [templates, setTemplates] = useState<Template[]>([]);
  const { organizationId } = useUser();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getTemplates = () =>
      dbAccess.getOrganizationTemplates(organizationId ?? '').then((results) => {
        setTemplates(results);
        setLoading(false);
      });

    if (organizationId) {
      getTemplates();
    }
  }, [organizationId]);

  return (
    <div className="editorHome">
      <div>
        <div>
          <h1>Velkommen til Bibliotek for Maler</h1>
          <p>Her kan du som redaktør lage, administrere og publisere maler globalt i Innbyggerkontakt.</p>
        </div>
        <Link to="/opprett">
          <Button color="primary" svg={[25, 15]}>
            <Add />
            Lag ny mal
          </Button>
        </Link>
      </div>
      <div>
        {loading ? (
          <Loader className="globalSearch__loader" />
        ) : (
          <SearchTemplate list={templates} maxSearchResult={Infinity} />
        )}
      </div>
    </div>
  );
};
