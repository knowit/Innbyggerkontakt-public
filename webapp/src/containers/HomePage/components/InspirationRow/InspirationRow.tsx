import { useEffect, useState } from 'react';
import { Card, Loading } from 'innbyggerkontakt-design-system';
import { Link, useNavigate } from 'react-router-dom';
import { Text } from '../../../../components';
import store from '../../../../contexts/store';
import { Template } from '../../../../models';
import { getTemplateImage, sortTemplatesAfterDates } from '../../../../utils/Template/util';

import './InspirationRow.scss';

const InspirationRow = () => {
  const navigate = useNavigate();
  const dbAccess = store.dbAccess;
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTemplates() {
      setLoading(true);
      const templates = await dbAccess.getPublishedTemplates();
      setTemplates(templates);
      setLoading(false);
    }
    fetchTemplates();
  }, []);

  return !loading ? (
    <div className="inspirationRowContainer">
      <div>
        <Text className="bold18">Inspirasjon</Text>
        {templates.length > 0 ? (
          <Link className="regular14" to="/oversikt/inspirasjon">
            Se alle
          </Link>
        ) : null}
      </div>
      <div>
        {templates.length > 0 ? (
          templates
            .sort((a, b) => sortTemplatesAfterDates(a, b))
            .slice(0, 4)
            .map((template) => (
              <Card
                key={template.id}
                title={template.name ?? ''}
                lastChanged={template.lastChanged ? new Date(template.lastChanged) : new Date()}
                size="large"
                tags={template.tags ? template.tags : ['Publisert']}
                image={getTemplateImage(template)}
                onClick={() => {
                  navigate(`/oversikt/forhaandsvisning/${template.id}`);
                }}
              />
            ))
        ) : (
          <p className="editorHome__notFound">Ingen maler er publisert enda.</p>
        )}
      </div>
    </div>
  ) : (
    <Loading />
  );
};

export default InspirationRow;
