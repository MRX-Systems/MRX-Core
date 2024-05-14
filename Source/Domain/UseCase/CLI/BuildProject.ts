import {
    spinner
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

function buildProject(): void {
    const s = spinner();
    s.start('Build the project 🛠️');

    try {
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
        execBuildCommand(buildOptions);
    } catch (error) {
        s.stop('Build failed ❌');
        throw error;
    }
    s.stop('Build completed 🎉');
}

export {
    buildProject
};
