import { ErrorMessage, Loading } from 'innbyggerkontakt-design-system';
import { useContext, useEffect, useLayoutEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { v4 as uuid } from 'uuid';
import {
  GenderPicker,
  PermanentAdressCheckbox,
  PersonStatusPicker,
  PostalCodeSelector,
} from '../../../../../../components';
import { StoreContext } from '../../../../../../contexts';
import {
  AgeFilter,
  AGEFILTER_OPTIONS,
  Bulletin,
  BulletinRecipients,
  FilterTypes,
  FilterValues,
  RecipientsQuery,
} from '../../../../../../models';
import { FormAgeSelector } from '../../../../components';
import RecipientsAddCancelButtons from '../../../../components/RecipientsAddCancelButtons/RecipientsAddCancelButtons';
import { civilStatusAlternatives, genderAlternatives, validateAgeSelector } from '../../../../util';
import FilterButtonContainer from '../../../SelectAutoRecipients/FilterButtonContainer';
import { FilterWrapper } from '../../components';
import { onFilterEdit } from '../../searchUtil';

import './FolkeregisterFilter.scss';
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
export const FolkeregisterFilter: React.FC<Props> = ({
  onCancel,
  activeFilter,
  editMode,
  onSubmit,
  evaluatedFilter,
}) => {
  const preloadedValues = {
    ageSelector: '',
  };
  const store = useContext(StoreContext);

  const [gender, setGender] = useState<string[]>([]);
  const [relationshipStatus, setRelationshipStatus] = useState<string[]>([]);
  const [ageValue, setAgeValue] = useState<AgeFilter>();
  const [inkludererOppholdsadresse, setInkludererOppholdsadresse] = useState<boolean>(false);
  const [activePostalCodes, setActivePostalcodes] = useState<string[]>([]);

  const [displayPostalcodes, setDisplayPostalcodes] = useState<boolean>();
  const [displayAge, setDisplayAge] = useState<boolean>();
  const [displayGender, setDisplayGender] = useState<boolean>();
  const [displayStatus, setDisplayStatus] = useState<boolean>();

  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  useLayoutEffect(() => {
    const queryGroup = evaluatedFilter as RecipientsQuery | null;
    setRelationshipStatus(
      queryGroup?.sivilstandtype || civilStatusAlternatives.map((civilStatus) => civilStatus.value),
    );
    if (evaluatedFilter && editMode) {
      const activePostalCodesFromFilter = queryGroup?.postnummer || [];
      const genderFromFilter = queryGroup?.kjoenn && queryGroup?.kjoenn.split(',');
      setAgeValue(queryGroup?.alder);
      setActivePostalcodes(activePostalCodesFromFilter);
      setInkludererOppholdsadresse(queryGroup?.inkludererOppholdsadresse || false);
      setGender(genderFromFilter || genderAlternatives.map((gender) => gender.value));
      setRelationshipStatus(
        queryGroup?.sivilstandtype || civilStatusAlternatives.map((civilStatus) => civilStatus.value),
      );

      setDisplayPostalcodes(activePostalCodesFromFilter.length > 0);
      setDisplayAge(queryGroup?.alder !== undefined && queryGroup?.alder?.filter !== AGEFILTER_OPTIONS.EVERYONE);
      setDisplayGender(
        !!genderFromFilter && genderFromFilter.length > 0 && genderFromFilter.length < genderAlternatives.length,
      );
      setDisplayStatus(
        queryGroup?.sivilstandtype &&
          queryGroup?.sivilstandtype.length > 0 &&
          queryGroup?.sivilstandtype.length < civilStatusAlternatives.length,
      );
    }
  }, []);

  const {
    control,
    formState: { errors },
    handleSubmit,
    trigger,
  } = useForm<Inputs>({
    defaultValues: preloadedValues,
    shouldFocusError: true,
  });

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
      sivilstandtype: relationshipStatus,
      mottager: 'self',
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

  useEffect(() => {
    displayPostalcodes !== undefined && !displayPostalcodes && setActivePostalcodes([]);
  }, [displayPostalcodes]);
  useEffect(() => {
    displayAge !== undefined && !displayAge && setAgeValue(undefined);
  }, [displayAge]);
  useEffect(() => {
    displayGender !== undefined && !displayGender && setGender([]);
  }, [displayGender]);
  useEffect(() => {
    displayStatus !== undefined && !displayStatus && setRelationshipStatus([]);
  }, [displayStatus]);

  const filterButtons = [
    { label: 'Postkoder', state: displayPostalcodes, setState: setDisplayPostalcodes },
    { label: 'Alder', state: displayAge, setState: setDisplayAge },
    { label: 'Kjønn', state: displayGender, setState: setDisplayGender },
    { label: 'Sivilstatus', state: displayStatus, setState: setDisplayStatus },
  ];

  const filterButtonsSMS = [
    { label: 'Alder', state: displayAge, setState: setDisplayAge },
    { label: 'Kjønn', state: displayGender, setState: setDisplayGender },
    { label: 'Sivilstatus', state: displayStatus, setState: setDisplayStatus },
  ];

  useEffect(() => {
    if (errors?.ageSelector) {
      trigger();
    }
  }, [ageValue]);

  return (
    <FilterWrapper
      overskrift="Folkeregisteret"
      infotekst="Folkeregisteret som har info som alder, kjønn, bostedsadresse og så videre. Bruk for eksempel for å finne alle
under 18."
      filterType="folkeregister"
    >
      <form
        className="folkeregisterFilter__form"
        onSubmit={handleSubmit(() => {
          if (store.currentBulletin && store.currentBulletinId) {
            const bulletinToPost = setFiltersForBulletin(store.currentBulletin);
            setLoading(true);
            store.dbAccess
              .checkForPotentialOverwrite(store.currentBulletinId)
              .then(() => {
                store.dbAccess.persistBulletin(bulletinToPost, store.currentBulletinId).then(() => {
                  onSubmit(bulletinToPost);
                  store.setBulletin(bulletinToPost);
                });
              })
              .catch((error) => setError(error.message))
              .finally(() => {
                setTimeout(() => {
                  setLoading(false);
                }, 2000);
              });
          } else {
            setError('Det har skjedd en ukjent feil, vennligst kontakt vår support');
          }
        })}
      >
        {loading ? (
          <Loading />
        ) : (
          <div className="folkeregisterFilter">
            <PermanentAdressCheckbox
              setInkludererOppholdsadresse={setInkludererOppholdsadresse}
              inkludererOppholdsadresse={inkludererOppholdsadresse}
            />
            <div className="folkeregisterFilter--filterButton">
              <FilterButtonContainer
                filterButtons={store.currentBulletin?.channel.name === 'email' ? filterButtons : filterButtonsSMS}
              />
              {displayPostalcodes && (
                <PostalCodeSelector
                  onChange={setActivePostalcodes}
                  postalCodes={activePostalCodes}
                  onlyMultiselect={true}
                />
              )}
              {displayAge && (
                <Controller
                  render={({ field }) => (
                    <FormAgeSelector
                      className="folkeregisterFilter--age"
                      setValue={setAgeValue}
                      ageValue={ageValue}
                      errorMessage={errors?.ageSelector?.message}
                      {...field}
                    />
                  )}
                  control={control}
                  name={'ageSelector'}
                  rules={{
                    validate: () => {
                      return validateAgeSelector(ageValue);
                    },
                  }}
                />
              )}
              {displayGender && <GenderPicker onChange={(e) => setGender(e)} initialValues={gender} />}
              {displayStatus && (
                <PersonStatusPicker onChange={(e) => setRelationshipStatus(e)} initialValues={relationshipStatus} />
              )}
            </div>
            {error && (
              <ErrorMessage
                color={'error'}
                errorTitle={'Det har skjedd en feil, feilmeldingen er:'}
                errorMessage={error}
                onClose={() => setError('')}
              />
            )}
          </div>
        )}

        <RecipientsAddCancelButtons onCancel={onCancel} editMode={editMode} />
      </form>
    </FilterWrapper>
  );
};

export default FolkeregisterFilter;
