import type { BetterSQLiteDatabaseOptions } from '#/common/types/index.js';
import { AbstractDatabaseCreator } from './abstractDatabase.creator.js';

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
                    filename: options.filename,
                },
            },
            log: options.log,
        });
    }
}
