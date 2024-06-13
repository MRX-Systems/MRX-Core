import type { ChildProcess } from 'child_process';
import { cwd, exit } from 'process';

import type { IAndesiteApiConfigDTO } from '@/DTO';
import { getFileEnvUsers } from '@/Domain/Service/User';
import { execBundleCommand } from '@/Domain/Service/User/Command';
import { readAndesiteYmlConfig } from '@/Domain/Service/User/Config';

/**
 * Start the project
 */
function startProject(): void {
    try {
        const config: IAndesiteApiConfigDTO = readAndesiteYmlConfig() as IAndesiteApiConfigDTO;
        const scriptPath: string = `${cwd()}/${config.Config.OutputDir}/app.js`;
        const env: Record<string, string> = getFileEnvUsers();
        const child: ChildProcess = execBundleCommand(scriptPath, env);

        child.stdout?.on('data', (data: string | Uint8Array) => {
            process.stdout.write(data);
        });

        child.stderr?.on('data', (data: string | Uint8Array) => {
            process.stderr.write(data);
        });
    } catch (error) {
        console.error(error);
        exit(1);
    }
}

export {
    startProject
};
