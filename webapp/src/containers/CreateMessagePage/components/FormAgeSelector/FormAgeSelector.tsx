import { SetStateAction, useContext, useEffect, useLayoutEffect, useState } from 'react';
import { StoreContext } from '../../../../contexts';

import { AgeFilter, AGEFILTER_OPTIONS, OptionType } from '../../../../models';
import { SelectBetween } from '../index';

import { Dropdown, Input } from '../../../../components';
import DateSelection from '../../../../components/DateSelection/DateSelection';

import './FormAgeSelector.scss';
interface Props {
  eventType?: string | undefined;
  setValue: React.Dispatch<SetStateAction<AgeFilter | undefined>>;
  ageValue?: AgeFilter;
  disabled?: boolean;
  className?: string;
  mandatory?: boolean;
  errorMessage?: string;
}

export type OptionTypeWithValue = {
  value: string;
  label: string;
  stateValue: Record<string, string>;
};

const FormAgeSelector: React.FC<Props> = ({ className = '', mandatory, setValue, errorMessage, ageValue }) => {
  const store = useContext(StoreContext);

  const [toDate, setToDate] = useState<Date | undefined>(undefined);
  const [fromDate, setFromDate] = useState<Date | undefined>(undefined);

  const [afterDate, setAfterDate] = useState<Date | undefined>(undefined);
  const [beforeDate, setBeforeDate] = useState<Date | undefined>(undefined);

  const [fromAge, setFromAge] = useState('');
  const [toAge, setToAge] = useState('');

  const [olderThan, setOlderThan] = useState('');
  const [youngerThan, setYoungerThan] = useState('');

  const [age, setAge] = useState('');

  const [foedselsaarFraOgMed, setFoedselsaarFraOgMed] = useState<string>('');
  const [foedselsaarTilOgMed, setFoedselsaarTilOgMed] = useState<string>('');

  const dateObjectToDateFormat = (dateObject?: Date) => {
    dateObject && dateObject.setMinutes(dateObject.getMinutes() - dateObject.getTimezoneOffset());
    return dateObject?.toISOString().split('T')[0];
  };

  const ageDropdownOptionsWithValues = [
    { value: 'everyone', label: 'Alle aldre', stateValue: { youngerThan: '999' } },
    { value: 'olderThan', label: 'Eldre enn', stateValue: { olderThan } },
    { value: 'youngerThan', label: 'Yngre enn', stateValue: { youngerThan } },
    { value: 'ageBetween', label: 'Alder mellom', stateValue: { fromAge, toAge } },
    {
      value: 'afterDate',
      label: 'Født etter (dato)',
      stateValue: { afterDate: dateObjectToDateFormat(afterDate) },
    },
    {
      value: 'beforeDate',
      label: 'Født før (dato)',
      stateValue: { beforeDate: dateObjectToDateFormat(beforeDate) },
    },
    {
      value: 'betweenDate',
      label: 'Født mellom (dato)',
      stateValue: {
        fromDate: dateObjectToDateFormat(fromDate),
        toDate: dateObjectToDateFormat(toDate),
      },
    },
  ];

  const SMSageDropdownOptions = [
    {
      value: 'foedselsaarFraOgTilOgMed',
      label: 'Fødselsår',
      stateValue: { foedselsaarFraOgMed: foedselsaarFraOgMed, foedselsaarTilOgMed: foedselsaarTilOgMed },
    },
  ];

  const SMSorEmailOptions =
    store.currentBulletin?.channel.name === 'email' ? ageDropdownOptionsWithValues : SMSageDropdownOptions;

  const ageDropdownOptions: OptionType[] = SMSorEmailOptions.map((dropDownOption) => ({
    value: dropDownOption.value,
    label: dropDownOption.label,
  }));

  const [dropDownOption, setDropdownOption] = useState<OptionType | null>(ageDropdownOptions[0]);

  useLayoutEffect(() => {
    const initialOption =
      ageDropdownOptions.find((option) => option.value === ageValue?.filter) || ageDropdownOptions[0];

    setDropdownOption(initialOption);
    switch (ageValue?.filter) {
      case 'olderThan':
        setOlderThan(ageValue?.olderThan as string);
        break;
      case 'ageBetween':
        setFromAge(ageValue?.fromAge as string);
        setToAge(ageValue?.toAge as string);
        break;
      case 'youngerThan':
        setYoungerThan(ageValue?.youngerThan as string);
        break;
      case 'afterDate':
        setAfterDate(new Date(ageValue?.afterDate as string));
        break;
      case 'beforeDate':
        setBeforeDate(new Date(ageValue?.beforeDate as string));
        break;
      case 'betweenDate':
        setToDate(new Date(ageValue?.toDate as string));
        setFromDate(new Date(ageValue?.fromDate as string));
        break;
      case 'foedselsaarFraOgTilOgMed':
        setFoedselsaarFraOgMed(ageValue.foedselsaarFraOgMed as string);
        setFoedselsaarTilOgMed(ageValue.foedselsaarTilOgMed as string);
        break;
      default:
        setAge(ageValue?.age as string);
        break;
    }
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (dropDownOption) {
      const currentValue = dropDownOption as OptionTypeWithValue;
      const currentStateValueObject =
        store.currentBulletin?.channel.name === 'email'
          ? ageDropdownOptionsWithValues.find((option) => currentValue.value === option.value)
          : SMSageDropdownOptions.find((option) => currentValue.value === option.value);

      if (currentStateValueObject) {
        const resultingObject: AgeFilter = {
          filter: currentStateValueObject.value as AGEFILTER_OPTIONS,
          ...currentStateValueObject.stateValue,
          label: currentStateValueObject.label,
        };
        setValue(resultingObject);
      } else {
        setValue(undefined);
      }
    }
    // eslint-disable-next-line
  }, [
    dropDownOption,
    toDate,
    fromDate,
    afterDate,
    beforeDate,
    fromAge,
    toAge,
    olderThan,
    youngerThan,
    age,
    foedselsaarFraOgMed,
    foedselsaarTilOgMed,
  ]);

  return (
    <>
      <div className={`ageDropdown ${className} ${errorMessage ? 'formError' : ''}`}>
        <Dropdown
          options={ageDropdownOptions}
          isClearable={false}
          value={dropDownOption as OptionType}
          onChange={(e: unknown) => setDropdownOption(e as OptionType)}
          title={'Alder'}
        />
        {dropDownOption && (
          <>
            {(dropDownOption as OptionType).value === 'betweenDate' && (
              <SelectBetween title="" className="ageBetweenDates">
                <DateSelection
                  onChange={setFromDate}
                  date={fromDate}
                  required={mandatory}
                  className="fromDate"
                  placeholderText={'Velg en dato'}
                  dateFormat="dd.MM.yyyy"
                  showTitle={false}
                />
                <p className="betweenAnd">og</p>
                <DateSelection
                  onChange={setToDate}
                  date={toDate}
                  required={mandatory}
                  className="toDate"
                  dateFormat="dd.MM.yyyy"
                  placeholderText={'Velg en dato'}
                  showTitle={false}
                />
              </SelectBetween>
            )}
            {(dropDownOption as OptionType).value === 'afterDate' && (
              <DateSelection
                onChange={setAfterDate}
                date={afterDate}
                required={mandatory}
                placeholderText={'Velg en dato'}
                className="afterDate"
                dateFormat="dd.MM.yyyy"
                showTitle={true}
              />
            )}
            {(dropDownOption as OptionType).value === 'beforeDate' && (
              <DateSelection
                onChange={setBeforeDate}
                date={beforeDate}
                required={mandatory}
                placeholderText={'Velg en dato'}
                className="beforeDate"
                dateFormat="dd.MM.yyyy"
                showTitle={true}
              />
            )}
            {(dropDownOption as OptionType).value === 'ageBetween' && (
              <SelectBetween title="" className="ageBetween">
                <Input
                  placeholder=""
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFromAge(e.target.value)}
                  className="betweenFromAge betweenField"
                  value={fromAge}
                  type="number"
                  pattern="^-?[0-9]\d*\.?\d*$"
                  showTitle={false}
                  min="0"
                />
                <p className="years">År</p>
                <p className="years--betweenAnd">og</p>
                <Input
                  placeholder=""
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setToAge(e.target.value)}
                  className="betweenToAge betweenField"
                  value={toAge}
                  type="number"
                  pattern="^-?[0-9]\d*\.?\d*$"
                  showTitle={false}
                  min="0"
                />
                <p className="years">År</p>
              </SelectBetween>
            )}
            {(dropDownOption as OptionType).value === 'olderThan' && (
              <SelectBetween title="" className="flexStart">
                <Input
                  placeholder=""
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setOlderThan(e.target.value)}
                  className="olderThan"
                  value={olderThan}
                  type="number"
                  pattern="^-?[0-9]\d*\.?\d*$"
                  showTitle={false}
                  min="0"
                />
                <p className="years">År</p>
              </SelectBetween>
            )}
            {(dropDownOption as OptionType).value === 'youngerThan' && (
              <SelectBetween title="" className="flexStart">
                <Input
                  placeholder=""
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setYoungerThan(e.target.value)}
                  className="youngerThan"
                  value={youngerThan}
                  type="number"
                  pattern="^-?[0-9]\d*\.?\d*$"
                  showTitle={false}
                  min="0"
                />
                <p className="years">År</p>
              </SelectBetween>
            )}
            {(dropDownOption as OptionType).value === 'foedselsaarFraOgTilOgMed' && (
              <SelectBetween title="" className="foedselsaar">
                <div className="selectBetweenFields--foedselsaar--flex">
                  <p className="ageSelector--foedselsaar">Fødselsår fra og med</p>
                  <Input
                    placeholder="1900"
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFoedselsaarFraOgMed(e.target.value)}
                    value={foedselsaarFraOgMed}
                    type="number"
                    showTitle={false}
                    min="0"
                  />
                </div>
                <div className="selectBetweenFields--foedselsaar--flex">
                  <p className="ageSelector--foedselsaar">Fødselsår til og med</p>
                  <Input
                    placeholder={new Date().getFullYear().toString()}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFoedselsaarTilOgMed(e.target.value)}
                    value={foedselsaarTilOgMed}
                    type="number"
                    showTitle={false}
                    min="0"
                  />
                </div>
              </SelectBetween>
            )}
          </>
        )}
      </div>
      {errorMessage && <p className="errorMessage">{errorMessage}</p>}
    </>
  );
};

export default FormAgeSelector;
