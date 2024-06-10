import { useRef } from 'react';

import ContentPreview from 'containers/CreateTemplatePage/containers/Summary/components/ContentSummary/ContentPreview';
import { useTemplate } from 'containers/CreateTemplatePage/contexts/TemplateContext';
import { Button } from 'innbyggerkontakt-design-system';

import { NavigateNextOutlined } from '@mui/icons-material';

import { Template } from 'models';
import { validTemplate } from 'utils/Template/util';

import './Preview.scss';

interface PreviewProps {
  onClickNext: () => void;
}

const Preview = ({ onClickNext }: PreviewProps) => {
  const { template } = useTemplate();

  const templateRef = useRef<Template | null>(template);
  templateRef.current = template;

  return (
    <div className="previewTemplatePageContainer">
      <h1>Forhåndsvisning</h1>
      <div>
        <ContentPreview templateContent={validTemplate(template)} />
      </div>
      <Button color="primary" type="submit" svg={[15, 25]} onClick={() => onClickNext()}>
        Videre
        <NavigateNextOutlined />
      </Button>
    </div>
  );
};

export default Preview;
