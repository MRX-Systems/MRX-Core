import { cwd, exit } from 'process';

import { type IAndesiteApiConfigDTO } from '@/DTO';
import { getFileEnvUsers } from '@/Domain/Service/User';
import { execBundleCommand } from '@/Domain/Service/User/Command';
import { readAndesiteYmlConfig } from '@/Domain/Service/User/Config';


function startProject(): void {
    try {
        const config: IAndesiteApiConfigDTO = readAndesiteYmlConfig() as IAndesiteApiConfigDTO;
        const scriptPath: string = `${cwd()}/${config.Config.OutputDir}/app.js`;
        const env: Record<string, string> = getFileEnvUsers();
        execBundleCommand(scriptPath, env);
    } catch (error) {
        console.error(error);
        exit(1);
    }
}

export {
    startProject
};
