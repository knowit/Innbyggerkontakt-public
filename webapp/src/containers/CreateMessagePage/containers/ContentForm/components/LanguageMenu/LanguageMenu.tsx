import Clear from '@mui/icons-material/Clear';
import { Button } from '../../../../../../components';
import { OptionType } from '../../../../../../models';
import { PlussDropdown } from '../index';
import './LanguageMenu.scss';

interface Props {
  chosenLanguages: OptionType[];
  languageOptions: OptionType[];
  activeLanguage: string;
  setActiveLanguage: (value: string) => void;
  // append fra react hook form har denne typen, sp kommer ikke unna any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  append: (value: Partial<Record<string, any>> | Partial<Record<string, any>>[]) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  appendObject?: Partial<Record<string, any>> | Partial<Record<string, any>>[];
  setChosenLanguages: (value: (OptionType | OptionType)[]) => void;
  deleteLanguage: (
    e: React.MouseEvent<SVGSVGElement, MouseEvent> | React.KeyboardEvent<SVGSVGElement>,
    lang: string,
  ) => void;
}
const LanguageMenu: React.FC<Props> = ({
  chosenLanguages,
  languageOptions,
  activeLanguage,
  setActiveLanguage,
  append,
  appendObject,
  setChosenLanguages,
  deleteLanguage,
}) => {
  const remainingLanguages = languageOptions.filter(
    (option) => !chosenLanguages.find((lang) => lang.value === option.value),
  );

  return (
    <div className="languageMenu">
      {chosenLanguages.map((chosenLanguage) => (
        <Button
          className={`languageTab geeks ${chosenLanguage.value === activeLanguage ? 'activeTab draw' : ''}`}
          key={chosenLanguage.value}
          onClick={() => setActiveLanguage(chosenLanguage.value)}
        >
          {chosenLanguage.label}
          {chosenLanguages.length > 1 && (
            <Clear
              onClick={(event) => {
                event.preventDefault();
                deleteLanguage(event, chosenLanguage.value);
              }}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault();
                  deleteLanguage(event, chosenLanguage.value);
                }
              }}
              tabIndex={0}
            />
          )}
        </Button>
      ))}
      {remainingLanguages.length > 0 && (
        <>
          <div className="addLanguageDropdown">
            <PlussDropdown
              key={'chooseLanguageDropdown'}
              options={remainingLanguages}
              onClick={(lang) => {
                setChosenLanguages([...chosenLanguages, lang as OptionType]);
                append(
                  appendObject
                    ? { ...appendObject, language: (lang as OptionType).value }
                    : { subject: '', previewText: '', language: (lang as OptionType).value },
                );
              }}
              showLongText={languageOptions.length - remainingLanguages.length <= 1}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default LanguageMenu;
