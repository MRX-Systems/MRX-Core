import EventEmitter from 'events';

/**
 * Represents a table in the database.
 * Extends the {@link EventEmitter} class to support event emission.
 */
export class Table extends EventEmitter {
    /**
     * The name of the database.
     */
    private readonly _databaseName: string;

    /**
     * The fields (columns) of the table.
     */
    private readonly _fields: string[] = [];

    /**
     * The name of the table.
     */
    private readonly _name: string;

    /**
     * The primary key of the table.
     */
    private readonly _primaryKey: [string, 'NUMBER' | 'STRING'];

    /**
     * Creates a new instance of the `Table` class.
     * @param databaseName - The name of the database.
     * @param tableName - The name of the table.
     * @param fields - The fields (columns) of the table.
     * @param primaryKey - The primary key of the table.
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
     * Gets the name of the database.
     */
    public get databaseName(): string {
        return this._databaseName;
    }

    /**
     * Gets the name of the table.
     */
    public get name(): string {
        return this._name;
    }

    /**
     * Gets the fields (columns) of the table.
     */
    public get fields(): string[] {
        return this._fields;
    }

    /**
     * Gets the primary key of the table.
     */
    public get primaryKey(): [string, 'NUMBER' | 'STRING'] {
        return this._primaryKey;
    }
}