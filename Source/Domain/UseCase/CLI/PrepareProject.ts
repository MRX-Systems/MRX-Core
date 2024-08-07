import { exit } from 'process';

import { AndesiteUserYml, JestUser, PackageJsonUser, TsConfigPkg } from '@/Config/index.js';
import { initAndesiteFolderStructure } from '@/Domain/Service/User/UserProjectStructure.js';
import type { IAndesiteConfigDTO } from '@/DTO/index.js';


export async function prepareProject(): Promise<void> {
    try {
        // Get the configuration from the andesite.yml file
        const config: IAndesiteConfigDTO = await AndesiteUserYml.readConfig();

        // Initialize the folder .andesite
        initAndesiteFolderStructure();
        JestUser.init(PackageJsonUser.content.name ?? 'andesite');
        TsConfigPkg.update(config);

    } catch (error) {
        console.error(error);
        exit(1);
    }
}
