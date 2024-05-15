import { exit } from 'process';
import {
    cancel,
    intro,
    outro,
    spinner,
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
} from '@clack/prompts';


import { type IAndesiteApiConfigDTO, type IBuildProjectOptionsDTO } from '@/DTO';
import { readAndesiteYmlConfig } from '@/Domain/Service/User/Config';
import { initAndesiteFolderStructure, updateTsConfig } from '@/Domain/Service/User/Config/AndesiteFolder';
import { execBuildCommand } from '@/Domain/Service/User/Command';
import { type ChildProcess } from 'child_process';

/**
 * Build the project
 */
async function buildProject(): Promise<void> {
    intro('Hey there! 👋');
    try {
        const s = spinner();
        s.start('Running build process 🚀');
        const config: IAndesiteApiConfigDTO = readAndesiteYmlConfig() as IAndesiteApiConfigDTO;        
        initAndesiteFolderStructure();
        updateTsConfig(config);
        
        const buildOptions: IBuildProjectOptionsDTO & (IAndesiteApiConfigDTO) = {
            minify: true,
            keepNames: true,
            treeShaking: true,
            dev: false,
            watch: false,
            ...config
        };

        await new Promise<void>((resolve) => {
            const child: ChildProcess = execBuildCommand(buildOptions);
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
    const date = new Date();
    if (date.getHours() >= 8 && date.getHours() <= 18)
        outro('Have a great day! 🌞');
    else
        outro('Have a great night! 🌚');
}

export {
    buildProject
};
