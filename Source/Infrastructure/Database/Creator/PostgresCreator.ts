import type { BasaltLogger } from '@basalt-lab/basalt-logger';
import { PostgresDialect } from 'kysely';
import { Pool } from 'pg';

import { AbstractCreator } from './AbstractCreator';

/**
 * Interface for Postgres Database
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
     * The user of the database
     */
    user: string;
    /**
     * The password of the database
     */
    password: string;
    /**
     * The port of the database
     */
    port: number;
    /**
     * The pool size min of the database
     */
    poolSizeMax?: number;
    /**
     * Instance of BasaltLogger allowing to log messages in one or more strategies. ({@link BasaltLogger})
     */
    log: BasaltLogger;
}

/**
 * Postgres Creator is a concrete creator for Postgres Database (Factory Pattern)
 *
 * @typeparam T - The database schema types
 */
export class PostgresCreator<T> extends AbstractCreator<T> {
    /**
     * Constructor of the PostgresCreator class
     * @param options - The options for the Postgres Database. ({@link IPostgresDatabaseOptions})
     */
    public constructor(options: Readonly<IPostgresDatabaseOptions>) {
        super({
            dialect: new PostgresDialect({
                pool: new Pool({
                    database: options.databaseName,
                    host: options.host,
                    user: options.user,
                    port: options.port,
                    max: options.poolSizeMax ?? 10,
                })
            }),
            log: options.log
        });
    }
}
