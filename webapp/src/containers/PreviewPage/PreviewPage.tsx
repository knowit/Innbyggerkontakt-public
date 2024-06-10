import { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import AboutTemplate from '../../components/AboutTemplate/AboutTemplate';
import store from '../../contexts/store';
import { useUser } from '../../hooks';
import { USER_ROLES } from '../../models';
import { validTemplate } from '../../utils/Template/util';
import ContentPreview from '../CreateTemplatePage/containers/Summary/components/ContentSummary/ContentPreview';
import { useTemplate } from '../CreateTemplatePage/contexts/TemplateContext';
import BackButton from './components/BackButton/BackButton';
import { TemplateButtonRowEditor, TemplateButtonRowUser } from './components/TemplateButtonRow';
import TemplateHeader from './components/TemplateHeader/TemplateHeader';
import TemplateStatistics from './components/TemplateStatistics/TemplateStatistics';

import './PreviewPage.scss';

const PreviewPage = () => {
  const { id } = useParams();
  const dbAccess = store.dbAccess;
  const { template, setValues } = useTemplate();
  const { role } = useUser();
  const [showEmailPreview, setShowEmailPreview] = useState(false);

  useEffect(() => {
    if (id) {
      dbAccess
        .getTemplate(id)
        .then((template) => {
          setValues({ ...template });
        })
        .catch((err) => console.error(err));
    }
  }, [id]);

  return template?.id ? (
    <div className="previewPageContainer">
      <BackButton />
      <TemplateHeader />
      <div style={{ backgroundColor: 'rgba(134, 188, 255, 0.2)' }}>
        <AboutTemplate template={template} />
      </div>
      {role === USER_ROLES.EDITOR ? <TemplateStatistics /> : null}
      {role === USER_ROLES.EDITOR ? (
        <TemplateButtonRowEditor />
      ) : (
        <TemplateButtonRowUser setShowEmailPreview={setShowEmailPreview} showEmailPreview={showEmailPreview} />
      )}

      {showEmailPreview ? (
        <div className="emailPreviewContainer">
          <ContentPreview templateContent={validTemplate(template)} />
        </div>
      ) : null}
    </div>
  ) : null;
};

export default PreviewPage;
