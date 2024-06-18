// Import vine from '@vinejs/vine';
import { parse } from 'yaml';

import apiConfig from '@/../Templates/AndesiteConfigs/api.json';
import sampleScriptConfig from '@/../Templates/AndesiteConfigs/sample-script.json';
import { AndesiteError } from '@/Common/Error';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { CommonErrorKeys, ServiceErrorKeys } from '@/Common/Error/Enum';
import { stringify } from '@/Common/Util';
import { File } from '@/Common/Util/File';
import type { IAndesiteApiConfigDTO, IAndesiteSampleScriptConfigDTO } from '@/DTO';

/**
 * Project type (API or Sample Script)
 */
export type ProjectType = 'API' | 'Sample Script';

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
        super({
            path,
        });
    }

    /**
     * Read andesite-config.yml file
     *
     * @throws ({@link AndesiteError}) If the file access is denied. ({@link CommonErrorKeys.ERROR_ACCESS_FILE})
     * @throws ({@link AndesiteError}) If the file read fails. ({@link CommonErrorKeys.ERROR_READ_FILE})
     *
     * @returns ({@link IAndesiteApiConfigDTO}) or ({@link IAndesiteSampleScriptConfigDTO})
     */
    public readConfig(): IAndesiteApiConfigDTO | IAndesiteSampleScriptConfigDTO {
        const config: unknown = this._loadEnvAndReplace(parse(this.read()) as Record<string, unknown>);
        this._checkAndesiteYmlConfig(config);
        return config as IAndesiteApiConfigDTO | IAndesiteSampleScriptConfigDTO;
    }

    /**
     * Initialize andesite-config.yml file
     *
     * @param projectType - Project type (API or Sample Script)
     *
     * @throws ({@link AndesiteError}) If the file already exists. ({@link ServiceErrorKeys.ERROR_ANDESITE_YML_EXISTS})
     * @throws ({@link AndesiteError}) If the file access is denied. ({@link CommonErrorKeys.ERROR_ACCESS_FILE})
     * @throws ({@link AndesiteError}) If the file read fails. ({@link CommonErrorKeys.ERROR_WRITE_FILE})
     */
    public initializeAndesiteYml(projectType: ProjectType): void {
        if (this.exists())
            throw new AndesiteError({
                messageKey: ServiceErrorKeys.ERROR_ANDESITE_YML_EXISTS,
                detail: this._path
            });
        switch (projectType) {
        case 'API':
            this.write(stringify(apiConfig));
            break;
        case 'Sample Script':
            this.write(stringify(sampleScriptConfig));
            break;
        default:
            this.write('');
        }
    }

    /**
     * Load environment variables and replace them in the config object
     *
     * @param config - It's a config object got from andesite-config.yml
     *
     * @returns config object with replaced environment variables
     */
    private _loadEnvAndReplace(config: Record<string, unknown>): unknown {
        if (config && typeof config === 'object')
            for (const key in config)
                if (typeof config[key] === 'string' && /^\${.*}$/.test(config[key] as string)) {
                    const envKey = (config[key] as string).slice(2, -1);
                    if (envKey in process.env)
                        config[key] = process.env[envKey];
                } else if (typeof config[key] === 'object') {
                    this._loadEnvAndReplace(config[key] as Record<string, unknown>);
                }
        return config;
    }

    /*
     * Private async _checkAndesiteApiConfig(config: IAndesiteApiConfigDTO): Promise<void> {
     *     const schema = vine.object({
     *         ProjectType: vine.enum(['API', 'Sample Script']),
     *         Config: vine.object({
     */

    /*
     *         }),
     *         Server: vine.object({
     *             Host: vine
     *                 .string()
     *                 .optional()
     *                 .requiredWhen('ProjectType', '=', 'API'),
     *             Port: vine.unionOfTypes([
     *                 vine
     *                     .number()
     *                     .positive()
     *                     .min(1024)
     *                     .withoutDecimals()
     *                     .optional()
     *                     .requiredWhen('ProjectType', '=', 'API'),
     *                 vine
     *                     .string()
     *                     .optional()
     *                     .requiredWhen('ProjectType', '=', 'API')
     *             ]),
     *             BaseUrl: vine
     *                 .string()
     *                 .optional()
     *                 .requiredWhen('ProjectType', '=', 'API'),
     *             Logger: vine
     *                 .boolean()
     *                 .optional()
     *                 .requiredWhen('ProjectType', '=', 'API'),
     *         }).optional(),
     *     });
     *     await vine.validate({
     *         schema,
     *         data: config,
     *     });
     * }
     */

    /**
     * Detect project type from andesite-config.yml (API or Sample Script)
     *
     * @param config - config object got from andesite-config.yml
     *
     * @throws ({@link AndesiteError}) If the project type is invalid. ({@link ServiceErrorKeys.ERROR_ANDESITE_YML_INVALID_PROJECT_TYPE})
     *
     * @returns ({@link ProjectType}) or void
     */
    private _detectProjectType(config: unknown): ProjectType | void {
        if (config && typeof config === 'object' && 'ProjectType' in config)
            switch ((config as Record<string, unknown>).ProjectType) {
            case 'API':
                return 'API';
            case 'Sample Script':
                return 'Sample Script';
            default:
                throw new AndesiteError({
                    messageKey: ServiceErrorKeys.ERROR_ANDESITE_YML_INVALID_PROJECT_TYPE,
                    detail: (config as Record<string, unknown>).ProjectType
                });
            }
        throw new AndesiteError({
            messageKey: ServiceErrorKeys.ERROR_ANDESITE_YML_INVALID_PROJECT_TYPE
        });
    }

    /**
     * Check andesite-config.yml config
     *
     * @param config - config object got from andesite-config.yml
     */
    private _checkAndesiteYmlConfig(config: unknown): void {
        const projectType: ProjectType = this._detectProjectType(config) as ProjectType;

        switch (projectType) {
        case 'API':
            // Await this._checkAndesiteApiConfig(config as IAndesiteApiConfigDTO);
            break;
        case 'Sample Script':
            break;
        default:
            break;
        }
    }
}
