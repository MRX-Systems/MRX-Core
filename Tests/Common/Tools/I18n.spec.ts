// import i18next from 'i18next';

import { I18n } from '../../../Source/Common/Tools';
// import { ErrorCommon, ErrorCommonCode } from '../../../Source//Common/Errors';

describe('I18n', () => {
    describe('initI18n', () => {

        beforeEach(async () => {
            const resources = {
                en: {
                    translation: {
                        test: 'Test',
                    },
                },
            };
            await I18n.initI18n(resources, 'en');
        });

        afterEach(() => {
            if (I18n.isI18nInitialized())
                I18n.resetI18n();
        });

        it('should translate and translate with fallback', async () => {
            expect(I18n.translate('test', 'en')).toBe('Test');
            expect(I18n.translate('test')).toBe('Test');
        });


        it('should translate with interpolation', async () => {
            if (I18n.isI18nInitialized())
                I18n.resetI18n();
            const resources = {
                en: {
                    translation: {
                        test: 'Test {{value}}',
                    },
                },
            };
            await I18n.initI18n(resources, 'en');
            expect(I18n.translate('test', 'en', { value: 'hello' })).toBe('Test hello');
        });
        
        it('should throw an error if i18n is already initialized', async () => {
            const resources = {
                en: {
                    translation: {
                        test: 'Test',
                    },
                },
            };
            await expect(I18n.initI18n(resources)).rejects.toThrow('I18N_IS_ALREADY_INITIALIZED');
        });

        it ('should throw an error if i18n is not initialized when we try to reset it', async () => {
            I18n.resetI18n();
            expect(() => I18n.resetI18n()).toThrow('I18N_NOT_INITIALIZED');
        });

        it ('should throw an error if i18n is not initialized when we try to translate', () => {
            I18n.resetI18n();
            expect(() => I18n.translate('test')).toThrow('I18N_NOT_INITIALIZED');
        });
    });
});