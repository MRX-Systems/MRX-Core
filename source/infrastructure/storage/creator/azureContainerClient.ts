import type { ContainerClient } from '@azure/storage-blob';
import type { BasaltLogger } from '@basalt-lab/basalt-logger';
import type { Readable } from 'stream';

import { CoreError, ErrorKeys } from '#/common/error/index.ts';

/**
 * Blob options interface
 */
export interface BlobOptions {
    /**
     * The name of the blob to be uploaded
     */
    blobName: string;
    /**
     * The size of the file to be uploaded
     */
    blobSize: number;
    /**
     * The stream of the file to be uploaded. ({@link ReadableStream})
     */
    blobStream: Readable;
    /**
     * The metadata of the file to be uploaded
     */
    blobMetadata?: Record<string, string> | undefined;
}

export class AzureContainerClient {
    /**
     * The container client for the azure storage
     */
    private readonly _containerClient: ContainerClient;

    /**
     * Instance of BasaltLogger allowing to log messages in one or more strategies. ({@link BasaltLogger})
     */
    private readonly _log: BasaltLogger | undefined;

    /**
     * Creates a new instance of the AzureContainerClient class.
     *
     * @param containerClient - The container client for the azure storage
     */
    public constructor(containerClient: ContainerClient, log?: BasaltLogger) {
        this._containerClient = containerClient;
        this._log = log;
    }

    /**
     * Uploads a blob to the storage service
     *
     * @param options - The options for the upload operation ({@link BlobOptions})
     *
     * @throws ({@link CoreError}) - If the upload operation failed. ({@link ErrorKeys.AZ_STORAGE_BLOB_UPLOAD_FAILED})
     */
    public async uploadBlob(options: Readonly<BlobOptions>): Promise<void> {
        try {
            await this._containerClient.uploadBlockBlob(options.blobName, options.blobStream, options.blobSize, {
                metadata: options.blobMetadata ?? {},
            });
            this._log?.info(`[Azure:${this._containerClient.accountName}:${this._containerClient.containerName}:(UploadBlob)] - Blob "${options.blobName}" uploaded`);
        } catch (error) {
            throw new CoreError({
                messageKey: ErrorKeys.AZ_STORAGE_BLOB_UPLOAD_FAILED,
                detail: {
                    accountName: this._containerClient.accountName,
                    containerName: this._containerClient.containerName,
                    blobName: options.blobName,
                    error
                }
            });
        }
    }

    /**
     * Uploads multiple blobs to the storage service
     *
     * @param options - The options for the upload operation ({@link BlobOptions})
     *
     * @throws ({@link CoreError}) - If the upload operation failed. ({@link ErrorKeys.AZ_STORAGE_BLOB_UPLOAD_FAILED})
     */
    public async uploadBlobs(options: Readonly<BlobOptions>[]): Promise<void> {
        await Promise.all(options.map(async (option) => {
            await this.uploadBlob(option);
        }));
    }

    /**
     * Downloads a blob from the storage service
     *
     * @param blobName - The name of the blob to download from the storage service
     *
     * @throws ({@link CoreError}) - If the download operation failed. ({@link ErrorKeys.AZ_STORAGE_BLOB_DOWNLOAD_FAILED})
     *
     * @returns The options for the downloaded blob ({@link BlobOptions})
     */
    public async downloadBlob(blobName: string): Promise<BlobOptions> {
        try {
            const blobClient = this._containerClient.getBlobClient(blobName);
            const blobDownloadResponse = await blobClient.download();
            this._log?.info(`[Azure:${this._containerClient.accountName}:${this._containerClient.containerName}:(DownloadBlob)] - Blob "${blobName}" downloaded`);
            return {
                blobName,
                blobSize: blobDownloadResponse.contentLength ?? 0,
                blobStream: blobDownloadResponse.readableStreamBody as Readable,
                blobMetadata: blobDownloadResponse.metadata
            };
        } catch (error) {
            throw new CoreError({
                messageKey: ErrorKeys.AZ_STORAGE_BLOB_DOWNLOAD_FAILED,
                detail: {
                    accountName: this._containerClient.accountName,
                    containerName: this._containerClient.containerName,
                    blobName,
                    error
                }
            });
        }
    }

    /**
     * Deletes a blob from the storage service
     *
     * @param blobName - The name of the blob to delete from the storage service
     *
     * @throws ({@link CoreError}) - If the delete operation failed. ({@link ErrorKeys.AZ_STORAGE_BLOB_DELETE_FAILED})
     */
    public async deleteBlob(blobName: string): Promise<void> {
        try {
            const blobClient = this._containerClient.getBlobClient(blobName);
            await blobClient.deleteIfExists();
            this._log?.info(`[Azure:${this._containerClient.accountName}:${this._containerClient.containerName}:(DeleteBlob)] - Blob "${blobName}" deleted`);
        } catch (error) {
            throw new CoreError({
                messageKey: ErrorKeys.AZ_STORAGE_BLOB_DELETE_FAILED,
                detail: {
                    accountName: this._containerClient.accountName,
                    containerName: this._containerClient.containerName,
                    blobName,
                    error
                }
            });
        }
    }

    /**
     * Deletes multiple blobs from the storage service
     *
     * @param blobNames - The names of the blobs to delete from the storage service
     *
     * @throws ({@link CoreError}) - If the delete operation failed. ({@link ErrorKeys.AZ_STORAGE_BLOB_DELETE_FAILED})
     */
    public async deleteBlobs(blobNames: string[]): Promise<void> {
        await Promise.all(blobNames.map(async (blobName) => {
            await this.deleteBlob(blobName);
        }));
    }

    /**
     * Gets the information of a blob from the storage service
     *
     * @param blobName - The name of the blob to get information from the storage service
     *
     * @throws ({@link CoreError}) - If the get operation failed. ({@link ErrorKeys.AZ_STORAGE_BLOB_GET_FAILED})
     *
     * @returns The options for the blob ({@link BlobOptions})
     */
    public async getBlobInfo(blobName: string): Promise<Omit<BlobOptions, 'blobStream'>> {
        try {
            const blobClient = this._containerClient.getBlobClient(blobName);
            const blobProperties = await blobClient.getProperties();
            this._log?.info(`[Azure:${this._containerClient.accountName}:${this._containerClient.containerName}:(GetBlobInfo)] - Blob "${blobName}" information retrieved`);
            return {
                blobName,
                blobSize: blobProperties.contentLength ?? 0,
                blobMetadata: blobProperties.metadata
            };
        } catch (error) {
            throw new CoreError({
                messageKey: ErrorKeys.AZ_STORAGE_BLOB_GET_FAILED,
                detail: {
                    accountName: this._containerClient.accountName,
                    containerName: this._containerClient.containerName,
                    blobName,
                    error
                }
            });
        }
    }

    /**
     * Checks if a blob exists in the storage service
     *
     * @param blobName - The name of the blob to check if it exists in the storage service
     *
     * @throws ({@link CoreError}) - If the check operation failed. ({@link ErrorKeys.AZ_STORAGE_BLOB_GET_FAILED})
     *
     * @returns A boolean indicating if the blob exists in the storage service
     */
    public async checkBlobExists(blobName: string): Promise<boolean> {
        try {
            const blobClient = this._containerClient.getBlobClient(blobName);
            const exists = await blobClient.exists();
            this._log?.info(`[Azure:${this._containerClient.accountName}:${this._containerClient.containerName}:(CheckBlobExists)] - Blob "${blobName}" exists: ${exists}`);
            return exists;
        } catch (error) {
            throw new CoreError({
                messageKey: ErrorKeys.AZ_STORAGE_BLOB_GET_FAILED,
                detail: {
                    accountName: this._containerClient.accountName,
                    containerName: this._containerClient.containerName,
                    blobName,
                    error
                }
            });
        }
    }

    /**
     * Lists all the blobs in a container
     *
     * @throws ({@link CoreError}) - If the list operation failed. ({@link ErrorKeys.STORAGE_LIST_FAILED})
     *
     * @returns The list of blobs in the container
     */
    public async listBlobs(): Promise<string[]> {
        try {
            const blobs = await Array.fromAsync(this._containerClient.listBlobsFlat());
            this._log?.info(`[Azure:${this._containerClient.accountName}] - List ${blobs.length} blobs in container ${this._containerClient.containerName}`);
            return blobs.map((blob) => blob.name);
        } catch (error) {
            throw new CoreError({
                messageKey: ErrorKeys.AZ_STORAGE_CONTAINER_LIST_FAILED,
                detail: {
                    accountName: this._containerClient.accountName,
                    containerName: this._containerClient.containerName,
                    error
                }
            });
        }
    }

    /**
     * Lists all the blobs in a container with their details.
     *
     * @throws ({@link CoreError}) - If the list operation failed. ({@link ErrorKeys.STORAGE_LIST_FAILED})
     *
     * @returns The list of blobs in the container with their details ({@link BlobOptions})
     */
    public async listBlobsDetails(): Promise<Omit<BlobOptions, 'blobStream'>[]> {
        try {
            const blobs = await Array.fromAsync(this._containerClient.listBlobsFlat({
                includeMetadata: true,
            }));
            this._log?.info(`[Azure:${this._containerClient.accountName}] - List ${blobs.length} blobs details in container ${this._containerClient.containerName}`);

            return blobs.map((blob) => ({
                blobName: blob.name,
                blobSize: blob.properties.contentLength ?? 0,
                blobMetadata: { ...blob.metadata }
            }));
        } catch (error) {
            throw new CoreError({
                messageKey: ErrorKeys.AZ_STORAGE_CONTAINER_LIST_FAILED,
                detail: {
                    accountName: this._containerClient.accountName,
                    containerName: this._containerClient.containerName,
                    error
                }
            });
        }
    }
}
