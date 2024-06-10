import { useContext, useEffect, useLayoutEffect, useState } from 'react';
import { MultiValue, OnChangeValue } from 'react-select';
import { StoreContext } from '../../contexts';
import { OptionType } from '../../models';
import { ChoiceSlider, Multiselect } from '../index';
import './PostalCodeSelector.scss';

interface Props {
  onChange: (e: string[]) => void;
  postalCodes?: string[];
  className?: string;
  name?: string;
  onlyMultiselect?: boolean;
  mandatory?: boolean;
  errorMessage?: string;
}

export const PostalCodeSelector: React.FC<Props> = ({
  onChange,
  postalCodes,
  className,
  name,
  onlyMultiselect = false,
  mandatory,
  errorMessage,
}) => {
  const chooseValue = 'choose';
  const allValue = 'all';
  const store = useContext(StoreContext);

  const [choice, setChoice] = useState<string>(allValue);

  const [activePostalCodes, setActivePostalcodes] = useState<OnChangeValue<OptionType, true>>(
    postalCodes?.map((code) => ({ label: code, value: code })) || [],
  );
  const [postalCodeOptions, setPostalCodeOptions] = useState<OptionType[]>([]);

  const dbAccess = store.dbAccess;

  useLayoutEffect(() => {
    dbAccess.getPostalCodes().then((res) => {
      const postalCodeOptions = res.map((postalCode) => ({ label: postalCode, value: postalCode }));
      setPostalCodeOptions(postalCodeOptions);
    });
  }, []);

  useEffect(() => {
    setActivePostalcodes(postalCodes?.map((code) => ({ label: code, value: code })) || []);
    setChoice(postalCodes && postalCodes.length > 0 ? chooseValue : allValue);
  }, [postalCodeOptions]);

  const setPostalCodes = (codeOptions: OnChangeValue<OptionType, true>) => {
    setActivePostalcodes(codeOptions as OnChangeValue<OptionType, true>);
    onChange((codeOptions as OptionType[])?.map((postalCode) => postalCode.value));
  };

  const showMultiselect = onlyMultiselect || (choice && choice === chooseValue);

  return (
    <div className={`postalCodeSelector ${className || ''}`}>
      {!onlyMultiselect && (
        <ChoiceSlider
          options={[
            { label: 'Alle postnummer', value: allValue },
            { label: 'Send til utvalgte', value: chooseValue },
          ]}
          onClick={(e) => {
            if (e === allValue) {
              setPostalCodes([]);
            }
            setChoice(e);
          }}
          className="choiceSliderPostalcode"
          title="Postnummer"
          value={choice}
        />
      )}
      {showMultiselect && (
        <Multiselect
          placeholder="Velg postnummer"
          onChange={(e: unknown) => setPostalCodes(e as MultiValue<OptionType>)}
          value={activePostalCodes}
          options={postalCodeOptions}
          title={'Postnummer'}
          info="Velg ett eller flere postnummer i din kommune"
          name={name}
          showTitle={onlyMultiselect}
          mandatory={mandatory}
          errorMessage={errorMessage}
        />
      )}
    </div>
  );
};

export default PostalCodeSelector;
