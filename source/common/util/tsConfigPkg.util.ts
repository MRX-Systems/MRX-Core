import tsConfig from '#/../template/tsconfig.json' with { type: 'json' };
import type { AndesiteConfig, TsConfig } from '#/common/types/index.js';
import { TsConfigFile } from '#/common/util/index.js';

/**
 * The TsConfigPkgSingleton class has the responsibility to manage the tsconfig.json file for the package.
 * Inherit from the File class ({@link TsConfigFile})
 */
export class TsConfigPkgSingleton extends TsConfigFile {
    /**
     * The instance of the TsConfigPkgSingleton class. ({@link TsConfigPkgSingleton})
     */
    private static _instance: TsConfigPkgSingleton | undefined;

    /**
     * Gets the instance of the TsConfigPkgSingleton class.
     *
     * @returns Instance of TsConfigPkgSingleton. ({@link TsConfigPkgSingleton})
     */
    public static getInstance(path: string): TsConfigPkgSingleton {
        if (!this._instance)
            this._instance = new TsConfigPkgSingleton(path);
        return this._instance;
    }

    /**
     * Creates the tsconfig.json file for the project.
     *
     * @param andesiteConfig - The andesite configuration object. ({@link AndesiteConfig})
     *
     * @throws ({@link BasaltError}) If the file access is denied. ({@link ErrorKeys.ERROR_ACCESS_FILE})
     * @throws ({@link BasaltError}) If the file write fails. ({@link ErrorKeys.ERROR_WRITE_FILE})
     */
    public update(andesiteConfig: Readonly<Omit<AndesiteConfig, 'ProjectType'>>): void {
        const conf: TsConfig = tsConfig as TsConfig;
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

export const TsConfigPkg = TsConfigPkgSingleton.getInstance('./.andesite/tsconfig.json');
