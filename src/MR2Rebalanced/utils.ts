export const t = (value: string, replacements: Record<string, string>) => {
  let retval = value;
  for (let key in replacements) {
    retval = retval.replace(new RegExp(`{{${key}}}`, "g"), replacements[key]);
  }
  return retval;
};
