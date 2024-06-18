import { exec, type ChildProcess } from 'child_process';
import { cwd } from 'process';

import type {
    IAndesiteApiConfigDTO,
    IAndesiteSampleScriptConfigDTO,
    IBuildProjectOptionsDTO
} from '@/DTO';

/**
 * The esbuild user options.
 */
export type EsbuildUserOption = IBuildProjectOptionsDTO & (IAndesiteApiConfigDTO | IAndesiteSampleScriptConfigDTO);

/**
 * The esbuild user class. It builds the project using esbuild.
 */
export class EsbuildUser {
    /**
     * The project builder options. ({@link EsbuildUserOption})
     */
    private readonly _config: EsbuildUserOption;

    /**
     * The project builder constructor.
     *
     * @param config - The project builder options. ({@link EsbuildUserOption})
     */
    public constructor(config: EsbuildUserOption) {
        this._config = config;
    }

    /**
     * Gets the project builder options.
     *
     * @returns The project builder options. ({@link EsbuildUserOption})
     */
    public get config(): EsbuildUserOption {
        return this._config;
    }

    /**
     * Sets the project builder options.
     *
     * @param config - The project builder options. ({@link EsbuildUserOption})
     */
    public set config(config: Partial<EsbuildUserOption>) {
        Object.assign(this._config, config);
    }

    /**
     * Executes the build command, and returns the child process.
     *
     * @returns The child process. ({@link ChildProcess})
     */
    public exec(): ChildProcess {
        const command = this._buildCommandEsbuild();
        return exec(command, {
            cwd: cwd(),
            windowsHide: true,
        });
    }

    /**
     * Builds the project using esbuild.
     *
     * @returns The command to build the project using esbuild.
     */
    private _buildCommandEsbuild(): string {
        let command: string = `npm --prefix ${__dirname}/../ run user::build -- -cwd ${cwd()}`;
        const flags = [
            this._config.watch && '-w',
            this._config.dev && '-d',
            this._config.minify && '-min',
            this._config.keepNames && '-k',
            this._config.treeShaking && '-t'
        ].filter(Boolean).join(' ');
        command += ` ${flags}`;

        if (this._config.Config.EntryPoint)
            command += ` -entry ${this._config.Config.EntryPoint}`;

        if (this._config.Config.OutputDir)
            command += ` -o ${this._config.Config.OutputDir}`;

        command += ` -cwd ${cwd()}`;
        return command;
    }
}
