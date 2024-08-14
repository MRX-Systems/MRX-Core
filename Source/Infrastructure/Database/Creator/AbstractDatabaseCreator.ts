import type { BasaltLogger } from '@basalt-lab/basalt-logger';
import knex, { type Knex } from 'knex';

import { AndesiteError, ErrorKeys } from '@/Common/Error/index.js';
import type { Dialect } from '../KnexType.js';

/**
 * Abstract Database class for Database Creator
 */
export abstract class AbstractDatabaseCreator {
    /**
     * The database connection object ({@link Knex})
     */
    private _database: Knex | undefined;
    /**
     * The dialect of the database ({@link Dialect})
     */
    private readonly _dialect: Dialect;
    /**
     * /**
     * Instance of BasaltLogger allowing to log messages in one or more strategies. ({@link BasaltLogger})
     */
    private readonly _log: BasaltLogger | undefined;

    /**
     * Constructor of the AbstractCreator class
     *
     * @param options - The options of the AbstractDatabaseCreator (({@link Dialect}) & ({@link BasaltLogger}))
     */
    protected constructor(options: {
        dialect: Dialect
        log: BasaltLogger | undefined
    }) {
        this._dialect = options.dialect;
        this._log = options.log;
    }

    /**
     * Check if the database is connected
     *
     * @returns If the database is connected
     */
    public async isConnected(): Promise<boolean> {
        if (!this._database)
            return false;
        try {
            await this._database?.raw('SELECT 1');
            return true;
        } catch {
            return false;
        }
    }

    /**
     * Connect to the database
     *
     * @throws ({@link AndesiteError}) - If the database is not connected ({@link ErrorKeys.DATABASE_NOT_CONNECTED})
     */
    public async connect(): Promise<void> {
        this._database = knex({
            ...this._dialect,
            log: {
                debug: (message) => {
                    this._log?.debug(message);
                },
                error: (message) => {
                    this._log?.error(message);
                },
                deprecate: (message) => {
                    this._log?.warn(message);
                },
                warn: (message) => {
                    this._log?.warn(message);
                },
            }
        });
        if (!(await this.isConnected()))
            throw new AndesiteError({
                messageKey: ErrorKeys.DATABASE_NOT_CONNECTED,
            });
    }

    /**
     * Disconnect from the database
     */
    public async disconnect(): Promise<void> {
        await this._database?.destroy();
        this._database = undefined;
    }

    /**
     * Get the database connection object
     *
     * @throws ({@link AndesiteError}) - If the database is not connected ({@link ErrorKeys.DATABASE_NOT_CONNECTED})
     *
     * @returns The database connection object. ({@link Knex})
     */
    public get database(): Knex {
        if (!this._database)
            throw new AndesiteError({
                messageKey: ErrorKeys.DATABASE_NOT_CONNECTED,
            });
        return this._database as Knex;
    }
}
