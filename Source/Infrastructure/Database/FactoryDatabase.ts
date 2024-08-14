import type { Knex } from 'knex';

import { AndesiteError, ErrorKeys } from '@/Common/Error/index.js';
import {
    BetterSQLiteCreator,
    MSSQLCreator,
    PostgresCreator,
    type AbstractDatabaseCreator,
    type IBetterSQLiteDatabaseOptions,
    type IMSSQLDatabaseOptions,
    type IPostgresDatabaseOptions
} from '@/Infrastructure/Database/Creator/index.js';

/**
 * FactoryDatabase class. (Singleton)
 */
class FactoryDatabaseSingleton {
    /**
     * Singleton instance of the FactoryDatabase class. ({@link FactoryDatabaseSingleton})
     */
    private static _instance: FactoryDatabaseSingleton;

    /**
     * Map of database. Key is the name of the database and value is the ({@link AbstractDatabaseCreator}) with the database schema types.
     */
    private readonly _database: Map<string, AbstractDatabaseCreator>;

    /**
     * Private constructor of the FactoryDatabase class.
     */
    private constructor() {
        this._database = new Map();
    }

    /**
     * Constructor of the FactoryDatabase class.
     *
     * @returns A new instance of the FactoryDatabase class. ({@link FactoryDatabaseSingleton})
     */
    public static get instance(): FactoryDatabaseSingleton {
        if (!this._instance)
            this._instance = new FactoryDatabaseSingleton();
        return this._instance;
    }

    /**
     * Register a new database.
     *
     * @param name - The name of the database
     * @param type - The type of the database (ex: postgres, better-sqlite, mssql)
     * @param options - The options of the database. ({@link IPostgresDatabaseOptions} or {@link IBetterSQLiteDatabaseOptions} or {@link IMSSQLDatabaseOptions})
     *
     * @throws ({@link AndesiteError}) - If the database is already registered with the same name. ({@link ErrorKeys.DATABASE_ALREADY_REGISTERED})
     * @throws ({@link AndesiteError}) - If the database is not connected ({@link ErrorKeys.DATABASE_NOT_CONNECTED})
     * @throws ({@link AndesiteError}) - If the database type is invalid. ({@link ErrorKeys.DATABASE_INVALID_TYPE})
     */
    public async register(
        name: string,
        type: 'postgres' | 'better-sqlite' | 'mssql',
        options: IPostgresDatabaseOptions | IBetterSQLiteDatabaseOptions | IMSSQLDatabaseOptions
    ): Promise<void> {
        if (this._database.has(name))
            throw new AndesiteError({
                messageKey: ErrorKeys.DATABASE_ALREADY_REGISTERED,
                detail: { name }
            });
        let creator: AbstractDatabaseCreator | undefined = undefined;
        if (type === 'postgres')
            creator = new PostgresCreator(options as IPostgresDatabaseOptions);
        else if (type === 'better-sqlite')
            creator = new BetterSQLiteCreator(options as IBetterSQLiteDatabaseOptions);
        else if (type === 'mssql')
            creator = new MSSQLCreator(options as IMSSQLDatabaseOptions);

        if (!creator)
            throw new AndesiteError({
                messageKey: ErrorKeys.DATABASE_INVALID_TYPE,
                detail: { type }
            });
        this._database.set(name, creator);
        await creator.connect();
        const { log } = options;
        if (log)
            log.info(`Database ${name} initialized`);
    }

    /**
     * Unregister a database by name.
     *
     * @param name - The name of the database to unregister
     *
     * @throws ({@link AndesiteError}) - If the database is not registered with the same name. ({@link ErrorKeys.DATABASE_NOT_REGISTERED})
     */
    public async unregister(name: string): Promise<void> {
        if (!this._database.has(name))
            throw new AndesiteError({
                messageKey: ErrorKeys.DATABASE_NOT_REGISTERED,
                detail: { name }
            });
        const database: AbstractDatabaseCreator = this._database.get(name) as AbstractDatabaseCreator;
        if (await database.isConnected())
            await database.disconnect();
        this._database.delete(name);
    }

    /**
     * Get a database by name.
     *
     * @param name - The name of the database to get
     *
     * @throws ({@link AndesiteError}) - If the database is not registered with the same name. ({@link ErrorKeys.DATABASE_NOT_REGISTERED})
     *
     * @returns The ({@link Knex}) instance
     */
    public get(name: string): Knex {
        if (!this._database.has(name))
            throw new AndesiteError({
                messageKey: ErrorKeys.DATABASE_NOT_REGISTERED,
                detail: { name }
            });
        const database: AbstractDatabaseCreator = this._database.get(name) as AbstractDatabaseCreator;
        return database.database;
    }

    /**
     * Get the list of registered databases.
     */
    public get registry(): string[] {
        return Array.from(this._database.keys());
    }
}

/**
 * The singleton instance of the FactoryDatabase class. ({@link FactoryDatabaseSingleton})
 */
export const FactoryDatabase = FactoryDatabaseSingleton.instance;
