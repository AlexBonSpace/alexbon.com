export type TranslationPrimitive = string | number | boolean | Date;
export type TranslationValues = Record<string, TranslationPrimitive>;
export type TranslateFn = (key: string, values?: TranslationValues) => string;
