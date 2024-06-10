import { ContentInLanguage, GlobalTemplateVariable } from 'models';
import { generateUrl } from 'utils/util';

export const generateUrlObject = (lang: string, currentBulletinId: string, orgId: string, feedback: boolean) =>
  feedback
    ? ['positive', 'neutral', 'negative'].reduce(
        (accum, feedbackValue) => ({
          ...accum,
          [feedbackValue + '_smiley']: generateUrl(feedbackValue, lang, currentBulletinId, orgId),
        }),
        {},
      )
    : { positive_smiley: '', neutral_smiley: '', negative_smiley: '' };

export const updateContentInLanguageVariable = (
  field: string,
  value: string,
  activeLanguage: string,
  contentInLanguage: ContentInLanguage[],
) => {
  const languageIndex = contentInLanguage.findIndex((content) => content.language === activeLanguage);

  if (languageIndex !== -1) {
    const contentInLanguageEntry = contentInLanguage[languageIndex];
    const updatedVariables = contentInLanguageEntry.variables;
    updatedVariables[field] = value;
    const updatedEntry = { ...contentInLanguageEntry, variables: updatedVariables };
    const updatedContent = contentInLanguage.slice();
    updatedContent[languageIndex] = updatedEntry;
    return updatedContent;
  }
  const variables: Record<string, string> = {};
  variables[field] = value;
  const content: ContentInLanguage = {
    language: activeLanguage,
    subject: '',
    variables,
  };
  return [...contentInLanguage, content];
};

export const sortByPosition = (globalVariable1: GlobalTemplateVariable, globalVariable2: GlobalTemplateVariable) => {
  if (globalVariable1.position > globalVariable2.position) {
    return 1;
  }
  if (globalVariable1.position < globalVariable2.position) {
    return -1;
  }
  return 0;
};

export const errorMessages: Record<string, string> = {
  subject: 'Emnefeltet trenger tittel',
  previewText: 'Meldingen trenger en forhåndsvisningstekst',
  bilde: '',
  bilde_alt: 'Bildet må ha en alternativ bildetekst for skjermlesere',
  overskrift: 'E-posten din må ha en overskrift',
  innhold: 'E-posten din må ha et innhold',
  begrunnelse:
    'E-posten din må ha en begrunnelse for å forklare innbyggerne hvordan kommunen har tilgang til kontaktinformasjonen deres',
};

export const getDefaultLanguage = () => {
  const organization = sessionStorage.getItem('organization');
  if (organization) {
    const data = JSON.parse(organization);
    return data.defaultLanguage;
  }
};

export const getLanguageOptions = [
  { value: 'nb', label: 'Bokmål' },
  { value: 'nn', label: 'Nynorsk' },
  { value: 'en', label: 'Engelsk' },
  { value: 'se', label: 'Samisk' },
];

export interface Inputs {
  subjectAndPreviewArray: Record<string, string>[];
}
