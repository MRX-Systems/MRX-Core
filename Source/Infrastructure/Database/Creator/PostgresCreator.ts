import type { BasaltLogger } from '@basalt-lab/basalt-logger';

import { AbstractCreator } from './AbstractCreator';

/**
 * Options for the Postgres Database
 */
export interface IPostgresDatabaseOptions {
    /**
     * Database Name
     */
    databaseName: string;
    /**
     * The server of the database
     */
    host: string;
    /**
     * The port of the database
     */
    port: number;
    /**
     * The user of the database
     */
    user: string;
    /**
     * The password of the database
     */
    password: string;
    /**
     * The minimum pool size of the database
     */
    poolMin?: number;
    /**
     * The maximum pool size of the database
     */
    poolMax?: number;
    /**
     * Instance of BasaltLogger  allowing to log messages in one or more strategies. ({@link BasaltLogger})
     */
    log: BasaltLogger;
    /**
     * Debug mode (active debug + stack trace)
     */
    debug?: boolean;
}

/**
 * Postgres Creator is a concrete creator for Postgres Database (Factory Pattern) extending ({@link AbstractCreator})
 */
export class PostgresCreator extends AbstractCreator {
    /**
     * Constructor of the PostgresCreator class
     *
     * @param options - The options for the Postgres Database. ({@link IPostgresDatabaseOptions})
     */
    public constructor(options: Readonly<IPostgresDatabaseOptions>) {
        super({
            dialect: {
                client: 'pg',
                debug: options.debug ?? false,
                acquireConnectionTimeout: 15000,
                connection: {
                    host: options.host,
                    port: options.port,
                    user: options.user,
                    password: options.password,
                    database: options.databaseName,
                },
                pool: {
                    min: options.poolMin ?? 2,
                    max: options.poolMax ?? 10
                }
            },
            log: options.log
        });
    }
}
