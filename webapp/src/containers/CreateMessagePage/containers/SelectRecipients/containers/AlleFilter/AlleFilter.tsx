import { useContext, useLayoutEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { v4 as uuid } from 'uuid';
import { StoreContext } from '../../../../../../contexts';
import { Bulletin, BulletinRecipients, FilterTypes, FilterValues, RecipientsQuery } from '../../../../../../models';
import RecipientsAddCancelButtons from '../../../../components/RecipientsAddCancelButtons/RecipientsAddCancelButtons';
import { FilterWrapper } from '../../components';

interface Props {
  onCancel: () => void;
  activeFilter: FilterValues['recipientFilter'];
  editMode: boolean;
  onSubmit: (bulletinToPost: Bulletin) => void;
  evaluatedFilter: FilterTypes | null;
}
export const AlleFilter: React.FC<Props> = ({ onCancel, activeFilter, editMode, onSubmit, evaluatedFilter }) => {
  const { handleSubmit } = useForm();
  const store = useContext(StoreContext);

  const [inkludererOppholdsadresse, setInkludererOppholdsadresse] = useState<boolean>(false);

  useLayoutEffect(() => {
    if (evaluatedFilter && editMode) {
      const queryGroup = evaluatedFilter as RecipientsQuery;
      setInkludererOppholdsadresse(!!queryGroup.inkludererOppholdsadresse);
    }
  }, []);

  const setFiltersForBulletin = (bulletinToStore: Bulletin) => {
    const prevRecipients: BulletinRecipients | undefined = bulletinToStore?.recipients;
    const filter: RecipientsQuery = {
      id: evaluatedFilter?.id || uuid(),
      recipientFilter: activeFilter,
      inkludererOppholdsadresse: inkludererOppholdsadresse,
      kommunenummer: bulletinToStore?.kommunenummer || '',
    };
    const recipients: BulletinRecipients = {
      ...prevRecipients,
      query: [filter],
    };
    const bulletin: Bulletin = {
      ...bulletinToStore,
      recipients,
    };
    return bulletin;
  };

  return (
    <FilterWrapper
      overskrift="Alle i din kommune"
      infotekst="Hvis du ønsker å nå alle i din kommune. Du får valg om å også sende til de som bor der midlertidig."
      ekstraInfotekst="Nå alle som er registrert som fastboende i kommunen din. Hvis du vil nå flere enn disse kan du
      krysse av under her for å nå andre som og har tilknytning til kommunen din. Hvis en person oppfyller flere av
      kriteriene vil den fortsatt bare få én e-post."
      filterType="alle"
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
        <div className="recipientItemContent">
          <div className="adresseCheckbox">
            <h3>Send og til:</h3>
            <div>
              <label>
                <input
                  type="checkbox"
                  onChange={() => setInkludererOppholdsadresse(!inkludererOppholdsadresse)}
                  checked={inkludererOppholdsadresse}
                />
                De som har oppholdsadresse men ikke er permanente innbyggere
              </label>
            </div>
          </div>
        </div>
        <RecipientsAddCancelButtons onCancel={onCancel} editMode={editMode} />
      </form>
    </FilterWrapper>
  );
};

export default AlleFilter;
