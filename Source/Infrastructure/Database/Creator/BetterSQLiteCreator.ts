import type { BasaltLogger } from '@basalt-lab/basalt-logger';

import { AbstractCreator } from './AbstractCreator.js';

/**
 * Options for the Better SQLite Database
 */
export interface IBetterSQLiteDatabaseOptions {
    /**
     * The filename of the database
     * U can set :memory: for in-memory database
     */
    filename: string;
    /**
     * Instance of BasaltLogger allowing to log messages in one or more strategies. ({@link BasaltLogger})
     */
    log: BasaltLogger;
    /**
     * Debug mode (active debug + stack trace)
     */
    debug?: boolean;
}

/**
 * Better SQLite Creator is a concrete creator for Better SQLite Database (Factory Pattern) extending ({@link AbstractCreator})
 */
export class BetterSQLiteCreator extends AbstractCreator {
    /**
     * Constructor of the BetterSQLiteCreator class
     *
     * @param options - The options for the Better SQLite Database. ({@link IBetterSQLiteDatabaseOptions})
     */
    public constructor(options: Readonly<IBetterSQLiteDatabaseOptions>) {
        super({
            dialect: {
                client: 'better-sqlite3',
                debug: options.debug ?? false,
                connection: {
                    filename: options.filename,
                },
            },
            log: options.log
        });
    }
}
