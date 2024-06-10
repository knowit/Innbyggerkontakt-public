import { Template } from '../../models';
import { validTemplate } from '../../utils/Template/util';
import Text from '../Text/Text';

import './AboutTemplate.scss';

type Props = {
  template: Template | null;
};

const AboutTemplate: React.FC<Props> = ({ template }: Props) => {
  const templateContent = validTemplate(template);

  return (
    <div className={'aboutSummaryContainer'}>
      <div>
        <div>
          <div>
            <Text className="medium18">Beskrivelse</Text>
            <Text className="regular14 gray">{template?.description}</Text>
          </div>
          <div>
            <Text className="medium18">Målgruppe</Text>
            <Text className="regular14 gray">{template?.recipientDescription}</Text>
          </div>
          <div>
            <Text className="medium18">Om eposten:</Text>
            <div className="aboutEmailContentContainer">
              <Text className="medium14">
                Emnefelt: <span className="regular14">{templateContent?.subject}</span>
              </Text>
              <Text className="medium14">
                Forhåndsvisningstekst: <span className="regular14">{templateContent?.previewText}</span>
              </Text>
            </div>
          </div>
        </div>
        {templateContent?.image ? (
          <img alt={templateContent?.image_alt} src={templateContent?.image} className="templateContentImage" />
        ) : (
          <svg className="templateImagePlaceholder">
            <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle">
              Malen er uten bilde
            </text>
          </svg>
        )}
      </div>
    </div>
  );
};

export default AboutTemplate;
