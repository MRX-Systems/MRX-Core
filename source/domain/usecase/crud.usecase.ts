import type { OptionalModel, PaginationQueryOptions, SearchModel } from '@/common/types/index.ts';
import { CrudRepository } from '@/infrastructure/repository/index.ts';

/**
 * The insert function. It inserts data into the table.
 *
 * @param data - The data to insert. ({@link OptionalModel})
 * @param table - The table name.
 * @param databaseName - The name of the database.
 * @param primaryKey - The primary key of the table. (default is ['id', 'NUMBER'])
 *
 * @typeParam T - The type of the data. (Is the table model (interface to represent the table))
 *
 * @throws ({@link CoreError}) - If the query can throw an error and an error occurred ({@link ErrorKeys.DATABASE_QUERY_ERROR})
 * @throws ({@link CoreError}) - If the query can throw an error and an error occurred ({@link ErrorKeys.DATABASE_MODEL_NOT_CREATED})
 *
 * @returns The inserted data. ({@link OptionalModel})
 */
function insert<T>(
    data: OptionalModel<T> | OptionalModel<T>[],
    table: string,
    databaseName: string,
    primaryKey?: [keyof T, 'NUMBER' | 'STRING']
): Promise<OptionalModel<T>[] | void> {
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
 * @param search - The data to find. ({@link SearchModel})
 * @param pagination - The pagination options. ({@link PaginationQueryOptions})
 * @param table - The table name.
 * @param databaseName - The name of the database.
 * @param primaryKey - The primary key of the table. (default is ['id', 'NUMBER'])
 *
 * @typeParam T - The type of the data. (Is the table model (interface to represent the table))
 *
 * @throws ({@link CoreError}) - If the query can throw an error and an error occurred ({@link ErrorKeys.DATABASE_QUERY_ERROR})
 * @throws ({@link CoreError}) - If the query can throw an error and an error occurred ({@link ErrorKeys.DATABASE_MODEL_NOT_FOUND})
 *
 * @returns The found data. ({@link OptionalModel})
 */
function find<T>(
    search: SearchModel<T> | SearchModel<T>[],
    pagination: PaginationQueryOptions,
    table: string,
    databaseName: string,
    primaryKey?: [keyof T, 'NUMBER' | 'STRING']
): Promise<OptionalModel<T>[] | void> {
    const crudRepository: CrudRepository<T> = new CrudRepository<T>(
        table,
        databaseName,
        primaryKey
    );
    return crudRepository.find(search, {}, pagination) as Promise<OptionalModel<T>[] | void>;
}

/**
 * The find one function. It finds one data in the table.
 *
 * @param search - The data to find. ({@link SearchModel})
 * @param table - The table name.
 * @param databaseName - The name of the database.
 * @param primaryKey - The primary key of the table. (default is ['id', 'NUMBER'])
 *
 * @typeParam T - The type of the data. (Is the table model (interface to represent the table))
 *
 * @throws ({@link CoreError}) - If the query can throw an error and an error occurred ({@link ErrorKeys.DATABASE_QUERY_ERROR})
 * @throws ({@link CoreError}) - If the query can throw an error and an error occurred ({@link ErrorKeys.DATABASE_MODEL_NOT_FOUND})
 *
 * @returns The found data. ({@link OptionalModel})
 */
function findOne<T>(
    search: SearchModel<T>,
    table: string,
    databaseName: string,
    primaryKey?: [keyof T, 'NUMBER' | 'STRING']
): Promise<OptionalModel<T> | void> {
    const crudRepository: CrudRepository<T> = new CrudRepository<T>(
        table,
        databaseName,
        primaryKey
    );
    return crudRepository.find(search, {}, { first: true }) as Promise<OptionalModel<T> | void>;
}

/**
 * The update function. It updates data in the table with equivalent data or conditionnaly.
 *
 * @param data - The updated data. ({@link OptionalModel})
 * @param search - The data to find. ({@link SearchModel})
 * @param table - The table name.
 * @param databaseName - The name of the database.
 * @param primaryKey - The primary key of the table. (default is ['id', 'NUMBER'])
 *
 * @typeParam T - The type of the data. (Is the table model (interface to represent the table))
 *
 * @throws ({@link CoreError}) - If the query can throw an error and an error occurred ({@link ErrorKeys.DATABASE_QUERY_ERROR})
 * @throws ({@link CoreError}) - If the query can throw an error and an error occurred ({@link ErrorKeys.DATABASE_MODEL_NOT_UPDATED})
 *
 * @returns The updated data. ({@link OptionalModel})
 */
function update<T>(
    data: OptionalModel<T>,
    search: SearchModel<T> | SearchModel<T>[],
    table: string,
    databaseName: string,
    primaryKey?: [keyof T, 'NUMBER' | 'STRING']
): Promise<OptionalModel<T>[] | void> {
    const crudRepository: CrudRepository<T> = new CrudRepository<T>(
        table,
        databaseName,
        primaryKey
    );
    return crudRepository.update(data, search);
}

/**
 * The delete function. It deletes data with equivalent data or conditionnaly in the table.
 *
 * @param search - The data to find. ({@link SearchModel})
 * @param table - The table name.
 * @param databaseName - The name of the database.
 * @param primaryKey - The primary key of the table. (default is ['id', 'NUMBER'])
 *
 * @typeParam T - The type of the data. (Is the table model (interface to represent the table))
 *
 * @throws ({@link CoreError}) - If the query can throw an error and an error occurred ({@link ErrorKeys.DATABASE_QUERY_ERROR})
 * @throws ({@link CoreError}) - If the query can throw an error and an error occurred ({@link ErrorKeys.DATABASE_MODEL_NOT_DELETED})
 *
 * @returns The deleted data. ({@link OptionalModel})
 */
function del<T>(
    search: SearchModel<T> | SearchModel<T>[],
    table: string,
    databaseName: string,
    primaryKey?: [keyof T, 'NUMBER' | 'STRING']
): Promise<OptionalModel<T>[] | void> {
    const crudRepository: CrudRepository<T> = new CrudRepository<T>(
        table,
        databaseName,
        primaryKey
    );
    return crudRepository.delete(search);
}


/**
 * The count function. It counts data with equivalent data or conditionnaly in the table.
 *
 * @param search - The data to find. ({@link SearchModel})
 * @param table - The table name.
 * @param databaseName - The name of the database.
 * @param primaryKey - The primary key of the table. (default is ['id', 'NUMBER'])
 *
 * @typeParam T - The type of the data. (Is the table model (interface to represent the table))
 *
 * @throws ({@link CoreError}) - If the query can throw an error and an error occurred ({@link ErrorKeys.DATABASE_QUERY_ERROR})
 *
 * @returns The number of data.
 */
function count<T>(
    search: SearchModel<T> | SearchModel<T>[] | undefined,
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
    findOne,
    update,
    del,
    count
};
