import {
    writeFileSync,
    existsSync
} from 'fs';

import { AndesiteError } from '@/Common/Error';
import { type IProjectInformation } from '@/Domain/Interface';
import { ServiceErrorKeys } from '@/Common/Error/Enum';

/**
 * An object representing the package.json file.
 */
interface IPackageJson {
    /**
     * The name of the project.
     */
    name: string;
    /**
     * The version of the project.
     */
    version: string;
    /**
     * The description of the project.
     */
    description: string;
    /**
     * The scripts of the project. (ex: 'start', 'test', ...)
     */
    scripts: {
        start: string;
    };
    /**
     * The keywords of the project.
     * Used for searching the project in npm.
     */
    keywords: string[];
    /**
     * The dependencies of the project.
     */
    dependencies?: Record<string, string>;
    /**
     * The devDependencies of the project.
     */
    devDependencies?: Record<string, string>;
}

const apiDevDependencies = {
    '@tsconfig/node21': '^21.0.3',
    '@types/jest': '^29.5.12',
    '@types/node': '^20.12.4',
    '@typescript-eslint/eslint-plugin': '^7.5.0',
    '@typescript-eslint/parser': '^7.5.0',
    'concurrently': '^8.2.2',
    'esbuild': '^0.20.2',
    'esbuild-plugin-alias': '^0.2.1',
    'eslint': '^8.57.0',
    'jest': '^29.7.0',
    'ts-jest': '^29.1.2',
    'ts-node': '^10.9.2',
    'tslib': '^2.6.2',
    'typescript': '^5.4.3'
};

const apiDependencies = {
    'kysely': '^0.27.3',
    'source-map-support': '^0.5.21'
};

/**
 * Builds the package.json object based on the project information.
 * @param projectInformation - The project information.
 * @returns The package.json object.
 */
function buildPackageJsonObject(projectInformation: IProjectInformation): IPackageJson {
    const packageJson: IPackageJson = {
        name: projectInformation.name,
        version: '1.0.0',
        description: projectInformation.description,
        scripts: {
            start: 'node index.js'
        },
        keywords: [],
    };

    switch (projectInformation.type) {
    case 'API':
        packageJson.dependencies = apiDependencies;
        packageJson.devDependencies = apiDevDependencies;
        return packageJson;

    case 'Worker Manager':
        return packageJson;

    case 'Library':
        return packageJson;
        
    case 'Sample Script':
        return packageJson;
    default:
        return packageJson;
    }
}

/**
 * Creates the package.json file.
 * @param projectInformation - The project information.
 * 
 * @throws {@link AndesiteError} - If the package.json file already exists. {@link ServiceErrorKeys.PACKAGE_JSON_EXISTS}
 */
function createPackageJson(projectInformation: IProjectInformation): void {
    const packageJson = buildPackageJsonObject(projectInformation);
    if (existsSync('package.json'))
        throw new AndesiteError({
            messageKey: ServiceErrorKeys.PACKAGE_JSON_EXISTS
        });
    writeFileSync('package.json', JSON.stringify(packageJson, null, 2));
}

export {
    createPackageJson
};