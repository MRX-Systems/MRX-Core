import { AbstractRepository } from './AbstractRepository.js';
/**
 * The CrudRepository class. It's a repository for Crud Handler. Inherited ({@link AbstractRepository})
 *
 * @typeparam T - The type of the data.
 */
export class CrudRepository<T> extends AbstractRepository<T> {
    /**
     * Constructor of the CrudRepository.
     *
     * @param table - The table name.
     * @param databaseName - The name of the database.
     * @param primaryKey - The primary key of the table. (default is ['id', 'NUMBER'])
     *
     * @throws ({@link AndesiteError}) - If the database is not registered with the same name. ({@link InfrastructureDatabaseKeys.DATABASE_NOT_REGISTERED})
     * @throws ({@link AndesiteError}) - If the database is not connected ({@link InfrastructureDatabaseKeys.DATABASE_NOT_CONNECTED})
     */
    public constructor(
        table: string,
        databaseName: string,
        primaryKey?: [keyof T, 'NUMBER' | 'STRING']
    ) {
        super(table, databaseName, primaryKey);
    }
}
