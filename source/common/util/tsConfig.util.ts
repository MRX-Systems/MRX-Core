import { File } from '@basalt-lab/basalt-helper';

import type { TsConfig } from '#/common/types/index.ts';

/**
 * The TsConfig class has the responsibility to manage the tsconfig.json file for the project.
 * Inherits from the File class ({@link File}).
 */
export class TsConfigFile extends File {

    /**
     * The tsconfig.json. ({@link TsConfig})
     */
    private _tsConfig: Partial<TsConfig> = {};
    /**
     * The hash of the file.
     */
    private _hashFile: string = '';

    /**
     * Initializes a new instance of the TsConfig class.
     *
     * @param path - The path of the tsconfig.json.
     */
    protected constructor(path: string) {
        super(path);
    }

    /**
     * Gets the content of the tsconfig.json file.
     *
     * @returns The tsconfig.json content. ({@link TsConfig})
     */
    public get content(): Partial<TsConfig> {
        try {
            if (this._hashFile !== this.calculateHashMD5() || !this._hashFile) {
                this._tsConfig = JSON.parse(this.read());
                this._hashFile = this.calculateHashMD5();
            }
            return this._tsConfig;
        } catch {
            return {};
        }
    }
}
