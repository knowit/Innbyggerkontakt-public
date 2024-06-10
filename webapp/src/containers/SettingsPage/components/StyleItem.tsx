import Close from '@mui/icons-material/Close';
import Edit from '@mui/icons-material/Edit';
import { Link } from 'react-router-dom';
import { Text } from '../../../components';

interface StyleItem {
  title: string;
  id: string;
  deleteStyle?: ((event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void) | undefined;
}

export const StyleItem: React.FC<StyleItem> = ({ title, id, deleteStyle }) => {
  return (
    <div className="usersWrapper">
      <Text className="medium14">{title}</Text>
      <div style={{ display: 'inline-flex' }}>
        <Link className="clickableIcon" to={`${id}`} style={{ marginRight: '10px' }}>
          <Edit className="styleIcon" />
        </Link>
        <div className="clickableIcon" onClick={deleteStyle}>
          <Close className="styleIcon" />
        </div>
      </div>
    </div>
  );
};
export default StyleItem;
