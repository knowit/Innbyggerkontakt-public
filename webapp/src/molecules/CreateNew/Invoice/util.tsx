export const parseOrgNr = (orgnr: string): number => {
  const noSpacesOrgnr = orgnr.replace(/\s+/g, '');
  return noSpacesOrgnr.length;
};
