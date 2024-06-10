import DateRangeIcon from '@mui/icons-material/DateRange';
import EditIcon from '@mui/icons-material/Edit';
import { Bulletin } from '../../models';

import './SummaryHeader.scss';

interface Props {
  bulletin: Bulletin;
}

/* currently only caters to drafts and planned bulletins */
export const SummaryHeader: React.FC<Props> = ({ bulletin }) => {
  const { channel, status, name } = bulletin;

  let bulletinDate = bulletin.lastChanged ? new Date(bulletin.lastChanged) : undefined;

  const formatTime = (time: Date) => {
    const bits = time.toLocaleString('no-NO').split(',');
    return ''.concat(bits[1].slice(0, 6), ' ', bits[0]);
  };

  /* use the planned publishing time if it is a planned post */
  if (status === 'active')
    bulletinDate = bulletin.execution?.datetime ? new Date(bulletin.execution.datetime) : undefined;

  const lastChanged = bulletinDate ? formatTime(bulletinDate) : undefined;

  const dateToString = (date: Date) => `
  ${date.toLocaleDateString('no-NO', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })} kl ${date.toLocaleTimeString('no-NO', { timeStyle: 'short', hour12: false })}`;

  /* the header data will be different depending on what type/state the bulletin is in */
  const displayMetadata = () => {
    if (['search', 'event'].includes(channel.type)) {
      return status === 'active' ? (
        <div className="summary-header__tag">
          <DateRangeIcon className="summary-header__icon" />
          <p className="summary-header__tag-text">Sendes ut {bulletinDate && dateToString(bulletinDate)}</p>
        </div>
      ) : (
        <>
          <p className="summary-header__text">Sist endret {lastChanged}</p>
          <div className="summary-header__tag">
            <EditIcon className="summary-header__icon summary-header__icon--enlarged" />
            <p className="summary-header__tag-text">Utkast</p>
          </div>
        </>
      );
    } else {
      return <></>;
    }
  };

  return (
    <div className="summary-header">
      <h2 className="summary-header__heading"> {name}</h2>
      <div className="summary-header__content">{displayMetadata()}</div>
    </div>
  );
};
