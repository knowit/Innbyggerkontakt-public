import firebase from 'firebase/compat/app';
import { Loading } from 'innbyggerkontakt-design-system';
import { Bulletin } from 'models';
import { useContext, useEffect, useState } from 'react';
import { StoreContext } from '../../../contexts';
import ListView from './BulletinTypeList';
import './ListView.scss';

interface TitleSummaryProps {
  status: Bulletin['status'] | 'planned';
}

export const TitleSummaryBox: React.FC<TitleSummaryProps> = ({ status }) => {
  const store = useContext(StoreContext);
  const dbAccess = store.dbAccess;

  const [messages, setMessages] = useState<{ id: string; bulletin: firebase.firestore.DocumentData }[]>([]);
  const [loading, setLoading] = useState(true);

  let typeStatus: 'default' | 'event' | 'search' = 'default';

  let title: {
    overskrift: string;
    infoText: string;
  } = {
    overskrift: 'Historikk',
    infoText:
      'Her vises alle meldinger som er sendt ut, enten de er automatiske meldinger som er stoppet eller de er tidligere enkeltmeldinger.',
  };

  switch (status) {
    case 'active':
      typeStatus = 'event';
      title = {
        overskrift: 'Aktive meldinger',
        infoText:
          'Her ser du en oversikt over alle aktive automatiske meldinger. Det betyr at meldingene sendes ut idet en hendelse registreres i Folkeregisteret.',
      };
      break;
    case 'planned':
      typeStatus = 'search';
      title = {
        overskrift: 'Planlagte meldinger',
        infoText:
          'Her ser du meldinger som skal sendes i fremtiden. Hvis du vil endre på noe kan du enkelt klikke på meldingen og velge Endre',
      };
      break;
    case 'draft':
      typeStatus = 'default';
      title = {
        overskrift: 'Utkast',
        infoText:
          'Her vises alle meldinger som ikke er fullførte og ikke sendt ut. Når du klikker på et utkast vil det åpne seg der du var sist gang du jobbet med meldingen.',
      };
      break;
    case 'finished':
      typeStatus = 'default';
      break;
    default:
      typeStatus = 'default';
      break;
  }

  useEffect(() => {
    setLoading(true);
    dbAccess
      .getAllBulletinWithParam(sessionStorage.organizationId, status === 'planned' ? 'active' : status, typeStatus)
      .then((collection) => {
        const docs: { id: string; bulletin: firebase.firestore.DocumentData }[] = [];
        collection.forEach((doc) => docs.push({ id: doc.id, bulletin: doc.data() }));
        setMessages(
          docs.sort((a, b) => new Date(b.bulletin.lastChanged).getTime() - new Date(a.bulletin.lastChanged).getTime()),
        );
      })
      .finally(() => setLoading(false));
  }, [status]);

  return loading ? (
    <Loading />
  ) : (
    <ListView messages={messages} overskrift={title.overskrift} infoText={title.infoText} />
  );
};

export default TitleSummaryBox;
