
import eslint from '@/../Templates/eslint.json' with { type: 'json' };
import { DomainErrorKeys } from '@/Common/Error/Enum/index.js';
import { AndesiteError } from '@/Common/Error/index.js';
import { File } from '@/Common/Util/index.js';

/**
 * Eslint User class to handle .eslintrc file. (Singleton)
 * Inherit from the File class ({@link File})
 */
export class EslintUserSingleton extends File {
    /**
     * The instance of the EslintUserSingleton class. ({@link EslintUserSingleton})
     */
    public static _instance: EslintUserSingleton | undefined;

    /**
     * Constructor of EslintUserSingleton class
     *
     * @param path - Path to .eslintrc
     */
    private constructor(path: string) {
        super(path);
    }

    public static getInstance(path: string): EslintUserSingleton {
        if (!this._instance)
            this._instance = new EslintUserSingleton(path);
        return this._instance;
    }

    /**
     * Create the .eslintrc file.
     *
     * @throws ({@link AndesiteError}) - If the .eslintrc file already exists. ({@link DomainErrorKeys.ERROR_ESLINT_EXISTS})
     * @throws ({@link AndesiteError}) If the file access is denied. ({@link CommonErrorKeys.ERROR_ACCESS_FILE})
     * @throws ({@link AndesiteError}) If the file write fails. ({@link CommonErrorKeys.ERROR_WRITE_FILE})
     */
    public init(): void {
        if (this.exists())
            throw new AndesiteError({
                messageKey: DomainErrorKeys.ERROR_ESLINT_EXISTS
            });
        this.write(JSON.stringify(eslint, null, 2));
    }
}

export const EslintUser = EslintUserSingleton.getInstance('./.eslintrc');
