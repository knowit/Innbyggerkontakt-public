import './FilterItem.scss';

interface Props {
  filterContent: JSX.Element;
  onDelete?: JSX.Element;
  onEdit?: JSX.Element;
}

const FilterItem: React.FC<Props> = ({ filterContent, onDelete, onEdit }) => {
  return (
    <div className="recipientItem">
      <div className="recipientItem__actionButtons">
        {onEdit}
        {onDelete}
      </div>
      <div className="recipientItemContent">{filterContent}</div>
    </div>
  );
};

export default FilterItem;
