import { exec, type ChildProcess } from 'child_process';
import { cwd } from 'process';

import type {
    IAndesiteApiConfigDTO,
    IAndesiteSampleScriptConfigDTO,
    IBuildProjectOptionsDTO
} from '@/DTO';

/**
 * Builds the command to build the project using esbuild with the given options.
 * 
 * @param config - The build project options. {@link IBuildProjectOptionsDTO} & ({@link IAndesiteApiConfigDTO} | {@link IAndesiteSampleScriptConfigDTO})
 * 
 * @returns The build command.
 */
function _buildCommandEsbuild(
    config: Readonly<IBuildProjectOptionsDTO & (IAndesiteApiConfigDTO | IAndesiteSampleScriptConfigDTO)>
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
 * @param config - The build project options. {@link IBuildProjectOptionsDTO} & ({@link IAndesiteApiConfigDTO} | {@link IAndesiteSampleScriptConfigDTO})
 * 
 * @returns The child process. ({@link ChildProcess})
 */ 
function execBuildCommand(
    config: Readonly<IBuildProjectOptionsDTO & (IAndesiteApiConfigDTO | IAndesiteSampleScriptConfigDTO)>
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
