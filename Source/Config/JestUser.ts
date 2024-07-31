import { File } from '@basalt-lab/basalt-helper';

import jest from '@/../Templates/jest.json' with { type: 'json' };

/**
 * JestUserSingleton class to handle jest.config.json file. (Singleton)
 * Inherit from the File class ({@link File})
 */
export class JestUserSingleton extends File {
    /**
     * The instance of the JestUserSingleton class. ({@link JestUserSingleton})
     */
    public static _instance: JestUserSingleton | undefined;

    /**
     * Create a new Jest configuration file.
     *
     * @param path - The path where the file will be created.
     */
    public constructor(path: string) {
        super(path);
    }

    /**
     * Gets the instance of the JestUserSingleton class.
     *
     * @param path - The path where the file will be created.
     *
     * @returns Instance of JestUserSingleton. ({@link JestUserSingleton})
     */
    public static getInstance(path: string): JestUserSingleton {
        if (!this._instance)
            this._instance = new JestUserSingleton(path);
        return this._instance;
    }

    /**
     * Create a jest.config.json file.
     *
     * @param projectName - The name of the project.
     *
     * @throws ({@link AndesiteError}) If the file access is denied. ({@link CommonErrorKeys.ERROR_ACCESS_FILE})
     * @throws ({@link AndesiteError}) If the file write fails. ({@link CommonErrorKeys.ERROR_WRITE_FILE})
     */
    public init(projectName: string): void {
        jest.displayName = projectName;
        this.write(JSON.stringify(jest, null, 2));
    }
}

export const JestUser = JestUserSingleton.getInstance('./.andesite/jest.config.json');
