import tsConfig from '@/../Templates/tsconfig.json' with { type: 'json' };
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { AndesiteError } from '@/Common/Error/index.js';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { CommonErrorKeys } from '@/Common/Error/Enum/index.js';
import { File } from '@/Common/Util/index.js';
import type {
    IAndesiteConfigDTO
} from '@/DTO/index.js';

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
 * The TsConfigPkg class has the responsibility to manage the tsconfig.json file for the package. Inherits from ({@link File}).
 */
export class TsConfigPkg extends File {
    /**
     * Initializes a new instance of the TsConfigPkg class.
     *
     * @param path - The path where the file will be created.
     */
    public constructor(path: string = './.andesite/tsconfig.json') {
        super(path);
    }

    /**
     * Creates the tsconfig.json file for the project.
     *
     * @param andesiteConfig - The andesite configuration object. ({@link IAndesiteApiConfigDTO})
     *
     * @throws ({@link AndesiteError}) If the file access is denied. ({@link CommonErrorKeys.ERROR_ACCESS_FILE})
     * @throws ({@link AndesiteError}) If the file write fails. ({@link CommonErrorKeys.ERROR_WRITE_FILE})
     */
    public update(andesiteConfig: Readonly<Omit<IAndesiteConfigDTO, 'ProjectType'>>): void {
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
        conf.compilerOptions.outDir = `./.andesite/${andesiteConfig.Config.OutputDir}`;
        this.write(JSON.stringify(conf, null, 2));
    }
}
