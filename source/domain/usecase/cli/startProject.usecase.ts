import type { ChildProcess } from 'child_process';
import { cwd, exit } from 'process';

import type { AndesiteConfig } from '#/common/types/index.ts';
import { AndesiteUserYml, EnvironmentUser } from '#/common/util/index.ts';
import { execBundleCommand } from '#/domain/service/index.ts';

/**
 * Start the project
 */
export async function startProject(): Promise<void> {
    try {
        const config: AndesiteConfig = await AndesiteUserYml.readConfig();
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
