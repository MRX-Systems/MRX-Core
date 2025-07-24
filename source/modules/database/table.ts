import type { TableEventMap } from '#/modules/database/events/tableEventMap';
import { TypedEventEmitter } from '#/modules/typedEventEmitter/typedEventEmitter';

/**
 * Represents a database table and provides access to its metadata (name, fields, primary key).
 * The class extends `TypedEventEmitter`<{@link TableEventMap}> to allow for event-driven programming.
 *
 * Can emit events for table operations (e.g., SELECTED, CREATED, UPDATED, DELETED). when is attach to {@link MSSQL} class.
 *
 * Example:
 * ```ts
 * const table = new Table('db', 'users', ['id', 'name'], ['id', 'NUMBER']);
 * table.on('selected', data => console.log(data));
 * ```
 */
export class Table extends TypedEventEmitter<TableEventMap> {
	/**
	 * The name of the database that this table belongs to.
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
	 * The primary key of the table, represented as a tuple of field name and type.
	 * The type can be either 'NUMBER' or 'STRING'.
	 */
	private readonly _primaryKey: [string, 'NUMBER' | 'STRING'];

	/**
	 * Creates an instance of the Table class.
	 *
	 * @param databaseName - The name of the database that this table belongs to.
	 * @param tableName - The name of the table.
	 * @param fields - The fields (columns) of the table.
	 * @param primaryKey - The primary key of the table, represented as a tuple of field name and type.
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
	 * Gets the name of the database that this table belongs to.
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
	 * Gets the primary key of the table, represented as a tuple of field name and type.
	 * The type can be either 'NUMBER' or 'STRING'.
	 */
	public get primaryKey(): [string, 'NUMBER' | 'STRING'] {
		return this._primaryKey;
	}
}