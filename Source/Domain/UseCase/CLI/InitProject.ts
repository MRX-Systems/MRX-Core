import { exit } from 'process';

import { AndesiteError } from '@/Common/Error/index.js';
import type { IProjectInformationDTO } from '@/DTO/index.js';
/**
 * Cancel the project initialization and stop the process.
 *
 * @param message - The message to display when canceling the project initialization.
 * @param code - The exit code.
 */
async function _cancelAndStop(message: string = 'Project initialization canceled', code: number = 0): Promise<void> {
    const { cancel } = await import('@/Domain/Service/index.js');
    cancel(message);
    exit(code);
}

/**
 * Handle the error occurred during the project initialization.
 *
 * @param error - The error occurred.
 */
async function _handleError(error: unknown): Promise<void> {
    if (error instanceof AndesiteError)
        await _cancelAndStop(`An error occurred while initializing the project 😢 ${error.message}`, 1);
    else
        await _cancelAndStop('An unexpected error occurred while initializing the project 😢', 1);
}

/**
 * The user selects the project type.
 *
 * @throws ({@link AndesiteError}) - If the user cancels the prompt. ({@link ServiceErrorKeys.ERROR_CANCEL_PROMPT})
 *
 * @returns The project type selected by the user.
 */
async function _requestProjectTypeSelected(): Promise<string> {
    const { select } = await import('@/Domain/Service/index.js');
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
 * @throws ({@link AndesiteError}) - If the user cancels the prompt. ({@link ServiceErrorKeys.ERROR_CANCEL_PROMPT})
 *
 * @returns The project name.
 */
async function _requestProjectName(): Promise<string> {
    const { text } = await import('@/Domain/Service/index.js');
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
    const { text } = await import('@/Domain/Service/index.js');
    const projectDescription = await text({
        message: 'Enter the project description',
        defaultValue: '',
        placeholder: ''
    });
    return projectDescription as string;
}

async function _request(): Promise<IProjectInformationDTO>{
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
// eslint-disable-next-line max-lines-per-function
export async function initProject(): Promise<void> {
    const { intro, spinner, outroBasedOnTime } = await import('@/Domain/Service/index.js');
    const {
        AndesiteYml,
        Jest,
        TsConfigPkg,
        TsConfigUser,
        initAndesiteFolderStructure,
        initEntryPoint,
        initEslint,
        initFolderStructure,
        initPackageJson,
    } = await import('@/Domain/Service/User/Config/index.js');
    intro('Hey there! 👋');

    const projectInformation: IProjectInformationDTO = await _request();

    try {
        const s = spinner();
        s.start('Running initialization process 🚀');

        // Initialize the andesite.yml file
        const andesiteYml = new AndesiteYml();
        andesiteYml.initializeAndesiteYml(projectInformation.type);

        // Initialize the folder .andesite
        initAndesiteFolderStructure();
        const jest = new Jest();
        jest.initJestConfig(projectInformation.name);
        const tsConfigPkg = new TsConfigPkg();
        tsConfigPkg.update({
            Config: {
                BaseSourceDir: 'Source',
                EntryPoint: 'Source/App.ts',
                OutputDir: 'Build',
                PathAlias: '@/'
            }
        });

        // Initialize the package.json file, folder structure, tsconfig.json file, eslint file, and entry point
        initPackageJson(projectInformation);
        initFolderStructure(projectInformation.type);
        const tsConfigUser = new TsConfigUser();
        tsConfigUser.init();
        initEslint();
        initEntryPoint();
        s.stop('Project initialized 😊');
    } catch (error) {
        await _handleError(error);
    }
    outroBasedOnTime();
}
