import slugifyLib from "slugify";

export const slugifyText = (text: string): string => {
  if (!text || typeof text !== "string") return "";

  return slugifyLib(text.trim(), {
    replacement: "-",
    remove: /[*+~.()'"!:@]/g,
    lower: true,
    strict: true,
    locale: "en",
    trim: true,
  });
};
