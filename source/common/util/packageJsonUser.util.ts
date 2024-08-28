import { cwd } from 'process';

import api from '#/../template/packageJson/api.json' with { type: 'json' };
import base from '#/../template/packageJson/base.json' with { type: 'json' };
import script from '#/../template/packageJson/script.json' with { type: 'json' };
import { CoreError, ErrorKeys } from '#/common/error/index.ts';
import type { PackageJson, ProjectInformation } from '#/common/types/index.ts';
import { PackageJsonFile } from '#/common/util/index.ts';

/**
 * The PackageJsonUserSingleton class is a singleton class that extends the PackageJson class.
 * Inherit from the File class ({@link PackageJson})
 */
export class PackageJsonUserSingleton extends PackageJsonFile {
    /**
     * The instance of the PackageJsonUser class. ({@link PackageJsonUserSingleton})
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
     * @throws ({@link CoreError}) If the package.json file already exists. ({@link ErrorKeys.PACKAGE_JSON_EXISTS})
     * @throws ({@link BasaltError}) If the file access is denied. ({@link ErrorKeys.ERROR_ACCESS_FILE})
     * @throws ({@link BasaltError}) If the file write fails. ({@link ErrorKeys.ERROR_WRITE_FILE})
     */
    public init(projectInformation: Readonly<ProjectInformation>): void {
        if (this.exists())
            throw new CoreError({
                messageKey: ErrorKeys.PACKAGE_JSON_EXISTS
            });
        const packageJson = this._buildPackageJsonObject(projectInformation);
        this.write(JSON.stringify(packageJson, null, 2));
    }

    /**
     * Builds the package.json object based on the project information.
     *
     * @param projectInformation - The project information. ({@link IProjectInformation})
     *
     * @returns The package.json object. ({@link PackageJson})
     */
    private _buildPackageJsonObject(projectInformation: Readonly<ProjectInformation>): Partial<PackageJson> {
        const packageJson: Partial<PackageJson> = {
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
