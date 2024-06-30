import type { BasaltLogger } from '@basalt-lab/basalt-logger';
import {
    DeduplicateJoinsPlugin,
    Kysely,
    type Dialect,
    type ErrorLogEvent,
    type QueryLogEvent
} from 'kysely';

import { AndesiteError } from '@/Common/Error';
import { InfrastructureDatabaseKeys } from '@/Common/Error/Enum';

/**
 * Abstract class for Database Creator
 *
 * @typeparam T - The database schema types
 */
export abstract class AbstractCreator<T> {
    /**
     * The database connection object ({@link Kysely})
     */
    private _database: Kysely<T> | undefined;
    /**
     * The dialect of the database ({@link Dialect})
     */
    private readonly _dialect: Dialect;
    /**
     * Instance of BasaltLogger allowing to log messages in one or more strategies. ({@link BasaltLogger})
     */
    private readonly _log: BasaltLogger | undefined;

    /**
     * Constructor of the AbstractCreator class
     *
     * @param dialect - The {@link Dialect} of the database (ex: PostgresDialect, MySQLDialect ...)
     * @param log - Instance of BasaltLogger allowing to log messages in one or more strategies. ({@link BasaltLogger})
     */
    protected constructor(options: {
        dialect: Readonly<Dialect>,
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
    public isConnected(): boolean {
        return Boolean(this._database);
    }

    /**
     * Connect to the database
     */
    public connection(): void {
        this._database = new Kysely<T>({
            dialect: this._dialect,
            log: (event: QueryLogEvent | ErrorLogEvent): void => {
                if (!this._log)
                    return;
                if (event.level === 'query')
                    this._log.debug(event);
                else
                    this._log.error(event);
            },
            plugins: [new DeduplicateJoinsPlugin()]
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
     * @throws ({@link AndesiteError}) - If the database is not connected ({@link InfrastructureDatabaseKeys.DATABASE_NOT_CONNECTED})
     *
     * @returns The database connection object. ({@link Kysely})
     */
    public get database(): Kysely<T> {
        if (!this._database)
            throw new AndesiteError({
                messageKey: InfrastructureDatabaseKeys.DATABASE_NOT_CONNECTED,
            });
        return this._database;
    }
}
