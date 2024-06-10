import { ContentInLanguage } from '../../models';
import './LanguagePicker.scss';

interface Props {
  contentInLanguage: ContentInLanguage[] | undefined;
  language: string;
  setLanguage: (language: string) => void;
  setLanguageIndex: (index: number) => void;
}

const LanguagePicker: React.FC<Props> = ({ language, contentInLanguage, setLanguage, setLanguageIndex }) => {
  const languageMap: Record<string, string> = {
    nb: 'Bokmål',
    en: 'Engelsk',
    nn: 'Nynorsk',
    se: 'Samisk',
  };

  return (
    <div className="languagePicker">
      {contentInLanguage?.map((content, index) => (
        <button
          className={language === content.language ? 'languageButton languageButton--active' : 'languageButton'}
          key={content.language}
          value={content.language}
          onClick={() => {
            setLanguage(content.language);
            setLanguageIndex(index);
          }}
        >
          {languageMap[content.language]}
        </button>
      ))}
    </div>
  );
};

export default LanguagePicker;
