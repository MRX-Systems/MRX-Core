import { File } from '@basalt-lab/basalt-helper';
import type { ChildProcess } from 'child_process';
import { cwd, exit } from 'process';

import {
    AndesiteUserYml,
    EnvironmentUser,
    JestUser,
    PackageJsonUser,
    TsConfigPkg
} from '@/Config/index.js';
import type {
    IAndesiteConfigDTO
} from '@/DTO/index.js';
import { EsbuildUser, execBundleCommand } from '@/Domain/Service/User/Command/index.js';
import { initAndesiteFolderStructure } from '@/Domain/Service/User/index.js';

/**
 * Reload the watch process.
 *
 * @param bundleChild - The child process of the bundle command. ({@link ChildProcess})
 * @param scriptFile - The script file to watch. ({@link File})
 * @param env - The environment variables to pass to the child process.
 *
 * @returns The child process of the bundle command. ({@link ChildProcess})
 */
function _reloadWatch(bundleChild: ChildProcess, scriptFile: File, env: Record<string, string>): ChildProcess {
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
    try {
        const config: IAndesiteConfigDTO = await AndesiteUserYml.readConfig();

        // Initialize the folder .andesite
        initAndesiteFolderStructure();
        JestUser.init(PackageJsonUser.content.name ?? 'andesite');
        TsConfigPkg.update(config);

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

        const scriptFile = new File(`${cwd()}/${config.Config.OutputDir}/app.js`);
        let bundleChild = execBundleCommand(scriptFile.path, EnvironmentUser.content);

        // Start the watch start process when scriptFile and env changes
        scriptFile.watch(10, () => { bundleChild = _reloadWatch(bundleChild, scriptFile, EnvironmentUser.content); });
        EnvironmentUser.watch(10, () => { bundleChild = _reloadWatch(bundleChild, scriptFile, EnvironmentUser.content); });
    } catch (error) {
        console.error(error);
        exit(1);
    }
}
