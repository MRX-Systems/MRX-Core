import type { ChildProcess } from 'child_process';
import { exit } from 'process';

import type { AndesiteConfig } from '#/common/types/index.ts';
import {
    AndesiteUserYml,
    JestUser,
    PackageJsonUser,
    TsConfigPkg
} from '#/common/util/index.ts';
import {
    cancel,
    EsbuildUser,
    initAndesiteFolderStructure,
    intro,
    outroBasedOnTime,
    spinner
} from '#/domain/service/index.ts';

/**
 * Build the project
 */
export async function buildProject(): Promise<void> {
    intro('Hey there! 👋');
    try {
        const s = spinner();
        s.start('Running build process 🚀');

        // Get the configuration from the andesite.yml file
        const config: AndesiteConfig = await AndesiteUserYml.readConfig();

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
        cancel('Build failed ❌');
        console.error(error);
        exit(1);
    }
    outroBasedOnTime();
}
