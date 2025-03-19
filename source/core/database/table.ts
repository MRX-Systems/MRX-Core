import EventEmitter from 'events';

/**
 * The `Table` class represents a database table and provides access to table metadata
 * such as name, fields (columns), and primary key information. It extends {@link EventEmitter}
 * to support event-driven programming related to table operations.
 *
 * This class is an essential component in the database abstraction layer, working
 * closely with the {@link MSSQL} and {@link Repository} classes to facilitate
 * database operations. Table instances are typically created during database
 * introspection and used for constructing queries and handling table-specific events.
 *
 * ### Key Features:
 * - Stores and provides access to table metadata (name, fields, primary key)
 * - Supports event emission for table-related operations
 * - Maintains connection between a table and its parent database
 *
 * ### Event Support:
 * As an EventEmitter, Table instances can emit and listen for events related to
 * database operations such as:
 * - `SELECTED`: Emitted when records are selected from the table
 * - `CREATED`: Emitted when records are inserted into the table
 * - `UPDATED`: Emitted when records in the table are updated
 * - `DELETED`: Emitted when records from the table are deleted
 *
 * @example
 * ```typescript
 * // Creating a table instance
 * const usersTable = new Table(
 *   'myDatabase',
 *   'users',
 *   ['id', 'username', 'email', 'created_at'],
 *   ['id', 'NUMBER']
 * );
 *
 * // Accessing table metadata
 * console.log(usersTable.name);          // 'users'
 * console.log(usersTable.fields);        // ['id', 'username', 'email', 'created_at']
 * console.log(usersTable.primaryKey);    // ['id', 'NUMBER']
 * console.log(usersTable.databaseName);  // 'myDatabase'
 *
 * // Using event listeners with the table
 * usersTable.on('SELECTED', (data) => {
 *   console.log('Data was selected from users table:', data);
 * });
 *
 * usersTable.on('UPDATED', (data) => {
 *   console.log('Data was updated in users table:', data);
 * });
 * ```
 */
export class Table extends EventEmitter {
    /**
     * The name of the database this table belongs to.
     * This helps maintain the relationship between the table and its parent database,
     * which is particularly useful in multi-database scenarios.
     */
    private readonly _databaseName: string;

    /**
     * The fields (columns) of the table.
     * This array contains the names of all columns in the table, which is used
     * for query construction, validation, and schema introspection.
     */
    private readonly _fields: string[] = [];

    /**
     * The name of the table.
     * This is the identifier used in SQL queries and database operations.
     */
    private readonly _name: string;

    /**
     * The primary key of the table.
     * This tuple contains the name of the primary key column and its data type
     * (represented as either 'NUMBER' or 'STRING'). This information is essential
     * for operations like lookups, joins, and ensuring data integrity.
     */
    private readonly _primaryKey: [string, 'NUMBER' | 'STRING'];

    /**
     * Creates a new instance of the `Table` class.
     *
     * @param databaseName - The name of the database this table belongs to.
     * @param tableName - The name of the table in the database.
     * @param fields - An array of field (column) names in the table.
     * @param primaryKey - A tuple containing the primary key column name and its type
     *                    (either 'NUMBER' or 'STRING').
     *
     * @example
     * ```typescript
     * // Create a table with a numeric primary key
     * const usersTable = new Table(
     *   'myDatabase',
     *   'users',
     *   ['id', 'username', 'email'],
     *   ['id', 'NUMBER']
     * );
     *
     * // Create a table with a string primary key
     * const configTable = new Table(
     *   'myDatabase',
     *   'config',
     *   ['key', 'value', 'description'],
     *   ['key', 'STRING']
     * );
     * ```
     */
    public constructor(
        databaseName: string,
        tableName: string,
        fields: string[],
        primaryKey: [string, 'NUMBER' | 'STRING']
    ) {
        super();
        this._databaseName = databaseName;
        this._name = tableName;
        this._fields = fields;
        this._primaryKey = primaryKey;
    }

    /**
     * Gets the name of the database this table belongs to.
     *
     * @returns The name of the database as a string.
     *
     * @example
     * ```typescript
     * const dbName = table.databaseName;
     * console.log(`This table belongs to the ${dbName} database`);
     * ```
     */
    public get databaseName(): string {
        return this._databaseName;
    }

    /**
     * Gets the name of the table.
     *
     * @returns The name of the table as a string.
     *
     * @example
     * ```typescript
     * const tableName = table.name;
     * console.log(`Working with the ${tableName} table`);
     * ```
     */
    public get name(): string {
        return this._name;
    }

    /**
     * Gets the fields (columns) of the table.
     *
     * @returns An array containing the names of all fields in the table.
     *
     * @example
     * ```typescript
     * const fields = table.fields;
     * console.log(`Table has ${fields.length} columns:`, fields.join(', '));
     *
     * // Check if a specific field exists
     * if (fields.includes('email')) {
     *   console.log('Table contains an email field');
     * }
     * ```
     */
    public get fields(): string[] {
        return this._fields;
    }

    /**
     * Gets the primary key information of the table.
     *
     * @returns A tuple containing the primary key column name and its type ('NUMBER' or 'STRING').
     *
     * @example
     * ```typescript
     * const [pkName, pkType] = table.primaryKey;
     * console.log(`Primary key is ${pkName} of type ${pkType}`);
     *
     * // Use in a query condition
     * if (pkType === 'NUMBER') {
     *   repository.findOne({ advancedSearch: { [pkName]: { $eq: 123 } } });
     * } else {
     *   repository.findOne({ advancedSearch: { [pkName]: { $eq: 'ABC123' } } });
     * }
     * ```
     */
    public get primaryKey(): [string, 'NUMBER' | 'STRING'] {
        return this._primaryKey;
    }
}