import { CoreError, ErrorKeys } from '#/common/error/index.ts';
import { AzureBlobServiceClientCreator, type AzureBlobServiceClientOptions } from '#/infrastructure/storage/creator/index.ts';

/**
 * AzureFactoryStorageSingleton class. (Singleton)
 */
class AzureFactoryStorageSingleton {
    /**
     * Singleton instance of the FactoryStorage class. ({@link AzureFactoryStorageSingleton})
     */
    private static _instance: AzureFactoryStorageSingleton;

    /**
     * Map of storage. Key is the name of the storage and value is the ({@link AbstractStorageCreator}) with the storage schema types.
     */
    private readonly _storage: Map<string, AzureBlobServiceClientCreator>;

    /**
     * Private constructor of the FactoryStorage class.
     */
    private constructor() {
        this._storage = new Map();
    }

    /**
     * Constructor of the FactoryStore class.
     *
     * @returns A new instance of the FactoryStore class. ({@link FactoryStoreSingleton})
     */
    public static get instance(): AzureFactoryStorageSingleton {
        if (!AzureFactoryStorageSingleton._instance)
            AzureFactoryStorageSingleton._instance = new AzureFactoryStorageSingleton();
        return AzureFactoryStorageSingleton._instance;
    }

    /**
     * Register a new storage.
     *
     * @param name - The name of the storage
     * @param options - The options of the storage. ({@link AzureBlobServiceClientOptions})
     *
     * @throws ({@link CoreError}) - If the storage is already registered with the same name. ({@link ErrorKeys.AZ_STORAGE_ALREADY_REGISTERED})
     * @throws ({@link CoreError}) - If the storage type is invalid. ({@link ErrorKeys.STORAGE_INVALID_TYPE})
     */
    public register(
        name: string,
        options: Readonly<AzureBlobServiceClientOptions>
    ): void {
        if (this._storage.has(name))
            throw new CoreError({
                messageKey: ErrorKeys.AZ_STORAGE_ALREADY_REGISTERED,
                detail: { name }
            });
        const creator: AzureBlobServiceClientCreator = new AzureBlobServiceClientCreator(options);
        this._storage.set(name, creator);
        const { log } = options;
        if (log)
            log.info(`Storage ${name} initialized`);
    }

    /**
     * Get the storage by name.
     *
     * @param name - The name of the storage
     *
     * @throws ({@link CoreError}) - If the storage is not registered. ({@link ErrorKeys.AZ_STORAGE_NOT_REGISTERED})
     */
    public unregister(name: string): void {
        if (!this._storage.has(name))
            throw new CoreError({
                messageKey: ErrorKeys.AZ_STORAGE_NOT_REGISTERED,
                detail: { name }
            });
        this._storage.delete(name);
    }

    /**
     * Get the storage by name.
     *
     * @param name - The name of the storage
     *
     * @throws ({@link CoreError}) - If the storage is not registered. ({@link ErrorKeys.AZ_STORAGE_NOT_REGISTERED})
     *
     * @returns The storage by name ({@link AzureBlobServiceClientCreator})
     */
    public get(name: string): AzureBlobServiceClientCreator {
        if (!this._storage.has(name))
            throw new CoreError({
                messageKey: ErrorKeys.AZ_STORAGE_NOT_REGISTERED,
                detail: { name }
            });
        return this._storage.get(name) as AzureBlobServiceClientCreator;
    }

    /**
     * Get the list of registered storage.
     */
    public get registry(): string[] {
        return Array.from(this._storage.keys());
    }

    /**
     * Check if the storage is registered by name.
     *
     * @param name - The name of the storage to check
     *
     * @returns If the storage is registered
     */
    public has(name: string): boolean {
        return this._storage.has(name);
    }
}

/**
 * FactoryStorage is a singleton instance of the FactoryStoreSingleton class. ({@link AzureFactoryStorageSingleton})
 */
export const AzureFactoryStorage = AzureFactoryStorageSingleton.instance;
