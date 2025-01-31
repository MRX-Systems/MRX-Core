/* eslint-disable max-classes-per-file */
import { afterAll, beforeAll, describe, expect, test } from 'bun:test';
import knex from 'knex';

import { Repository } from '#/core/repository/repository';
import { EVENT_MSSQL } from '#/types/constant/eventMssql';
import { EVENT_TABLE } from '#/types/constant/eventTable';
import type { MssqlEventLog } from '#/types/data/mssqlEventLog';

const options = {
    databaseName: process.env.MSSQL_DATABASE ?? '',
    host: process.env.MSSQL_HOST ?? '',
    port: 1433,
    user: process.env.MSSQL_USER ?? '',
    password: process.env.MSSQL_PASSWORD ?? '',
    encrypt: true,
    poolMin: 2,
    poolMax: 10
};

const testTable = 'unit_test_mssql';

const knexInstance = knex({
    client: 'mssql',
    connection: {
        database: options.databaseName,
        host: options.host,
        port: options.port,
        user: options.user,
        password: options.password,
        options: { encrypt: true }
    }
});

describe('MSSQL', () => {
    beforeAll(async () => {
        await knexInstance.schema.createTable(testTable, (table) => {
            table.increments('id').primary();
            table.string('name');
        });
    });

    describe('constructor', () => {
        test('should create a new instance', async () => {
            const { MSSQL } = await import('#/core/database/mssql');
            const mssql = new MSSQL(options);
            expect(mssql).toBeInstanceOf(MSSQL);
        });
    });

    describe('connect', () => {
        test('should connect to the database', async () => {
            const { MSSQL } = await import('#/core/database/mssql');
            const mssql = new MSSQL(options);
            await mssql.connect();
            expect(mssql.isConnected).toBe(true);
        });

        test('should add listener on all tables when pulse is true', async () => {
            const { MSSQL } = await import('#/core/database/mssql');
            const mssql = new MSSQL({ ...options, pulse: true });
            await mssql.connect();

            mssql.table(testTable)
                .on(EVENT_TABLE.SELECTED, (res) => {
                    expect(res).toBeDefined();
                });
            await mssql.db(testTable).select('*').from(testTable);
        });

        test('should throw an error when the connection fails', async () => {
            const { MSSQL } = await import('#/core/database/mssql');
            const mssql = new MSSQL({ ...options, host: 'foo' });
            expect(mssql.connect()).rejects.toThrow(`Failed to connect to the database: "${options.databaseName}".`);
        });
    });

    describe('disconnect', () => {
        test('should disconnect from the database', async () => {
            const { MSSQL } = await import('#/core/database/mssql');
            const mssql = new MSSQL(options);
            await mssql.connect();
            await mssql.disconnect();
            expect(mssql.isConnected).toBe(false);
        });

        test('should throw an error when the connection is not established', async () => {
            const { MSSQL } = await import('#/core/database/mssql');
            const mssql = new MSSQL(options);
            expect(mssql.disconnect()).rejects.toThrow(`Database "${options.databaseName}" is not connected.`);
        });
    });

    describe('setCustomRepository', () => {
        class ExampleRepository extends Repository<unknown> {
            public foo(): string {
                return 'bar';
            }
        }

        test('should set a custom repository', async () => {
            const { MSSQL } = await import('#/core/database/mssql');
            const mssql = new MSSQL(options);
            await mssql.connect();
            mssql.setCustomRepository(testTable, ExampleRepository);
            expect(mssql.getRepository(testTable)).toBeInstanceOf(ExampleRepository);
        });

        test('should throw an error when the database is not connected', async () => {
            const { MSSQL } = await import('#/core/database/mssql');
            const mssql = new MSSQL(options);
            expect(() => mssql.setCustomRepository(testTable, ExampleRepository)).toThrow(`Database "${options.databaseName}" is not connected.`);
        });

        test('should throw an error whe the table is not found', async () => {
            const { MSSQL } = await import('#/core/database/mssql');
            const mssql = new MSSQL(options);
            await mssql.connect();
            expect(() => mssql.setCustomRepository('foo', ExampleRepository)).toThrow('Table not found: "foo".');
        });
    });

    describe('getRepository', () => {
        class ExampleRepository extends Repository<unknown> {
            public foo(): string {
                return 'bar';
            }
        }

        test('should return a default repository', async () => {
            const { MSSQL } = await import('#/core/database/mssql');
            const mssql = new MSSQL(options);
            await mssql.connect();
            expect(mssql.getRepository(testTable)).toBeInstanceOf(Repository);
        });

        test('should return a custom repository', async () => {
            const { MSSQL } = await import('#/core/database/mssql');
            const mssql = new MSSQL(options);
            await mssql.connect();
            mssql.setCustomRepository(testTable, ExampleRepository);
            expect(mssql.getRepository(testTable)).toBeInstanceOf(ExampleRepository);
        });

        test('should throw an error when the database is not connected', async () => {
            const { MSSQL } = await import('#/core/database/mssql');
            const mssql = new MSSQL(options);
            expect(() => mssql.getRepository(testTable)).toThrow(`Database "${options.databaseName}" is not connected.`);
        });

        test('should throw an error when the repository is not found', async () => {
            const { MSSQL } = await import('#/core/database/mssql');
            const mssql = new MSSQL(options);
            await mssql.connect();
            expect(() => mssql.getRepository('foo')).toThrow('Table not found: "foo".');
        });
    });

    describe('getters', () => {
        test('should return the database name', async () => {
            const { MSSQL } = await import('#/core/database/mssql');
            const mssql = new MSSQL(options);
            expect(mssql.databaseName).toBe(options.databaseName);
        });

        test('should return isConnected', async () => {
            const { MSSQL } = await import('#/core/database/mssql');
            const mssql = new MSSQL(options);
            expect(mssql.isConnected).toBe(false);
        });

        test('should return the knex instance', async () => {
            const { MSSQL } = await import('#/core/database/mssql');
            const mssql = new MSSQL(options);
            await mssql.connect();
            expect(mssql.db).toBeDefined();
        });

        test('should throw an error when the database is not connected', async () => {
            const { MSSQL } = await import('#/core/database/mssql');
            const mssql = new MSSQL(options);
            expect(() => mssql.db).toThrow(`Database "${options.databaseName}" is not connected.`);
        });
    });

    describe('table', () => {
        test('should return a table instance', async () => {
            const { MSSQL } = await import('#/core/database/mssql');
            const mssql = new MSSQL(options);
            await mssql.connect();
            expect(mssql.table(testTable)).toBeDefined();
        });

        test('should throw an error when the database is not connected', async () => {
            const { MSSQL } = await import('#/core/database/mssql');
            const mssql = new MSSQL(options);
            expect(() => mssql.table(testTable)).toThrow(`Database "${options.databaseName}" is not connected.`);
        });

        test('should throw an error when the table is not found', async () => {
            const { MSSQL } = await import('#/core/database/mssql');
            const mssql = new MSSQL(options);
            await mssql.connect();
            expect(() => mssql.table('foo')).toThrow('Table not found: "foo".');
        });
    });

    describe('functionnal tests', () => {
        describe('debug-events', () => {
            test('should log events', async () => {
                const { MSSQL } = await import('#/core/database/mssql');
                const mssql = new MSSQL({ ...options, debug: true });
                mssql.on(EVENT_MSSQL.LOG, (event: MssqlEventLog) => {
                    expect(event).toBeDefined();
                    expect(event.bindings).toBeDefined();
                    expect(event.database).toBeDefined();
                    expect(event.method).toBeDefined();
                    expect(event.queryUuid).toBeDefined();
                    expect(event.queryUuid).toBeDefined();
                    expect(event.sql).toBeDefined();
                    expect(event.tables).toBeDefined();
                });
                await mssql.connect();
            });
        });

        describe('query-event', () => {
            test('should log select events by table', async () => {
                const { MSSQL } = await import('#/core/database/mssql');
                const mssql = new MSSQL(options);
                await mssql.connect();
                mssql.table(testTable).on(EVENT_TABLE.SELECTED, (res) => {
                    expect(res).toBeDefined();
                });
                await mssql.db(testTable).select('*').from(testTable);
            });
        });
    });

    afterAll(async () => {
        await knexInstance.schema.dropTable(testTable);
        await knexInstance.destroy();
    });
});