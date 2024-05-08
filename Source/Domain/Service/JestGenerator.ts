import {
    existsSync,
    writeFileSync
} from 'fs';

import { AndesiteError } from '@/Common/Error';
import { ServiceErrorKeys } from '@/Common/Error/Enum';

const jestConfig = {
    preset: 'ts-jest',
    coverageDirectory: 'coverage',
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/Source/$1'
    },
    testMatch: [
        '**/?(*.)+(spec).ts'
    ],
    resetMocks: true,
    clearMocks: true,
    verbose: true
};

/**
 * Create a jest.config.json file.
 * 
 * @param projectName - The name of the project.
 * @param path - The parent path of the jest.config.json.
 * 
 * @throws {@link AndesiteError} - If jest.config.json already exists. {@link ServiceErrorKeys.ERROR_JEST_EXISTS}
 */
function createJestConfig(projectName: string, path: string = './example'): void {
    if (existsSync(`${path}/jest.config.json`))
        throw new AndesiteError({
            messageKey: ServiceErrorKeys.ERROR_JEST_EXISTS
        });
    writeFileSync(`${path}/jest.config.json`, JSON.stringify({
        displayName: projectName,
        ...jestConfig
    }, null, 4));
}

export {
    createJestConfig
};