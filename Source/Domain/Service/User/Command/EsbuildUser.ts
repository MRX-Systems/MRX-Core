import { exec, type ChildProcess } from 'child_process';
import { cwd } from 'process';

import { getDirname } from '@/Common/Util';
import type {
    IAndesiteConfigDTO,
} from '@/DTO';

/**
 * The esbuild user options. ({@link IAndesiteConfigDTO})
 */
export type EsbuildUserOption = IAndesiteConfigDTO;

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
     * @param watchMode - The watch mode. (default: false)
     *
     * @returns The child process. ({@link ChildProcess})
     */
    public exec(watchMode: boolean = false): ChildProcess {
        const command = this._buildCommandEsbuild();
        return exec(`${command}${watchMode ? ' --watch' : ''}`, {
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
        return `npm --prefix ${getDirname()}/../ run user::build -- -cwd ${cwd()} -entry ${this._config.Config.EntryPoint} -o ${this._config.Config.OutputDir}`;
    }
}
