import type { Knex } from 'knex';
import { PassThrough } from 'stream';

import type { Table } from '#/core/database/table';
import { makeStreamAsyncIterable } from '#/core/util/stream';
import { CoreError } from '#/error/coreError';
import { DATABASE_KEY_ERROR } from '#/error/key/databaseKeyError';
import { MSSQL_ERROR_CODE } from '#/types/constant/mssqlErrorCode';
import type { AdvancedSearch } from '#/types/data/advancedSearch';
import type { QueryOptions } from '#/types/data/queryOptions';
import type { QueryOptionsExtendPagination } from '#/types/data/queryOptionsExtendPagination';
import type { QueryOptionsExtendStream } from '#/types/data/queryOptionsExtendStream';
import type { StreamWithAsyncIterable } from '#/types/data/streamWithAsyncIterable';
import type { WhereClause } from '#/types/data/whereClause';

/**
 * The `Repository` class provides a robust and extensible implementation for handling database operations
 * such as querying, insertion, updating, and deletion. It acts as a wrapper around Knex.js to simplify
 * database interactions while maintaining flexibility and type safety.
 *
 * This class is designed to support common database operations using various query options such as
 * field selection, ordering, pagination, advanced filtering, and streaming. The `Repository` class can
 * be extended or used directly to interact with a specific table in the database.
 *
 * ### Key Features:
 * - **CRUD Operations**: Supports all basic operations: `find`, `findOne`, `insert`, `update`, and `delete`.
 * - **Streaming Queries**: Allows streaming large datasets using the `findStream` method, with support for both
 *   async iteration and event-driven consumption.
 * - **Advanced Query Options**: Supports advanced search filters, pagination, and field selection.
 * - **Error Handling**: Centralized error handling with custom error codes for MSSQL-specific errors.
 * - **Type Safety**: Ensures type safety for queries and results with TypeScript generics.
 *
 * @template TModel - The type of the data model handled by the repository.
 *
 * ### Example Usage:
 * @example
 * ```typescript
 * // Create a repository for a specific table
 * const userRepository = new Repository<User>(knexInstance, userTable);
 *
 * // Find all users with pagination
 * const allUsers = await userRepository.find({
 *   limit: 10,
 *   offset: 0
 * });
 *
 * // Find users with specific criteria
 * const filteredUsers = await userRepository.find({
 *   advancedSearch: {
 *     age: { $gte: 18 },
 *     status: 'active'
 *   },
 *   limit: 20,
 *   selectedFields: ['id', 'name', 'email']
 * });
 *
 * // Insert a new user
 * const insertedUser = await userRepository.insert({
 *   name: 'John Doe',
 *   email: 'john@example.com',
 *   age: 25
 * });
 *
 * // Update user information
 * await userRepository.update(
 *   { status: 'inactive' },
 *   { advancedSearch: { id: 123 } }
 * );
 *
 * // Delete a user
 * await userRepository.delete({
 *   advancedSearch: { id: 123 }
 * });
 * ```
 */
export class Repository<TModel = unknown> {
    /**
     * The Knex.js instance used to interact with the database.
     * This property holds the database connection and query builder used for executing SQL operations.
     */
    protected readonly _knex: Knex;

    /**
     * The table object representing the database table to interact with.
     * Contains metadata about the table such as name, columns, and primary key information.
     */
    protected readonly _table: Table;

    /**
     * Creates a new `Repository` instance with the specified Knex.js instance and table object.
     *
     * @param knex - The Knex.js instance used to interact with the database.
     * @param table - The table object representing the database table to interact with.
     */
    public constructor(knex: Knex, table: Table) {
        this._knex = knex;
        this._table = table;
    }

    /**
     * Finds records in the database based on the specified query options and returns a stream
     * for async iteration. This method is particularly useful when working with large datasets
     * that would be inefficient to load entirely into memory.
     *
     * The stream emits data events for each record and an end event when the stream is finished.
     * It can be consumed using either async iteration or event listeners.
     *
     * @template KModel - The type of the object to retrieve.
     * @param options - The query options to apply to the search.
     *   - `selectedFields`: Specific fields to select from the table.
     *   - `advancedSearch`: Filtering criteria for the query.
     *   - `orderBy`: Field and direction for sorting results.
     *   - `transform`: Optional transform function to process each record.
     *
     * @returns A stream with an async iterable interface for consuming the results.
     *
     * ### Usage Examples:
     * @example
     * ```typescript
     * // Basic usage with async iteration
     * const stream = userRepository.findStream();
     * for await (const user of stream) {
     *   console.log(user);
     * }
     *
     * // With ordering and field selection
     * const stream = userRepository.findStream({
     *   selectedFields: ['id', 'name', 'email'],
     *   orderBy: ['createdDate', 'desc']
     * });
     *
     * // Using event listeners
     * const stream = userRepository.findStream();
     * stream.on('data', (user) => {
     *   console.log('User:', user);
     * });
     * stream.on('error', (error) => {
     *   console.error('Stream error:', error);
     * });
     * stream.on('end', () => {
     *   console.log('Stream completed');
     * });
     *
     * // With transform function to process records
     * const stream = userRepository.findStream({
     *   transform: (chunk, encoding, callback) => {
     *     // Transform the data
     *     const transformedData = { ...chunk, processed: true };
     *     callback(null, transformedData);
     *   }
     * });
     * ```
     */
    public findStream<KModel extends TModel = NoInfer<TModel>>(options?: QueryOptionsExtendStream<KModel>): StreamWithAsyncIterable<KModel[]> {
        const query = this._knex(this._table.name)
            .select(options?.selectedFields ?? '*');
        if (options?.advancedSearch)
            this._applySearch(query, options.advancedSearch);

        const orderBy: [string, 'asc' | 'desc'] = [
            options?.orderBy?.[0] || this._table.primaryKey[0],
            options?.orderBy?.[1] || 'asc'
        ];
        query.orderBy(orderBy[0], orderBy[1]);

        const kStream: StreamWithAsyncIterable<KModel> = query.stream();

        const passThrough = new PassThrough({
            objectMode: true,
            ...options?.transform && { transform: options.transform }
        });

        kStream.on('error', (error: unknown) => {
            const code = (error as { number: number })?.number || 0;
            passThrough.emit('error', new CoreError({
                key: MSSQL_ERROR_CODE[code] ?? DATABASE_KEY_ERROR.MSSQL_QUERY_ERROR,
                message: 'An error occurred while streaming the query results.',
                cause: {
                    query: query.toSQL().sql,
                    error
                }
            }));
        });

        kStream.pipe(passThrough);
        return makeStreamAsyncIterable<KModel, PassThrough>(passThrough);
    }

    /**
     * Finds records in the database based on the specified query options and returns the results
     * as an array. This method supports comprehensive filtering, pagination, field selection, and sorting
     * to provide flexible data retrieval capabilities.
     *
     * @template KModel - The type of the object to retrieve.
     * @param options - The query options to apply to the search.
     *   - `selectedFields`: Specific fields to select from the table.
     *   - `advancedSearch`: Filtering criteria for the query.
     *   - `orderBy`: Field and direction for sorting results.
     *   - `limit`: Maximum number of records to return (defaults to 100).
     *   - `offset`: Number of records to skip (defaults to 0).
     *   - `throwIfNoResult`: Whether to throw an error if no records are found.
     *   - `transaction`: Optional transaction object for running the query within a transaction.
     *
     * @throws {CoreError} Throws an error if no records are found and the `throwIfNoResult` option is enabled.
     * @throws {CoreError} Throws an error if an MSSQL-specific error occurs during the query execution.
     *
     * @returns An array of records matching the query options.
     *
     * ### Usage Examples:
     * @example
     * ```typescript
     * // Basic usage with pagination
     * const users = await userRepository.find({
     *   limit: 25,
     *   offset: 50  // Get users 51-75
     * });
     *
     * // With field selection
     * const userNames = await userRepository.find({
     *   selectedFields: ['id', 'firstName', 'lastName']
     * });
     *
     * // With advanced filtering
     * const activeAdmins = await userRepository.find({
     *   advancedSearch: {
     *     role: 'admin',
     *     status: { $eq: 'active' },
     *     lastLogin: { $gte: new Date('2023-01-01') }
     *   }
     * });
     *
     * // With OR conditions
     * const results = await userRepository.find({
     *   advancedSearch: [
     *     { department: 'engineering' },
     *     { department: 'design', role: 'lead' }
     *   ]
     * });
     *
     * // With sorting
     * const sortedUsers = await userRepository.find({
     *   orderBy: ['lastName', 'asc']
     * });
     *
     * // Using a transaction
     * await knex.transaction(async (trx) => {
     *   const users = await userRepository.find({
     *     advancedSearch: { department: 'finance' },
     *     transaction: trx
     *   });
     *
     *   // Perform additional operations within the same transaction
     * });
     * ```
     */
    public async find<KModel extends TModel = NoInfer<TModel>>(options?: QueryOptionsExtendPagination<KModel>): Promise<KModel[]> {
        const query = this._knex(this._table.name)
            .select(options?.selectedFields ?? '*');
        if (options?.advancedSearch)
            this._applySearch(query, options.advancedSearch);

        const orderBy: [string, 'asc' | 'desc'] = [
            options?.orderBy?.[0] || this._table.primaryKey[0],
            options?.orderBy?.[1] || 'asc'
        ];
        const limit = options?.limit || 100;
        const offset = options?.offset || 0;

        query.orderBy(orderBy[0], orderBy[1])
            .limit(limit)
            .offset(offset);

        return this._executeQuery<KModel>(query, options?.throwIfNoResult);
    }

    /**
     * Finds a single record in the database based on the specified query options and returns it.
     * This method is optimized for retrieving individual records that match specific criteria.
     *
     * @template KModel - The type of the object to retrieve.
     * @param options - The query options to apply to the search.
     *   - `selectedFields`: Specific fields to select from the table.
     *   - `advancedSearch` (required): Filtering criteria for the query.
     *   - `orderBy`: Field and direction for sorting results.
     *   - `throwIfNoResult`: Whether to throw an error if no records are found.
     *   - `transaction`: Optional transaction object for running the query within a transaction.
     *
     * @throws {CoreError} Throws an error if no records are found and `throwIfNoResult` is enabled.
     * @throws {CoreError} Throws an error if an MSSQL-specific error occurs during query execution.
     *
     * @returns The first record matching the query options.
     *
     * ### Usage Examples:
     * @example
     * ```typescript
     * // Find a user by ID
     * const user = await userRepository.findOne({
     *   advancedSearch: { id: 123 }
     * });
     *
     * // Find a user by email with selected fields
     * const user = await userRepository.findOne({
     *   advancedSearch: { email: 'user@example.com' },
     *   selectedFields: ['id', 'name', 'email', 'role']
     * });
     *
     * // Find the most recently created user in a department
     * const latestUser = await userRepository.findOne({
     *   advancedSearch: { department: 'marketing' },
     *   orderBy: ['createdAt', 'desc']
     * });
     *
     * // Find a user with compound conditions
     * const user = await userRepository.findOne({
     *   advancedSearch: {
     *     email: { $like: 'admin' },
     *     status: 'active',
     *     lastLogin: { $gte: new Date('2023-01-01') }
     *   }
     * });
     *
     * // Using a transaction
     * await knex.transaction(async (trx) => {
     *   const user = await userRepository.findOne({
     *     advancedSearch: { id: 123 },
     *     transaction: trx
     *   });
     *
     *   // Perform additional operations with the user within the same transaction
     * });
     * ```
     */
    public async findOne<KModel extends TModel = NoInfer<TModel>>(options: Omit<QueryOptions<KModel>, 'advancedSearch'> & Required<Pick<QueryOptions<KModel>, 'advancedSearch'>>): Promise<KModel> {
        const query = this._knex(this._table.name)
            .select(options?.selectedFields ?? '*');
        if (options?.advancedSearch)
            this._applySearch(query, options.advancedSearch);

        const orderBy: [string, 'asc' | 'desc'] = [
            options?.orderBy?.[0] || this._table.primaryKey[0],
            options?.orderBy?.[1] || 'asc'
        ];

        query.orderBy(orderBy[0], orderBy[1]);

        return this._executeQuery<KModel>(query, options?.throwIfNoResult)
            .then((result) => result[0]);
    }

    /**
     * Counts the number of records in the database that match the specified query options.
     * This method is useful for getting the total count of records without retrieving the actual data,
     * which can be more efficient for large datasets or when only the count is needed.
     *
     * @template KModel - The type of the object to match.
     * @param options - The query options to apply to the count operation.
     *   - `advancedSearch`: Filtering criteria for determining which records to count.
     *   - `throwIfNoResult`: Whether to throw an error if no records are found.
     *   - `transaction`: Optional transaction object for running the query within a transaction.
     *
     * @throws {CoreError} Throws an error if no records are found and `throwIfNoResult` is enabled.
     * @throws {CoreError} Throws an error if an MSSQL-specific error occurs during query execution.
     *
     * @returns The number of records matching the query options.
     *
     * ### Usage Examples:
     * @example
     * ```typescript
     * // Count all users
     * const totalUsers = await userRepository.count();
     *
     * // Count active users
     * const activeUsers = await userRepository.count({
     *   advancedSearch: { status: 'active' }
     * });
     *
     * // Count users with complex conditions
     * const count = await userRepository.count({
     *   advancedSearch: {
     *     role: { $in: ['admin', 'editor'] },
     *     lastLogin: { $gte: new Date('2023-01-01') }
     *   }
     * });
     *
     * // Count users with OR conditions
     * const combinedCount = await userRepository.count({
     *   advancedSearch: [
     *     { department: 'engineering' },
     *     { department: 'design', role: 'lead' }
     *   ]
     * });
     *
     * // Using a transaction
     * await knex.transaction(async (trx) => {
     *   const count = await userRepository.count({
     *     advancedSearch: { department: 'finance' },
     *     transaction: trx
     *   });
     *
     *   if (count > 0) {
     *     // Perform additional operations within the same transaction
     *   }
     * });
     * ```
     */
    public async count<KModel extends TModel = NoInfer<TModel>>(options?: Omit<QueryOptions<KModel>, 'selectedFields' | 'orderBy'>): Promise<number> {
        const query = this._knex(this._table.name)
            .count({ count: '*' });
        if (options?.advancedSearch)
            this._applySearch(query, options.advancedSearch);

        return this._executeQuery<{ count: number }>(query, options?.throwIfNoResult)
            .then((result) => result[0].count);
    }

    /**
     * Inserts one or more records into the database and returns the inserted records.
     * This method supports both single and bulk insertions, making it versatile for various use cases.
     *
     * @template KModel - The type of the object to insert.
     * @param data - The data to insert into the database. Can be a single object or an array of objects.
     * @param options - The query options to apply to the insertion.
     *   - `selectedFields`: Specific fields to return from the inserted record(s).
     *   - `throwIfNoResult`: Whether to throw an error if no records are inserted.
     *   - `transaction`: Optional transaction object for running the query within a transaction.
     *
     * @throws {CoreError} Throws an error if an MSSQL-specific error occurs during query execution.
     *
     * @returns An array of the inserted records with the fields specified in the options.
     *
     * ### Usage Examples:
     * @example
     * ```typescript
     * // Insert a single user
     * const newUser = await userRepository.insert({
     *   firstName: 'John',
     *   lastName: 'Doe',
     *   email: 'john.doe@example.com',
     *   department: 'engineering'
     * });
     *
     * // Insert multiple users
     * const newUsers = await userRepository.insert([
     *   {
     *     firstName: 'Alice',
     *     lastName: 'Johnson',
     *     email: 'alice.johnson@example.com',
     *     department: 'marketing'
     *   },
     *   {
     *     firstName: 'Bob',
     *     lastName: 'Smith',
     *     email: 'bob.smith@example.com',
     *     department: 'finance'
     *   }
     * ]);
     *
     * // Insert with specific return fields
     * const newUser = await userRepository.insert(
     *   {
     *     firstName: 'Sarah',
     *     lastName: 'Parker',
     *     email: 'sarah.parker@example.com',
     *     department: 'design',
     *     salary: 75000,
     *     startDate: new Date()
     *   },
     *   { selectedFields: ['id', 'email'] }
     * );
     *
     * // Using a transaction
     * await knex.transaction(async (trx) => {
     *   const user = await userRepository.insert(
     *     {
     *       firstName: 'Mike',
     *       lastName: 'Taylor',
     *       email: 'mike.taylor@example.com'
     *     },
     *     { transaction: trx }
     *   );
     *
     *   // Perform additional operations within the same transaction
     * });
     * ```
     */
    public async insert<KModel extends TModel = NoInfer<TModel>>(
        data: Partial<KModel> | Partial<KModel>[],
        options?: Omit<QueryOptions<KModel>, 'advancedSearch' | 'orderBy'>
    ): Promise<KModel[]> {
        const query = this._knex(this._table.name)
            .insert(data)
            .returning(options?.selectedFields ?? '*');

        return this._executeQuery<KModel>(query);
    }

    /**
     * Updates one or more records in the database based on the specified query options
     * and returns the updated records. This method allows for precise updates to records
     * that match specific filtering criteria.
     *
     * @template KModel - The type of the object to update.
     * @param data - The data to update in the database. Contains the fields and values to be updated.
     * @param options - The query options to apply to the update operation.
     *   - `selectedFields`: Specific fields to return from the updated record(s).
     *   - `advancedSearch` (required): Filtering criteria to determine which records to update.
     *   - `throwIfNoResult`: Whether to throw an error if no records are updated.
     *   - `transaction`: Optional transaction object for running the query within a transaction.
     *
     * @throws {CoreError} Throws an error if no records are updated and `throwIfNoResult` is enabled.
     * @throws {CoreError} Throws an error if an MSSQL-specific error occurs during query execution.
     *
     * @returns An array of the updated records with the fields specified in the options.
     *
     * ### Usage Examples:
     * @example
     * ```typescript
     * // Update a user's status by ID
     * const updatedUser = await userRepository.update(
     *   { status: 'inactive' },
     *   { advancedSearch: { id: 123 } }
     * );
     *
     * // Update multiple users by department
     * const updatedUsers = await userRepository.update(
     *   {
     *     department: 'Customer Service',
     *     updatedAt: new Date()
     *   },
     *   { advancedSearch: { department: 'Support' } }
     * );
     *
     * // Update with complex conditions
     * const result = await userRepository.update(
     *   { securityLevel: 'elevated', lastAudit: new Date() },
     *   {
     *     advancedSearch: {
     *       role: { $in: ['admin', 'security'] },
     *       lastLogin: { $gte: new Date('2023-01-01') }
     *     },
     *     selectedFields: ['id', 'email', 'securityLevel']
     *   }
     * );
     *
     * // Using a transaction
     * await knex.transaction(async (trx) => {
     *   const updated = await userRepository.update(
     *     { status: 'verified' },
     *     {
     *       advancedSearch: { email: 'user@example.com' },
     *       transaction: trx
     *     }
     *   );
     *
     *   // Perform additional operations within the same transaction
     * });
     * ```
     */
    public async update<KModel extends TModel = NoInfer<TModel>>(
        data: Partial<KModel>,
        options: Omit<QueryOptions<KModel>, 'orderBy' | 'advancedSearch'> & Required<Pick<QueryOptions<KModel>, 'advancedSearch'>>
    ): Promise<KModel[]> {
        const query = this._knex(this._table.name)
            .update(data)
            .returning(options?.selectedFields ?? '*');
        if (options?.advancedSearch)
            this._applySearch(query, options.advancedSearch);

        return this._executeQuery<KModel>(query);
    }

    /**
     * Deletes one or more records in the database based on the specified query options
     * and returns the deleted records. This method ensures that only records matching
     * specific filtering criteria are removed from the database.
     *
     * @template KModel - The type of the object to delete.
     * @param options - The query options to apply to the delete operation.
     *   - `selectedFields`: Specific fields to return from the deleted record(s).
     *   - `advancedSearch` (required): Filtering criteria to determine which records to delete.
     *   - `throwIfNoResult`: Whether to throw an error if no records are deleted.
     *   - `transaction`: Optional transaction object for running the query within a transaction.
     *
     * @throws {CoreError} Throws an error if no records are deleted and `throwIfNoResult` is enabled.
     * @throws {CoreError} Throws an error if an MSSQL-specific error occurs during query execution.
     *
     * @returns An array of the deleted records with the fields specified in the options.
     *
     * ### Usage Examples:
     * @example
     * ```typescript
     * // Delete a user by ID
     * const deletedUser = await userRepository.delete({
     *   advancedSearch: { id: 123 }
     * });
     *
     * // Delete inactive users
     * const deletedUsers = await userRepository.delete({
     *   advancedSearch: {
     *     status: 'inactive',
     *     lastLogin: { $lt: new Date('2022-01-01') }
     *   }
     * });
     *
     * // Delete with specific return fields
     * const result = await userRepository.delete({
     *   advancedSearch: { department: 'deprecated' },
     *   selectedFields: ['id', 'email']
     * });
     *
     * // Using a transaction
     * await knex.transaction(async (trx) => {
     *   const deleted = await userRepository.delete({
     *     advancedSearch: {
     *       role: 'guest',
     *       createdAt: { $lt: new Date('2023-01-01') }
     *     },
     *     transaction: trx
     *   });
     *
     *   // Perform additional operations within the same transaction
     * });
     * ```
     */
    public async delete<KModel extends TModel = NoInfer<TModel>>(options: Omit<QueryOptions<KModel>, 'orderBy' | 'advancedSearch'> & Required<Pick<QueryOptions<KModel>, 'advancedSearch'>>): Promise<KModel[]> {
        const query = this._knex(this._table.name)
            .delete()
            .returning(options?.selectedFields ?? '*');
        if (options?.advancedSearch)
            this._applySearch(query, options.advancedSearch);

        return this._executeQuery<KModel>(query);
    }

    /**
     * Applies advanced search filters to a query object. This method translates
     * search options into SQL WHERE clauses using the specified operators and conditions.
     *
     * The search parameter can be either a single object with field conditions or an array
     * of such objects. When an array is provided, the conditions are combined using OR logic.
     *
     * ### Supported Operators:
     * - `$eq`: Equal to (exact match)
     * - `$neq`: Not equal to
     * - `$lt`: Less than
     * - `$lte`: Less than or equal to
     * - `$gt`: Greater than
     * - `$gte`: Greater than or equal to
     * - `$in`: In a set of values
     * - `$nin`: Not in a set of values
     * - `$between`: Between two values (inclusive)
     * - `$nbetween`: Not between two values
     * - `$like`: Contains substring (case-insensitive)
     * - `$nlike`: Does not contain substring
     * - `$isNull`: Field is null (when true) or not null (when false)
     * - `$q`: Full-text search across specified fields
     *
     * @template KModel - The type of the object to apply the search filters to.
     * @param query - The Knex.js query builder to apply the filters to.
     * @param search - The advanced search options to apply.
     *
     * ### Usage Examples:
     * @example
     * ```typescript
     * // Simple equality condition
     * const query = knex('users');
     * repository._applySearch(query, { status: 'active' });
     * // Produces: SELECT * FROM users WHERE status = 'active'
     *
     * // Using operators
     * const query = knex('users');
     * repository._applySearch(query, {
     *   age: { $gte: 21 },
     *   name: { $like: 'John' },
     *   role: { $in: ['admin', 'manager'] }
     * });
     * // Produces: SELECT * FROM users WHERE age >= 21 AND name LIKE '%John%' AND role IN ('admin', 'manager')
     *
     * // Using OR logic with array
     * const query = knex('users');
     * repository._applySearch(query, [
     *   { department: 'engineering' },
     *   { role: 'manager', department: 'design' }
     * ]);
     * // Produces: SELECT * FROM users WHERE (department = 'engineering') OR (role = 'manager' AND department = 'design')
     *
     * // Using the $q operator for full-text search
     * const query = knex('users');
     * repository._applySearch(query, {
     *   $q: {
     *     selectedFields: ['name', 'email', 'bio'],
     *     value: 'programmer'
     *   }
     * });
     * // Searches for 'programmer' in name, email, and bio columns
     * ```
     */
    protected _applySearch<KModel>(
        query: Knex.QueryBuilder,
        search: AdvancedSearch<KModel> | AdvancedSearch<KModel>[]
    ): void {
        type OperatorFunction = (query: Knex.QueryBuilder, key: string, value: unknown) => void;
        const keysFunc: Record<keyof WhereClause, OperatorFunction> = {
            $eq: (query, key, value) => {
                query.where(key, value as string | number | boolean | Date);
            },
            $neq: (query, key, value) => {
                query.whereNot(key, value as string | number | boolean | Date);
            },
            $lt: (query, key, value) => {
                query.where(key, '<', value as string | number | Date);
            },
            $lte: (query, key, value) => {
                query.where(key, '<=', value as string | number | Date);
            },
            $gt: (query, key, value) => {
                query.where(key, '>', value as string | number | Date);
            },
            $gte: (query, key, value) => {
                query.where(key, '>=', value as string | number | Date);
            },
            $in: (query, key, value) => {
                query.whereIn(key, value as string[] | number[] | Date[]);
            },
            $nin: (query, key, value) => {
                query.whereNotIn(key, value as string[] | number[] | Date[]);
            },
            $between: (query, key, value) => {
                query.whereBetween(key, value as [string | number | Date, string | number | Date]);
            },
            $nbetween: (query, key, value) => {
                query.whereNotBetween(key, value as [string | number | Date, string | number | Date]);
            },
            $like: (query, key, value) => {
                const likeValue = `%${value}%`;
                if (typeof value === 'string' && new Date(value).toString() !== 'Invalid Date') {
                    const { client } = this._knex.client.config;
                    if (client === 'mssql')
                        query.whereRaw(`CONVERT(VARCHAR, ${key}, 23) LIKE ?`, [likeValue]);
                } else {
                    query.whereLike(key, likeValue);
                }
            },
            $nlike: (query, key, value) => {
                const likeValue = `%${value}%`;
                if (typeof value === 'string' && new Date(value).toString() !== 'Invalid Date') {
                    const { client } = this._knex.client.config;
                    if (client === 'mssql')
                        query.whereRaw(`CONVERT(VARCHAR, ${key}, 23) NOT LIKE ?`, [likeValue]);
                } else {
                    query.whereRaw(`${key} NOT LIKE ?`, [likeValue]);
                }
            },
            $isNull: (query, key, value) => {
                if (value)
                    query.whereNull(key);
                else
                    query.whereNotNull(key);
            }
        };
        const processing = (query: Knex.QueryBuilder, search: AdvancedSearch<KModel>): void => {
            for (const [key, value] of Object.entries(search))
                if (this._isComplexQuery(value)) {
                    const whereClause = value as WhereClause;
                    for (const [operator, opValue] of Object.entries(whereClause))
                        if (operator in keysFunc) {
                            const func = keysFunc[operator as keyof WhereClause];
                            func(query, key, opValue);
                        }
                } else if (key === '$q' && (typeof value === 'string' || typeof value === 'number')) {
                    for (const field of this._table.fields)
                        if (value)
                            query.orWhere(field, 'like', `%${value}%`);
                } else if (key === '$q' && typeof value === 'object' && 'selectedFields' in value) {
                    const { selectedFields, value: searchValue } = value;
                    const isNumber = typeof searchValue === 'number';
                    const operator = isNumber ? '=' : 'like';
                    const formattedValue = isNumber ? searchValue : `%${searchValue}%`;

                    selectedFields.forEach((field) => {
                        query.orWhere(field, operator, formattedValue);
                    });
                } else {
                    if (typeof value === 'object' && Object.keys(value).length === 0)
                        continue;
                    query.where(key, value);
                }
        };
        if (Array.isArray(search))
            search.reduce((acc, item) => acc.orWhere((q) => this._applySearch(q, item)), query);
        else
            processing(query, search);
    }

    /**
     * Handles errors that occur during query execution. This method centralizes error handling
     * for all database operations, providing consistent error reporting and translation of
     * database-specific error codes into application-specific error types.
     *
     * @param error - The error object that occurred during query execution.
     * @param query - The Knex.js query builder that caused the error.
     *
     * @throws {CoreError} Throws an enhanced error with additional context about the failed query.
     */
    protected _handleError(error: unknown, query: Knex.QueryBuilder): never {
        if (error instanceof CoreError)
            throw error;
        const code = (error as { number: number })?.number || 0;
        throw new CoreError({
            key: MSSQL_ERROR_CODE[code] ?? DATABASE_KEY_ERROR.MSSQL_QUERY_ERROR,
            message: 'An error occurred while executing the query.',
            cause: {
                query: query.toSQL().sql,
                error
            }
        });
    }

    /**
     * Determines whether the provided data object represents a complex query.
     * A complex query is defined as an object containing one or more valid query operators,
     * such as $eq, $gt, $like, etc.
     *
     * @template MaybeWhereClause - The type of the object to check.
     * @param data - The data object to check.
     *
     * @returns `true` if the object contains valid query operators, otherwise `false`.
     */
    private _isComplexQuery<MaybeWhereClause>(data: MaybeWhereClause): boolean {
        const validKeys = new Set<string>([
            '$eq',
            '$neq',
            '$lt',
            '$lte',
            '$gt',
            '$gte',
            '$in',
            '$nin',
            '$between',
            '$nbetween',
            '$like',
            '$nlike',
            '$isNull'
        ]);
        return Boolean(
            data
            && typeof data === 'object'
            && !Array.isArray(data)
            && Object.keys(data).some((key) => validKeys.has(key))
        );
    }

    /**
     * Executes a Knex.js query and returns the result. This method provides centralized
     * error handling and supports the option to throw an error if no records are found.
     *
     * @template KModel - The type of the records returned by the query.
     * @param query - The Knex.js query builder to execute.
     * @param throwIfNoResult - Whether to throw an error if no records are found.
     *
     * @throws {CoreError} Throws an error if no records are found and `throwIfNoResult` is enabled.
     * @throws {CoreError} Throws an error if an MSSQL-specific error occurs during query execution.
     *
     * @returns An array of records returned by the query.
     */
    private async _executeQuery<KModel>(query: Knex.QueryBuilder, throwIfNoResult = false): Promise<KModel[]> {
        try {
            const result: KModel[] = await query;
            if (throwIfNoResult && result.length === 0)
                throw new CoreError({
                    key: DATABASE_KEY_ERROR.MSSQL_NO_RESULT,
                    message: 'No records found matching the specified query options.',
                    cause: {
                        query: query.toSQL().sql
                    }
                });
            return result;
        } catch (error) {
            return this._handleError(error, query);
        }
    }
}