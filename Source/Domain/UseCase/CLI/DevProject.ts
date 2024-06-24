import type { ChildProcess } from 'child_process';
import { cwd, exit } from 'process';

import { File } from '@/Common/Util';
import type {
    IAndesiteConfigDTO
} from '@/DTO';
import { EnvironnementUser } from '@/Domain/Service/User';
import { EsbuildUser, execBundleCommand } from '@/Domain/Service/User/Command';
import { AndesiteYml } from '@/Domain/Service/User/Config';

/**
 * Reload the watch process.
 *
 * @param bundleChild - The child process of the bundle command. ({@link ChildProcess})
 * @param scriptFile - The script file to watch. ({@link File})
 * @param env - The environment variables to pass to the child process.
 *
 * @returns The child process of the bundle command. ({@link ChildProcess})
 */
function reloadWatch(bundleChild: ChildProcess, scriptFile: File, env: Record<string, string>): ChildProcess {
    let child = bundleChild;
    child.kill();
    console.clear();
    child = execBundleCommand(scriptFile.path, env);
    child.stdout?.on('data', (data: string | Uint8Array) => {
        process.stdout.write(data);
    });
    child.stderr?.on('data', (data: string | Uint8Array) => {
        process.stderr.write(data);
    });
    return child;
}

/**
 * Start the project in development mode with watch mode
 */
async function devProject(): Promise<void> {
    try {
        const andesiteYml = new AndesiteYml();
        const config: IAndesiteConfigDTO = andesiteYml.readConfig();
        const esbuildUser: EsbuildUser = new EsbuildUser({
            minify: false,
            keepNames: false,
            treeShaking: false,
            dev: true,
            watch: false,
            ...config
        });

        // Build the project first
        await new Promise<void>((resolve) => {
            const child: ChildProcess = esbuildUser.exec();
            child.stderr?.on('data', (data: string | Uint8Array) => {
                process.stderr.write(data);
            });
            child.on('close', () => {
                resolve();
            });
        });

        // Start the watch build process
        esbuildUser.config.watch = true;
        const buildChild = esbuildUser.exec();
        buildChild.stderr?.on('data', (data: string | Uint8Array) => {
            process.stderr.write(data);
        });
        const env: EnvironnementUser = new EnvironnementUser();
        const scriptFile = new File({ path: `${cwd()}/${config.Config.OutputDir}/app.js` });
        let bundleChild = execBundleCommand(scriptFile.path, env.getEnv());

        // Start the watch start process when scriptFile and env changes
        scriptFile.watch(25, () => { bundleChild = reloadWatch(bundleChild, scriptFile, env.getEnv()); });
        env.watch(25, () => { bundleChild = reloadWatch(bundleChild, scriptFile, env.getEnv()); });
    } catch (error) {
        console.error(error);
        exit(1);
    }
}

export {
    devProject
};
