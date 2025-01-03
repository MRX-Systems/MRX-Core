//                  Common Layer                    //
// Config Sub-Layer
export * from './common/config/typebox.config.ts';

// Error Sub-Layer
export * from './common/error/core.error.ts';
export * from './common/error/key/config.error.ts';
export * from './common/error/key/util.error.ts';

// I18n Sub-Layer
import ar from './common/i18n/ar.json' with { type: 'json' };
import de from './common/i18n/de.json' with { type: 'json' };
import en from './common/i18n/en.json' with { type: 'json' };
import es from './common/i18n/es.json' with { type: 'json' };
import fr from './common/i18n/fr.json' with { type: 'json' };
import it from './common/i18n/it.json' with { type: 'json' };
import ja from './common/i18n/ja.json' with { type: 'json' };
import ko from './common/i18n/ko.json' with { type: 'json' };
export { ar, de, en, es, fr, it, ja, ko };

// Util Sub-Layer
export * from './common/util/color.util.ts';
export * from './common/util/other.util.ts';
// ------------------------------------------------ //