import { cwd } from 'process';

import api from '@/../Templates/PackageJson/api.json' with { type: 'json' };
import base from '@/../Templates/PackageJson/base.json' with { type: 'json' };
import script from '@/../Templates/PackageJson/script.json' with { type: 'json' };
import { ServiceErrorKeys } from '@/Common/Error/Enum/index.js';
import { AndesiteError } from '@/Common/Error/index.js';
import { PackageJson, type IPackageJson } from '@/Config/index.js';
import type { IProjectInformationDTO } from '@/DTO/index.js';

/**
 * The PackageJsonUserSingleton class is a singleton class that extends the PackageJson class.
 * Inherit from the File class ({@link PackageJson})
 */
export class PackageJsonUserSingleton extends PackageJson {
    /**
     * The instance of the PackageJsonUser class. ({@link PackageJson})
     */
    private static _instance: PackageJsonUserSingleton | undefined;

    /**
     * Gets the instance of the PackageJsonSingleton class.
     *
     * @returns Instance of PackageJsonSingleton. ({@link PackageJsonUserSingleton})
     */
    public static getInstance(path: string): PackageJsonUserSingleton {
        if (!this._instance)
            this._instance = new PackageJsonUserSingleton(path);
        return this._instance;
    }

    /**
     * Creates the package.json file.
     *
     * @param projectInformation - The project information. ({@link IProjectInformation})
     *
     * @throws ({@link AndesiteError}) If the package.json file already exists. ({@link ServiceErrorKeys.ERROR_PACKAGE_JSON_EXISTS})
     * @throws ({@link AndesiteError}) If the file access is denied. ({@link CommonErrorKeys.ERROR_ACCESS_FILE})
     * @throws ({@link AndesiteError}) If the file write fails. ({@link CommonErrorKeys.ERROR_WRITE_FILE})
     */
    public init(projectInformation: Readonly<IProjectInformationDTO>): void {
        if (this.exists())
            throw new AndesiteError({
                messageKey: ServiceErrorKeys.ERROR_PACKAGE_JSON_EXISTS
            });
        const packageJson = this._buildPackageJsonObject(projectInformation);
        this.write(JSON.stringify(packageJson, null, 2));
    }

    /**
     * Builds the package.json object based on the project information.
     *
     * @param projectInformation - The project information. ({@link IProjectInformation})
     *
     * @returns The package.json object. ({@link IPackageJson})
     */
    private _buildPackageJsonObject(projectInformation: Readonly<IProjectInformationDTO>): Partial<IPackageJson> {
        const packageJson: Partial<IPackageJson> = {
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
}


export const PackageJsonUser = PackageJsonUserSingleton.getInstance(`${cwd()}/package.json`);
