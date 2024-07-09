import jest from '@/../Templates/jest.json' with { type: 'json' };
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { CommonErrorKeys } from '@/Common/Error/Enum/index.js';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { AndesiteError } from '@/Common/Error/index.js';
import { File } from '@/Common/Util/index.js';

/**
 * The Jest configuration file extends ({@link File}).
 */
export class Jest extends File {
    /**
     * Create a new Jest configuration file.
     *
     * @param path - The path where the file will be created.
     */
    public constructor(path: string = './') {
        super(`${path}/.andesite/jest.config.json`);
    }

    /**
     * Create a jest.config.json file.
     *
     * @param projectName - The name of the project.
     *
     * @throws ({@link AndesiteError}) If the file access is denied. ({@link CommonErrorKeys.ERROR_ACCESS_FILE})
     * @throws ({@link AndesiteError}) If the file write fails. ({@link CommonErrorKeys.ERROR_WRITE_FILE})
     */
    public initJestConfig(projectName: string): void {
        jest.displayName = projectName;
        this.write(JSON.stringify(jest, null, 2));
    }
}
