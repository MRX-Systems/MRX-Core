import type { ChildProcess } from 'child_process';
import { exit } from 'process';

import type {
    IAndesiteApiConfigDTO,
    IAndesiteSampleScriptConfigDTO
} from '@/DTO';
import { cancel, intro, outroBasedOnTime, spinner } from '@/Domain/Service';
import { EsbuildUser } from '@/Domain/Service/User/Command';
import { AndesiteYml, TsConfig, initAndesiteFolderStructure } from '@/Domain/Service/User/Config';

/**
 * Build the project
 */
async function buildProject(): Promise<void> {
    intro('Hey there! 👋');
    try {
        const s = spinner();
        s.start('Running build process 🚀');

        const config: IAndesiteApiConfigDTO | IAndesiteSampleScriptConfigDTO = new AndesiteYml().readConfig();

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
