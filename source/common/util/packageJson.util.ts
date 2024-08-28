import { File } from '@basalt-lab/basalt-helper';

import type { PackageJson } from '#/common/types/index.ts';

/**
 * PackageJsonFile class is responsible for managing the package.json. (Singleton)
 * Inherit from the File class ({@link File})
 */
export class PackageJsonFile extends File {
    /**
     * The package.json. ({@link PackageJson})
     */
    private _packageJson: Partial<PackageJson> = {};

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
     * @returns The package.json. ({@link PackageJson})
     */
    public get content(): Partial<PackageJson> {
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
