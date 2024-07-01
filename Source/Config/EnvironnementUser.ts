import { cwd, env } from 'process';

import { File } from '@/Common/Util';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { AndesiteError } from '@/Common/Error';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { CommonErrorKeys } from '@/Common/Error/Enum';

/**
 * EnvironnementUser class is responsible for managing the environment variables.
 */
export class EnvironnementUser extends File {
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
     * @throws ({@link AndesiteError}) If the file access is denied. ({@link CommonErrorKeys.ERROR_ACCESS_FILE})
     * @throws ({@link AndesiteError}) If the file read fails. ({@link CommonErrorKeys.ERROR_READ_FILE})
     */
    public constructor() {
        super(`${cwd()}/.env`);
    }

    /**
     * Gets the environment variables of the .env file of the user project.
     *
     * @throws ({@link AndesiteError}) If the file access is denied. ({@link CommonErrorKeys.ERROR_ACCESS_FILE})
     * @throws ({@link AndesiteError}) If the file read fails. ({@link CommonErrorKeys.ERROR_READ_FILE})
     * 
     * @returns The user environment variables with the system environment variables.
     */
    public get env(): Record<string, string> {
        this._hashFile ||= this.calculateHashMD5();
        if (this._hashFile !== this.calculateHashMD5()) {
            this._env = this._readEnv();
            this._hashFile = this.calculateHashMD5();
        }
        return {
            ...env as Record<string, string>,
            ...this._env
        };
    }

    /**
     * Gets the environment variables of the .env file of the user project.
     *  
     * @throws ({@link AndesiteError}) If the file access is denied. ({@link CommonErrorKeys.ERROR_ACCESS_FILE})
     * @throws ({@link AndesiteError}) If the file read fails. ({@link CommonErrorKeys.ERROR_READ_FILE})
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
