import { execFile, type ChildProcess } from 'child_process';
import { cwd } from 'process';


/** 
 * Execute the script with the environment variables
 * 
 * @param scriptPath - The path of the script to execute
 * @param env - The environment variables to pass to the script
 * 
 * @returns The child process
 */
function execBundleCommand(scriptPath: string, env: Record<string, string>): ChildProcess {
    const child: ChildProcess = execFile('node', [scriptPath], {
        env: { ...process.env, ...env },
        cwd: cwd(),
        windowsHide: true
    });

    child.stdout?.on('data', (data: string | Uint8Array) => {
        process.stdout.write(data);
    });
    
    child.stderr?.on('data', (data: string | Uint8Array) => {
        process.stderr.write(data);
    });

    return child;
}

export {
    execBundleCommand
};
