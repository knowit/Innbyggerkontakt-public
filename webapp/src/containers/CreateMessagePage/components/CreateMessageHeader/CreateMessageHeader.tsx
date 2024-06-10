import { SaveOptions } from '../../util';

import AutorenewIcon from '@mui/icons-material/Autorenew';
import CheckIcon from '@mui/icons-material/Check';

import './CreateMessageHeader.scss';
interface Props {
  title: string;
  subtitle?: string;
  description?: string;
  save?: SaveOptions;
}

export const CreateMessageHeader: React.FC<Props> = ({ title, description, save, subtitle }) => {
  return (
    <div className="createMessageHeader">
      <div className="createMessageHeader--inline">
        <h2 className="title semibold24 darkBlue">{title}</h2>
        {save === SaveOptions.SAVING ? (
          <div className="loadContainer darkBrightBlue regular14">
            <AutorenewIcon className="rotatingIcon" /> <p>Lagrer</p>
          </div>
        ) : save === SaveOptions.SAVED ? (
          <div className="loadContainer darkGreen regular14">
            <CheckIcon /> <p>Lagret</p>
          </div>
        ) : (
          <></>
        )}
      </div>
      {subtitle && <span className="regular18"> {subtitle}</span>}
      {description && <p className="descriptionText darkBlue regular14">{description}</p>}
    </div>
  );
};

export default CreateMessageHeader;
