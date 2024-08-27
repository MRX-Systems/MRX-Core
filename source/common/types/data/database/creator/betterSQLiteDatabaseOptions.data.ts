import type { BasaltLogger } from '@basalt-lab/basalt-logger';

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
