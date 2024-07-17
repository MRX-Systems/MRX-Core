import { File } from '@/Common/Util/index.js';

/**
 * Interface for the package.json
 */
export interface IPackageJson {
    name: string,
    version: string,
    description: string,
    author: string,
    license: string,
    type: string,
    scripts: Record<string, string>,
    keywords: string[],
    dependencies: Record<string, string>,
    devDependencies: Record<string, string>,
    peerDependencies: Record<string, string>,
    [key: string]: unknown
}


/**
 * PackageJsonSingleton class is responsible for managing the package.json. (Singleton)
 * Inherit from the File class ({@link File})
 */
export class PackageJson extends File {
    /**
     * The package.json. ({@link IPackageJson})
     */
    private _packageJson: Partial<IPackageJson> = {};

    /**
     * The hash of the file.
     */
    private _hashFile: string = '';

    /**
     * Initializes a new instance of the PackageJsonSingleton class.
     *
     * @param path - The path of the package.json.
     */
    protected constructor(path: string) {
        super(path);
    }

    /**
     * Gets the package.json.
     *
     * @returns The package.json. ({@link IPackageJson})
     */
    public get content(): Partial<IPackageJson> {
        try {
            if (this._hashFile !== this.calculateHashMD5() || !this._hashFile) {
                this._packageJson = JSON.parse(this.read());
                this._hashFile = this.calculateHashMD5();
            }
            return this._packageJson;
        } catch {
            return {};
        }
    }
}
