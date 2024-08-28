import { CoreError, ErrorKeys } from '#/common/error/index.ts';
import { TsConfigFile } from '#/common/util/index.ts';

/**
 * The TsConfigUserSingleton class has the responsibility to manage the tsconfig.json file for the user.
 * Inherit from the File class ({@link TsConfigFile})
 */
export class TsConfigUserSingleton extends TsConfigFile {
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
     * @throws ({@link BasaltError}) If the file access is denied. ({@link ErrorKeys.ERROR_ACCESS_FILE})
     * @throws ({@link BasaltError}) If the file write fails. ({@link ErrorKeys.ERROR_WRITE_FILE})
     * @throws ({@link CoreError}) If the tsconfig.json file already exists. ({@link ErrorKeys.TS_CONFIG_EXISTS})
     */
    public init(): void {
        if (this.exists() || this.exists())
            throw new CoreError({
                messageKey: ErrorKeys.TS_CONFIG_EXISTS,
                detail: './tsconfig.json'
            });
        this.write(JSON.stringify({
            'extends': './.andesite/tsconfig.json'
        }, null, 2));
    }
}

export const TsConfigUser = TsConfigUserSingleton.getInstance('./tsconfig.json');
