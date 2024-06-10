import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { ChoiceSlider, GenderPicker, PersonStatusPicker, PostalCodeSelector } from '../../../../../../components';
import { AgeFilter, AGEFILTER_OPTIONS } from '../../../../../../models';
import { AgeSelectorAuto } from '../../../../components';
import { genderAlternatives, getDropDownValue, roleAlternatives } from '../../../../util';
import FilterButtonContainer from '../../FilterButtonContainer';
import './ChangeInAge.scss';

interface Props extends Partial<Pick<UseFormReturn, 'control'>> {
  setGender: (gender: string[]) => void;
  setStatus: (status: string[]) => void;
  setActivePostalcodes: (postalCodes: string[]) => void;
  setAgeValue: Dispatch<SetStateAction<AgeFilter | undefined>>;
  ageValue: AgeFilter | undefined;
  status: string[];
  gender: string[];
  activePostalCodes: string[];
  validateAgeFields: () => boolean | string;
  setRole: (gender: string) => void;
  role: string;
  errorMessage?: string;
}

const ChangeInAge: React.FC<Props> = ({
  setGender,
  setStatus,
  setActivePostalcodes,
  status,
  gender,
  activePostalCodes,
  setAgeValue,
  ageValue,
  errorMessage,
  setRole,
  role,
}) => {
  const [displayPostalcodes, setDisplayPostalcodes] = useState<boolean>();
  const [displayGender, setDisplayGender] = useState<boolean>();
  const [displayStatus, setDisplayStatus] = useState<boolean>();

  useEffect(() => {
    setDisplayPostalcodes(activePostalCodes.length > 0);
    setDisplayGender(gender.length > 0 && gender.length < genderAlternatives.length);
    setDisplayStatus(status.length > 0);
  }, []);

  useEffect(() => {
    displayPostalcodes !== undefined && !displayPostalcodes && setActivePostalcodes([]);
  }, [displayPostalcodes]);
  useEffect(() => {
    displayGender !== undefined && !displayGender && setGender([]);
  }, [displayGender]);
  useEffect(() => {
    displayStatus !== undefined && !displayStatus && setStatus([]);
  }, [displayStatus]);

  const filterButtons = [
    { label: 'Postkoder', state: displayPostalcodes, setState: setDisplayPostalcodes, defaultValue: [] },
    { label: 'Kjønn', state: displayGender, setState: setDisplayGender, defaultValue: [] },
    { label: 'Sivilstatus', state: displayStatus, setState: setDisplayStatus, defaultValue: [] },
  ];
  return (
    <div>
      <div className="lightBlueIngress changeInAge__wrapper">
        <h1 className="ingressTitle">Personer som fyller...</h1>
        <p>
          Velg en alder en innbygger oppnår, år eller måneder, som gjør at denne e-posten blir sendt til dem den samme
          dagen de fyller år/måneder. Du kan velge om du vil sende til den som fyller eller foreldre til personen som
          fyller.
        </p>
        <div className="ingressChoices">
          <AgeSelectorAuto
            eventType="endringIAlder"
            name={'ageSelector'}
            setValue={setAgeValue}
            errorMessage={errorMessage}
            ageValue={ageValue || { filter: AGEFILTER_OPTIONS.TURN_X_YEARS, label: 'År' }}
          />
          <ChoiceSlider
            title="Hvem skal få meldingen"
            options={roleAlternatives}
            onClick={(e) => setRole(getDropDownValue(roleAlternatives, e)?.value || roleAlternatives[0].value)}
            value={role || roleAlternatives[0].value}
            className="roleChoiceSlider"
            id="roleAlternatives"
          />
        </div>
      </div>

      <FilterButtonContainer filterButtons={filterButtons} />

      {displayPostalcodes && (
        <PostalCodeSelector onChange={setActivePostalcodes} postalCodes={activePostalCodes} onlyMultiselect={true} />
      )}
      {displayGender && <GenderPicker onChange={setGender} initialValues={gender} />}
      {displayStatus && <PersonStatusPicker onChange={setStatus} initialValues={status} />}
    </div>
  );
};

export default ChangeInAge;
