import SQLite from 'better-sqlite3';
import { SqliteDialect } from 'kysely';

import { AbstractCreator } from './AbstractCreator.js';

export interface ISQLiteDatabaseOptions {

    /**
     * The filename of the database
     * U can set :memory: for in-memory database
     */
    filename: string;
    /**
     * Activate the log
     */
    log?: boolean;
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
        super(new SqliteDialect({
            database: new SQLite(options.filename)
        }), options.log ?? false);
    }
}
