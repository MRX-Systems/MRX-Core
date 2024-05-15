import { execSync } from 'child_process';
import { cwd } from 'process';

import {
    type IAndesiteApiConfigDTO,
    type IBuildProjectOptionsDTO
} from '@/DTO';

/**
 * Builds the command to build the project using esbuild with the given options.
 * 
 * @param config - The build project options. {@link IBuildProjectOptionsDTO} & {@link IAndesiteApiConfigDTO}
 * 
 * @returns The build command.
 */
function _buildCommandEsbuild(config: Readonly<IBuildProjectOptionsDTO & (IAndesiteApiConfigDTO)>): string {
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
 * @param config - The build project options. {@link IBuildProjectOptionsDTO} & {@link IAndesiteApiConfigDTO}
 */ 
function execBuildCommand(config: Readonly<IBuildProjectOptionsDTO & (IAndesiteApiConfigDTO)>): void {
    const command: string = _buildCommandEsbuild(config);
    execSync(command, {
        cwd: process.cwd(),
        stdio: ['ignore', 'ignore', 'ignore']
    });
}

export {
    execBuildCommand
};
