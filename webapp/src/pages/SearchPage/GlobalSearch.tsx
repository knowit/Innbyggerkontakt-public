import firebase from 'firebase/compat/app';
import { Search } from 'molecules';
import { useContext, useLayoutEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { Loader } from '../../components';
import { StoreContext } from '../../contexts';
import { Bulletin, BulletinMessage } from '../../models';
import './GlobalSearch.scss';

export const GlobalSearch: React.FC = () => {
  const navigate = useNavigate();
  const store = useContext(StoreContext);
  const dbAccess = store.dbAccess;
  const [meldinger, setMeldinger] = useState<
    { id: string; type: string; status: string; bulletin: firebase.firestore.DocumentData }[]
  >([]);
  const [loading, setLoading] = useState(true);

  useLayoutEffect(() => {
    dbAccess
      .getAllBulletinsFromOrganization(sessionStorage.organizationId)
      .then((results) => {
        let tempMeldinger: {
          id: string;
          type: string;
          status: string;
          bulletin: firebase.firestore.DocumentData;
        }[] = [];

        results.forEach((snapshot) =>
          snapshot?.forEach((doc) => {
            const data = doc.data();
            tempMeldinger = [...tempMeldinger, { id: doc.id, type: data.type, status: data.status, bulletin: data }];
          }),
        );
        setMeldinger(tempMeldinger);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [dbAccess]);

  return (
    <div className="globalSearch">
      <div className="globalSearch__header">
        <h1 className="darkBlue">Finn innhold i innbyggerkontakt</h1>
        <p className="settingsExplainText">Søk på navn, tekst i innhold eller tags for å finne det du leter etter.</p>
      </div>
      {loading ? (
        <Loader className="globalSearch__loader" />
      ) : (
        <Search
          list={meldinger}
          type={'search'}
          extended
          onClick={(e: BulletinMessage) => {
            switch (e?.bulletin?.status) {
              case 'active':
                if (e?.bulletin?.type === 'search') {
                  store.setBulletinId(e.id);
                  store.setBulletin(e.bulletin as Bulletin);
                  navigate(`/oversikt/planlagte/${e.id}`);
                }
                if (e?.bulletin?.type === 'event') {
                  store.setBulletinId(e.id);
                  store.setBulletin(e.bulletin as Bulletin);
                  navigate(`/oversikt/aktive/${e.id}`);
                }
                break;
              case 'draft':
                dbAccess.getBulletin(sessionStorage.organizationId, e.id, 'draft').then((bulletin) => {
                  store.setBulletinId(e.id);
                  store.setBulletin(bulletin as Bulletin);
                  navigate(`/oversikt/utkast/${e.id}`);
                });
                break;
              case 'finished':
                navigate(`/oversikt/utsendte/${e.id}`);
                break;
            }
          }}
        />
      )}
    </div>
  );
};

export default GlobalSearch;
