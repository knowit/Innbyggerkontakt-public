import { useContext, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { v4 as uuid } from 'uuid';
import { StoreContext } from '../../../../../../contexts';
import { Bulletin, BulletinRecipients, FilterTypes, FilterValues, RecipientsMatrikkel } from '../../../../../../models';
import RecipientsAddCancelButtons from '../../../../components/RecipientsAddCancelButtons/RecipientsAddCancelButtons';
import { FilterWrapper } from '../../components';

interface Props {
  onCancel: () => void;
  activeFilter: FilterValues['recipientFilter'];
  editMode: boolean;
  onSubmit: (bulletinToPost: Bulletin) => void;
  evaluatedFilter: FilterTypes | null;
}

export const MatrikkelFilter: React.FC<Props> = ({ onCancel, activeFilter, editMode, onSubmit, evaluatedFilter }) => {
  const { handleSubmit } = useForm();
  const store = useContext(StoreContext);

  const [fritidsboligeier, setFritidsboligeier] = useState<boolean>(false);

  const [regEier, setRegEier] = useState<boolean>(false);

  useEffect(() => {
    if (evaluatedFilter && editMode) {
      const matrikkelGroup = evaluatedFilter as RecipientsMatrikkel;
      setFritidsboligeier(matrikkelGroup.fritidsbolig);
      setRegEier(matrikkelGroup.osloReg);
    }
  }, []);

  const setFiltersForBulletin = (bulletinToStore: Bulletin) => {
    const prevRecipients: BulletinRecipients | undefined = bulletinToStore?.recipients;
    const filter: RecipientsMatrikkel = {
      id: evaluatedFilter?.id || uuid(),
      recipientFilter: activeFilter,
      fritidsbolig: fritidsboligeier,
      osloReg: regEier,
    };
    const recipients: BulletinRecipients = {
      ...prevRecipients,
      matrikkel: [filter],
    };
    const bulletin: Bulletin = {
      ...bulletinToStore,
      recipients,
    };
    return bulletin;
  };

  return (
    <FilterWrapper
      overskrift="Matrikkelen"
      infotekst="Matrikkelen gir informasjon om eiendommer innenfor din kommune. Bruk for eksempel for å finne folk som eier hytter."
      filterType="matrikkel"
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
        <span className="matrikkelFilter--span">Send til</span>
        <div className="recipientItemContent recipientItemContent--paddingTop">
          {/* input type checkbox må fikses også i alleFilter.tsx, får feil ved bruk av vår checkbox komponent */}
          <label className="recipientItemContent--label">
            <input
              type="checkbox"
              onChange={() => {
                setFritidsboligeier((fritidsboligeier) => !fritidsboligeier);
              }}
              checked={fritidsboligeier}
            />
            De som eier fritidseiendom i kommunen din
          </label>
        </div>
        {(store.sessionStorage.getItem('organizationId') === 'oslo_REG' ||
          store.sessionStorage.getItem('organizationId') === 'development') && (
          <FilterWrapper overskrift="Oslo REG" infotekst="Ekstra valg for Oslo REG." filterType="matrikkel">
            <span className="matrikkelFilter--span">Eiere</span>
            <div className="recipientItemContent recipientItemContent--paddingTop">
              {/* input type checkbox må fikses også i alleFilter.tsx, får feil ved bruk av vår checkbox komponent */}
              <label className="recipientItemContent--label">
                <input
                  type="checkbox"
                  onChange={() => {
                    setRegEier((regEier) => !regEier);
                  }}
                  checked={regEier}
                />
                Enebolig, tomannsbolig, rekkehus, kjedehus, andre småhus
              </label>
            </div>
          </FilterWrapper>
        )}
        <RecipientsAddCancelButtons onCancel={onCancel} editMode={editMode} disabled={!fritidsboligeier && !regEier} />
      </form>
    </FilterWrapper>
  );
};

export default MatrikkelFilter;
