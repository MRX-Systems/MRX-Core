import { AndesiteError } from '@/Common/Error/index.js';
import { ServiceErrorKeys } from '@/Common/Error/Enum/index.js';
import { TsConfig } from '@/Config/index.js';

/**
 * The TsConfigUserSingleton class has the responsibility to manage the tsconfig.json file for the user.
 * Inherit from the File class ({@link TsConfig})
 */
export class TsConfigUserSingleton extends TsConfig {
    /**
     * The instance of the TsConfigUserSingleton class. ({@link TsConfigUserSingleton})
     */
    private static _instance: TsConfigUserSingleton | undefined;

    /**
     * Gets the instance of the TsConfigUserSingleton class.
     *
     * @returns Instance of TsConfigUserSingleton. ({@link TsConfigUserSingleton})
     */
    public static getInstance(path: string): TsConfigUserSingleton {
        if (!this._instance)
            this._instance = new TsConfigUserSingleton(path);
        return this._instance;
    }
    /**
     * Creates the tsconfig.json file for the user.
     *
     * @throws ({@link AndesiteError}) If the file access is denied. ({@link CommonErrorKeys.ERROR_ACCESS_FILE})
     * @throws ({@link AndesiteError}) If the file write fails. ({@link CommonErrorKeys.ERROR_WRITE_FILE})
     * @throws ({@link AndesiteError}) If the tsconfig.json file already exists. ({@link ServiceErrorKeys.ERROR_TS_CONFIG_EXISTS})
     */
    public init(): void {
        if (this.exists() || this.exists())
            throw new AndesiteError({
                messageKey: ServiceErrorKeys.ERROR_TS_CONFIG_EXISTS,
                detail: './tsconfig.json'
            });
        this.write(JSON.stringify({
            'extends': './.andesite/tsconfig.json'
        }, null, 2));
    }
}


export const TsConfigUser = TsConfigUserSingleton.getInstance('./tsconfig.json');
