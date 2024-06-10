import { useContext, useState, useLayoutEffect } from 'react';
import { useForm } from 'react-hook-form';

/* kart */
import { FeatureCollection, Polygon } from 'geojson';
/* components */
import { FilterWrapper } from '../../../../containers/CreateMessagePage/containers/SelectRecipients/components';
import { RecipientsAddCancelButtons } from '../../../../containers/CreateMessagePage/components';
import { PolygonMap } from './PolygonMap/PolygonMap';
/* diverse */
import { v4 as uuid } from 'uuid';
import { Bulletin, BulletinRecipients, FilterTypes, FilterValues, RecipientsKart } from 'models';
import { StoreContext } from 'contexts';
import { onFilterEdit } from '../../../../containers/CreateMessagePage/containers/SelectRecipients/searchUtil';
/* styling */
import './KartFilter.scss';

type MapProps = {
  onCancel: () => void;
  activeFilter: FilterValues['recipientFilter'];
  editMode: boolean;
  onSubmit: (bulletinToPost: Bulletin) => void;
  evaluatedFilter: FilterTypes | null;
};

const KartFilter: React.FC<MapProps> = ({ onCancel, editMode, activeFilter, evaluatedFilter, onSubmit }) => {
  const store = useContext(StoreContext);

  const { handleSubmit } = useForm();

  const [polygons, setPolygons] = useState<FeatureCollection<Polygon>>({
    type: 'FeatureCollection',
    features: [],
  });
  const [ownerType, setOwnerType] = useState<boolean>(false); //må kanskje endre det til array senere når vi får inn flere owners

  useLayoutEffect(() => {
    if (evaluatedFilter && editMode) {
      const matrikkelGroup = evaluatedFilter as RecipientsKart;
      setOwnerType(matrikkelGroup.ownerType);
      setPolygons(
        matrikkelGroup.polygons ? JSON.parse(matrikkelGroup.polygons) : { type: 'FeatureCollection', features: [] },
      );
    }
  }, []);

  const setFiltersForBulletin = (bulletinToStore: Bulletin) => {
    const prevMatrikkelFilter: RecipientsKart[] = bulletinToStore?.recipients?.kart || [];
    const prevRecipients: BulletinRecipients | undefined = bulletinToStore?.recipients;
    const filter: RecipientsKart = {
      id: evaluatedFilter?.id || uuid(),
      recipientFilter: activeFilter,
      polygons: JSON.stringify(polygons),
      ownerType: ownerType,
    };
    if (!(editMode && evaluatedFilter)) {
      const recipients: BulletinRecipients = {
        ...prevRecipients,
        kart: [...prevMatrikkelFilter, filter],
      };
      const bulletin: Bulletin = {
        ...bulletinToStore,
        recipients,
      };
      return bulletin;
    } else {
      return onFilterEdit(evaluatedFilter, filter, bulletinToStore);
    }
  };

  return (
    <FilterWrapper
      overskrift="Kart"
      infotekst="Kartet gir deg mulighet til å nå de som eier eiendom i kommunen din. Her kan du selv velge områder i kartet. Søket henter alle personer som står oppført som eiere av matrikkelenheter som ligger innenfor de valgte områdene."
      filterType="kart"
    >
      <form
        onSubmit={handleSubmit(() => {
          if (store.currentBulletin && store.currentBulletinId) {
            const bulletinToPost = setFiltersForBulletin(store.currentBulletin);
            store.dbAccess.checkForPotentialOverwrite(store.currentBulletinId).then(() => {
              store.dbAccess.persistBulletin(bulletinToPost, store.currentBulletinId).then(() => {
                store.setBulletin(bulletinToPost);
                onSubmit(bulletinToPost);
              });
            });
          }
        })}
      >
        <PolygonMap polygons={polygons} setPolygons={setPolygons} />
        <RecipientsAddCancelButtons onCancel={onCancel} editMode={editMode} />
      </form>
    </FilterWrapper>
  );
};

export default KartFilter;
