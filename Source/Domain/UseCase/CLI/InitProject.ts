import {
    cancel,
    intro,
    isCancel,
    outro,
    select,
    spinner,
    text
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
} from '@clack/prompts';
import { exit } from 'process';


import { AndesiteError } from '@/Common/Error';
import { type IProjectInformationDTO } from '@/DTO';
import { initAndesiteYmlConfig, initEntryPoint, initEslint, initFolderStructure, initNpmIgnoreFile, initPackageJson } from '@/Domain/Service/User/Config';
import { initAndesiteFolderStructure, initJestConfig, initTsConfig, initTsConfigUser } from '@/Domain/Service/User/Config/AndesiteFolder';

/**
 * Cancel the project initialization and stop the process.
 */
function _cancelAndStop(): void {
    cancel('Project initialization canceled');
    exit(0);
}

/**
 * The user selects the project type.
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
                value: 'Worker Manager',
                label: 'Worker Manager',
            },
            {
                value: 'Library',
                label: 'Library',
            },
            {
                value: 'Sample Script',
                label: 'Sample Script',
            },
        ]
    });
    if (isCancel(projectType)) _cancelAndStop();
    return projectType as string;
}

/**
 * Request the project name to the user.
 * 
 * @returns The project name.
 */
async function _requestProjectName(): Promise<string> {
    const projectName = await text({
        message: 'Enter the project name',
        defaultValue: 'my-project',
        placeholder: 'my-project'
    });
    if (isCancel(projectName)) _cancelAndStop();
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
    if (isCancel(projectDescription)) _cancelAndStop();
    return projectDescription as string;
}

/**
 * Initialize a new project by asking the user several questions.
 */
async function initProject(): Promise<void> {
    intro('Hey there! 👋');
    const projectType = await _requestProjectTypeSelected();
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
        initAndesiteYmlConfig(projectInformation.type);
        initPackageJson(projectInformation);
        initEslint();
        initJestConfig(projectInformation.name);
        initTsConfig();
        initTsConfigUser();
        initEntryPoint();

        if (projectType === 'Library') 
            initNpmIgnoreFile();
        s.stop('Project initialized 😊');
    } catch (error) {
        if (error instanceof AndesiteError)
            cancel(`An error occurred while initializing the project 😢 ${error.message}`);
        else
            cancel('An error occurred while initializing the project 😢');
        console.error(error);
        exit(1);
    }

    const date = new Date();
    if (date.getHours() >= 8 && date.getHours() <= 18)
        outro('Have a great day! 🌞');
    else
        outro('Have a great night! 🌚');
}

export { initProject };
