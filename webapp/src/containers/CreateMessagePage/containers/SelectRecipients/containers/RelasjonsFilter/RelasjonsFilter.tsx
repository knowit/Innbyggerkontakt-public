import { useContext, useLayoutEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { v4 as uuid } from 'uuid';
import { GenderPicker, PermanentAdressCheckbox, PostalCodeSelector } from '../../../../../../components';
import { StoreContext } from '../../../../../../contexts';
import {
  AgeFilter,
  Bulletin,
  BulletinRecipients,
  FilterTypes,
  FilterValues,
  RecipientsQuery,
} from '../../../../../../models';
import { FormAgeSelector } from '../../../../components';
import RecipientsAddCancelButtons from '../../../../components/RecipientsAddCancelButtons/RecipientsAddCancelButtons';
import { genderAlternatives, validateAgeSelector } from '../../../../util';
import { FilterWrapper } from '../../components';
import { onFilterEdit } from '../../searchUtil';
import './RelasjonsFilter.scss';

interface Props {
  onCancel: () => void;
  activeFilter: FilterValues['recipientFilter'];
  editMode: boolean;
  onSubmit: (bulletinToPost: Bulletin) => void;
  evaluatedFilter: FilterTypes | null;
}

type Inputs = {
  ageSelector: string;
};
export const RelasjonsFilter: React.FC<Props> = ({ onCancel, activeFilter, editMode, onSubmit, evaluatedFilter }) => {
  const preloadedValues = {
    ageSelector: '',
  };
  const store = useContext(StoreContext);

  const [gender, setGender] = useState<string[]>([]);
  const [ageValue, setAgeValue] = useState<AgeFilter>();
  const [inkludererOppholdsadresse, setInkludererOppholdsadresse] = useState<boolean>(false);
  const [activePostalCodes, setActivePostalcodes] = useState<string[]>([]);
  const [relation, setRelation] = useState<string>('parent');

  useLayoutEffect(() => {
    if (evaluatedFilter && editMode) {
      const queryGroup = evaluatedFilter as RecipientsQuery;
      setAgeValue(queryGroup.alder);
      setActivePostalcodes(queryGroup.postnummer || []);
      setInkludererOppholdsadresse(queryGroup.inkludererOppholdsadresse || false);
      setGender(
        (queryGroup.kjoenn && queryGroup.kjoenn.split(',')) || genderAlternatives.map((gender) => gender.value),
      );
      // Ettersom det kun er 1 valg per nå
      setRelation(queryGroup.mottager || 'parent');
    }
  }, []);

  const setFiltersForBulletin = (bulletinToStore: Bulletin) => {
    const prevQueryFilter: RecipientsQuery[] = (bulletinToStore?.recipients?.query || []).filter(
      (queryFilter) => queryFilter.recipientFilter !== 'alle',
    );
    const prevRecipients: BulletinRecipients | undefined = bulletinToStore?.recipients;
    const filter = {
      id: evaluatedFilter?.id || uuid(),
      recipientFilter: activeFilter,
      alder: ageValue,
      inkludererOppholdsadresse: inkludererOppholdsadresse,
      kjoenn: gender.length === 1 ? gender[0] : '',
      kommunenummer: bulletinToStore?.kommunenummer || '',
      mottager: relation,
      postnummer: activePostalCodes,
    };
    if (!(editMode && evaluatedFilter)) {
      const recipients: BulletinRecipients = {
        ...prevRecipients,
        query: [...prevQueryFilter, filter],
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

  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<Inputs>({
    defaultValues: preloadedValues,
    shouldFocusError: true,
  });

  return (
    <FilterWrapper
      overskrift="Relasjon"
      infotekst="Søk i folkeregisteret og nå de med en relasjon, for eksempel foreldre til et barn."
      ekstraInfotekst="Søk i folkeregisteret og nå de med en relasjon, for eksempel foreldre til et barn."
      filterType="relasjon"
    >
      <h3 className="relationTitle">Relasjon</h3>
      <p className="regular14 gray">Send til de som er</p>
      <div className="clickableBlueBorder" onClick={() => setRelation('parent')}>
        <div
          style={relation === 'parent' ? { background: '#0E72ED', color: 'white' } : {}}
          className="recipientsBlueBorderButton"
        >
          Foresatte til
        </div>
      </div>
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
          {(() => {
            switch (relation) {
              case 'parent':
                return (
                  <div className="recipientContent">
                    <Controller
                      control={control}
                      render={({ field }) => (
                        <FormAgeSelector
                          {...field}
                          setValue={setAgeValue}
                          errorMessage={errors['ageSelector']?.message}
                          ageValue={ageValue}
                        />
                      )}
                      name={'ageSelector'}
                      rules={{
                        validate: () => {
                          return validateAgeSelector(ageValue);
                        },
                      }}
                    />
                    <PostalCodeSelector onChange={setActivePostalcodes} postalCodes={activePostalCodes} />
                    <GenderPicker onChange={(e) => setGender(e)} initialValues={gender} />
                  </div>
                );
              default:
                return <div />;
            }
          })()}
          {relation ? (
            <PermanentAdressCheckbox
              setInkludererOppholdsadresse={setInkludererOppholdsadresse}
              inkludererOppholdsadresse={inkludererOppholdsadresse}
            />
          ) : null}
        </div>
        <RecipientsAddCancelButtons onCancel={onCancel} editMode={editMode} />
      </form>
    </FilterWrapper>
  );
};

export default RelasjonsFilter;
