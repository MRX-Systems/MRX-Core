import { cwd } from 'process';

import { File } from '@/Common/Util/index.js';

/**
 * Interface for the package.json user.
 */
export interface IPackageJsonUser {
    name?: string,
    version?: string,
    description?: string,
    author?: string,
    license?: string,
    type?: string,
    scripts?: Record<string, string>,
    keywords?: string[],
    dependencies?: Record<string, string>,
    devDependencies?: Record<string, string>,
    peerDependencies?: Record<string, string>,
    [key: string]: unknown
}


/**
 * Gets the package.json user.
 *
 * @throws ({@link AndesiteError}) If the file access is denied. ({@link CommonErrorKeys.ERROR_ACCESS_FILE})
 * @throws ({@link AndesiteError}) If the file read fails. ({@link CommonErrorKeys.ERROR_READ_FILE})
 *
 * @returns The package.json user. ({@link IPackageJsonUser})
 */
export function packageJsonUser(): IPackageJsonUser {
    const path = `${cwd()}/package.json`;
    const file = new File(path);
    const packageJsonUser: IPackageJsonUser = JSON.parse(file.read());
    return packageJsonUser;
}
