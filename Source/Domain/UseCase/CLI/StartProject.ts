import type { ChildProcess } from 'child_process';
import { cwd, exit } from 'process';

import { AndesiteUserYml, EnvironmentUser } from '@/Config/index.js';
import type { IAndesiteConfigDTO } from '@/DTO/index.js';
import { execBundleCommand } from '@/Domain/Service/User/Command/index.js';

/**
 * Start the project
 */
export async function startProject(): Promise<void> {
    try {
        const config: IAndesiteConfigDTO = await AndesiteUserYml.readConfig();
        const scriptPath: string = `${cwd()}/${config.Config.OutputDir}/app.js`;
        const child: ChildProcess = execBundleCommand(scriptPath, EnvironmentUser.content);

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
