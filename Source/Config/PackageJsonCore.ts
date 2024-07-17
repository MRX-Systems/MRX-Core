import { PackageJson } from '@/Config/index.js';

/**
 * The PackageJsonCoreSingleton class is a singleton class that extends the PackageJson class. (Singleton)
 * Inherit from the File class ({@link PackageJson})
 */
export class PackageJsonCoreSingleton extends PackageJson {
    /**
     * The instance of the PackageJsonCoreSingleton class. ({@link PackageJsonCoreSingleton})
     */
    private static _instance: PackageJsonCoreSingleton | undefined;

    /**
     * Gets the instance of the PackageJsonCoreSingleton class.
     *
     * @returns Instance of PackageJsonCoreSingleton. ({@link PackageJsonCoreSingleton})
     */
    public static getInstance(path: string): PackageJsonCoreSingleton {
        if (!this._instance)
            this._instance = new PackageJsonCoreSingleton(path);
        return this._instance;
    }
}

export const PackageJsonCore = PackageJsonCoreSingleton.getInstance('../../package.json');
