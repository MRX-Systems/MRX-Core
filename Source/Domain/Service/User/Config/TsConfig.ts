import tsConfig from '@/../Templates/tsconfig.json' with { type: 'json' };
import { AndesiteError } from '@/Common/Error';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { CommonErrorKeys, ServiceErrorKeys } from '@/Common/Error/Enum';
import { File } from '@/Common/Util';
import type {
    IAndesiteConfigDTO
} from '@/DTO';

/**
 * Interface for the tsconfig.json file.
 */
interface ITsConfig {
    compilerOptions: {
        [key: string]: unknown;
        rootDir?: string;
        baseUrl?: string;
        paths?: Record<string, string[]>;
      };
      include?: string[];
      exclude?: string[];
      [key: string]: unknown;
}

/**
 * The TsConfig class has the responsibility to manage the tsconfig.json file User and Package.
 */
export class TsConfig {
    /**
     * The tsconfig.json file for the user. ({@link File})
     */
    private readonly _tsConfigUser: File;

    /**
     * The tsconfig.json file for the package. ({@link File})
     */
    private readonly _tsConfigPkg: File;

    /**
     * Initializes a new instance of the TsConfig class.
     */
    public constructor() {
        this._tsConfigUser = new File('./tsconfig.json');

        this._tsConfigPkg = new File('./.andesite/tsconfig.json');
    }

    /**
     * Initializes the tsconfig.json file for the project.
     *
     * @throws ({@link AndesiteError}) If the file access is denied. ({@link CommonErrorKeys.ERROR_ACCESS_FILE})
     * @throws ({@link AndesiteError}) If the file write fails. ({@link CommonErrorKeys.ERROR_WRITE_FILE})
     */
    public initializeTsConfig(): void {
        this._initializeTsConfigUser();
        this._initializeTsConfigPkg();
    }

    /**
     * Creates the tsconfig.json file for the project.
     *
     * @param andesiteConfig - The andesite configuration object. ({@link IAndesiteApiConfigDTO}) | ({@link IAndesiteSampleScriptConfigDTO})
     *
     * @throws ({@link AndesiteError}) If the file access is denied. ({@link CommonErrorKeys.ERROR_ACCESS_FILE})
     * @throws ({@link AndesiteError}) If the file write fails. ({@link CommonErrorKeys.ERROR_WRITE_FILE})
     */
    public updateTsConfigUser(andesiteConfig: Readonly<IAndesiteConfigDTO>): void {
        const conf: ITsConfig = tsConfig as ITsConfig;
        conf.include = [
            `../${andesiteConfig.Config.BaseSourceDir}/**/*.ts`,
            `../${andesiteConfig.Config.BaseSourceDir}/**/*.json`
        ];
        conf.compilerOptions.rootDir = `../${andesiteConfig.Config.BaseSourceDir}`;
        conf.compilerOptions.baseUrl = `../${andesiteConfig.Config.BaseSourceDir}`;
        andesiteConfig.Config.PathAlias = andesiteConfig.Config.PathAlias.endsWith('/') ? andesiteConfig.Config.PathAlias : `${andesiteConfig.Config.PathAlias}/`;
        conf.compilerOptions.paths = {
            [`${andesiteConfig.Config.PathAlias}*`]: ['./*']
        };
        conf.compilerOptions.outDir = andesiteConfig.Config.OutputDir;
        this._tsConfigPkg.write(JSON.stringify(conf, null, 2));
    }

    /**
     * Creates the tsconfig.json file for the user.
     *
     * @throws ({@link AndesiteError}) If the file access is denied. ({@link CommonErrorKeys.ERROR_ACCESS_FILE})
     * @throws ({@link AndesiteError}) If the file write fails. ({@link CommonErrorKeys.ERROR_WRITE_FILE})
     * @throws ({@link AndesiteError}) If the tsconfig.json file already exists. ({@link ServiceErrorKeys.ERROR_TS_CONFIG_EXISTS})
     */
    private _initializeTsConfigUser(): void {
        if (this._tsConfigUser.exists() || this._tsConfigPkg.exists())
            throw new AndesiteError({
                messageKey: ServiceErrorKeys.ERROR_TS_CONFIG_EXISTS,
                detail: './tsconfig.json'
            });
        this._tsConfigUser.write(JSON.stringify({
            'extends': './.andesite/tsconfig.json'
        }, null, 2));
    }

    /**
     * Creates the tsconfig.json file for the package.
     *
     * @throws ({@link AndesiteError}) If the file access is denied. ({@link CommonErrorKeys.ERROR_ACCESS_FILE})
     * @throws ({@link AndesiteError}) If the file write fails. ({@link CommonErrorKeys.ERROR_WRITE_FILE})
     */
    private _initializeTsConfigPkg(): void {
        const conf: ITsConfig = tsConfig as ITsConfig;
        conf.include = [
            '../Source/**/*.ts',
            '../Source/**/*.json'
        ];
        conf.compilerOptions.rootDir = '../Source';
        conf.compilerOptions.baseUrl = '../Source';
        conf.compilerOptions.paths = {
            '@/*': ['./*']
        };
        this._tsConfigPkg.write(JSON.stringify(conf, null, 2));
    }
}
