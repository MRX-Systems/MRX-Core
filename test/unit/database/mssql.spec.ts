
import { afterAll, beforeAll, describe, expect, mock, test } from 'bun:test';
import { randomBytes } from 'crypto';
import knex from 'knex';

import { Repository } from '#/repository/repository';

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

// Create a connection pool to the database
const knexInstance = knex({
    client: 'mssql',
    connection: {
        database: options.databaseName,
        host: options.host,
        port: options.port,
        user: options.user,
        password: options.password,
        options: { encrypt: true },
        pool: {
            min: options.poolMin,
            max: options.poolMax
        }
    }
});


// Create a name to use for the test table
const nanoId = randomBytes(4).toString('hex');
const testTable = `unit_test_mssql_${nanoId}`;

describe('MSSQL', () => {
    beforeAll(async () => {
        await knexInstance.schema.createTable(testTable, (table) => {
            table.increments('id').primary();
            table.string('name');
        });
    });

    describe('constructor', () => {
        test('should create a new instance', async () => {
            const { MSSQL } = await import('#/database/mssql');
            const mssql = new MSSQL(options);
            expect(mssql).toBeInstanceOf(MSSQL);
        });
    });

    describe('connect', () => {
        test('should connect to the database', async () => {
            const { MSSQL } = await import('#/database/mssql');
            const mssql = new MSSQL(options);
            await mssql.connect();
            expect(mssql.isConnected).toBe(true);
        });

        test('should throw an error when the connection fails', async () => {
            const { MSSQL } = await import('#/database/mssql');
            const mssql = new MSSQL({ ...options, host: 'foo', connectionTimeout: 2500 });
            expect(mssql.connect()).rejects.toThrow(`Failed to connect to the database: "${options.databaseName}".`);
        });

        test('should trigger [MSSQL][query] event listener only when isEventEnabled is true', async () => {
            const { MSSQL } = await import('#/database/mssql');

            // Test with isEventEnabled set to false
            const mssql = new MSSQL({ ...options, isEventEnabled: false });
            await mssql.connect();
            const foo = mock();

            mssql.on('query', () => {
                foo();
            });
            await mssql.db(testTable).select('*').from(testTable);
            expect(foo).not.toHaveBeenCalled();

            // Test with isEventEnabled set to true
            const mssql2 = new MSSQL({ ...options, isEventEnabled: true });
            await mssql2.connect();
            const foo2 = mock();
            mssql2.on('query', () => {
                foo2();
            });
            await mssql2.db(testTable).select('*').from(testTable);
            expect(foo2).toHaveBeenCalled();
        });

        test('should trigger [MSSQL][query:error] event listener only when isEventEnabled is true', async () => {
            const { MSSQL } = await import('#/database/mssql');

            // Test with isEventEnabled set to false
            const mssql = new MSSQL({ ...options, isEventEnabled: false });
            await mssql.connect();
            const foo = mock();

            mssql.on('query:error', () => {
                foo();
            });
            try {
                await mssql.db(testTable).select('*').from('non_existent_table');
            } catch {
                // Ignore the error
            }
            expect(foo).not.toHaveBeenCalled();

            // Test with isEventEnabled set to true
            const mssql2 = new MSSQL({ ...options, isEventEnabled: true });
            await mssql2.connect();
            const foo2 = mock();
            mssql2.on('query:error', () => {
                foo2();
            });
            try {
                await mssql2.db(testTable).select('*').from('non_existent_table');
            } catch {
                // Ignore the error
            }
            expect(foo2).toHaveBeenCalled();
        });

        test('should trigger [MSSQL][query:response] event listener only when isEventEnabled is true', async () => {
            const { MSSQL } = await import('#/database/mssql');

            // Test with isEventEnabled set to false
            const mssql = new MSSQL({ ...options, isEventEnabled: false });
            await mssql.connect();
            const foo = mock();

            mssql.on('query:response', () => {
                foo();
            });
            await mssql.db(testTable).select('*').from(testTable);
            expect(foo).not.toHaveBeenCalled();

            // Test with isEventEnabled set to true
            const mssql2 = new MSSQL({ ...options, isEventEnabled: true });
            await mssql2.connect();
            const foo2 = mock();
            mssql2.on('query:response', () => {
                foo2();
            });
            await mssql2.db(testTable).select('*').from(testTable);
            expect(foo2).toHaveBeenCalled();
        });

        test('should trigger [Table][selected] event listener only when isEventEnabled is true', async () => {
            const { MSSQL } = await import('#/database/mssql');

            // Test with isEventEnabled set to false
            const mssql = new MSSQL({ ...options, isEventEnabled: false });
            await mssql.connect();
            const foo = mock();

            mssql.getTable(testTable).on('selected', () => {
                foo();
            });
            await mssql.db(testTable).select('*').from(testTable);
            expect(foo).not.toHaveBeenCalled();

            // Test with isEventEnabled set to true
            const mssql2 = new MSSQL({ ...options, isEventEnabled: true });
            await mssql2.connect();
            const foo2 = mock();
            mssql2.getTable(testTable).on('selected', () => {
                foo2();
            });
            await mssql2.db(testTable).select('*').from(testTable);
            expect(foo2).toHaveBeenCalled();
        });

        test('should trigger [Table][inserted] event listener only when isEventEnabled is true', async () => {
            const { MSSQL } = await import('#/database/mssql');

            // Test with isEventEnabled set to false
            const mssql = new MSSQL({ ...options, isEventEnabled: false });
            await mssql.connect();
            const foo = mock();

            mssql.getTable(testTable).on('inserted', () => {
                foo();
            });
            await mssql.db(testTable).insert({ name: 'test' }).into(testTable);
            expect(foo).not.toHaveBeenCalled();

            // Test with isEventEnabled set to true
            const mssql2 = new MSSQL({ ...options, isEventEnabled: true });
            await mssql2.connect();
            const foo2 = mock();
            mssql2.getTable(testTable).on('inserted', () => {
                foo2();
            });
            await mssql2.db(testTable).insert({ name: 'test' }).into(testTable);
            expect(foo2).toHaveBeenCalled();
        });

        test('should trigger [Table][updated] event listener only when isEventEnabled is true', async () => {
            const { MSSQL } = await import('#/database/mssql');

            // Test with isEventEnabled set to false
            const mssql = new MSSQL({ ...options, isEventEnabled: false });
            await mssql.connect();

            // Insert a row to update
            await mssql.db(testTable).insert({ name: 'test' }).into(testTable);

            const foo = mock();

            mssql.getTable(testTable).on('updated', () => {
                foo();
            });
            await mssql.db(testTable).update({ name: 'test' }).into(testTable);
            expect(foo).not.toHaveBeenCalled();

            // Test with isEventEnabled set to true
            const mssql2 = new MSSQL({ ...options, isEventEnabled: true });
            await mssql2.connect();
            const foo2 = mock();
            mssql2.getTable(testTable).on('updated', () => {
                foo2();
            });
            await mssql2.db(testTable).update({ name: 'test' }).into(testTable);
            expect(foo2).toHaveBeenCalled();
        });

        test('should trigger [Table][deleted] event listener only when isEventEnabled is true', async () => {
            const { MSSQL } = await import('#/database/mssql');

            // Test with isEventEnabled set to false
            const mssql = new MSSQL({ ...options, isEventEnabled: false });
            await mssql.connect();

            // Insert a row to delete
            await mssql.db(testTable).insert({ name: 'test' }).into(testTable);

            const foo = mock();

            mssql.getTable(testTable).on('deleted', () => {
                foo();
            });
            await mssql.db(testTable).delete().from(testTable);
            expect(foo).not.toHaveBeenCalled();

            // Insert a row to delete
            await mssql.db(testTable).insert({ name: 'test' }).into(testTable);

            // Test with isEventEnabled set to true
            const mssql2 = new MSSQL({ ...options, isEventEnabled: true });
            await mssql2.connect();
            const foo2 = mock();
            mssql2.getTable(testTable).on('deleted', () => {
                foo2();
            });
            await mssql2.db(testTable).delete().from(testTable);
            expect(foo2).toHaveBeenCalled();
        });

        test('should trigger events in the correct order when isEventEnabled is true', async () => {
            const { MSSQL } = await import('#/database/mssql');

            const mssql = new MSSQL({ ...options, isEventEnabled: true });
            await mssql.connect();

            const eventOrder: string[] = [];

            mssql.on('query', () => {
                eventOrder.push('query');
            });

            mssql.on('query:response', () => {
                eventOrder.push('query:response');
            });

            mssql.getTable(testTable).on('selected', () => {
                eventOrder.push('selected');
            });

            mssql.on('query:error', () => {
                eventOrder.push('query:error');
            });

            await mssql.db(testTable).select('*').from(testTable);
            expect(eventOrder).toEqual([
                'query',
                'query:response',
                'selected'
            ]);

            eventOrder.length = 0; // Clear the array for the next test

            try {
                await mssql.db(testTable).select('*').from('non_existent_table');
            } catch {
                // Ignore the error
            }
            expect(eventOrder).toEqual([
                'query',
                'query:error'
            ]);
        });
    });

    describe('disconnect', () => {
        test('should disconnect from the database', async () => {
            const { MSSQL } = await import('#/database/mssql');
            const mssql = new MSSQL(options);
            await mssql.connect();
            await mssql.disconnect();
            expect(mssql.isConnected).toBe(false);
        });

        test('should throw an error when the connection is not established', async () => {
            const { MSSQL } = await import('#/database/mssql');
            const mssql = new MSSQL(options);
            expect(mssql.disconnect()).rejects.toThrow(`Database "${options.databaseName}" is not connected.`);
        });
    });

    describe('getRepository', () => {
        class ExampleRepository extends Repository<{ a: string }> {
            public foo(): string {
                return 'bar';
            }
        }

        test('should return a default repository', async () => {
            const { MSSQL } = await import('#/database/mssql');
            const mssql = new MSSQL(options);
            await mssql.connect();
            expect(mssql.getRepository(testTable)).toBeInstanceOf(Repository);
        });

        test('should return a custom repository', async () => {
            const { MSSQL } = await import('#/database/mssql');
            const mssql = new MSSQL(options);
            await mssql.connect();
            expect(mssql.getRepository(testTable, ExampleRepository)).toBeInstanceOf(ExampleRepository);
            expect(mssql.getRepository(testTable, ExampleRepository).foo()).toBe('bar');
        });

        test('should throw an error when the database is not connected', async () => {
            const { MSSQL } = await import('#/database/mssql');
            const mssql = new MSSQL(options);
            expect(() => mssql.getRepository(testTable)).toThrow(`Database "${options.databaseName}" is not connected.`);
        });

        test('should throw an error when the repository is not found', async () => {
            const { MSSQL } = await import('#/database/mssql');
            const mssql = new MSSQL(options);
            await mssql.connect();
            expect(() => mssql.getRepository('foo')).toThrow('Table not found: "foo".');
        });
    });

    describe('getTable', () => {
        test('should return a table instance', async () => {
            const { MSSQL } = await import('#/database/mssql');
            const mssql = new MSSQL(options);
            await mssql.connect();
            expect(mssql.getTable(testTable)).toBeDefined();
        });

        test('should throw an error when the database is not connected', async () => {
            const { MSSQL } = await import('#/database/mssql');
            const mssql = new MSSQL(options);
            expect(() => mssql.getTable(testTable)).toThrow(`Database "${options.databaseName}" is not connected.`);
        });

        test('should throw an error when the table is not found', async () => {
            const { MSSQL } = await import('#/database/mssql');
            const mssql = new MSSQL(options);
            await mssql.connect();
            expect(() => mssql.getTable('foo')).toThrow('Table not found: "foo".');
        });
    });

    describe('getters', () => {
        test('should return the database name', async () => {
            const { MSSQL } = await import('#/database/mssql');
            const mssql = new MSSQL(options);
            expect(mssql.databaseName).toBe(options.databaseName);
        });

        test('should return isConnected', async () => {
            const { MSSQL } = await import('#/database/mssql');
            const mssql = new MSSQL(options);
            expect(mssql.isConnected).toBe(false);
        });

        test('should return the knex instance', async () => {
            const { MSSQL } = await import('#/database/mssql');
            const mssql = new MSSQL(options);
            await mssql.connect();
            expect(mssql.db).toBeDefined();
        });

        test('should throw an error when the database is not connected', async () => {
            const { MSSQL } = await import('#/database/mssql');
            const mssql = new MSSQL(options);
            expect(() => mssql.db).toThrow(`Database "${options.databaseName}" is not connected.`);
        });

        test('should return tables', async () => {
            const { MSSQL } = await import('#/database/mssql');
            const mssql = new MSSQL(options);
            await mssql.connect();
            expect(mssql.tables).toBeDefined();
        });

        test('should return repositories', async () => {
            const { MSSQL } = await import('#/database/mssql');
            const mssql = new MSSQL(options);
            await mssql.connect();
            expect(mssql.repositories).toBeDefined();
        });
    });

    afterAll(async () => {
        await knexInstance.schema.dropTable(testTable);
        await knexInstance.destroy();
    });
});