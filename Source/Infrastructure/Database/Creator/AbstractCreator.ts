import type { BasaltLogger } from '@basalt-lab/basalt-logger';
import knex, { type Knex } from 'knex';

import { AndesiteError } from '@/Common/Error/index.js';
import { InfrastructureDatabaseKeys } from '@/Common/Error/Enum/index.js';

/**
 * Dialect of the database
 */
export type Dialect = Knex.Config;

/**
 * Abstract class for Database Creator
 */
export abstract class AbstractCreator {
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
     */
    protected constructor(options: {
        dialect: Dialect
        log?: BasaltLogger
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
     * @throws ({@link AndesiteError}) - If the database is not connected ({@link InfrastructureDatabaseKeys.DATABASE_NOT_CONNECTED})
     */
    public async connection(): Promise<void> {
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
        if (await this.isConnected())
            throw new AndesiteError({
                messageKey: InfrastructureDatabaseKeys.DATABASE_NOT_CONNECTED,
            });
    }

    /**
     * Disconnect from the database
     */
    public async disconnection(): Promise<void> {
        await this._database?.destroy();
        this._database = undefined;
    }

    /**
     * Get the database connection object
     *
     * @returns The database connection object. ({@link Knex})
     */
    public get database(): Knex {
        return this._database as Knex;
    }
}
