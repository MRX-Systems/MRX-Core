import { cwd } from 'process';

import { File } from '@/Common/Util';

/**
 * EnvironnementUser class is responsible for managing the environment variables.
 */
export class EnvironnementUser extends File {
    /**
     * Initializes a new instance of the EnvironnementUser class.
     */
    public constructor() {
        super({ path: `${cwd()}/.env` });
    }

    /**
     * Reads the environment variables.
     *
     * @returns The environment variables.
     */
    public getEnv(): Record<string, string> {
        const env: Record<string, string> = {};
        if (this.checkAccess()) {
            const envConfig = this.read();
            envConfig.split('\n').forEach((envVar) => {
                const [key, value] = envVar.split('=');
                if (key && value)
                    env[key.trim()] = value.trim();
            });
        }
        return env;
    }
}
