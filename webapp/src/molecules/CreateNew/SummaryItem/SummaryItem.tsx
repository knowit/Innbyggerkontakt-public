import { ReactNode, useRef, useState } from 'react';

import CheckCircle from '@mui/icons-material/CheckCircle';
import ExpandMore from '@mui/icons-material/ExpandMore';
import Lens from '@mui/icons-material/Lens';

import { Button } from 'innbyggerkontakt-design-system';
import { ButtonProps } from 'innbyggerkontakt-design-system/dist/components/Button';

import Edit from '@mui/icons-material/Edit';
import './SummaryItem.scss';

interface User {
  overskrift?: string;
  children?: ReactNode;
  finished?: boolean;
  buttonProps?: ButtonProps;
}

export const SummaryItem: React.FC<User> = ({ overskrift, children, finished, buttonProps }) => {
  const [open, setOpen] = useState<boolean>(true);

  const divRef = useRef(null);

  return (
    <div className="summary-item">
      <div
        className="summary-item__container"
        ref={divRef}
        role="button"
        tabIndex={0}
        onClick={() => {
          divRef.current === document.activeElement && setOpen((open) => !open);
        }}
        onKeyDown={(event) => {
          const key = event.key;
          divRef.current === document.activeElement && (key === 'Enter' || key === ' ') && setOpen((open) => !open);
        }}
      >
        <div className="summary-item__header">
          <div className="summary-item__icon">
            {finished ? (
              <CheckCircle className="summary-item__icon--active" />
            ) : (
              <Lens className="summary-item__icon--inactive" />
            )}
          </div>
          <h1 className="summary-item__heading">{overskrift}</h1>
        </div>
        <div className="summary-item__clickable" onClick={() => setOpen((open) => !open)}>
          <ExpandMore
            className={'summary-item__expand-icon ' + (open ? 'summary-item__rotate' : '')}
            onClick={() => setOpen((open) => !open)}
          />
        </div>
      </div>
      <div className={open ? 'summary-item__content__button' : 'summary-item__content--inactive'}>
        <div className={'summary-item__content'}>{children}</div>
        {buttonProps?.onClick && (
          <Button color="tertiary" className="summary-item__editButton" svg={[15, 15]} size="small" {...buttonProps}>
            <Edit style={{ width: '1rem', marginRight: '0.5rem' }} />
            {finished ? 'Endre' : 'Legg til'}
          </Button>
        )}
      </div>
    </div>
  );
};
export default SummaryItem;
