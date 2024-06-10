import { Tag } from 'innbyggerkontakt-design-system';
import { Text } from '../../../../components';
import { useTemplate } from '../../../CreateTemplatePage/contexts/TemplateContext';
import { formatTemplateType } from '../../../../utils/Template/util';

import './TemplateHeader.scss';

const dateFormat = (date: string) => {
  if (!date) return 'ukjent';
  return new Date(date).toLocaleDateString('no-NO', { dateStyle: 'short' });
};

const TemplateHeader = () => {
  const { template } = useTemplate();
  const generateTags = () => {
    return (template?.tags ?? []).map((tag) => <Tag key={tag}>{tag}</Tag>);
  };

  return (
    <div className="templateHeaderContainer">
      <div>
        <h1 className="bold24">{template?.name}</h1>
        <Tag>{template?.type && formatTemplateType(template.type)}</Tag>
      </div>
      <Text className="regular14 gray">{`Sist redigert: ${dateFormat(template?.lastChanged ?? '')}`}</Text>
      {template?.tags ? <div className="templateHeaderTags">{generateTags()}</div> : null}
    </div>
  );
};

export default TemplateHeader;
