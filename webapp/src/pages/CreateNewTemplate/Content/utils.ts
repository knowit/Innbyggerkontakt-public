export const regexOutImgWidth = (imageSource: string) => {
  const reg = new RegExp(/<img.+?>/gm);

  const replacer = (match: string) => {
    const innerReg = new RegExp(/(min-width:.*?%;|max-width: .*?%;|width: .*?%;)/gm);
    return match.replaceAll(innerReg, '');
  };

  if (!imageSource) {
    return imageSource;
  }

  let check = imageSource;
  check = check.replaceAll(reg, replacer);
  return check;
};
