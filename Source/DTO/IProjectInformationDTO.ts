/**
 * Interface for Project Information object that is used to store information about a project.
 */
export interface IProjectInformationDTO {
    /**
     * The name of the project.
     */
    name: string;
    /**
     * The description of the project.
     */
    description: string;
    /**
     * The type of the project. (ex: 'API', 'Library', ...)
     */
    type: string;
}