import type { ChildProcess } from 'child_process';
import { exit } from 'process';

import type { IAndesiteConfigDTO } from '@/DTO/index.js';
import { EsbuildUser } from '@/Domain/Service/User/Command/index.js';
import { intro, outroBasedOnTime, spinner } from '@/Domain/Service/index.js';
import { initAndesiteFolderStructure } from '@/Domain/Service/User/Config/UserProjectStructure.js';
import {
    AndesiteUserYml,
    JestUser,
    PackageJsonUser,
    TsConfigPkg
} from '@/lib.js';

/**
 * Build the project
 */
export async function buildProject(): Promise<void> {
    intro('Hey there! 👋');
    try {
        const s = spinner();
        s.start('Running build process 🚀');

        // Get the configuration from the andesite.yml file
        const config: IAndesiteConfigDTO = await AndesiteUserYml.readConfig();

        // Initialize the folder .andesite
        initAndesiteFolderStructure();
        JestUser.init(PackageJsonUser.content.name ?? 'andesite');
        TsConfigPkg.update(config);


        const esbuildUser: EsbuildUser = new EsbuildUser(config);
        await new Promise<void>((resolve) => {
            const child: ChildProcess = esbuildUser.exec();
            child.stderr?.on('data', (data: string | Uint8Array) => {
                process.stderr.write(data);
            });

            child.on('close', () => {
                resolve();
            });
        });
        s.stop('Build successful! ✅');
    } catch (error) {
        const { cancel } = await import('@/Domain/Service/index.js');
        cancel('Build failed ❌');
        console.error(error);
        exit(1);
    }
    outroBasedOnTime();
}
