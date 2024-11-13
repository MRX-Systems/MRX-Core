import { CoreError } from '#/common/error/core.error.ts';
import { ErrorKeys } from '#/common/error/keys.error.ts';
import type { SearchModel } from '#/common/type/data/infrastructure/repository/searchModel.data.ts';
import type { PaginationQueryOptions } from '#/infrastructure/repository/abstract.repository.ts';
import { CrudRepository } from '#/infrastructure/repository/crud.repository.ts';

/**
 * The insert function. It inserts data into the table.
 *
 * @param data - The data to insert. ({@link Partial})
 * @param table - The table name.
 * @param databaseName - The name of the database.
 * @param primaryKey - The primary key of the table. (default is ['id', 'NUMBER'])
 *
 * @typeParam T - The type of the data. (Is the table model (interface to represent the table))
 *
 * @throws ({@link CoreError}) - If the query can throw an error and an error occurred ({@link ErrorKeys.DATABASE_QUERY_ERROR})
 * @throws ({@link CoreError}) - If the query can throw an error and an error occurred ({@link ErrorKeys.DATABASE_MODEL_NOT_CREATED})
 *
 * @returns The inserted data. ({@link Partial})
 */
function insert<T>(
    data: Partial<T> | Partial<T>[],
    table: string,
    databaseName: string,
    primaryKey?: [keyof T, 'NUMBER' | 'STRING']
): Promise<Partial<T>[] | void> {
    const model: CrudRepository<T> = new CrudRepository<T>(
        table,
        databaseName,
        primaryKey
    );
    return model.insert(data, {}, { throwIfNoResult: true });
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
 * @returns The found data. ({@link Partial})
 */
function find<T>(
    search: SearchModel<T> | SearchModel<T>[],
    pagination: PaginationQueryOptions,
    table: string,
    databaseName: string,
    primaryKey?: [keyof T, 'NUMBER' | 'STRING']
): Promise<Partial<T>[] | void> {
    const crudRepository: CrudRepository<T> = new CrudRepository<T>(
        table,
        databaseName,
        primaryKey
    );
    return crudRepository.find(search, {}, { ...pagination, throwIfNoResult: true }) as Promise<Partial<T>[] | void>;
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
 * @returns The found data. ({@link Partial})
 */
function findOne<T>(
    search: SearchModel<T>,
    table: string,
    databaseName: string,
    primaryKey?: [keyof T, 'NUMBER' | 'STRING']
): Promise<Partial<T> | void> {
    const crudRepository: CrudRepository<T> = new CrudRepository<T>(
        table,
        databaseName,
        primaryKey
    );
    return crudRepository.find(search, {}, { first: true, throwIfNoResult: true }) as Promise<Partial<T> | void>;
}

/**
 * The update function. It updates data in the table with equivalent data or conditionnaly.
 *
 * @param data - The updated data. ({@link Partial})
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
 * @returns The updated data. ({@link Partial})
 */
function update<T>(
    data: Partial<T>,
    search: SearchModel<T> | SearchModel<T>[],
    table: string,
    databaseName: string,
    primaryKey?: [keyof T, 'NUMBER' | 'STRING']
): Promise<Partial<T>[] | void> {
    const crudRepository: CrudRepository<T> = new CrudRepository<T>(
        table,
        databaseName,
        primaryKey
    );
    return crudRepository.update(data, search, {}, { throwIfNoResult: true });
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
 * @returns The deleted data. ({@link Partial})
 */
function del<T>(
    search: SearchModel<T> | SearchModel<T>[],
    table: string,
    databaseName: string,
    primaryKey?: [keyof T, 'NUMBER' | 'STRING']
): Promise<Partial<T>[] | void> {
    const crudRepository: CrudRepository<T> = new CrudRepository<T>(
        table,
        databaseName,
        primaryKey
    );
    if (!search || (Array.isArray(search) && search.length === 0))
        throw new CoreError({
            code: 400,
            messageKey: ErrorKeys.CRUD_DELETE_NO_SEARCH
        });
    return crudRepository.delete(search, {}, { throwIfNoResult: true });
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
