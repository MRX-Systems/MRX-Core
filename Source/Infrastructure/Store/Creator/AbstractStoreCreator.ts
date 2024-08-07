import type { BasaltLogger } from '@basalt-lab/basalt-logger';
import { Redis, type RedisOptions } from 'ioredis';

import { InfrastructureErrorKeys } from '@/Common/Error/Enum/index.js';
import { AndesiteError } from '@/Common/Error/index.js';

/**
 * Abstract Store class for Store Creator
 */
export abstract class AbstractStoreCreator {
    /**
     * The store connection object ({@link Redis})
     */
    private _store: Redis | undefined;

    /**
     * The configuration of the store ({@link RedisOptions})
     */
    private readonly _config: RedisOptions;

    /**
     * Constructor of the AbstractCreator class
     *
     * @param options - The options of the AbstractStoreCreator (({@link RedisOptions}) & ({@link BasaltLogger}))
     */
    protected constructor(options: {
        config: RedisOptions
        log: BasaltLogger | undefined
    }) {
        this._config = options.config;
    }

    /**
     *  Connect to the store
     *
     * @throws ({@link AndesiteError}) - If the store is not connected ({@link InfrastructureErrorKeys.STORE_NOT_CONNECTED})
     */
    public connect(): void {
        try {
            this._store = new Redis(this._config);
        } catch (error) {
            throw new AndesiteError({
                messageKey: InfrastructureErrorKeys.STORE_NOT_CONNECTED,
                detail: error
            });
        }
    }

    /**
     * Check if the store is connected
     *
     * @returns If the store is connected or not
     */
    public isConnected(): boolean {
        return Boolean(this._store);
    }

    /**
     * Disconnect from the store
     */
    public disconnect(): void {
        if (this._store) {
            this._store.disconnect();
            this._store = undefined;
        }
    }

    /**
     * Get the store connection object
     *
     * @throws ({@link AndesiteError}) - If the store is not connected ({@link InfrastructureErrorKeys.STORE_NOT_CONNECTED})
     */
    public get store(): Redis {
        if (!this._store)
            throw new AndesiteError({
                messageKey: InfrastructureErrorKeys.STORE_NOT_CONNECTED,
            });
        return this._store;
    }
}
