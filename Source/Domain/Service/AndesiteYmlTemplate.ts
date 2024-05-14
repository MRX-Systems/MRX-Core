import {
    existsSync,
    readFileSync,
    writeFileSync
} from 'fs';

import apiConfig from '@/../Templates/AndesiteConfigs/api.json';
import libraryConfig from '@/../Templates/AndesiteConfigs/library.json';
import sampleScriptConfig from '@/../Templates/AndesiteConfigs/sample-script.json';
import workerManagerConfig from '@/../Templates/AndesiteConfigs/worker-manager.json';
import { AndesiteError } from '@/Common/Error';
import { ServiceErrorKeys } from '@/Common/Error/Enum';
import { parse, stringify } from '@/Common/Util';

/**
 * Writes the Andesite yml config.
 * 
 * @param config - The config object to write.
 * @param path - The path to write the config.
 */
function writeAndesiteYmlConfig(config: Record<string, unknown>, path: string = './'): void {
    writeFileSync(`${path}/andesite-config.yml`, stringify(config));
}

/**
 * Checks if the Andesite yml config exists and throws an error if it does.
 * 
 * @param path - The path to check for the andesite yml config.
 *
 * @throws {@link AndesiteError} - If the andesite yml config does not exist. {@link ServiceErrorKeys.ERROR_ANDESITE_YML_NOT_EXISTS} 
 */
function checkAndesiteYmlConfigExistsAndThrow(path: string = './'): void {
    if (!existsSync(`${path}/andesite-config.yml`))
        throw new AndesiteError({
            messageKey: ServiceErrorKeys.ERROR_ANDESITE_YML_NOT_EXISTS
        });
}

/**
 * Reads the Andesite yml config.
 * 
 * @param path - The path to read the config.
 * 
 * @throws {@link AndesiteError} - If the andesite yml config does not exist. {@link ServiceErrorKeys.ERROR_ANDESITE_YML_NOT_EXISTS}
 * 
 * @returns The Andesite yml config.
 */
function readAndesiteYmlConfig(path: string = './'): unknown {
    checkAndesiteYmlConfigExistsAndThrow(path);
    return parse(readFileSync(`${path}/andesite-config.yml`, 'utf8'));
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
    if (existsSync(`${path}/andesite-config.yml`))
        throw new AndesiteError({
            messageKey: ServiceErrorKeys.ERROR_ANDESITE_YML_EXISTS
        });
    switch (type) {
    case 'API':
        writeAndesiteYmlConfig(apiConfig, path);
        break;
    case 'Worker Manager':
        writeAndesiteYmlConfig(workerManagerConfig, path);
        break;
    case 'Library':
        writeAndesiteYmlConfig(libraryConfig, path);
        break;
    case 'Sample Script':
        writeAndesiteYmlConfig(sampleScriptConfig, path);
        break;
    default:
    }
}

export {
    checkAndesiteYmlConfigExistsAndThrow,
    initAndesiteYmlConfig, readAndesiteYmlConfig, writeAndesiteYmlConfig
};

