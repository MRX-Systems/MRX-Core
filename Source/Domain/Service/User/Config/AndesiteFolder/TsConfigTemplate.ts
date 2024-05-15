import {
    existsSync,
    writeFileSync
} from 'fs';

import tsConfig from '@/../Templates/tsconfig.json';
import { AndesiteError } from '@/Common/Error';
import { ServiceErrorKeys } from '@/Common/Error/Enum';
import { type IAndesiteApiConfigDTO } from '@/DTO';

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
 * Writes the tsconfig.json file.
 * 
 * @param conf - The tsconfig.json object to write.
 * @param path - The path to write the tsconfig.json.
 */
function writeTsConfig(conf: Readonly<ITsConfig>, path: string = './'): void {
    writeFileSync(path, JSON.stringify(conf, null, 2));
}

/**
 * Creates the tsconfig.json file for the project.
 *
 * @param path - The parent path of the tsconfig.json.
 * 
 * @throws {@link AndesiteError} - If the tsconfig.json file already exists. {@link ServiceErrorKeys.ERROR_TS_CONFIG_EXISTS}
 */
function initTsConfig(path: string = './'): void {
    if (existsSync(`${path}/.andesite/tsconfig.json`))
        throw new AndesiteError({
            messageKey: ServiceErrorKeys.ERROR_TS_CONFIG_EXISTS,
            detail: `${path}/.andesite/tsconfig.json`
        });

    const conf: ITsConfig = tsConfig as ITsConfig;
    conf.include = [
        '../Source/**/*.ts',
    ];
    conf.compilerOptions.rootDir = '../Source';
    conf.compilerOptions.baseUrl = '../Source';
    conf.compilerOptions.paths = {
        '@/*': ['./*']
    };
    writeTsConfig(conf, `${path}/.andesite/tsconfig.json`);
}

/**
 * Creates the tsconfig.json file for the user.
 * 
 * @param path - The parent path of the tsconfig.json.
 * 
 * @throws {@link AndesiteError} - If the tsconfig.json file already exists. {@link ServiceErrorKeys.ERROR_TS_CONFIG_EXISTS}
 */
function initTsConfigUser(path: string = './'): void {
    if (existsSync(`${path}/tsconfig.json`))
        throw new AndesiteError({
            messageKey: ServiceErrorKeys.ERROR_TS_CONFIG_EXISTS,
            detail: `${path}/tsconfig.json`
        });
    writeFileSync(`${path}/tsconfig.json`, JSON.stringify({
        'extends': `${path}/.andesite/tsconfig.json`
    }, null, 2));
}

/**
 * Updates the tsconfig.json file.
 * 
 * @param andesiteConfig - The andesite configuration object. {@link IAndesiteApiConfigDTO}
 * @param path - The parent path of the tsconfig.json.
 */
function updateTsConfig(andesiteConfig: Readonly<IAndesiteApiConfigDTO>, path: string = './'): void {
    const conf: ITsConfig = tsConfig as ITsConfig;
    conf.include = [
        `../${andesiteConfig.Config.BaseSourceDir}/**/*.ts`,
    ];
    conf.compilerOptions.rootDir = `../${andesiteConfig.Config.BaseSourceDir}`;
    conf.compilerOptions.baseUrl = `../${andesiteConfig.Config.BaseSourceDir}`;
    conf.compilerOptions.paths = {
        [`${andesiteConfig.Config.PathAlias}/*`]: ['./*']
    };
    conf.compilerOptions.outDir = andesiteConfig.Config.OutputDir;
    writeTsConfig(conf, `${path}/.andesite/tsconfig.json`);
}

export {
    initTsConfig,
    initTsConfigUser,
    updateTsConfig,
    writeFileSync
};

