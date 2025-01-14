import EventEmitter from 'events';

export class Table extends EventEmitter {
    private readonly _databaseName: string;

    private readonly _fields: string[] = [];

    private readonly _name: string;

    private readonly _primaryKey: [string, 'NUMBER' | 'STRING'];

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

    public get databaseName(): string {
        return this._databaseName;
    }

    public get name(): string {
        return this._name;
    }

    public get fields(): string[] {
        return this._fields;
    }

    public get primaryKey(): [string, 'NUMBER' | 'STRING'] {
        return this._primaryKey;
    }
}