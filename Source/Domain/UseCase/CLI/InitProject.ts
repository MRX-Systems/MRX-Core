import { exit } from 'process';


import { AndesiteError } from '@/Common/Error';
import type { IProjectInformationDTO } from '@/DTO';
import { cancel, intro, outroBasedOnTime, select, spinner, text } from '@/Domain/Service';
import {
    AndesiteYml,
    TsConfig,
    initAndesiteFolderStructure,
    initEntryPoint,
    initEslint,
    initFolderStructure,
    initJestConfig,
    initPackageJson,
    type ProjectType,
} from '@/Domain/Service/User/Config';

/**
 * The project types.
 */
export const PROJECT_TYPES = {
    API: 'API',
    SAMPLE_SCRIPT: 'Sample Script',
};

/**
 * Cancel the project initialization and stop the process.
 *
 * @param message - The message to display when canceling the project initialization.
 * @param code - The exit code.
 */
function _cancelAndStop(message: string = 'Project initialization canceled', code: number = 0): void {
    cancel(message);
    exit(code);
}

/**
 * Handle the error occurred during the project initialization.
 *
 * @param error - The error occurred.
 */
function _handleError(error: unknown): void {
    if (error instanceof AndesiteError)
        _cancelAndStop(`An error occurred while initializing the project 😢 ${error.message}`, 1);
    else
        _cancelAndStop('An unexpected error occurred while initializing the project 😢', 1);
}

/**
 * The user selects the project type.
 *
 * @throws ({@link AndesiteError}) - If the user cancels the prompt. ({@link ServiceErrorKeys.ERROR_CANCEL_PROMPT})
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
                value: 'Sample Script',
                label: 'Sample Script',
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

/**
 * Initialize a new project by asking the user several questions.
 */
async function initProject(): Promise<void> {
    intro('Hey there! 👋');
    const projectType = await _requestProjectTypeSelected() as ProjectType;
    const projectName = await _requestProjectName();
    const projectDescription = await _requestProjectDescription();
    try {
        const s = spinner();
        s.start('Running initialization process 🚀');
        const projectInformation: IProjectInformationDTO = {
            name: projectName,
            description: projectDescription,
            type: projectType
        };
        initAndesiteFolderStructure();
        initFolderStructure(projectInformation.type);

        const andesiteYml = new AndesiteYml();
        andesiteYml.initializeAndesiteYml(projectType);

        initPackageJson(projectInformation);
        initEslint();

        initJestConfig(projectInformation.name);

        const tsConfig = new TsConfig();
        tsConfig.initializeTsConfig();

        initEntryPoint();

        s.stop('Project initialized 😊');
    } catch (error) {
        _handleError(error);
    }
    outroBasedOnTime();
}

export { initProject };
