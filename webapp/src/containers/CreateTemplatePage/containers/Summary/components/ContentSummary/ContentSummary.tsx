import { useTemplate } from 'containers/CreateTemplatePage/contexts/TemplateContext';
import SummaryItem from 'molecules/CreateNew/SummaryItem/SummaryItem';
import { validateContentArray } from 'routes/CreateNew/Template/NewTemplateRoutes';
import { validTemplate } from 'utils/Template/util';
import ContentPreview from './ContentPreview';

const ContentSummary: React.FC = () => {
  const { template } = useTemplate();

  const completed = validateContentArray(template?.contentArray ?? []);
  const templateContent = validTemplate(template);

  return (
    <SummaryItem overskrift="Innhold" finished={completed}>
      <div style={{ padding: '1rem', margin: '1rem', border: '1px solid black', backgroundColor: 'white' }}>
        <ContentPreview templateContent={templateContent} />
      </div>
    </SummaryItem>
  );
};

export default ContentSummary;
