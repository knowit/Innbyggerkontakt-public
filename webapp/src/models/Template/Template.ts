import { BulletinContent, ContentInLanguage } from '../Bulletin/Bulletin';
import { Organization } from '../types';

export type TemplateApplication = {
  global_variables: [GlobalTemplateVariable];
  local_variables: [string];
  mailjet_template: number;
  name: string;
  html_part?: string;
};

export type GlobalTemplateVariable = {
  help_text: string;
  input_component: string;
  position: number;
  title: string;
  variable_name: string;
  mandatory?: boolean;
};

export type TemplateContent = {
  language: string;
  subject: string;
  previewText: string;
  image: string;
  image_alt: string;
  heading: string;
  ingress: string;
  content: string;
  reason: string;
};

export type TemplateType = 'draft' | 'published' | 'archived';

export interface Template {
  id?: string;
  orgId?: string;
  name?: string;
  description?: string;
  recipientDescription?: string;
  contentArray?: TemplateContent[];
  type?: TemplateType;
  tags?: string[];
  lastChanged?: string;
}

export type TemplateContextType = {
  template: Template | null;
  clearTemplate: () => void;
  setValues: (values: Template) => void;
};

export enum CategoryTagNames {
  SKOLE_OG_UTDANNING = 'Skole og Utdanning',
  HELSE_OG_OMSORG = 'Helse og Omsorg',
  TEKNISK = 'Teknisk',
  KULTUR = 'Kultur',
  ORGANISASJON = 'Organisasjon',
}

export const convertTemplateDataToBulletinData = (
  template: Template,
  organization: Organization | null | undefined,
): BulletinContent => {
  const contentInLanguage: ContentInLanguage[] =
    template.contentArray?.map(({ language, subject, previewText, ...rest }) => ({
      language,
      subject,
      previewText,
      variables: {
        begrunnelse: rest.reason,
        bilde: rest.image,
        bilde_alt: rest.image_alt,
        ingress: rest.ingress,
        feedback: '0',
        previewText,
        overskrift: rest.heading,
        innhold: rest.content,
      },
    })) ?? [];
  return {
    contentInLanguage,
    defaultLanguage: 'nb',
    from: {
      email: organization?.defaultEmailAddress ?? 'kommune@kommune.no',
      name: organization?.navn ?? 'Kommunen',
    },
  };
};
