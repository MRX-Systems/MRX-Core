// Export utils
export * from './core/util/env';
export * from './core/util/json';
export * from './core/util/typebox';

// Exports of error classes
export * from './error/coreError';
export * from './error/key/configKeyError';

// Exports of i18n translation files
import arLocale from './i18n/ar.json' with { type: 'json' };
import deLocale from './i18n/de.json' with { type: 'json' };
import enLocale from './i18n/en.json' with { type: 'json' };
import esLocale from './i18n/es.json' with { type: 'json' };
import frLocale from './i18n/fr.json' with { type: 'json' };
import itLocale from './i18n/it.json' with { type: 'json' };
import jaLocale from './i18n/ja.json' with { type: 'json' };
import koLocale from './i18n/ko.json' with { type: 'json' };
export const ar = arLocale;
export const de = deLocale;
export const en = enLocale;
export const es = esLocale;
export const fr = frLocale;
export const it = itLocale;
export const ja = jaLocale;
export const ko = koLocale;

// Exports of TypeScript types
export type * from './types/enum/color';
export type * from './types/enum/httpStatusCode';
