import Start from 'containers/CreateTemplatePage/containers/Start/Start';
import Summary from 'containers/CreateTemplatePage/containers/Summary/Summary';
import { Template, TemplateContent } from 'models';
import { Preview } from 'pages/CreateNewTemplate';
import Content from 'pages/CreateNewTemplate/Content/Content';
import { RoutesType } from '../Bulletin/utils';

interface RoutesProps {
  currentTemplate: Template | null;
  onClickNext: () => void;
}

export const validateStart = (template: Template | null): boolean => {
  if (!template) return false;
  //eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { contentArray, tags, ...rest } = template;
  return !Object.values(rest).some((value) => value === undefined || value === '') && (tags || []).length > 0;
};

export const validateContentArray = (content: TemplateContent[]): boolean => {
  if (content.length === 0) return false;
  let result = true;
  content.forEach((item) => {
    //eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { image, image_alt, ingress, ...rest } = item;
    if (Object.values(rest).some((value) => value === undefined || value === '')) {
      result = false;
    }
    if (image && !image_alt) {
      result = false;
    }
  });

  return result;
};

// routes is collection of all components and paths that occur in innbyggerkontakt/ create new bulletin
export const NewTemplateRoutes = ({ currentTemplate, onClickNext }: RoutesProps): RoutesType[] => [
  {
    path: 'start',
    title: 'Start',
    component: <Start onClickNext={onClickNext} />,
    channel: { email: 'felles' },
    filled: validateStart(currentTemplate),
  },
  {
    path: 'innhold',
    title: 'Innhold',
    component: <Content onClickNext={onClickNext} />,
    channel: { email: 'felles' },
    filled: validateContentArray(currentTemplate?.contentArray || []),
  },
  {
    path: 'forhaandsvisning',
    title: 'Forhåndsvisning',
    component: <Preview onClickNext={onClickNext} />,
    channel: { email: 'felles' },
    filled: false, // må huske på å lagre om man er fornøyd med perview
  },
  {
    path: 'oppsummering',
    title: 'Oppsummering',
    component: <Summary onClickNext={onClickNext} />,
    channel: { email: 'felles' },
    filled: false,
  },
];
