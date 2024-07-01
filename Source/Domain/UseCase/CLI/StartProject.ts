import type { ChildProcess } from 'child_process';
import { cwd, exit } from 'process';

import { EnvironnementUser } from '@/Config';
import type { IAndesiteConfigDTO } from '@/DTO';
import { execBundleCommand } from '@/Domain/Service/User/Command';
import { AndesiteYml } from '@/Domain/Service/User/Config';

/**
 * Start the project
 */
function startProject(): void {
    try {
        const andesiteYml = new AndesiteYml();
        const config: IAndesiteConfigDTO = andesiteYml.readConfig();
        const scriptPath: string = `${cwd()}/${config.Config.OutputDir}/app.js`;
        const env: EnvironnementUser = new EnvironnementUser();
        const child: ChildProcess = execBundleCommand(scriptPath, env.env);

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
