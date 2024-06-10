import { CreateMessageHeader } from '../../containers/CreateMessagePage/components';
import { SaveOptions } from '../../containers/CreateMessagePage/util';

import './CreateNewTemplate.scss';

interface TemplateProps {
  title: string;
  subtitle?: string;
  save?: SaveOptions | undefined;
  children?: React.ReactNode;
}
const CreateNewTemplate: React.FC<TemplateProps> = ({ title, subtitle, save, children }) => {
  return (
    <div className="createNewBulletin">
      <CreateMessageHeader title={title} description={subtitle} save={save} />
      {children}
    </div>
  );
};

export default CreateNewTemplate;
