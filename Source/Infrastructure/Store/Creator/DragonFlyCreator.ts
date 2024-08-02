import type { BasaltLogger } from '@basalt-lab/basalt-logger';

import { AbstractStoreCreator } from './AbstractStoreCreator.js';

/**
 * Options for the DragonFly Store
 */
export interface IDragonFlyStoreOptions {
    /**
     * The host of the store
     * default: localhost
     */
    host?: string;
    /**
     * The port of the store
     * default: 6379
     */
    port?: number;
    /**
     * The password of the store
     */
    password?: string;
    /**
     * The username of the store
     */
    username?: string;
    /**
     * Instance of BasaltLogger allowing to log messages in one or more strategies. ({@link BasaltLogger})
     */
    log?: BasaltLogger;

    /**
     * Use TLS for the connection
     */
    tls?: boolean;
}

/**
 * DragonFly Creator is a concrete creator for DragonFly Store (Factory Pattern) extending ({@link AbstractStoreCreator})
 */
export class DragonFlyCreator extends AbstractStoreCreator {

    /**
     * Constructor of the DragonFlyCreator class
     * 
     * @param options - The options of the store ({@link IDragonFlyStoreOptions})
     */
    public constructor(options: IDragonFlyStoreOptions) {
        super({
            config: {
                host: options.host ?? 'localhost',
                port: options.port ?? 6379,
                ...(options.password && { password: options.password }),
                ...(options.username && { username: options.username }),
                ...(options.tls && { tls: {} }),
            },
            log: options.log,
        });
    }
}