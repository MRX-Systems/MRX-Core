import { type Kysely } from 'kysely';

import {
    type AbstractCreator,
    type IPostgresDatabaseOptions,
    type ISQLiteDatabaseOptions,
    PostgresCreator,
    SQLiteCreator
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
     * Map of database. Key is the name of the database and value is the {@link AbstractCreator} with the database schema types.
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
     * @param type - The type of the database (ex: postgres, sqlite, mssql)
     * @param options - The options of the database. ({@link IPostgresDatabaseOptions}, {@link ISQLiteDatabaseOptions})
     */
    public register<T>(
        name: string,
        type: 'postgres' | 'sqlite' | 'mssql',
        options: IPostgresDatabaseOptions | ISQLiteDatabaseOptions
    ): void {
        let creator: AbstractCreator<T> | undefined = undefined;
        if (type === 'postgres')
            creator = new PostgresCreator<T>(options as IPostgresDatabaseOptions);
        else if (type === 'sqlite')
            creator = new SQLiteCreator<T>(options as ISQLiteDatabaseOptions);

        if (creator)
            this._database.set(name, creator);
    }

    /**
     * Unregister a database by name.
     *
     * @param name - The name of the database to unregister
     */
    public async unregister(name: string): Promise<void> {
        const database: AbstractCreator<unknown> = this._database.get(name) as AbstractCreator<unknown>;
        if (database.isConnected())
            await database.disconnection();
        this._database.delete(name);
    }

    /**
     * Get a database by name.
     *
     * @param name - The name of the database to get
     * @returns The {@link Kysely} instance with the database schema types
     */
    public get<T>(name: string): Kysely<T> | undefined {
        const database: AbstractCreator<T> = this._database.get(name) as AbstractCreator<T>;
        if (!database.isConnected())
            database.connection();
        return database.database;
    }
}
