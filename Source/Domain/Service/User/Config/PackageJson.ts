import api from '@/../Templates/PackageJson/api.json' with { type: 'json' };
import base from '@/../Templates/PackageJson/base.json' with { type: 'json' };
import script from '@/../Templates/PackageJson/script.json' with { type: 'json' };
import { AndesiteError } from '@/Common/Error/index.js';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { CommonErrorKeys, ServiceErrorKeys } from '@/Common/Error/Enum/index.js';
import { File } from '@/Common/Util/index.js';
import type { IProjectInformationDTO } from '@/DTO/index.js';

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
 *
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
    if (projectInformation.type === 'API')
        packageJson.dependencies = api.dependencies;
    else if (projectInformation.type === 'Script')
        packageJson.dependencies = script.dependencies;
    return packageJson;
}

/**
 * Creates the package.json file.
 *
 * @param projectInformation - The project information. ({@link IProjectInformation})
 *
 * @throws ({@link AndesiteError}) - If the package.json file already exists. ({@link ServiceErrorKeys.ERROR_PACKAGE_JSON_EXISTS})
 * @throws ({@link AndesiteError}) If the file access is denied. ({@link CommonErrorKeys.ERROR_ACCESS_FILE})
 * @throws ({@link AndesiteError}) If the file write fails. ({@link CommonErrorKeys.ERROR_WRITE_FILE})
 */
export function initPackageJson(projectInformation: Readonly<IProjectInformationDTO>, path: string = './'): void {
    const file = new File(`${path}/package.json`);
    if (file.exists())
        throw new AndesiteError({
            messageKey: ServiceErrorKeys.ERROR_PACKAGE_JSON_EXISTS
        });
    const packageJson = _buildPackageJsonObject(projectInformation);
    file.write(JSON.stringify(packageJson, null, 2));
}

