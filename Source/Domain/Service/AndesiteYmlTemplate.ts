import {
    existsSync,
    writeFileSync
} from 'fs';

import apiConfig from '@/../Templates/AndesiteConfigs/api.json';
import libraryConfig from '@/../Templates/AndesiteConfigs/library.json';
import sampleScriptConfig from '@/../Templates/AndesiteConfigs/sample-script.json';
import workerManagerConfig from '@/../Templates/AndesiteConfigs/worker-manager.json';
import { AndesiteError } from '@/Common/Error';
import { ServiceErrorKeys } from '@/Common/Error/Enum';
import { stringify } from '@/Common/Util';

/**
 * Writes the Andesite yml config.
 * 
 * @param config - The config object to write.
 * @param path - The path to write the config.
 * 
 * @throws {@link AndesiteError} - If the andesite yml config already exists. {@link ServiceErrorKeys.ERROR_ANDESITE_YML_EXISTS}
 */
function _writeAndesiteYmlConfig(config: Record<string, unknown>, path: string): void {
    if (existsSync(`${path}/andesite-config.yml`))
        throw new AndesiteError({
            messageKey: ServiceErrorKeys.ERROR_ANDESITE_YML_EXISTS
        });
    writeFileSync(`${path}/andesite-config.yml`, stringify(config));
}

/**
 * Creates the Andesite yml config.
 * 
 * @param type - The type of the Andesite yml config to create.
 * @param path - The path to write the config.
 * 
 * @throws {@link AndesiteError} - If the andesite yml config already exists. {@link ServiceErrorKeys.ERROR_ANDESITE_YML_EXISTS}
 */
function initAndesiteYmlConfig(type: string, path: string = './'): void {
    switch (type) {
    case 'API':
        _writeAndesiteYmlConfig(apiConfig, path);
        break;
    case 'Worker Manager':
        _writeAndesiteYmlConfig(workerManagerConfig, path);
        break;
    case 'Library':
        _writeAndesiteYmlConfig(libraryConfig, path);
        break;
    case 'Sample Script':
        _writeAndesiteYmlConfig(sampleScriptConfig, path);
        break;
    default:
    }
}

export {
    initAndesiteYmlConfig
};
