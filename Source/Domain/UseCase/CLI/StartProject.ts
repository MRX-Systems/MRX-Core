import { execFile } from 'child_process';
import { cwd, exit } from 'process';

import { type IAndesiteApiConfigDTO } from '@/DTO';
import { readAndesiteYmlConfig, getFileEnvUsers } from '@/Domain/Service';

/**
 * 
 * Execute the script with the environment variables
 * 
 * @param scriptPath - The path of the script to execute
 * @param env - The environment variables to pass to the script
 */
function _execBundle(scriptPath: string, env: Record<string, string>): void {
    const child = execFile('node', [scriptPath], {
        env: { ...process.env, ...env },
        cwd: cwd(),
        windowsHide: true
    });

    if (child && child.stdout && child.stderr) {

        child.stdout.on('data', (data: string | Uint8Array) => {
            process.stdout.write(data);
        });
        
        child.stderr.on('data', (data: string | Uint8Array) => {
            process.stderr.write(data);
        });
        
        child.on('close', (code) => {
            exit(code);   
        });
        
        child.on('error', (error) => {
            console.error(error);
            exit(1);
        });
    }
}

function startProject(): void {
    try {
        const config: IAndesiteApiConfigDTO = readAndesiteYmlConfig() as IAndesiteApiConfigDTO;
        const scriptPath: string = `${cwd()}/${config.Config.OutputDir}/app.js`;
        const env: Record<string, string> = getFileEnvUsers();
        _execBundle(scriptPath, env);
    } catch (error) {
        console.error(error);
        exit(1);
    }
}

export {
    startProject
};
