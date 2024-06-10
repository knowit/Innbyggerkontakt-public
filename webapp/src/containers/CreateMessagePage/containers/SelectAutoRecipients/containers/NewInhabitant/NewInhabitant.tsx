import { useEffect, useState } from 'react';
import {
  GenderPicker,
  PermanentAdressCheckbox,
  PersonStatusPicker,
  PostalCodeSelector,
} from '../../../../../../components';
import { AgeFilter } from '../../../../../../models';
import { FormAgeSelector } from '../../../../components';
import { genderAlternatives } from '../../../../util';
import FilterButtonContainer from '../../FilterButtonContainer';
import './NewInhabitant.scss';

interface Props {
  setGender: (gender: string[]) => void;
  setStatus: (status: string[]) => void;
  setActivePostalcodes: (postalCodes: string[]) => void;
  status: string[];
  gender: string[];
  activePostalCodes: string[];
  ageValue: AgeFilter | undefined;
  setAgeValue: React.Dispatch<React.SetStateAction<AgeFilter | undefined>>;
  errorMessage: string | undefined;
  inkludererOppholdsadresse: boolean;
  setInkludererOppholdsadresse: React.Dispatch<React.SetStateAction<boolean>>;
}

const NewInhabitant: React.FC<Props> = ({
  setGender,
  setStatus,
  setActivePostalcodes,
  status,
  gender,
  activePostalCodes,
  ageValue,
  setAgeValue,
  errorMessage,
  inkludererOppholdsadresse,
  setInkludererOppholdsadresse,
}) => {
  const [displayPostalcodes, setDisplayPostalcodes] = useState<boolean>();
  const [displayAge, setDisplayAge] = useState<boolean>();
  const [displayGender, setDisplayGender] = useState<boolean>();
  const [displayStatus, setDisplayStatus] = useState<boolean>();

  const filterButtons = [
    { label: 'Postkoder', state: displayPostalcodes, setState: setDisplayPostalcodes },
    { label: 'Alder', state: displayAge, setState: setDisplayAge },
    { label: 'Kjønn', state: displayGender, setState: setDisplayGender },
    { label: 'Sivilstatus', state: displayStatus, setState: setDisplayStatus },
  ];

  useEffect(() => {
    setDisplayPostalcodes(activePostalCodes.length > 0);
    setDisplayAge(ageValue !== undefined);
    setDisplayGender(gender.length > 0 && gender.length < genderAlternatives.length);
    setDisplayStatus(status.length > 0);
  }, []);

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
    displayStatus !== undefined && !displayStatus && setStatus([]);
  }, [displayStatus]);

  return (
    <div className="internalMoving">
      <div className="lightBlueIngress">
        <h1 className="ingressTitle">Nye innbyggere</h1>
        <p>
          Nye inbyggere er personer som endrer bostedadresse til en adresse i din kommune fra en adresse i en annen
          kommune. Du har flere muligheter til å filtrere ut på forskjellige kriterier under her, eller du kan sende til
          alle
        </p>
      </div>
      <PermanentAdressCheckbox
        setInkludererOppholdsadresse={setInkludererOppholdsadresse}
        inkludererOppholdsadresse={inkludererOppholdsadresse}
      />

      <FilterButtonContainer filterButtons={filterButtons} />

      {displayPostalcodes && (
        <PostalCodeSelector
          onChange={(e) => setActivePostalcodes(e)}
          postalCodes={activePostalCodes}
          onlyMultiselect={true}
        />
      )}
      {displayAge && <FormAgeSelector setValue={setAgeValue} ageValue={ageValue} errorMessage={errorMessage} />}
      {displayGender && <GenderPicker onChange={(e) => setGender(e)} initialValues={gender} />}
      {displayStatus && <PersonStatusPicker onChange={(e) => setStatus(e)} initialValues={status} />}
    </div>
  );
};

export default NewInhabitant;
