import { useTemplate } from 'containers/CreateTemplatePage/contexts/TemplateContext';

import AboutTemplate from 'components/AboutTemplate/AboutTemplate';

import SummaryItem from 'molecules/CreateNew/SummaryItem/SummaryItem';

import { validateStart } from 'routes/CreateNew/Template/NewTemplateRoutes';

const AboutSummary: React.FC = () => {
  const { template } = useTemplate();

  return (
    <SummaryItem overskrift="Om malen" finished={validateStart(template)}>
      <AboutTemplate template={template} />
    </SummaryItem>
  );
};

export default AboutSummary;
