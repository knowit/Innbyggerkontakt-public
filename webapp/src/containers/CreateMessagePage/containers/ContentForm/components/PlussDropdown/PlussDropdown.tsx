import AddCircleIcon from '@mui/icons-material/AddCircle';
import { useEffect, useState } from 'react';
import { OptionType } from '../../../../../../models';
import './PlussDropdown.scss';

interface Props {
  options: Array<OptionType>;
  onClick: (value: OptionType) => void;
  showLongText?: boolean;
}

export const PlussDropdown: React.FC<Props> = ({ options, onClick, showLongText = false }) => {
  const [expanded, setExpanded] = useState<boolean>(false);
  const [activeItem, setActiveItem] = useState<number>(-1);
  const handleKeyPress = (event: KeyboardEvent) => {
    if (expanded) {
      if (event.key === 'ArrowDown' && activeItem < options.length) {
        event.preventDefault();
        setActiveItem((prev) => prev + 1);
      } else if (event.key === 'ArrowUp' && activeItem > 0) {
        event.preventDefault();
        setActiveItem((prev) => prev - 1);
      } else if (event.key === 'Enter' && activeItem > -1) {
        event.preventDefault();
        onItemClick(options[activeItem]);
      }
    }
  };

  useEffect(() => setActiveItem(-1), [expanded]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyPress);

    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [activeItem, setActiveItem, expanded]);

  const onItemClick = (value: OptionType) => {
    onClick(value);
    setExpanded(false);
  };

  return (
    <div
      className={`plussDropdown ${expanded ? '' : 'expanded'}`}
      tabIndex={0}
      onBlur={() => setExpanded(false)}
      onFocus={() => setExpanded(true)}
    >
      {!expanded && (
        <div className="iconContainer">
          <AddCircleIcon
            fontSize="large"
            onClick={() => {
              setExpanded(true);
            }}
          />
          {showLongText && <p>Legg til innhold på nytt språk</p>}
        </div>
      )}

      {expanded && (
        <div className="expandedClassMenu">
          <div className="expandendIcon">
            <AddCircleIcon />
            <p className="longText">Legg til innhold på nytt språk</p>
            <p className="shortText">Nytt språk</p>
          </div>
          <ul className="options">
            {options.map((item, index) => (
              <li
                key={item.value}
                className={`option ${index === activeItem ? 'active' : ''}`}
                onMouseDown={() => onItemClick(item)}
                tabIndex={0}
              >
                {item.label}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default PlussDropdown;
