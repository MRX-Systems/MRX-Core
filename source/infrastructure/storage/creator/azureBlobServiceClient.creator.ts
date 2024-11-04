import { BlobServiceClient } from '@azure/storage-blob';
import type { BasaltLogger } from '@basalt-lab/basalt-logger';

import { CoreError, ErrorKeys } from '#/common/error/index.ts';
import { AzureContainerClient } from './azureContainerClient.ts';

/**
 * Azure storage options
 */
export interface AzureBlobServiceClientOptions {
    /**
     * The connection string for the azure storage
     */
    connectionString: string;
    /**
     * Instance of BasaltLogger allowing to log messages in one or more strategies. ({@link BasaltLogger})
     */
    log?: BasaltLogger;
}

export class AzureBlobServiceClientCreator {
    /**
     * The blob service client for the azure storage
     */
    private readonly _blobServiceClient: BlobServiceClient;

    /**
     * Instance of BasaltLogger allowing to log messages in one or more strategies. ({@link BasaltLogger})
     */
    private readonly _log: BasaltLogger | undefined;

    /**
     * Creates a new instance of the AzureBlobServiceClientCreator class.
     *
     * @param nameStorage - The name of the storage service
     * @param options - The options for the storage service. ({@link AzureBlobServiceClientOptions})
     */
    public constructor(options: Readonly<AzureBlobServiceClientOptions>) {
        this._blobServiceClient = BlobServiceClient.fromConnectionString(options.connectionString);
        this._log = options.log;
    }

    /**
     * Lists all the containers in the storage service
     *
     * @throws ({@link CoreError}) - If the list operation failed. ({@link ErrorKeys.AZ_STORAGE_LIST_CONTAINER_FAILED})
     *
     * @returns The list of containers in the storage service
     */
    public listContainers(): Promise<string[]> {
        try {
            const containers = Array.fromAsync(this._blobServiceClient.listContainers());
            this._log?.info(`[Azure - ${this._blobServiceClient.accountName}] - List of containers`);
            return containers.then((containers) => containers.map((container) => container.name));
        } catch (error) {
            throw new CoreError({
                messageKey: ErrorKeys.AZ_STORAGE_LIST_CONTAINER_FAILED,
                detail: {
                    accountName: this._blobServiceClient.accountName,
                    error
                }
            });
        }
    }

    /**
     * Creates a new container in the storage service
     *
     * @param containerName - The name of the container to create
     *
     * @throws ({@link CoreError}) - If the create operation failed. ({@link ErrorKeys.AZ_STORAGE_CREATE_FAILED})
     */
    public async createContainer(containerName: string): Promise<void> {
        try {
            await this._blobServiceClient.createContainer(containerName);
            this._log?.info(`[Azure - ${this._blobServiceClient.accountName}] - Container "${containerName}" created`);
        } catch (error) {
            throw new CoreError({
                messageKey: ErrorKeys.AZ_STORAGE_CREATE_FAILED,
                detail: {
                    accountName: this._blobServiceClient.accountName,
                    containerName,
                    error
                }
            });
        }
    }

    /**
     * Deletes a container in the storage service
     *
     * @param containerName - The name of the container to delete
     *
     * @throws ({@link CoreError}) - If the delete operation failed. ({@link ErrorKeys.AZ_STORAGE_DELETE_FAILED})
     */
    public async deleteContainer(containerName: string): Promise<void> {
        try {
            await this._blobServiceClient.deleteContainer(containerName);
            this._log?.info(`[Azure - ${this._blobServiceClient.accountName}] - Container "${containerName}" deleted`);
        } catch (error) {
            throw new CoreError({
                messageKey: ErrorKeys.AZ_STORAGE_DELETE_FAILED,
                detail: {
                    accountName: this._blobServiceClient.accountName,
                    containerName,
                    error
                }
            });
        }
    }

    /**
     * Gets a container client for the specified container or creates a new one if it does not exist
     *
     * @param containerName - The name of the container
     *
     * @returns The container client for the specified container name ({@link AzureContainerClient})
     */
    public getContainerClient(containerName: string): AzureContainerClient {
        try {
            return new AzureContainerClient(this._blobServiceClient.getContainerClient(containerName), this._log);
        } catch (error) {
            throw new CoreError({
                messageKey: ErrorKeys.AZ_STORAGE_GET_CONTAINER_FAILED,
                detail: {
                    accountName: this._blobServiceClient.accountName,
                    containerName,
                    error
                }
            });
        }
    }
}
