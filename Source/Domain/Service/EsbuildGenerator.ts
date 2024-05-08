import {
    existsSync,
    readFileSync,
    writeFileSync
} from 'fs';
import { compile } from 'handlebars';

import { AndesiteError } from '@/Common/Error';
import { ServiceErrorKeys } from '@/Common/Error/Enum';

/**
 * Get the esbuild.config.ts template
 *
 * @returns The esbuild.config.ts template
 */
function getEsbuidConfigTemplate(): string {  
    const compiledResult = compile(readFileSync(`${__dirname}/../Templates/esbuild.hbs`, 'utf-8'));
    return compiledResult({});
}

/**
 * Create the esbuild.config.ts file
 * 
 * @param path - The path to create the esbuild.config.ts file
 * 
 * @throws {@link AndesiteError} - If the esbuild.config.ts file already exists. {@link ServiceErrorKeys.ERROR_ESBUILD_EXISTS}
 */
function createEsbuildConfigFile(path: string): void {
    if (existsSync(`${path}/esbuild.config.ts`))
        throw new AndesiteError({
            messageKey: ServiceErrorKeys.ERROR_ESBUILD_EXISTS
        });
    writeFileSync(`${path}/esbuild.config.ts`, getEsbuidConfigTemplate());
}

export {
    createEsbuildConfigFile
};
