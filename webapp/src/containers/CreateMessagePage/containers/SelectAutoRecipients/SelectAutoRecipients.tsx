import { useContext, useEffect, useLayoutEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router';
import { Loader } from '../../../../components';
import { PopUpContext, StoreContext } from '../../../../contexts';
import { AgeFilter, Bulletin, BulletinRecipients, RecipientsQuery } from '../../../../models';
import { CreateMessageError, CreateMessageHeader, NavigationButton } from '../../components';
import { genderAlternatives, roleAlternatives, validateAgeSelector } from '../../util';
import ChangeInAge from './containers/ChangeInAge/ChangeInAge';
import InternalMoving from './containers/InternalMoving/InternalMoving';
import NewInhabitant from './containers/NewInhabitant/NewInhabitant';
import './SelectAutoRecipients.scss';

interface Props {
  onClickNext: () => void;
}

type Inputs = {
  ageSelector: string;
  internalMoving: string;
  newInhabitant: string;
};

const SelectAutoRecipients: React.FC<Props> = ({ onClickNext }) => {
  const store = useContext(StoreContext);
  const { setPopUp } = useContext(PopUpContext);
  const dbAccess = store.dbAccess;
  const currentBulletinId = store.currentBulletinId;
  const navigate = useNavigate();
  const currentBulletin = store.currentBulletin;

  const [gender, setGender] = useState<string[]>([]);
  const [relationshipStatus, setRelationshipStatus] = useState<string[]>([]);

  const [role, setRole] = useState<string>('');
  const [ageValue, setAgeValue] = useState<AgeFilter>();
  const preloadedValues = { ageSelector: '', internalMoving: '' };
  const [activePostalCodes, setActivePostalcodes] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [inkluderOppholdsadresse, setInkluderOppholdsadresse] = useState<boolean>(false);

  const {
    handleSubmit,
    formState: { errors },
    control,
    trigger,
  } = useForm<Inputs>({
    defaultValues: preloadedValues,
    shouldFocusError: true,
  });

  useLayoutEffect(() => {
    const query = currentBulletin?.recipients?.query?.[0];
    if (query) {
      setGender(query?.kjoenn ? [query?.kjoenn] : genderAlternatives.map((gender) => gender.value));
      setRelationshipStatus(query?.sivilstandtype || []);
      setRole(query?.mottager || roleAlternatives[0].value);
      setAgeValue(query?.alder);
      setActivePostalcodes(() => {
        setIsLoading(false);
        return query?.postnummer || [];
      });
      setInkluderOppholdsadresse(query?.inkludererOppholdsadresse || false);
    } else {
      setIsLoading(false);
    }
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (errors?.ageSelector || errors?.internalMoving || errors?.newInhabitant) {
      trigger();
    }
  }, [ageValue, activePostalCodes]);

  const validateAgeFields = () => {
    const year = ageValue?.filter === 'turnXYears';
    const month = ageValue?.filter === 'turnXMonths';
    const days = ageValue?.filter === 'turnXDays';
    const validNumber = !!ageValue?.age && ageValue?.age !== '';
    return ((year || month || days) && validNumber) || '! Feltet er obligatorisk';
  };

  const postBulletin = () => {
    const filter: RecipientsQuery = {
      recipientFilter: 'event',
      alder: ageValue,
      inkludererOppholdsadresse: inkluderOppholdsadresse,
      kjoenn: gender.length === 1 ? gender[0] : '',
      kommunenummer: currentBulletin?.kommunenummer,
      postnummer: activePostalCodes,
      sivilstandtype: relationshipStatus,
      mottager: currentBulletin?.recipients?.event?.eventType === 'endringIAlder' ? role : undefined,
    };

    if (currentBulletin) {
      const recipients: BulletinRecipients = {
        ...currentBulletin.recipients,
        query: [filter],
      };

      const bulletin: Bulletin = {
        ...currentBulletin,
        recipients,
      };
      if (currentBulletinId) {
        dbAccess.persistBulletin(bulletin, currentBulletinId);
      }
      store.setBulletin(bulletin);
    }
    onClickNext();
  };

  const post = () =>
    dbAccess
      .checkForPotentialOverwrite(currentBulletinId)
      .then(() => postBulletin())
      .catch((reason: string) =>
        setPopUp(<CreateMessageError popUpMessage={reason} onPopUpAccept={() => navigate('/oversikt')} />),
      );

  // TODO: Endre layput for å få med årsak. (Bytte ut med identifikator, ettersom den muligens ikke kommer til å brukes?)
  // årsak = Flytting innen kommunen|Innflytting til annen kommune|Adresseendring fra matrikkelen|Adressekorreksjon

  const switchFilterSelector = () => {
    switch (currentBulletin?.recipients?.event?.eventType) {
      case 'endringIAlder':
        return (
          <Controller
            render={({ field }) => (
              <ChangeInAge
                setGender={setGender}
                setStatus={setRelationshipStatus}
                setAgeValue={setAgeValue}
                setActivePostalcodes={setActivePostalcodes}
                gender={gender}
                status={relationshipStatus}
                activePostalCodes={activePostalCodes}
                ageValue={ageValue}
                validateAgeFields={validateAgeFields}
                role={role}
                setRole={setRole}
                errorMessage={errors?.ageSelector?.message}
                {...field}
              />
            )}
            control={control}
            name="ageSelector"
            rules={{
              validate: () => {
                return validateAgeFields();
              },
            }}
          />
        );
      case 'flyttingInnenKommune':
        return (
          <Controller
            render={({ field }) => (
              <InternalMoving
                setGender={setGender}
                setStatus={setRelationshipStatus}
                setActivePostalcodes={setActivePostalcodes}
                gender={gender}
                status={relationshipStatus}
                activePostalCodes={activePostalCodes}
                errorMessage={errors?.internalMoving?.message}
                ageValue={ageValue}
                setAgeValue={setAgeValue}
                inkludererOppholdsadresse={inkluderOppholdsadresse}
                setInkludererOppholdsadresse={setInkluderOppholdsadresse}
                {...field}
              />
            )}
            name="internalMoving"
            control={control}
            rules={{
              validate: () => {
                return (
                  (activePostalCodes?.length > 0 && validateAgeSelector(ageValue)) ||
                  'Postnummer for flyttingen må være definert'
                );
              },
            }}
          />
        );
      case 'flyttingTilKommune':
        return (
          <Controller
            render={({ field }) => (
              <NewInhabitant
                setGender={setGender}
                setStatus={setRelationshipStatus}
                setActivePostalcodes={setActivePostalcodes}
                gender={gender}
                status={relationshipStatus}
                activePostalCodes={activePostalCodes}
                ageValue={ageValue}
                setAgeValue={setAgeValue}
                errorMessage={errors?.newInhabitant?.message}
                inkludererOppholdsadresse={inkluderOppholdsadresse}
                setInkludererOppholdsadresse={setInkluderOppholdsadresse}
                {...field}
              />
            )}
            name="newInhabitant"
            control={control}
            rules={{
              validate: () => {
                return validateAgeSelector(ageValue) || '! Må være gyldig intervall/alder';
              },
            }}
          />
        );
    }
  };

  return (
    <>
      <form className="autoRecipientsForm" onSubmit={handleSubmit(post)}>
        {!isLoading ? (
          <div className="autoPage">
            <CreateMessageHeader title="Mottakere" />
            {switchFilterSelector()}
          </div>
        ) : (
          <Loader />
        )}
        <NavigationButton />
      </form>
    </>
  );
};

export default SelectAutoRecipients;
