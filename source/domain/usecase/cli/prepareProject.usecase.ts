import { exit } from 'process';

import type { AndesiteConfig } from '#/common/types/index.ts';
import { AndesiteUserYml, JestUser, PackageJsonUser, TsConfigPkg } from '#/common/util/index.ts';
import { initAndesiteFolderStructure } from '#/domain/service/index.ts';

export async function prepareProject(): Promise<void> {
    try {
        // Get the configuration from the andesite.yml file
        const config: AndesiteConfig = await AndesiteUserYml.readConfig();

        // Initialize the folder .andesite
        initAndesiteFolderStructure();
        JestUser.init(PackageJsonUser.content.name ?? 'andesite');
        TsConfigPkg.update(config);

    } catch (error) {
        console.error(error);
        exit(1);
    }
}
