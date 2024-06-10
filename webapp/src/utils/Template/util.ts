import { Template, TemplateContent, TemplateType } from '../../models';

export const validTemplate = (template: Template | null): TemplateContent | undefined => {
  if (template && template.contentArray && template?.contentArray?.length > 0) {
    return template?.contentArray[0];
  }
  return undefined;
};

interface CardImageProps {
  src: string;
  text: string;
}

export const getTemplateImage = (template: Template): CardImageProps | undefined => {
  const validatedTemplate = validTemplate(template);
  if (!validatedTemplate?.image) return undefined;

  return { src: validatedTemplate?.image ?? '', text: validatedTemplate?.image_alt ?? '' };
};

export const filterTemplate = (template: Template, searchTerm: string, toggledFilters: string[], byType = true) => {
  return (
    filterOnSearch(template, searchTerm) &&
    (byType ? filterOnToggleTypes(template, toggledFilters) : filterOnToggleCategories(template, toggledFilters))
  );
};

const filterOnSearch = (template: Template, searchTerm: string) => {
  if (!template.name) {
    return false;
  }
  if (!template.name.toLowerCase().includes(searchTerm.toLowerCase())) {
    return false;
  }
  return true;
};

const filterOnToggleTypes = (template: Template, toggledFilters: string[]) => {
  if (toggledFilters.length < 3 && toggledFilters.length > 0) {
    const found = toggledFilters.includes(template?.type || '');
    return !!found;
  }

  if (toggledFilters.length === 3 || toggledFilters.length === 0) {
    return true;
  }
};

const filterOnToggleCategories = (template: Template, toggledFilters: string[]) => {
  if (toggledFilters.length == 0) return true;

  for (const filter of toggledFilters) {
    if (template.tags?.includes(filter)) {
      return true;
    }
  }

  return false;
};

export const sortTemplatesAfterDates = (a: Template, b: Template) => {
  if (!a.lastChanged || Number.isNaN(Date.parse(a.lastChanged))) {
    return -1;
  } else if (!b.lastChanged || Number.isNaN(Date.parse(b.lastChanged))) {
    return 1;
  }

  return new Date(b.lastChanged).getTime() - new Date(a.lastChanged).getTime();
};

export const sortTemplatesAfterNames = (a: Template, b: Template, reverse = false) => {
  const aName = (a.name ?? '').split(' ');
  const bName = (b.name ?? '').split(' ');

  for (let i = 0; i < aName.length; i++) {
    const result = aName[i].localeCompare(bName[i], 'nb');
    if (result !== 0) {
      return result;
    } else if (i === aName.length - 1 || i === bName.length - 1) {
      return reverse ? 1 : -1;
    }
  }
  return 0;
};

export const translateTemplateTypes = (types: string[]): string[] => {
  return types.map((type) => {
    switch (type) {
      case 'Publisert':
        return 'published';
      case 'Utkast':
        return 'draft';
      case 'Arkiverte':
        return 'archived';
      default:
        return type;
    }
  });
};

export const translateTemplateTypesToNorwegian = (types: string[]): string[] => {
  return types.map((type) => {
    switch (type.toLocaleLowerCase()) {
      case 'published':
        return 'Publisert';
      case 'draft':
        return 'Utkast';
      case 'archived':
        return 'Arkivert';
      default:
        return type;
    }
  });
};

export const formatTemplateType = (tag: TemplateType) => {
  if (tag === 'archived') return 'Arkivert';
  if (tag === 'draft') return 'Utkast';
  if (tag === 'published') return 'Publisert';
  return 'Ukjent';
};
