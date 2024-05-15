import { type ChildProcess } from 'child_process';
import { watchFile } from 'fs';
import { cwd, exit } from 'process';

import {
    type IAndesiteApiConfigDTO,
    type IAndesiteLibraryConfigDTO,
    type IAndesiteSampleScriptConfigDTO,
    type IAndesiteWorkerManagerConfigDTO,
    type IBuildProjectOptionsDTO
} from '@/DTO';
import { getFileEnvUsers } from '@/Domain/Service/User';
import { execBuildCommand, execBundleCommand } from '@/Domain/Service/User/Command';
import { readAndesiteYmlConfig } from '@/Domain/Service/User/Config';

/**
 * Start the project in development mode with watch mode
 */
async function devProject(): Promise<void> {
    try {
        const config = readAndesiteYmlConfig() as IAndesiteApiConfigDTO | IAndesiteLibraryConfigDTO | IAndesiteSampleScriptConfigDTO | IAndesiteWorkerManagerConfigDTO;
        const scriptPath: string = `${cwd()}/${config.Config.OutputDir}/app.js`;
        const env: Record<string, string> = getFileEnvUsers();
        const buildOptions: IBuildProjectOptionsDTO & (IAndesiteApiConfigDTO | IAndesiteLibraryConfigDTO | IAndesiteSampleScriptConfigDTO | IAndesiteWorkerManagerConfigDTO) = {
            minify: false,
            keepNames: false,
            treeShaking: false,
            dev: true,
            watch: false,
            ...config
        };
        await new Promise<void>((resolve) => {
            const child: ChildProcess = execBuildCommand(buildOptions);
            child.stderr?.on('data', (data: string | Uint8Array) => {
                process.stderr.write(data);
            });        
            child.on('close', () => {
                resolve();
            });
        });

        buildOptions.watch = true;
        const buildChild = execBuildCommand(buildOptions);
        buildChild.stderr?.on('data', (data: string | Uint8Array) => {
            process.stderr.write(data);
        });
        let bundleChild = execBundleCommand(scriptPath, env);

        watchFile(scriptPath, { persistent: true, interval: 50 }, (curr, prev) => {
            if (curr.mtimeMs !== prev.mtimeMs) {
                bundleChild.kill();
                bundleChild = execBundleCommand(scriptPath, env);
                bundleChild.stdout?.on('data', (data: string | Uint8Array) => {
                    process.stdout.write(data);
                });
                
                bundleChild.stderr?.on('data', (data: string | Uint8Array) => {
                    process.stderr.write(data);
                });
            }
        });    
    } catch (error) {
        console.error(error);
        exit(1);
    }
}

export {
    devProject
};
