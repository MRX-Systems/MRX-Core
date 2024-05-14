import {
    existsSync,
    writeFileSync
} from 'fs';

import { AndesiteError } from '@/Common/Error';
import { ServiceErrorKeys } from '@/Common/Error/Enum';
import { type IProjectInformationDTO } from '@/DTO';
import base from '@/../Templates/PackageJson/base.json';
import api from '@/../Templates/PackageJson/api.json';
import library from '@/../Templates/PackageJson/library.json';
import workerManager from '@/../Templates/PackageJson/worker-manager.json';
import sampleScript from '@/../Templates/PackageJson/sample-script.json';

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
    scripts: Record<string, string>;
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


/**
 * Builds the package.json object based on the project information.
 * @param projectInformation - The project information. ({@link IProjectInformation})
 * 
 * @returns The package.json object. ({@link IPackageJson})
 */
function _buildPackageJsonObject(projectInformation: Readonly<IProjectInformationDTO>): IPackageJson {
    const packageJson: IPackageJson = {
        name: projectInformation.name,
        version: '1.0.0',
        description: projectInformation.description,
        keywords: [],
        ...base
    };

    switch (projectInformation.type) {
    case 'API':
        packageJson.dependencies = api.dependencies;
        return packageJson;
    case 'Worker Manager':
        packageJson.dependencies = workerManager.dependencies;
        return packageJson;
    case 'Library':
        packageJson.dependencies = library.dependencies;
        return packageJson;
    case 'Sample Script':
        packageJson.dependencies = sampleScript.dependencies;
        return packageJson;
    default:
        return packageJson;
    }
}

/**
 * Creates the package.json file.
 * @param projectInformation - The project information. ({@link IProjectInformation})
 * 
 * @throws {@link AndesiteError} - If the package.json file already exists. {@link ServiceErrorKeys.ERROR_PACKAGE_JSON_EXISTS}
 */
function initPackageJson(projectInformation: Readonly<IProjectInformationDTO>, path: string = './'): void {
    if (existsSync(`${path}/package.json`))
        throw new AndesiteError({
            messageKey: ServiceErrorKeys.ERROR_PACKAGE_JSON_EXISTS
        });
    const packageJson = _buildPackageJsonObject(projectInformation);
    writeFileSync(`${path}/package.json`, JSON.stringify(packageJson, null, 2));
}

export {
    initPackageJson
};
