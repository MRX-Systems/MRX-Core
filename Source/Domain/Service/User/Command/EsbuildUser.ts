import { exec, type ChildProcess } from 'child_process';
import { cwd } from 'process';

import type {
    IAndesiteApiConfigDTO,
    IAndesiteLibraryConfigDTO,
    IAndesiteSampleScriptConfigDTO,
    IAndesiteWorkerManagerConfigDTO,
    IBuildProjectOptionsDTO
} from '@/DTO';

/**
 * Builds the command to build the project using esbuild with the given options.
 * 
 * @param config - The build project options. {@link IBuildProjectOptionsDTO} & ({@link IAndesiteApiConfigDTO} | {@link IAndesiteLibraryConfigDTO} | {@link IAndesiteSampleScriptConfigDTO} | {@link IAndesiteWorkerManagerConfigDTO})
 * 
 * @returns The build command.
 */
function _buildCommandEsbuild(
    config: Readonly<IBuildProjectOptionsDTO & (IAndesiteApiConfigDTO | IAndesiteLibraryConfigDTO | IAndesiteSampleScriptConfigDTO | IAndesiteWorkerManagerConfigDTO)>
): string {
    let command: string = `npm --prefix ${__dirname}/../ run user::build -- -cwd ${process.cwd()}`;
    if (config.watch)
        command += ' -w';
    if (config.dev)
        command += ' -d';
    if (config.minify)
        command += ' -min';
    if (config.keepNames)
        command += ' -k';
    if (config.treeShaking)
        command += ' -t';

    if (config.Config.EntryPoint)
        command += ` -entry ${config.Config.EntryPoint}`;
    if (config.Config.OutputDir)
        command += ` -o ${config.Config.OutputDir}`;
    command += ` -cwd ${cwd()}`;
    return command;
}

/**
 * Executes the build command.
 * 
 * @param config - The build project options. {@link IBuildProjectOptionsDTO} & ({@link IAndesiteApiConfigDTO} | {@link IAndesiteLibraryConfigDTO} | {@link IAndesiteSampleScriptConfigDTO} | {@link IAndesiteWorkerManagerConfigDTO})
 * 
 * @returns The child process.
 */ 
function execBuildCommand(
    config: Readonly<IBuildProjectOptionsDTO & (IAndesiteApiConfigDTO | IAndesiteLibraryConfigDTO | IAndesiteSampleScriptConfigDTO | IAndesiteWorkerManagerConfigDTO)>
): ChildProcess {
    const command: string = _buildCommandEsbuild(config);
    const child: ChildProcess = exec(command, {
        cwd: process.cwd(),
        windowsHide: true, 
    });

    return child;
}

export {
    execBuildCommand
};
