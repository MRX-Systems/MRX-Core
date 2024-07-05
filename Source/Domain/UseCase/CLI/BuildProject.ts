import type { ChildProcess } from 'child_process';
import { exit } from 'process';

import type { IAndesiteConfigDTO } from '@/DTO/index.js';
import type { EsbuildUser } from '@/Domain/Service/User/Command/index.js';

/**
 * Build the project
 */
export async function buildProject(): Promise<void> {
    const { intro, spinner, outroBasedOnTime } = await import('@/Domain/Service/index.js');
    const { AndesiteYml, TsConfigPkg, initAndesiteFolderStructure, Jest } = await import('@/Domain/Service/User/Config/index.js');
    const { EsbuildUser } = await import('@/Domain/Service/User/Command/index.js');
    const { packageJsonUser } = await import('@/Config/PackageJsonUser.js');

    intro('Hey there! 👋');
    try {
        const s = spinner();
        s.start('Running build process 🚀');

        // Get the configuration from the andesite.yml file
        const config: IAndesiteConfigDTO = await new AndesiteYml().readConfig();

        // Initialize the folder .andesite
        initAndesiteFolderStructure();
        const jest = new Jest();
        jest.initJestConfig(packageJsonUser.name);
        const tsConfigPkg = new TsConfigPkg();
        tsConfigPkg.update(config);


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