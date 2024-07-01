import type { Knex } from 'knex';

import {
    BetterSQLiteCreator,
    MSSQLCreator,
    PostgresCreator,
    type AbstractCreator,
    type IBetterSQLiteDatabaseOptions,
    type IMSSQLDatabaseOptions,
    type IPostgresDatabaseOptions
} from '@/Infrastructure/Database/Creator';

/**
 * FactoryDatabase class.
 */
export class FactoryDatabase {
    /**
     * Singleton instance of the FactoryDatabase class. ({@link FactoryDatabase})
     */
    private static _instance: FactoryDatabase;

    /**
     * Map of database. Key is the name of the database and value is the ({@link AbstractCreator}) with the database schema types.
     */
    private readonly _database: Map<string, unknown> = new Map();

    /**
     * Constructor of the FactoryDatabase class.
     *
     * @returns A new instance of the FactoryDatabase class. ({@link FactoryDatabase})
     */
    public static get instance(): FactoryDatabase {
        if (!this._instance)
            this._instance = new FactoryDatabase();
        return this._instance;
    }

    /**
     * Register a new database.
     *
     * @param name - The name of the database
     * @param type - The type of the database (ex: postgres, better-sqlite, mssql)
     * @param options - The options of the database. ({@link IPostgresDatabaseOptions} or {@link IBetterSQLiteDatabaseOptions} or {@link IMSSQLDatabaseOptions})
     */
    public register(
        name: string,
        type: 'postgres' | 'better-sqlite' | 'mssql',
        options: IPostgresDatabaseOptions | IBetterSQLiteDatabaseOptions | IMSSQLDatabaseOptions
    ): void {
        let creator: AbstractCreator | undefined = undefined;
        if (type === 'postgres')
            creator = new PostgresCreator(options as IPostgresDatabaseOptions);
        else if (type === 'better-sqlite')
            creator = new BetterSQLiteCreator(options as IBetterSQLiteDatabaseOptions);
        else if (type === 'mssql')
            creator = new MSSQLCreator(options as IMSSQLDatabaseOptions);
        if (creator)
            this._database.set(name, creator);
    }

    /**
     * Unregister a database by name.
     *
     * @param name - The name of the database to unregister
     */
    public async unregister(name: string): Promise<void> {
        const database: AbstractCreator = this._database.get(name) as AbstractCreator;
        if (database.isConnected())
            await database.disconnection();
        this._database.delete(name);
    }

    /**
     * Get a database by name.
     *
     * @param name - The name of the database to get
     *
     * @returns The ({@link Knex}) instance
     */
    public get(name: string): Knex | undefined {
        const database: AbstractCreator = this._database.get(name) as AbstractCreator;
        if (!database.isConnected())
            database.connection();
        return database.database;
    }
}
