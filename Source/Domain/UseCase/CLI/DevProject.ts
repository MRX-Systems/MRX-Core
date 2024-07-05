import type { ChildProcess } from 'child_process';
import { cwd, exit } from 'process';

import { File } from '@/Common/Util/index.js';
import { EnvironnementUser } from '@/Config/index.js';
import type {
    IAndesiteConfigDTO
} from '@/DTO/index.js';
import { EsbuildUser, execBundleCommand } from '@/Domain/Service/User/Command/index.js';
import { AndesiteYml } from '@/Domain/Service/User/Config/index.js';

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
export async function devProject(): Promise<void> {
    const { initAndesiteFolderStructure, Jest, TsConfigPkg } = await import('@/Domain/Service/User/Config/index.js');
    const { packageJsonUser } = await import('@/Config/PackageJsonUser.js');

    try {
        const andesiteYml = new AndesiteYml();
        const config: IAndesiteConfigDTO = await andesiteYml.readConfig();

        // Initialize the folder .andesite
        initAndesiteFolderStructure();
        const jest = new Jest();
        jest.initJestConfig(packageJsonUser.name);
        const tsConfigPkg = new TsConfigPkg();
        tsConfigPkg.update(config);

        // Build the project first
        const esbuildUser: EsbuildUser = new EsbuildUser(config);
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
        const buildChild = esbuildUser.exec(true);
        buildChild.stderr?.on('data', (data: string | Uint8Array) => {
            process.stderr.write(data);
        });
        buildChild.stdout?.on('data', (data: string | Uint8Array) => {
            process.stdout.write(data);
        });
        const env: EnvironnementUser = new EnvironnementUser();
        const scriptFile = new File(`${cwd()}/${config.Config.OutputDir}/app.js`);
        let bundleChild = execBundleCommand(scriptFile.path, env.env);

        // Start the watch start process when scriptFile and env changes
        scriptFile.watch(10, () => { bundleChild = reloadWatch(bundleChild, scriptFile, env.env); });
        env.watch(10, () => { bundleChild = reloadWatch(bundleChild, scriptFile, env.env); });
    } catch (error) {
        console.error(error);
        exit(1);
    }
}
