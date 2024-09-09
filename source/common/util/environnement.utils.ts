import { CoreError, ErrorKeys } from '#/common/error/index.js';
import { type SchemaTypes, vine } from '#/common/types/index.js';

import { File } from '@basalt-lab/basalt-helper';
import { cwd, env } from 'process';

/**
 * EnvironnementUser class is responsible for managing the environment variables. (Singleton)
 * Inherit from the File class ({@link File})
 */
class EnvironmentUserSingleton extends File {
    /**
     * The instance of the EnvironnementUser class. ({@link EnvironmentUserSingleton})
     */
    private static _instance: EnvironmentUserSingleton | undefined;

    /**
     * The environment variables.
     */
    private _env: Record<string, string> = {};

    /**
     * The hash of the file.
     */
    private _hashFile: string = '';

    /**
     * Initializes a new instance of the EnvironnementUser class.
     *
     * @throws ({@link BasaltError}) If the file access is denied. ({@link ErrorKeys.ERROR_ACCESS_FILE})
     * @throws ({@link BasaltError}) If the file read fails. ({@link ErrorKeys.ERROR_READ_FILE})
     */
    private constructor() {
        super(`${cwd()}/.env`);
    }

    /**
     * Gets the instance of the EnvironnementUser class.
     *
     * @returns Instance of EnvironnementUser. ({@link EnvironmentUserSingleton})
     */
    public static get instance(): EnvironmentUserSingleton {
        if (!this._instance)
            this._instance = new EnvironmentUserSingleton();
        return this._instance;
    }

    /**
     * Gets the environment variables of the .env file of the user project.
     *
     * @returns The user environment variables with the system environment variables.
     */
    public get content(): Record<string, string> {
        try {
            if (this._hashFile !== this.calculateHashMD5() || !this._hashFile) {
                this._env = this._readEnv();
                this._hashFile = this.calculateHashMD5();
            }
            return {
                ...env as Record<string, string>,
                ...this._env
            };
        } catch {
            return env as Record<string, string>;
        }
    }

    /**
     * Validate the environment variables.
     *
     * @param schema - The schema to validate the environment. ({@link SchemaTypes})
     *
     * @throws ({@link CoreError}) - When the environment is invalid. ({@link ErrorKeys.INVALID_ENVIRONMENT})
     */
    public async validate(schema: SchemaTypes): Promise<void> {
        try {
            const validator = vine.compile(schema);
            await validator.validate(this.content);
        } catch (error) {
            throw new CoreError({
                messageKey: ErrorKeys.INVALID_ENVIRONMENT,
                detail: error,
            });
        }
    }

    /**
     * Gets the environment variables of the .env file of the user project.
     *
     * @throws ({@link BasaltError}) If the file access is denied. ({@link ErrorKeys.ERROR_ACCESS_FILE})
     * @throws ({@link BasaltError}) If the file read fails. ({@link ErrorKeys.ERROR_READ_FILE})
     *
     * @returns The user environment variables.
     */
    private _readEnv(): Record<string, string> {
        const rawEnv = this.read();
        const env: Record<string, string> = {};
        rawEnv.split('\n').forEach((envVar) => {
            const [key, value] = envVar.split('=');
            if (key && value && !env[key.trim()])
                env[key.trim()] = value.trim();
        });
        return env;
    }
}

/**
 * The instance of the EnvironnementUser class. ({@link EnvironmentUserSingleton})
 */
export const EnvironmentUser = EnvironmentUserSingleton.instance;
