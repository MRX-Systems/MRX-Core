import { exit } from 'process';
import {
    cancel,
    intro,
    outro,
    spinner,
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
} from '@clack/prompts';

import {
    execBuildCommand,
    initAndesiteFolderStructure,
    readAndesiteYmlConfig,
    updateTsConfig
} from '@/Domain/Service';
import { type IAndesiteApiConfigDTO, type IBuildProjectOptionsDTO } from '@/DTO';
import { sleep } from '@/lib';

/**
 * Build the project
 */
async function buildProject(): Promise<void> {
    intro('Hey there! 👋');
    try {
        const s = spinner();
        s.start('Running build process 🚀');
        await sleep(70);
        s.message('Reading configuration 📖');
        await sleep(100);
        
        const config: IAndesiteApiConfigDTO = readAndesiteYmlConfig() as IAndesiteApiConfigDTO;
        
        s.message('Reconfiguring project 🛠️');
        await sleep(100);
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

        s.message('Building project 🏗️');
        await sleep(60);
        execBuildCommand(buildOptions);
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
