import type { ChildProcess } from 'child_process';
import { exit } from 'process';

import type {
    IAndesiteApiConfigDTO,
    IAndesiteSampleScriptConfigDTO,
    IBuildProjectOptionsDTO
} from '@/DTO';
import { cancel, intro, outroBasedOnTime, spinner } from '@/Domain/Service';
import { execBuildCommand } from '@/Domain/Service/User/Command';
import { readAndesiteYmlConfig } from '@/Domain/Service/User/Config';
import { initAndesiteFolderStructure, updateTsConfig } from '@/Domain/Service/User/Config/AndesiteFolder';

/**
 * Build the project
 */
async function buildProject(): Promise<void> {
    intro('Hey there! 👋');
    try {
        const s = spinner();
        s.start('Running build process 🚀');
        const config = readAndesiteYmlConfig() as IAndesiteApiConfigDTO | IAndesiteSampleScriptConfigDTO;
        initAndesiteFolderStructure();
        updateTsConfig(config);

        const buildOptions: IBuildProjectOptionsDTO & (IAndesiteApiConfigDTO | IAndesiteSampleScriptConfigDTO) = {
            minify: true,
            keepNames: true,
            treeShaking: true,
            dev: false,
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
