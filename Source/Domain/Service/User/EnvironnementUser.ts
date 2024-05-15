import { existsSync, readFileSync } from 'fs';
import { cwd } from 'process';

/**
 * Return the environment variables from the .env file of users project
 * 
 * @returns Get the environment variables from the .env file
 */
function getFileEnvUsers(): Record<string, string> {
    const env: Record<string, string> = {};
    const envFile = `${cwd()}/.env`;
    if (existsSync(envFile)) {
        const envConfig = readFileSync(envFile, 'utf-8');
        envConfig.split('\n').forEach((envVar) => {
            const [key, value] = envVar.split('=');
            if (key && value) 
                env[key.trim()] = value.trim();
        });
    }
    return env;
}

export {
    getFileEnvUsers
};
