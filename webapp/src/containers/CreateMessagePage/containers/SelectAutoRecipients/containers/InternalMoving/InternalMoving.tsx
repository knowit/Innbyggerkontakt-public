import { useEffect, useState } from 'react';
import {
  GenderPicker,
  PermanentAdressCheckbox,
  PersonStatusPicker,
  PostalCodeSelector,
} from '../../../../../../components';
import { AgeFilter } from '../../../../../../models';
import { FormAgeSelector } from '../../../../components';
import { genderAlternatives, validateAgeSelector } from '../../../../util';
import FilterButtonContainer from '../../FilterButtonContainer';
import './InternalMoving.scss';

interface Props {
  setGender: (gender: string[]) => void;
  setStatus: (status: string[]) => void;
  setActivePostalcodes: (postalCodes: string[]) => void;
  status: string[];
  gender: string[];
  activePostalCodes: string[];
  name: string;
  errorMessage?: string;
  ageValue: AgeFilter | undefined;
  setAgeValue: React.Dispatch<React.SetStateAction<AgeFilter | undefined>>;
  inkludererOppholdsadresse: boolean;
  setInkludererOppholdsadresse: React.Dispatch<React.SetStateAction<boolean>>;
}

const InternalMoving: React.FC<Props> = ({
  setGender,
  setStatus,
  setActivePostalcodes,
  status,
  gender,
  activePostalCodes,
  errorMessage,
  name,
  ageValue,
  setAgeValue,
  inkludererOppholdsadresse,
  setInkludererOppholdsadresse,
}) => {
  const [displayAge, setDisplayAge] = useState<boolean>();
  const [displayGender, setDisplayGender] = useState<boolean>();
  const [displayStatus, setDisplayStatus] = useState<boolean>();

  const [ageError, setAgeError] = useState<boolean>(false);

  const filterButtons = [
    { label: 'Alder', state: displayAge, setState: setDisplayAge },
    { label: 'Kjønn', state: displayGender, setState: setDisplayGender },
    { label: 'Sivilstatus', state: displayStatus, setState: setDisplayStatus },
  ];

  useEffect(() => {
    setDisplayAge(ageValue !== undefined);
    setDisplayGender(gender.length > 0 && gender.length < genderAlternatives.length);
    setDisplayStatus(status.length > 0);
  }, []);

  useEffect(() => {
    displayAge !== undefined && !displayAge && setAgeValue(undefined);
  }, [displayAge]);
  useEffect(() => {
    displayGender !== undefined && !displayGender && setGender([]);
  }, [displayGender]);
  useEffect(() => {
    displayStatus !== undefined && !displayStatus && setStatus([]);
  }, [displayStatus]);

  useEffect(() => {
    setAgeError(errorMessage !== undefined && validateAgeSelector(ageValue) !== true);
  }, [ageValue, errorMessage]);

  return (
    <div className="internalMoving">
      <div className="lightBlueIngress">
        <h1 className="ingressTitle">Innbyggere som flytter internt i kommunen</h1>
        <p>
          Personer som bor i din kommune, men endrer bostedadresse til en ny adresse i din kommune, med nytt postnummer.
          Du har flere muligheter å filtrere ut på forskjellige kriterier under her, eller du kan sende til alle
        </p>

        <PostalCodeSelector
          onChange={setActivePostalcodes}
          postalCodes={activePostalCodes}
          onlyMultiselect={true}
          errorMessage={errorMessage && activePostalCodes.length === 0 ? errorMessage : ''}
          mandatory
          name={name}
        />
      </div>

      <PermanentAdressCheckbox
        setInkludererOppholdsadresse={setInkludererOppholdsadresse}
        inkludererOppholdsadresse={inkludererOppholdsadresse}
      />

      <FilterButtonContainer filterButtons={filterButtons} />

      {displayAge && (
        <FormAgeSelector
          setValue={setAgeValue}
          ageValue={ageValue}
          errorMessage={ageError ? 'Vennligst fyll inn gyldig alder/intervall' : ''}
        />
      )}
      {displayGender && <GenderPicker onChange={setGender} initialValues={gender} />}
      {displayStatus && <PersonStatusPicker onChange={setStatus} initialValues={status} />}
    </div>
  );
};

export default InternalMoving;
