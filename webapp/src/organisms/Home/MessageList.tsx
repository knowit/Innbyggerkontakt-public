import { Text } from '../../components';
import { BulletinMessage } from '../../models';
import Search from '../Search/Search';
interface Props {
  messages: BulletinMessage[];
  placeholder: string;
  onListClick?: (e: BulletinMessage) => void;
  className?: string;
  activeId?: string;
}

export const MessageList: React.FC<Props> = ({ messages, placeholder, onListClick, className, activeId }) => {
  return (
    <div className={`messageList ${className || ''}`}>
      {messages.length > 0 ? (
        <Search
          type="search"
          placeholder={placeholder}
          list={messages}
          onClick={onListClick}
          activeId={activeId}
          rowclassName="listRowGlobal"
          maxSearchResult={8}
        />
      ) : (
        <Text className="regular14 gray" style={{ marginTop: '20px' }}>
          Ingen utsendinger
        </Text>
      )}
    </div>
  );
};

export default MessageList;
