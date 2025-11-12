import type { BasaltLogger } from '@basalt-lab/basalt-logger';

import { CoreError } from '#/common/error/core.error.ts';
import { ErrorKeys } from '#/common/error/keys.error.ts';
import { Cluster, type RedisOptions } from '#/common/lib/optional/ioredis/ioredis.lib.ts';

/**
 * Abstract Store class for Store Creator
 */
export abstract class AbstractStoreCreator {
    /**
     * The store connection object ({@link Cluster})
     */
    private _cluster: Cluster | undefined;

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
     * @throws ({@link CoreError}) - If the store is not connected ({@link ErrorKeys.STORE_NOT_CONNECTED})
     */
    public connect(): void {
        try {
            this._cluster = new Cluster(
                [
                    {
                        host: this._config.host,
                        port: this._config.port
                    }
                ],
                {
                    scaleReads: 'master',
                    slotsRefreshTimeout: 20000,
                    slotsRefreshInterval: 60000,
                    redisOptions: {
                        password: this._config.password as string,
                        tls: {},
                        maxRetriesPerRequest: 3
                    },
                    clusterRetryStrategy: (): number => 1000
                }
            );
        } catch (error) {
            throw new CoreError({
                messageKey: ErrorKeys.STORE_NOT_CONNECTED,
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
        return Boolean(this._cluster);
    }

    /**
     * Disconnect from the store
     */
    public disconnect(): void {
        if (this._cluster) {
            this._cluster.disconnect();
            this._cluster = undefined;
        }
    }

    /**
     * Get the store connection object
     *
     * @throws ({@link CoreError}) - If the store is not connected ({@link ErrorKeys.STORE_NOT_CONNECTED})
     */
    public get store(): Cluster {
        if (!this._cluster)
            throw new CoreError({
                messageKey: ErrorKeys.STORE_NOT_CONNECTED
            });
        return this._cluster;
    }
}
