import vine, { errors } from '@vinejs/vine';

import apiConfig from '@/../Templates/AndesiteConfigs/api.json' with { type: 'json' };
import sampleScriptConfig from '@/../Templates/AndesiteConfigs/sample-script.json' with { type: 'json' };
import { AndesiteError } from '@/Common/Error/index.js';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { CommonErrorKeys, ServiceErrorKeys } from '@/Common/Error/Enum/index.js';
import { File } from '@/Common/Util/File.js';
import { stringifyToYml, parseYml } from '@/Common/Util/index.js';
import type { IAndesiteConfigDTO } from '@/DTO/index.js';

/**
 * Andesite Yml class to handle andesite-config.yml file. Extends ({@link File})
 */
export class AndesiteYml extends File {
    /**
     * Constructor of AndesiteYml
     *
     * @param path - Path to andesite-config.yml
     */
    public constructor(path: string = './andesite-config.yml') {
        super(path);
    }

    /**
     * Read andesite-config.yml file
     *
     * @throws ({@link AndesiteError}) If the file access is denied. ({@link CommonErrorKeys.ERROR_ACCESS_FILE})
     * @throws ({@link AndesiteError}) If the file read fails. ({@link CommonErrorKeys.ERROR_READ_FILE})
     * @throws ({@link AndesiteError}) If the config object is not an object. ({@link ServiceErrorKeys.ERROR_ANDESITE_YML_INVALID_CONFIG})
     *
     * @returns ({@link IAndesiteConfigDTO})
     */
    public async readConfig(): Promise<IAndesiteConfigDTO> {
        const config: Record<string, unknown> = this._loadEnvAndReplace(parseYml(this.read()) as Record<string, unknown>);
        await this._validateAndesiteConfig(config);
        return config as unknown as IAndesiteConfigDTO;
    }

    /**
     * Initialize andesite-config.yml file
     *
     * @param projectType - Project type (API or Script)
     *
     * @throws ({@link AndesiteError}) If the file already exists. ({@link ServiceErrorKeys.ERROR_ANDESITE_YML_EXISTS})
     * @throws ({@link AndesiteError}) If the file access is denied. ({@link CommonErrorKeys.ERROR_ACCESS_FILE})
     * @throws ({@link AndesiteError}) If the file read fails. ({@link CommonErrorKeys.ERROR_WRITE_FILE})
     */
    public initializeAndesiteYml(projectType: string): void {
        if (this.exists())
            throw new AndesiteError({
                messageKey: ServiceErrorKeys.ERROR_ANDESITE_YML_EXISTS,
                detail: this._path
            });
        if (projectType === 'API')
            this.write(stringifyToYml(apiConfig) as string);
        else if (projectType === 'Script')
            this.write(stringifyToYml(sampleScriptConfig) as string);
    }

    /**
     * Load environment variables and replace them in the config object
     *
     * @param config - It's a config object got from andesite-config.yml
     *
     * @throws ({@link AndesiteError}) If the config object is not an object. ({@link ServiceErrorKeys.ERROR_ANDESITE_YML_INVALID_CONFIG})
     *
     * @returns config object with replaced environment variables
     */
    private _loadEnvAndReplace(config: Record<string, unknown>): Record<string, unknown> {
        if (!config || typeof config !== 'object')
            throw new AndesiteError({
                messageKey: ServiceErrorKeys.ERROR_ANDESITE_YML_INVALID_CONFIG,
                detail: this._path
            });
        if (config && typeof config === 'object')
            for (const key in config)
                if (typeof config[key] === 'string' && /^\${.*}$/.test(config[key] as string)) {
                    const envKey = (config[key] as string).slice(2, -1);
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
     * @throws ({@link AndesiteError}) If the config object is not valid. ({@link ServiceErrorKeys.ERROR_ANDESITE_YML_INVALID_CONFIG})
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
            throw new AndesiteError({
                messageKey: ServiceErrorKeys.ERROR_ANDESITE_YML_INVALID_CONFIG,
                detail
            });
        }
    }
}
