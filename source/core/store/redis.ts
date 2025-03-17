import { Redis as IoRedis, type RedisOptions } from 'ioredis';

/**
 * It is a wrapper around the `ioredis` library, for add to SingletonManager of [Basalt-Helper](https://basalt-lab.github.io/basalt-doc/basalt-helper/example/utility/basalt-utility.html)
 *
 * The `Redis` class manages the connection and operations with a Redis database.
 * It uses the `ioredis` library for Redis interactions.
 *
 * When an instance of `Redis` is created, it can be configured using {@link RedisOptions}.
 * The connection to the Redis server is established during the instantiation of the class.
 *
 * ### Overview:
 * @example
 * ```typescript
 * const options: RedisOptions = {
 *     host: 'localhost',
 *     port: 6379,
 *     password: 'password'
 * };
 *
 * const redis = new Redis(options);
 *
 * // Access the ioredis client
 * const client = redis.client;
 * await client.set('key', 'value');
 * const value = await client.get('key');
 * console.log(value); // Outputs: value
 * ```
 */
export class Redis {
    /**
     * The ioredis client instance.
     */
    private readonly _client: IoRedis;

    /**
     * Creates a new instance of the `Redis` class.
     * @param options - The configuration options for the Redis connection. ({@link RedisOptions})
     */
    public constructor(options: RedisOptions) {
        this._client = new IoRedis(options);
    }

    /**
     * Gets the ioredis client instance.
     */
    public get client(): IoRedis {
        return this._client;
    }
}