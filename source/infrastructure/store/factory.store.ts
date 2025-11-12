import { CoreError } from '#/common/error/core.error.ts';
import { ErrorKeys } from '#/common/error/keys.error.ts';
import type { Cluster } from 'ioredis';
import type { AbstractStoreCreator } from './creator/abstractStore.creator.ts';
import { DragonFlyCreator, type DragonFlyStoreOptions } from './creator/dragonFly.creator.ts';

/**
 * FactoryStoreSingleton class. (Singleton)
 */
class FactoryStoreSingleton {
    /**
     * Singleton instance of the FactoryStore class. ({@link FactoryStoreSingleton})
     */
    private static _instance: FactoryStoreSingleton;

    /**
     * Map of store. Key is the name of the store and value is the ({@link AbstractStoreCreator}) with the store schema types.
     */
    private readonly _store: Map<string, AbstractStoreCreator>;

    /**
     * Private constructor of the FactoryStore class.
     */
    private constructor() {
        this._store = new Map();
    }

    /**
     * Constructor of the FactoryStore class.
     *
     * @returns A new instance of the FactoryStore class. ({@link FactoryStoreSingleton})
     */
    public static get instance(): FactoryStoreSingleton {
        if (!FactoryStoreSingleton._instance)
            FactoryStoreSingleton._instance = new FactoryStoreSingleton();
        return FactoryStoreSingleton._instance;
    }

    /**
     * Register a new store.
     *
     * @param name - The name of the store
     * @param type - The type of the store (ex: redis)
     * @param options - The options of the store. ({@link DragonFlyStoreOptions})
     *
     * @throws ({@link CoreError}) - If the store is already registered with the same name. ({@link ErrorKeys.STORE_ALREADY_REGISTERED})
     * @throws ({@link CoreError}) - If the store type is invalid. ({@link ErrorKeys.STORE_INVALID_TYPE})
     */
    public register(
        name: string,
        type: 'redis',
        options: DragonFlyStoreOptions
    ): void {
        if (this._store.has(name))
            throw new CoreError({
                messageKey: ErrorKeys.STORE_ALREADY_REGISTERED,
                detail: { name }
            });
        let creator: AbstractStoreCreator | undefined = undefined;
        if (type === 'redis')
            creator = new DragonFlyCreator(options);
        if (!creator)
            throw new CoreError({
                messageKey: ErrorKeys.STORE_INVALID_TYPE,
                detail: { type }
            });
        this._store.set(name, creator);
        creator.connect();
        const { log } = options;
        if (log)
            log.info(`Store ${name} initialized`);
    }

    /**
     * Unregister a store.
     *
     * @param name - The name of the store
     *
     * @throws ({@link CoreError}) - If the store is not registered. ({@link ErrorKeys.STORE_NOT_REGISTERED})
     */
    public unregister(name: string): void {
        if (!this._store.has(name))
            throw new CoreError({
                messageKey: ErrorKeys.STORE_NOT_REGISTERED,
                detail: { name }
            });
        const store: AbstractStoreCreator = this._store.get(name) as AbstractStoreCreator;
        if (store.isConnected())
            store.disconnect();
        this._store.delete(name);
    }

    /**
     * Get a store by name.
     *
     * @param name - The name of the store
     *
     * @throws ({@link CoreError}) - If the store is not registered. ({@link ErrorKeys.STORE_NOT_REGISTERED})
     *
     * @returns The store. ({@link Redis})
     */
    public get(name: string): Cluster {
        if (!this._store.has(name))
            throw new CoreError({
                messageKey: ErrorKeys.STORE_NOT_REGISTERED,
                detail: { name }
            });
        const store: AbstractStoreCreator = this._store.get(name) as AbstractStoreCreator;
        return store.store;
    }

    /**
     * Get the list of store names.
     *
     * @returns The list of store names.
     */
    public get registry(): string[] {
        return Array.from(this._store.keys());
    }
}

/**
 * FactoryStore is a singleton instance of the FactoryStoreSingleton class. ({@link FactoryStoreSingleton})
 */
export const FactoryStore = FactoryStoreSingleton.instance;
