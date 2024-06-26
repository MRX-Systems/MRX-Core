import type { ChildProcess } from 'child_process';
import { exit } from 'process';

import type {
    IAndesiteConfigDTO
} from '@/DTO/index.js';
import { EsbuildUser } from '@/Domain/Service/User/Command/index.js';
import { AndesiteYml, TsConfig, initAndesiteFolderStructure } from '@/Domain/Service/User/Config/index.js';
import { cancel, intro, outroBasedOnTime, spinner } from '@/Domain/Service/index.js';

/**
 * Build the project
 */
async function buildProject(): Promise<void> {
    intro('Hey there! 👋');
    try {
        const s = spinner();
        s.start('Running build process 🚀');

        const config: IAndesiteConfigDTO = new AndesiteYml().readConfig();

        initAndesiteFolderStructure();

        new TsConfig().updateTsConfigUser(config);

        const esbuildUser: EsbuildUser = new EsbuildUser({
            minify: true,
            keepNames: true,
            treeShaking: true,
            dev: false,
            watch: false,
            ...config
        });

        await new Promise<void>((resolve, reject) => {
            const child: ChildProcess = esbuildUser.exec();
            child.stderr?.on('data', (data: string | Uint8Array) => {
                process.stderr.write(data);
                reject(new Error(data.toString()));
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

export {
    buildProject
};
