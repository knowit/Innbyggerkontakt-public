import { SetStateAction, useEffect, useState } from 'react';
import { OnChangeValue } from 'react-select';
import { Dropdown, FormWrapper, Input } from '../../../../components';
import { AgeFilter, AGEFILTER_OPTIONS, OptionType } from '../../../../models';

import './AgeSelectorAuto.scss';

export const ageTypeAlternatives = [
  { value: 'turnXYears', label: 'År' },
  { value: 'turnXMonths', label: 'Måneder' },
];

interface Props {
  eventType?: string | undefined;
  setValue: React.Dispatch<SetStateAction<AgeFilter | undefined>>;
  ageValue?: AgeFilter;

  disabled?: boolean;
  className?: string;

  mandatory?: boolean;
  name?: string;
  errorMessage?: string;
}

const AgeSelectorAuto: React.FC<Props> = ({ className = '', setValue, errorMessage, ageValue }) => {
  const [age, setAge] = useState(ageValue?.age || '1');

  const [ageFilter, setAgeFilter] = useState<OnChangeValue<OptionType, false>>(
    ageTypeAlternatives.find((alt) => alt.value === ageValue?.filter) || null,
  );

  useEffect(() => {
    const currentValue = ageFilter as OptionType;
    const resultingObject: AgeFilter | undefined =
      currentValue !== null && currentValue.value
        ? {
            filter: currentValue.value as AGEFILTER_OPTIONS,
            age,
            label: currentValue.label,
          }
        : undefined;
    setValue(resultingObject);
  }, [ageFilter, age]);

  return (
    <FormWrapper title={'Personer som fyller'} showTitle={true} errorMessage={errorMessage}>
      <div className={`ageField ${className} ${errorMessage ? 'formError' : ''}`}>
        <Input
          placeholder="1"
          title={'Alder som oppfylles '}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAge(e.target.value)}
          className="turnXYears"
          value={age}
          min="0"
          type="number"
          pattern="^?[0-9]\d*\.?\d*$"
          showTitle={false}
        />
        <Dropdown
          options={ageTypeAlternatives}
          showTitle={false}
          isClearable={false}
          value={ageFilter}
          onChange={(e: unknown) => setAgeFilter(e as OptionType)}
        />
      </div>
    </FormWrapper>
  );
};

export default AgeSelectorAuto;
