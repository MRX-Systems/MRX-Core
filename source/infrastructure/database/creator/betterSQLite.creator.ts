import type { BasaltLogger } from '@basalt-lab/basalt-logger';

import { AbstractDatabaseCreator } from './abstractDatabase.creator.ts';

/**
 * Options for the Better SQLite Database
 */
export interface BetterSQLiteDatabaseOptions {
    /**
     * The filename of the database
     * U can set :memory: for in-memory database
     */
    filename: string;
    /**
     * Instance of BasaltLogger allowing to log messages in one or more strategies. ({@link BasaltLogger})
     */
    log?: BasaltLogger;
}

/**
 * Better SQLite Creator is a concrete creator for Better SQLite Database (Factory Pattern).
 *
 * Inherit from the File class ({@link AbstractDatabaseCreator})
 */
export class BetterSQLiteCreator extends AbstractDatabaseCreator {
    /**
     * Constructor of the BetterSQLiteCreator class
     *
     * @param options - The options for the Better SQLite Database. ({@link BetterSQLiteDatabaseOptions})
     */
    public constructor(options: Readonly<BetterSQLiteDatabaseOptions>) {
        super({
            dialect: {
                client: 'better-sqlite3',
                debug: Boolean(options.log),
                connection: {
                    filename: options.filename
                }
            },
            log: options.log
        });
    }
}
