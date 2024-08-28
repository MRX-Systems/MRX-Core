import { exit } from 'process';

import { CoreError } from '#/common/error/index.ts';
import type { ProjectInformation } from '#/common/types/index.ts';
import {
    AndesiteUserYml,
    EslintUser,
    JestUser,
    PackageJsonUser,
    TsConfigPkg,
    TsConfigUser
} from '#/common/util/index.ts';
import {
    cancel,
    initAndesiteFolderStructure,
    initEntryPoint,
    initFolderStructure,
    intro,
    outroBasedOnTime,
    select,
    spinner,
    text
} from '#/domain/service/index.ts';

/**
 * Cancel the project initialization and stop the process.
 *
 * @param message - The message to display when canceling the project initialization.
 * @param code - The exit code.
 */
function _cancelAndStop(message: string = 'Project initialization canceled', code: number = 0): Promise<void> {
    cancel(message);
    exit(code);
}

/**
 * Handle the error occurred during the project initialization.
 *
 * @param error - The error occurred.
 */
async function _handleError(error: unknown): Promise<void> {
    if (error instanceof CoreError)
        await _cancelAndStop(`An error occurred while initializing the project 😢 ${error.message}`, 1);
    else
        await _cancelAndStop('An unexpected error occurred while initializing the project 😢', 1);
}

/**
 * The user selects the project type.
 *
 * @throws ({@link CoreError}) - If the user cancels the prompt. ({@link ServiceErrorKeys.ERROR_CANCEL_PROMPT})
 *
 * @returns The project type selected by the user.
 */
async function _requestProjectTypeSelected(): Promise<string> {
    const projectType = await select({
        message: 'Select the project type',
        initialValue: 'API',
        options: [
            {
                value: 'API',
                label: 'API',
            },
            {
                value: 'Script',
                label: 'Script',
            },
        ]
    });
    return projectType as string;
}

/**
 * Request the project name to the user.
 *
 * @throws ({@link CoreError}) - If the user cancels the prompt. ({@link ServiceErrorKeys.ERROR_CANCEL_PROMPT})
 *
 * @returns The project name.
 */
async function _requestProjectName(): Promise<string> {
    const projectName = await text({
        message: 'Enter the project name',
        defaultValue: 'my-project',
        placeholder: 'my-project'
    });
    return projectName as string;
}

/**
 * Request the project description to the user.
 *
 * @returns The project description.
 */
async function _requestProjectDescription(): Promise<string> {
    const projectDescription = await text({
        message: 'Enter the project description',
        defaultValue: '',
        placeholder: ''
    });
    return projectDescription as string;
}

async function _request(): Promise<ProjectInformation>{
    const projectType = await _requestProjectTypeSelected();
    const projectName = await _requestProjectName();
    const projectDescription = await _requestProjectDescription();
    return {
        name: projectName,
        description: projectDescription,
        type: projectType
    };
}

/**
 * Initialize a new project by asking the user several questions.
 */
export async function initProject(): Promise<void> {
    intro('Hey there! 👋');
    const projectInformation: ProjectInformation = await _request();
    try {
        const s = spinner();
        s.start('Running initialization process 🚀');

        // Initialize the andesite.yml file
        AndesiteUserYml.initializeAndesiteYml(projectInformation.type);

        // Initialize the folder .andesite
        initAndesiteFolderStructure();
        JestUser.init(projectInformation.name);
        TsConfigPkg.update({
            Config: {
                BaseSourceDir: 'Source',
                EntryPoint: 'Source/App.ts',
                OutputDir: 'Build',
                PathAlias: '#/'
            }
        });

        // Initialize the package.json file, folder structure, tsconfig.json file, eslint file, and entry point
        PackageJsonUser.init(projectInformation);
        TsConfigUser.init();
        EslintUser.init();
        initFolderStructure(projectInformation.type);
        initEntryPoint();
        s.stop('Project initialized 😊');
    } catch (error) {
        await _handleError(error);
    }
    outroBasedOnTime();
}
