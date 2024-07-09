import { AndesiteError } from '@/Common/Error/index.js';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { CommonErrorKeys, ServiceErrorKeys } from '@/Common/Error/Enum/index.js';
import { File } from '@/Common/Util/index.js';

/**
 * The TsConfigPkg class has the responsibility to manage the tsconfig.json file for the user. Inherits from ({@link File}).
 */
export class TsConfigUser extends File {
    /**
     * Initializes a new instance of the TsConfig class.
     *
     * @param path - The path where the file will be created.
     */
    public constructor(path: string = './tsconfig.json') {
        super(path);
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
