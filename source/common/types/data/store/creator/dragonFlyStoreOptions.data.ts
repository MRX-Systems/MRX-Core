import type { BasaltLogger } from '@basalt-lab/basalt-logger';

/**
 * Options for the DragonFly Store
 */
export interface DragonFlyStoreOptions {
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
