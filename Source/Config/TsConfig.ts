import { File } from '@basalt-lab/basalt-helper';

/**
 * Interface for the tsconfig.json file.
 */
export interface ITsConfig {
    compilerOptions: {
        [key: string]: unknown;
        rootDir: string;
        baseUrl: string;
        paths: Record<string, string[]>;
      };
      include: string[];
      exclude: string[];
      [key: string]: unknown;
}

/**
 * The TsConfig class has the responsibility to manage the tsconfig.json file for the project.
 * Inherits from the File class ({@link File}).
 */
export class TsConfig extends File {

    /**
     * The tsconfig.json. ({@link ITsConfig})
     */
    private _tsConfig: Partial<ITsConfig> = {};
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
     * @returns The tsconfig.json content. ({@link ITsConfig})
     */
    public get content(): Partial<ITsConfig> {
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
