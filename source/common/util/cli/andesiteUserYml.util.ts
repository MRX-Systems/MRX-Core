import { File } from '@basalt-lab/basalt-helper';
import vine, { errors } from '@vinejs/vine';

import andesiteConfig from '#/../template/andesiteConfig.json' with { type: 'json' };
import { CoreError, ErrorKeys } from '#/common/error/index.ts';
import type { AndesiteConfig } from '#/common/types/index.ts';
import { parseYml, stringifyToYml } from '#/common/util/index.ts';

/**
 * AndesiteUserYmlSingleton class to handle andesite-config.yml file. (Singleton)
 * Inherit from the File class ({@link File})
 */
export class AndesiteUserYmlSingleton extends File {
    /**
     * The instance of the AndesiteUserYmlSingleton class. ({@link AndesiteUserYmlSingleton})
     */
    public static _instance: AndesiteUserYmlSingleton | undefined;

    /**
     * Constructor of AndesiteUserYmlSingleton
     *
     * @param path - Path to andesite-config.yml
     */
    private constructor(path: string) {
        super(path);
    }

    /**
     * Gets the instance of the AndesiteUserYmlSingleton class.
     *
     * @returns Instance of AndesiteUserYmlSingleton. ({@link AndesiteUserYmlSingleton})
     */
    public static getInstance(path: string): AndesiteUserYmlSingleton {
        if (!this._instance)
            this._instance = new AndesiteUserYmlSingleton(path);
        return this._instance;
    }

    /**
     * Read andesite-config.yml file
     *
     * @throws ({@link BasaltError}) If the file access is denied. ({@link ErrorKeys.ERROR_ACCESS_FILE})
     * @throws ({@link BasaltError}) If the file read fails. ({@link ErrorKeys.ERROR_READ_FILE})
     * @throws ({@link CoreError}) If the config object is not an object. ({@link ErrorKeys.ANDESITE_YML_INVALID_CONFIG})
     *
     * @returns ({@link AndesiteConfig})
     */
    public async readConfig(): Promise<AndesiteConfig> {
        const config: Record<string, unknown> = this._loadEnvAndReplace(parseYml(this.read()) as Record<string, unknown>);
        await this._validateAndesiteConfig(config);
        return config as unknown as AndesiteConfig;
    }

    /**
     * Initialize andesite-config.yml file
     *
     * @param projectType - Project type (API or Script)
     *
     * @throws ({@link CoreError}) If the file already exists. ({@link ErrorKeys.ANDESITE_YML_EXISTS})
     * @throws ({@link BasaltError}) If the file access is denied. ({@link ErrorKeys.ERROR_ACCESS_FILE})
     * @throws ({@link BasaltError}) If the file read fails. ({@link ErrorKeys.ERROR_WRITE_FILE})
     */
    public initializeAndesiteYml(projectType: string): void {
        if (this.exists())
            throw new CoreError({
                messageKey: ErrorKeys.ANDESITE_YML_EXISTS,
                detail: this._path
            });
        if (projectType === 'API') {
            andesiteConfig.ProjectType = 'API';
            this.write(stringifyToYml(andesiteConfig));
        } else if (projectType === 'Script') {
            andesiteConfig.ProjectType = 'Script';
            this.write(stringifyToYml(andesiteConfig));
        }
    }

    /**
     * Load environment variables and replace them in the config object
     *
     * @param config - It's a config object got from andesite-config.yml
     *
     * @throws ({@link CoreError}) If the config object is not an object. ({@link ErrorKeys.ANDESITE_YML_INVALID_CONFIG})
     *
     * @returns config object with replaced environment variables
     */
    private _loadEnvAndReplace(config: Record<string, unknown>): Record<string, unknown> {
        if (!config || typeof config !== 'object')
            throw new CoreError({
                messageKey: ErrorKeys.ANDESITE_YML_INVALID_CONFIG,
                detail: this._path
            });
        if (config && typeof config === 'object')
            for (const key in config)
                if (typeof config[key] === 'string' && /^\${.*}$/.test(config[key])) {
                    const envKey = (config[key]).slice(2, -1);
                    if (envKey in process.env)
                        config[key] = process.env[envKey];
                    else
                        config[key] = '';
                } else if (typeof config[key] === 'object') {
                    this._loadEnvAndReplace(config[key] as Record<string, unknown>);
                }
        return config;
    }

    /**
     * Validate andesite-config.yml file
     *
     * @param config - It's a config object got from andesite-config.yml
     *
     * @throws ({@link CoreError}) If the config object is not valid. ({@link ErrorKeys.ANDESITE_YML_INVALID_CONFIG})
     */
    private async _validateAndesiteConfig(config: Record<string, unknown>): Promise<void> {
        const schema = vine.object({
            ProjectType: vine.enum(['API', 'Script']),
            Config: vine.object({
                BaseSourceDir: vine.string(),
                EntryPoint: vine.string(),
                OutputDir: vine.string(),
                PathAlias: vine.string(),
            }),
        });
        try {
            await vine.validate({ schema, data: config });
        } catch (error) {
            const isValidationError = error instanceof errors.E_VALIDATION_ERROR;
            const detail = isValidationError ? error.messages : [''];
            throw new CoreError({
                messageKey: ErrorKeys.ANDESITE_YML_INVALID_CONFIG,
                detail
            });
        }
    }
}

export const AndesiteUserYml = AndesiteUserYmlSingleton.getInstance('./andesite-config.yml');
