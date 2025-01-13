import EventEmitter from 'events';

export const EVENT_TABLE = {
    SELECTED: 'selected',
    CREATED: 'created',
    UPDATED: 'updated',
    DELETED: 'deleted'
} as const;

export class Table extends EventEmitter {
    private readonly _databaseName: string;

    private readonly _columns: string[] = [];

    private readonly _tableName: string;

    private readonly _primaryKey: [string, 'NUMBER' | 'STRING'];

    public constructor(
        databaseName: string,
        tableName: string,
        columns: string[],
        primaryKey: [string, 'NUMBER' | 'STRING']
    ) {
        super();
        this._databaseName = databaseName;
        this._tableName = tableName;
        this._columns = columns;
        this._primaryKey = primaryKey;
    }

    public get databaseName(): string {
        return this._databaseName;
    }

    public get tableName(): string {
        return this._tableName;
    }

    public get columns(): string[] {
        return this._columns;
    }

    public get primaryKey(): [string, 'NUMBER' | 'STRING'] {
        return this._primaryKey;
    }
}