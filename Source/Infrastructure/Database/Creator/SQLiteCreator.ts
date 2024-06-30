import type { BasaltLogger } from '@basalt-lab/basalt-logger';
import SQLite from 'better-sqlite3';
import { SqliteDialect } from 'kysely';

import { AbstractCreator } from './AbstractCreator';

export interface ISQLiteDatabaseOptions {
    /**
     * The filename of the database
     * U can set :memory: for in-memory database
     */
    filename: string;
    /**
     * Instance of BasaltLogger allowing to log messages in one or more strategies. ({@link BasaltLogger})
     */
    log: BasaltLogger;
}

/**
 * SQLite Creator is a concrete creator for SQLite Database (Factory Pattern)
 *
 * @typeparam T - The database schema types
 */
export class SQLiteCreator<T> extends AbstractCreator<T> {
    /**
     * Constructor of the SQLiteCreator class
     * @param options - The options for the SQLite Database. ({@link ISQLiteDatabaseOptions})
     */
    public constructor(options: Readonly<ISQLiteDatabaseOptions>) {
        super({
            dialect: new SqliteDialect({
                database: new SQLite(options.filename)
            }),
            log: options.log
        });
    }
}
