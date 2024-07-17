import type { IPaginationOptionQueryDTO, IWhereClauseDTO } from '@/DTO/index.js';
import { CrudRepository } from '@/Infrastructure/Repository/index.js';

/**
 * The insert function. It inserts data into the table.
 *
 * @param data - The data to insert.
 * @param table - The table name.
 * @param databaseName - The name of the database.
 * @param primaryKey - The primary key of the table.
 *
 * @throws ({@link AndesiteError}) - If the query can throw an error and an error occurred ({@link InfrastructureDatabaseKeys.DATABASE_QUERY_ERROR})
 * @throws ({@link AndesiteError}) - If the query can throw an error and an error occurred ({@link InfrastructureDatabaseKeys.DATABASE_MODEL_NOT_CREATED})
 *
 * @returns The inserted data. ({@link T})
 */
function insert<T>(
    data: T[],
    table: string,
    databaseName: string,
    primaryKey?: [keyof T, 'NUMBER' | 'STRING']
): Promise<Array<Partial<T>> | void> {
    const model: CrudRepository<T> = new CrudRepository<T>(
        table,
        databaseName,
        primaryKey
    );
    return model.insert(data);
}

/**
 * The find function. It finds data with equivalent data or conditionnaly in the table.
 *
 * @param pagination - The pagination options. ({@link IPaginationOptionQueryDTO})
 * @param search - The data to find. ({@link T}) or the condition to find. ({@link IWhereClauseDTO})
 * @param table - The table name.
 * @param databaseName - The name of the database.
 * @param primaryKey - The primary key of the table.
 *
 * @throws ({@link AndesiteError}) - If the query can throw an error and an error occurred ({@link InfrastructureDatabaseKeys.DATABASE_QUERY_ERROR})
 * @throws ({@link AndesiteError}) - If the query can throw an error and an error occurred ({@link InfrastructureDatabaseKeys.DATABASE_MODEL_NOT_FOUND})
 *
 * @returns The found data. ({@link T})
 */
function find<T>(
    pagination: IPaginationOptionQueryDTO,
    search: Array<Partial<T>> | Array<Partial<Record<keyof T, Partial<IWhereClauseDTO>>>>,
    table: string,
    databaseName: string,
    primaryKey?: [keyof T, 'NUMBER' | 'STRING']
): Promise<Array<Partial<T>> | void> {
    const crudRepository: CrudRepository<T> = new CrudRepository<T>(
        table,
        databaseName,
        primaryKey
    );
    return crudRepository.find(search, {}, pagination);
}

/**
 * The find all function. It finds all the data in the table.
 *
 * @param pagination - The pagination options. ({@link IPaginationOptionQueryDTO})
 * @param table - The table name.
 * @param databaseName - The name of the database.
 * @param primaryKey - The primary key of the table.
 *
 * @throws ({@link AndesiteError}) - If the query can throw an error and an error occurred ({@link InfrastructureDatabaseKeys.DATABASE_QUERY_ERROR})
 * @throws ({@link AndesiteError}) - If the query can throw an error and an error occurred ({@link InfrastructureDatabaseKeys.DATABASE_MODEL_NOT_FOUND})
 *
 * @returns The found data. ({@link T})
 */
function findAll<T>(
    pagination: IPaginationOptionQueryDTO,
    table: string,
    databaseName: string,
    primaryKey?: [keyof T, 'NUMBER' | 'STRING']
): Promise<Array<Partial<T>> | void> {
    const crudRepository: CrudRepository<T> = new CrudRepository<T>(
        table,
        databaseName,
        primaryKey
    );
    return crudRepository.findAll({}, pagination);
}

/**
 * The find one function. It finds one data in the table.
 *
 * @param data - The data to find. ({@link T})
 * @param table - The table name.
 * @param databaseName - The name of the database.
 * @param primaryKey - The primary key of the table.
 *
 * @throws ({@link AndesiteError}) - If the query can throw an error and an error occurred ({@link InfrastructureDatabaseKeys.DATABASE_QUERY_ERROR})
 * @throws ({@link AndesiteError}) - If the query can throw an error and an error occurred ({@link InfrastructureDatabaseKeys.DATABASE_MODEL_NOT_FOUND})
 *
 * @returns The found data. ({@link T})
 */
function findOne<T>(
    data: T,
    table: string,
    databaseName: string,
    primaryKey?: [keyof T, 'NUMBER' | 'STRING']
): Promise<Partial<T> | void> {
    const crudRepository: CrudRepository<T> = new CrudRepository<T>(
        table,
        databaseName,
        primaryKey
    );
    return crudRepository.findOne([data]);
}

/**
 * The update function. It updates data in the table with equivalent data or conditionnaly.
 *
 * @param data - The updated data. ({@link T})
 * @param search - The data to find. ({@link T}) or the condition to find. ({@link IWhereClauseDTO})
 * @param table - The table name.
 * @param databaseName - The name of the database.
 * @param primaryKey - The primary key of the table.
 *
 * @throws ({@link AndesiteError}) - If the query can throw an error and an error occurred ({@link InfrastructureDatabaseKeys.DATABASE_QUERY_ERROR})
 * @throws ({@link AndesiteError}) - If the query can throw an error and an error occurred ({@link InfrastructureDatabaseKeys.DATABASE_MODEL_NOT_UPDATED})
 *
 * @returns The updated data. ({@link T})
 */
function update<T>(
    data: T,
    search: Array<Partial<T>> | Array<Partial<Record<keyof T, Partial<IWhereClauseDTO>>>>,
    table: string,
    databaseName: string,
    primaryKey?: [keyof T, 'NUMBER' | 'STRING']
): Promise<Array<Partial<T>> | void> {
    const crudRepository: CrudRepository<T> = new CrudRepository<T>(
        table,
        databaseName,
        primaryKey
    );
    return crudRepository.update(data, search);
}

/**
 * The update all function. It updates all the data in the table.
 *
 * @param data - The updated data. ({@link T})
 * @param table - The table name.
 * @param databaseName - The name of the database.
 * @param primaryKey - The primary key of the table.
 *
 * @throws ({@link AndesiteError}) - If the query can throw an error and an error occurred ({@link InfrastructureDatabaseKeys.DATABASE_QUERY_ERROR})
 * @throws ({@link AndesiteError}) - If the query can throw an error and an error occurred ({@link InfrastructureDatabaseKeys.DATABASE_MODEL_NOT_UPDATED})
 *
 * @returns The updated data. ({@link T})
 */
function updateAll<T>(
    data: T,
    table: string,
    databaseName: string,
    primaryKey?: [keyof T, 'NUMBER' | 'STRING']
): Promise<Array<Partial<T>> | void> {
    const crudRepository: CrudRepository<T> = new CrudRepository<T>(
        table,
        databaseName,
        primaryKey
    );
    return crudRepository.updateAll(data);
}

/**
 * The update one function. It updates one data in the table.
 *
 * @param data - The data to find. ({@link T})
 * @param key - The key to find the data. (Is the primary key of the table)
 * @param table - The table name.
 * @param databaseName - The name of the database.
 * @param primaryKey - The primary key of the table.
 *
 * @throws ({@link AndesiteError}) - If the query can throw an error and an error occurred ({@link InfrastructureDatabaseKeys.DATABASE_QUERY_ERROR})
 * @throws ({@link AndesiteError}) - If the query can throw an error and an error occurred ({@link InfrastructureDatabaseKeys.DATABASE_MODEL_NOT_UPDATED})
 *
 * @returns The updated data. ({@link T})
 */
function updateOne<T>(
    data: T,
    key: T,
    table: string,
    databaseName: string,
    primaryKey?: [keyof T, 'NUMBER' | 'STRING']
): Promise<Array<Partial<T>> | void> {
    const crudRepository: CrudRepository<T> = new CrudRepository<T>(
        table,
        databaseName,
        primaryKey
    );
    return crudRepository.update(data, [key]);
}

/**
 * The delete function. It deletes data with equivalent data or conditionnaly in the table.
 *
 * @param search - The data to find. ({@link T}) or the condition to find. ({@link IWhereClauseDTO})
 * @param table - The table name.
 * @param databaseName - The name of the database.
 * @param primaryKey - The primary key of the table.
 *
 * @throws ({@link AndesiteError}) - If the query can throw an error and an error occurred ({@link InfrastructureDatabaseKeys.DATABASE_QUERY_ERROR})
 * @throws ({@link AndesiteError}) - If the query can throw an error and an error occurred ({@link InfrastructureDatabaseKeys.DATABASE_MODEL_NOT_DELETED})
 *
 * @returns The deleted data. ({@link T})
 */
function del<T>(
    search: Array<Partial<T>> | Array<Partial<Record<keyof T, Partial<IWhereClauseDTO>>>>,
    table: string,
    databaseName: string,
    primaryKey?: [keyof T, 'NUMBER' | 'STRING']
): Promise<Array<Partial<T>> | void> {
    const crudRepository: CrudRepository<T> = new CrudRepository<T>(
        table,
        databaseName,
        primaryKey
    );
    return crudRepository.delete(search);
}

/**
 * The delete all function. It deletes all the data in the table.
 *
 * @param table - The table name.
 * @param databaseName - The name of the database.
 * @param primaryKey - The primary key of the table.
 *
 * @throws ({@link AndesiteError}) - If the query can throw an error and an error occurred ({@link InfrastructureDatabaseKeys.DATABASE_QUERY_ERROR})
 * @throws ({@link AndesiteError}) - If the query can throw an error and an error occurred ({@link InfrastructureDatabaseKeys.DATABASE_MODEL_NOT_DELETED})
 *
 * @returns The deleted data. ({@link T})
 */
function deleteAll<T>(
    table: string,
    databaseName: string,
    primaryKey?: [keyof T, 'NUMBER' | 'STRING']
): Promise<Array<Partial<T>> | void> {
    const crudRepository: CrudRepository<T> = new CrudRepository<T>(
        table,
        databaseName,
        primaryKey
    );
    return crudRepository.deleteAll();
}

/**
 * The delete one function. It deletes one data in the table.
 *
 * @param data - The data to find. ({@link T})
 * @param table - The table name.
 * @param databaseName - The name of the database.
 * @param primaryKey - The primary key of the table.
 *
 * @throws ({@link AndesiteError}) - If the query can throw an error and an error occurred ({@link InfrastructureDatabaseKeys.DATABASE_QUERY_ERROR})
 * @throws ({@link AndesiteError}) - If the query can throw an error and an error occurred ({@link InfrastructureDatabaseKeys.DATABASE_MODEL_NOT_DELETED})
 *
 * @returns The deleted data. ({@link T})
 */
function deleteOne<T>(
    data: T,
    table: string,
    databaseName: string,
    primaryKey?: [keyof T, 'NUMBER' | 'STRING']
): Promise<Array<Partial<T>> | void> {
    const crudRepository: CrudRepository<T> = new CrudRepository<T>(
        table,
        databaseName,
        primaryKey
    );
    return crudRepository.delete([data]);
}

/**
 * The count function. It counts data with equivalent data or conditionnaly in the table.
 *
 * @param search - The data to find. ({@link T}) or the condition to find. ({@link IWhereClauseDTO})
 * @param table - The table name.
 * @param databaseName - The name of the database.
 * @param primaryKey - The primary key of the table.
 *
 * @throws ({@link AndesiteError}) - If the query can throw an error and an error occurred ({@link InfrastructureDatabaseKeys.DATABASE_QUERY_ERROR})
 *
 * @returns The number of data.
 */
function count<T>(
    search: Array<Partial<T>> | Array<Partial<Record<keyof T, Partial<IWhereClauseDTO>>>>,
    table: string,
    databaseName: string,
    primaryKey?: [keyof T, 'NUMBER' | 'STRING']
): Promise<number | void> {
    const crudRepository: CrudRepository<T> = new CrudRepository<T>(
        table,
        databaseName,
        primaryKey
    );
    return crudRepository.count(search);
}

export const crud = {
    insert,
    find,
    findAll,
    findOne,
    update,
    updateAll,
    updateOne,
    delete: del,
    deleteAll,
    deleteOne,
    count
};
