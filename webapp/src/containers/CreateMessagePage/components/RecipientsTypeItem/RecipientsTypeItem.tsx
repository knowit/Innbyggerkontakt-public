import { getAppropriateIcon } from '../../containers/SelectRecipients/searchUtil';
import './RecipientsTypeItem.scss';

interface User {
  overskrift?: string;
  infotekst?: string;
  ekstraInfotekst?: string;
  filterType?: string;
  onClick?: () => void;
}

export const RecipientsTypeItem: React.FC<User> = ({ overskrift, infotekst, filterType, onClick }) => (
  <div className="recipientsTypeItemWrapper" onClick={onClick}>
    <div className="iconsWrapper">{getAppropriateIcon(filterType || '', 'recipientsContentIcon')}</div>
    <div>
      <h3 className="regular18 noMargin">{overskrift}</h3>
      <p className="regular14">{infotekst}</p>
    </div>
  </div>
);

export default RecipientsTypeItem;
