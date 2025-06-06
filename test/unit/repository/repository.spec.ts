import { afterAll, beforeAll, describe, expect, test } from 'bun:test';
import { randomBytes } from 'crypto';
import knex from 'knex';
import { PassThrough, Stream, Transform } from 'stream';

import { Table } from '#/database/table';
import { CoreError } from '#/error/coreError';
import { Repository } from '#/repository/repository';
import type { Filter } from '#/repository/types/filter';

const options = {
    databaseName: process.env.MSSQL_DATABASE ?? '',
    host: process.env.MSSQL_HOST ?? '',
    port: 1433,
    user: process.env.MSSQL_USER ?? '',
    password: process.env.MSSQL_PASSWORD ?? ''
};

const nanoId = randomBytes(4).toString('hex');

const testTable = `unit_test_repository_${nanoId}`;

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

const table = new Table(
    options.databaseName,
    testTable,
    ['id', 'name', 'age', 'birth', 'n'],
    ['id', 'NUMBER']
);

interface Data {
    id: number;
    name: string;
    age: number;
    birth: Date;
    bool: boolean;
    n: string | null;
}

async function createDataTable(): Promise<void> {
    if (await knexInstance.schema.hasTable(testTable))
        return;
    await knexInstance.schema.createTable(testTable, (table) => {
        table.increments('id').primary();
        table.string('name').notNullable();
        table.integer('age').notNullable();
        table.date('birth').notNullable();
        table.boolean('bool').notNullable();
        table.string('n').nullable();
    });
}

async function dropDataTable(): Promise<void> {
    await knexInstance.schema.dropTable(testTable);
    await knexInstance.destroy();
}

type AdvancedSearchTest<T> = [Filter<T> | Filter<T>[], (data: T | T[]) => void, number];

function advancedSearchTests(): AdvancedSearchTest<Data>[] {
    const advancedSearchTest: AdvancedSearchTest<Data>[] = [
        /**
         * Single advanced search tests with one condition
         */
        // Equal
        [
            { id: 10 },
            (data: Data | Data[]): void => {
                if (Array.isArray(data))
                    data.forEach((item) => expect(item.id).toBe(10));
                else
                    expect(data.id).toBe(10);
            },
            1
        ],
        // Equal
        [
            { id: { $eq: 2 } },
            (data: Data | Data[]): void => {
                if (Array.isArray(data))
                    data.forEach((item) => expect(item.id).toBe(2));
                else
                    expect(data.id).toBe(2);
            },
            1
        ],
        // Not equal
        [
            { id: { $neq: 2 } },
            (data: Data | Data[]): void => {
                if (Array.isArray(data))
                    data.forEach((item) => expect(item.id).not.toBe(2));
                else
                    expect(data.id).not.toBe(2);
            },
            19
        ],
        // Less than
        [
            { id: { $lt: 5 } },
            (data: Data | Data[]): void => {
                if (Array.isArray(data))
                    data.forEach((item) => expect(item.id).toBeLessThan(5));
                else
                    expect(data.id).toBeLessThan(5);
            },
            4
        ],
        // Less than or equal
        [
            { id: { $lte: 5 } },
            (data: Data | Data[]): void => {
                if (Array.isArray(data))
                    data.forEach((item) => expect(item.id).toBeLessThanOrEqual(5));
                else
                    expect(data.id).toBeLessThanOrEqual(5);
            },
            5
        ],
        // Greater than
        [
            { id: { $gt: 5 } },
            (data: Data | Data[]): void => {
                if (Array.isArray(data))
                    data.forEach((item) => expect(item.id).toBeGreaterThan(5));
                else
                    expect(data.id).toBeGreaterThan(5);
            },
            15
        ],
        // Greater than or equal
        [
            { id: { $gte: 5 } },
            (data: Data | Data[]): void => {
                if (Array.isArray(data))
                    data.forEach((item) => expect(item.id).toBeGreaterThanOrEqual(5));
                else
                    expect(data.id).toBeGreaterThanOrEqual(5);
            },
            16
        ],
        // In
        [
            { id: { $in: [2, 3] } },
            (data: Data | Data[]): void => {
                if (Array.isArray(data))
                    data.forEach((item) => expect([2, 3]).toContain(item.id));
                else
                    expect([2, 3]).toContain(data.id);
            },
            2
        ],
        // Not in
        [
            { id: { $nin: [2, 3] } },
            (data: Data | Data[]): void => {
                if (Array.isArray(data))
                    data.forEach((item) => expect([2, 3]).not.toContain(item.id));
                else
                    expect([2, 3]).not.toContain(data.id);
            },
            18
        ],
        // Between
        [
            { id: { $between: [2, 5] } },
            (data: Data | Data[]): void => {
                if (Array.isArray(data)) {
                    data.forEach((item) => {
                        expect(item.id).toBeGreaterThanOrEqual(2);
                        expect(item.id).toBeLessThanOrEqual(5);
                    });
                } else {
                    expect(data.id).toBeGreaterThanOrEqual(2);
                    expect(data.id).toBeLessThanOrEqual(5);
                }
            },
            4
        ],
        // Not between
        [
            { id: { $nbetween: [3, 5] } },
            (data: Data | Data[]): void => {
                if (Array.isArray(data))
                    data.forEach((item) => {
                        if (item.id <= 3)
                            expect(item.id).toBeLessThanOrEqual(3);
                        else
                            expect(item.id).toBeGreaterThanOrEqual(5);
                    });
                else
                    if (data.id < 3)
                        expect(data.id).toBeLessThan(3);
                    else
                        expect(data.id).toBeGreaterThan(5);
            },
            17
        ],
        // Like
        [
            { name: { $like: 'Repository::' } },
            (data: Data | Data[]): void => {
                if (Array.isArray(data))
                    data.forEach((item) => expect(item.name).toMatch(/^Repository::/));
                else
                    expect(data.name).toMatch(/^Repository::/);
            },
            20
        ],
        // Not like
        [
            { name: { $nlike: 'zRepositoryz' } },
            (data: Data | Data[]): void => {
                if (Array.isArray(data))
                    data.forEach((item) => expect(item.name).not.toMatch(/:zRepositoryz/));
                else
                    expect(data.name).not.toMatch(/zRepositoryz/);
            },
            20
        ],
        // Is null
        [
            { n: { $isNull: true } },
            (data: Data | Data[]): void => {
                if (Array.isArray(data))
                    data.forEach((item) => expect(item.n).toBeNull());
                else
                    expect(data.n).toBeNull();
            },
            7
        ],
        // Is not null
        [
            { n: { $isNull: false } },
            (data: Data | Data[]): void => {
                if (Array.isArray(data))
                    data.forEach((item) => expect(item.n).not.toBeNull());
                else
                    expect(data.n).not.toBeNull();
            },
            13
        ],
        // Test $q operator with simple string search across all fields
        [
            {
                $q: 'Repository::'
            },
            (data: Data | Data[]): void => {
                if (Array.isArray(data)) {
                    data.forEach((item) => {
                        expect(item).toBeDefined();
                        expect(item.name).toContain('Repository::');
                    });
                } else {
                    expect(data).toBeDefined();
                    expect(data.name).toContain('Repository::');
                }
            },
            20
        ],
        // Test $q operator with numeric value search across all fields
        [
            {
                $q: 15
            },
            (data: Data | Data[]): void => {
                if (Array.isArray(data))
                    data.forEach((item) => {
                        expect(item).toBeDefined();
                        const stringifiedItem = JSON.stringify(item);
                        expect(stringifiedItem).toContain('15');
                    });
            },
            2
        ],
        // Test $q operator with search on selected field
        [
            {
                $q: {
                    selectedFields: ['name'],
                    value: 'Repository::'
                }
            },
            (data: Data | Data[]): void => {
                if (Array.isArray(data))
                    data.forEach((item) => {
                        expect(item).toBeDefined();
                        expect(item.name).toContain('Repository::');
                    });
            },
            20
        ],
        // Verify the $q operator with an operator and selected fields
        [
            {
                $q: {
                    selectedFields: ['age'],
                    value: 15
                }
            },
            (data: Data | Data[]): void => {
                if (Array.isArray(data))
                    data.forEach((item) => {
                        expect(item).toBeDefined();
                        expect(item.age).toBe(15);
                    });
            },
            1
        ],
        // Test $q operator with a string and numeric value search across selected fields
        [
            {
                $q: {
                    selectedFields: ['name', 'age'],
                    value: '15'
                }
            },
            (data: Data | Data[]): void => {
                if (Array.isArray(data))
                    data.forEach((item) => {
                        expect(item).toBeDefined();
                        const stringifiedItem = JSON.stringify(item);
                        expect(stringifiedItem).toContain('15');
                    });
            },
            1
        ],
        /**
         * Single advanced search tests with multiple conditions (AND)
         */
        [
            {
                id: { $gt: 2 },
                name: { $like: 'Repository::' },
                birth: { $between: [new Date('2021-01-01'), new Date('2021-01-10')] }
            },
            (data: Data | Data[]): void => {
                if (Array.isArray(data)) {
                    data.forEach((item) => {
                        expect(item.id).toBeGreaterThan(2);
                        expect(item.name).toMatch(/^Repository::/);
                        expect(item.birth.getTime()).toBeGreaterThanOrEqual(new Date('2021-01-01').getTime());
                        expect(item.birth.getTime()).toBeLessThanOrEqual(new Date('2021-01-10').getTime());
                    });
                } else {
                    expect(data.id).toBeGreaterThan(2);
                    expect(data.name).toMatch(/^Repository::/);
                    expect(data.birth.getTime()).toBeGreaterThanOrEqual(new Date('2021-01-01').getTime());
                    expect(data.birth.getTime()).toBeLessThanOrEqual(new Date('2021-01-10').getTime());
                }
            },
            8
        ],
        // Multiple advanced search tests (OR)
        [
            [
                {
                    id: { $eq: 2 }
                },
                {
                    id: { $eq: 5 }
                }
            ],
            (data: Data | Data[]): void => {
                if (Array.isArray(data))
                    data.forEach((item) => {
                        expect(item.id).toBeOneOf([2, 5]);
                    });
                else
                    expect(data.id).toBeOneOf([2, 5]);
            },
            2
        ]
    ];
    return advancedSearchTest;
}

const repository = new Repository<Data>(knexInstance, table);

describe('Repository', () => {
    beforeAll(async () => {
        await createDataTable();
        const dataToInsert: Omit<Data, 'id'>[] = Array.from({ length: 20 }, (_, i) => ({
            name: `Repository::${i}`,
            age: i,
            birth: new Date(`2021-01-${i + 1}`),
            bool: i % 2 === 0,
            n: i % 3 === 0 ? null : `null-${i}`
        }));
        await knexInstance(testTable).insert(dataToInsert);
    });

    describe('constructor', () => {
        test('should create a new instance', () => {
            expect(repository).toBeInstanceOf(Repository);
        });

        test('should create an instance with null table (validation happens at runtime)', () => {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any
            const repo = new Repository(knexInstance, null as any);
            expect(repo).toBeInstanceOf(Repository);
            // The error will occur when trying to use the repository, not during construction
        });

        test('should create an instance with null knex (validation happens at runtime)', () => {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any
            const repo = new Repository(null as any, table);
            expect(repo).toBeInstanceOf(Repository);
            // The error will occur when trying to use the repository, not during construction
        });
    });

    describe('findStream', () => {
        test('should return a stream compatible with Transform, PassThrough, and AsyncIterable', () => {
            const stream = repository.findStream();
            expect(stream).toBeInstanceOf(Stream);
            expect(stream).toBeInstanceOf(Transform);
            expect(stream).toBeInstanceOf(PassThrough);
            expect(stream[Symbol.asyncIterator]).toBeInstanceOf(Function);
        });

        test('should iterate asynchronously over all data from the stream', async () => {
            const stream = repository.findStream();
            for await (const data of stream) {
                expect(data).toHaveProperty('id');
                expect(data).toHaveProperty('name');
                expect(data).toHaveProperty('age');
                expect(data).toHaveProperty('birth');
                expect(data).toHaveProperty('bool');
            }
        });

        test('should emit data events and support stream subscriptions', (done) => {
            const stream = repository.findStream();
            stream.on('data', (data) => {
                expect(data).toHaveProperty('id');
                expect(data).toHaveProperty('name');
                expect(data).toHaveProperty('age');
                expect(data).toHaveProperty('birth');
                expect(data).toHaveProperty('bool');
            });
            stream.on('end', done);
        });

        test('should iterate asynchronously over selected fields from the stream', async () => {
            const stream = repository.findStream<Data>({
                selectedFields: ['id', 'name']
            });
            for await (const data of stream) {
                expect(data).toHaveProperty('id');
                expect(data).toHaveProperty('name');
                expect(data).not.toHaveProperty('age');
                expect(data).not.toHaveProperty('birth');
                expect(data).not.toHaveProperty('bool');
            }
        });

        test('should iterate asynchronously over data with correct order based on orderBy clause', async () => {
            const stream1 = repository.findStream<Data>({
                orderBy: ['id', 'desc']
            });
            let previousId = Number.MAX_SAFE_INTEGER;
            for await (const data of stream1) {
                expect(data).toHaveProperty('id');
                expect(data.id).toBeLessThanOrEqual(previousId);
                previousId = data.id;
            }

            const stream2 = repository.findStream<Data>({
                orderBy: ['id', 'asc']
            });
            previousId = Number.MIN_SAFE_INTEGER;
            for await (const data of stream2) {
                expect(data).toHaveProperty('id');
                expect(data.id).toBeGreaterThanOrEqual(previousId);
                previousId = data.id;
            }
        });

        test.each(advancedSearchTests())(
            'should correctly apply advanced search filter %j and validate the results',
            async (filter, validator) => {
                const stream = repository.findStream<Data>({
                    filters: filter
                });

                for await (const data of stream)
                    validator(data);
            }
        );

        test('should allow async iteration over the data with a transform function', async () => {
            const stream = repository.findStream<Data>({
                transform: (chunk, _, callback) => {
                    callback(null, { ...chunk, name: chunk.name.toUpperCase() });
                }
            });
            for await (const data of stream) {
                expect(data).toHaveProperty('id');
                expect(data).toHaveProperty('name');
                expect(data.name).toBe(data.name.toUpperCase());
                expect(data).toHaveProperty('age');
                expect(data).toHaveProperty('birth');
                expect(data).toHaveProperty('bool');
            }
        });

        test('should throw an error during async iteration when the query is invalid', async () => {
            const stream = repository.findStream<Data>({
                filters: {
                    // @ts-expect-error - Invalid query to trigger an error
                    error: '2'
                }
            });
            try {
                for await (const data of stream)
                    expect(data).not.toBeDefined();
            } catch (error) {
                expect(error).toBeInstanceOf(Error);
                expect(error).toBeInstanceOf(CoreError);
                expect(error).toHaveProperty('message');
                expect((error as { message: string }).message).toContain('An error occurred while streaming the query results.');
            }
        });

        test('should emit an error event when the query is invalid', (done) => {
            const stream = repository.findStream<Data>({
                filters: {
                    // @ts-expect-error - Invalid query to trigger an error
                    error: '2'
                }
            });
            stream.on('error', (error) => {
                expect(error).toBeInstanceOf(Error);
                expect(error).toBeInstanceOf(CoreError);
                expect(error).toHaveProperty('message');
                expect((error as { message: string }).message).toContain('An error occurred while streaming the query results.');
                done();
            });
        });
    });

    describe('find', () => {
        test('should return an array of data', async () => {
            const data = await repository.find();
            expect(data).toBeInstanceOf(Array);
            expect(data).toHaveLength(20);
            data.forEach((item) => {
                expect(item).toHaveProperty('id');
                expect(item).toHaveProperty('name');
                expect(item).toHaveProperty('age');
                expect(item).toHaveProperty('birth');
                expect(item).toHaveProperty('bool');
            });
        });

        test('should return an array of data with limit and offset', async () => {
            const data = await repository.find<Data>({
                limit: 5,
                offset: 5
            });
            expect(data).toBeInstanceOf(Array);
            expect(data).toHaveLength(5);
        });

        test('should return an array of data with limit and offset and advanced search', async () => {
            const data = await repository.find<Data>({
                limit: 5,
                offset: 5,
                filters: {
                    id: { $gte: 10 }
                }
            });
            expect(data).toBeInstanceOf(Array);
            expect(data).toHaveLength(5);
            data.forEach((item) => {
                expect(item).toHaveProperty('id');
                expect(item.id).toBeGreaterThanOrEqual(10);
            });
        });

        test('should return an array of data with selected fields', async () => {
            const data = await repository.find<Data>({
                selectedFields: ['id', 'name']
            });
            data.forEach((item) => {
                expect(item).toHaveProperty('id');
                expect(item).toHaveProperty('name');
                expect(item).not.toHaveProperty('age');
                expect(item).not.toHaveProperty('birth');
                expect(item).not.toHaveProperty('bool');
            });
        });

        test('should return an array of data with correct order based on orderBy clause', async () => {
            const data1 = await repository.find<Data>({
                orderBy: ['id', 'desc']
            });
            let previousId = Number.MAX_SAFE_INTEGER;
            data1.forEach((item) => {
                expect(item).toHaveProperty('id');
                expect(item.id).toBeLessThanOrEqual(previousId);
                previousId = item.id;
            });

            const data2 = await repository.find<Data>({
                orderBy: ['id', 'asc']
            });
            previousId = Number.MIN_SAFE_INTEGER;
            data2.forEach((item) => {
                expect(item).toHaveProperty('id');
                expect(item.id).toBeGreaterThanOrEqual(previousId);
                previousId = item.id;
            });
        });

        test.each(advancedSearchTests())(
            'should correctly apply advanced search filter %j and validate the results',
            async (filter, validator) => {
                const data = await repository.find<Data>({
                    filters: filter
                });
                validator(data);
            }
        );

        test('should throw an error when the query is invalid', async () => {
            try {
                await repository.find<Data>({
                    filters: {
                        // @ts-expect-error - Invalid query to trigger an error
                        error: '2'
                    }
                });
            } catch (error) {
                expect(error).toBeInstanceOf(Error);
                expect(error).toBeInstanceOf(CoreError);
                expect(error).toHaveProperty('message');
                expect((error as { message: string }).message).toContain('An error occurred while executing the query.');
            }
        });

        test('should throw an error when they are no results with options { throwIfNoResult: true }', async () => {
            try {
                await repository.find<Data>({
                    filters: {
                        id: 100
                    },
                    throwIfNoResult: true
                });
            } catch (error) {
                expect(error).toBeInstanceOf(Error);
                expect(error).toBeInstanceOf(CoreError);
                expect(error).toHaveProperty('message');
                expect((error as { message: string }).message).toBe('No records found matching the specified query options.');
            }
        });
    });

    describe('findOne', () => {
        test('should return a single data', async () => {
            const data = await repository.findOne({
                filters: {
                    id: 1
                }
            });
            expect(data).toHaveProperty('id');
            expect(data).toHaveProperty('name');
            expect(data).toHaveProperty('age');
            expect(data).toHaveProperty('birth');
            expect(data).toHaveProperty('bool');
        });

        test('should return a single data with selected fields', async () => {
            const data = await repository.findOne<Data>({
                filters: {
                    id: 1
                },
                selectedFields: ['id', 'name']
            });
            expect(data).toHaveProperty('id');
            expect(data).toHaveProperty('name');
            expect(data).not.toHaveProperty('age');
            expect(data).not.toHaveProperty('birth');
            expect(data).not.toHaveProperty('bool');
        });

        test('should return a single data with correct order based on orderBy clause', async () => {
            const data1 = await repository.findOne<Data>({
                orderBy: ['id', 'desc'],
                filters: {
                    id: { $lte: 20 }
                }
            });
            let previousId = Number.MAX_SAFE_INTEGER;
            expect(data1).toHaveProperty('id');
            expect(data1.id).toBeLessThanOrEqual(previousId);
            expect(data1.id).toBe(20);
            previousId = data1.id;

            const data2 = await repository.findOne<Data>({
                orderBy: ['id', 'asc'],
                filters: {
                    id: { $gte: 1 }
                }
            });
            previousId = Number.MIN_SAFE_INTEGER;
            expect(data2).toHaveProperty('id');
            expect(data2.id).toBeGreaterThanOrEqual(previousId);
            expect(data2.id).toBe(1);
            previousId = data2.id;
        });

        test.each(advancedSearchTests())(
            'should correctly apply advanced search filter %j and validate the results',
            async (filter, validator) => {
                const data = await repository.findOne<Data>({
                    filters: filter
                });
                validator(data);
            }
        );

        test('should throw an error when the query is invalid', async () => {
            try {
                await repository.findOne<Data>({
                    filters: {
                        // @ts-expect-error - Invalid query to trigger an error
                        error: '2'
                    }
                });
            } catch (error) {
                expect(error).toBeInstanceOf(Error);
                expect(error).toBeInstanceOf(CoreError);
                expect(error).toHaveProperty('message');
                expect((error as { message: string }).message).toContain('An error occurred while executing the query.');
            }
        });

        test('should throw an error when they are no results with options { throwIfNoResult: true }', async () => {
            try {
                await repository.findOne<Data>({
                    filters: {
                        id: 100
                    },
                    throwIfNoResult: true
                });
            } catch (error) {
                expect(error).toBeInstanceOf(Error);
                expect(error).toBeInstanceOf(CoreError);
                expect(error).toHaveProperty('message');
                expect((error as { message: string }).message).toBe('No records found matching the specified query options.');
            }
        });
    });

    describe('count', () => {
        test('should return the total number of data', async () => {
            const count = await repository.count();
            expect(count).toBe(20);
        });

        test.each(advancedSearchTests())(
            'should correctly apply advanced search filter %j and validate the results',
            async (filter, _, countExpected) => {
                const data = await repository.count<Data>({
                    filters: filter
                });
                expect(data).toBe(countExpected);
            }
        );

        test('should throw an error when the query is invalid', async () => {
            try {
                await repository.count({
                    filters: {
                        // @ts-expect-error - Invalid query to trigger an error
                        error: '2'
                    }
                });
            } catch (error) {
                expect(error).toBeInstanceOf(Error);
                expect(error).toBeInstanceOf(CoreError);
                expect(error).toHaveProperty('message');
                expect((error as { message: string }).message).toContain('An error occurred while executing the query.');
            }
        });
    });

    describe('insert', () => {
        test('should insert a new data', async () => {
            const data = {
                name: 'Repository::insert',
                age: 21,
                birth: new Date('2021-01-21'),
                bool: true
            };
            const items: Data[] = await repository.insert(data);
            expect(items).toHaveLength(1);
            items.forEach((item) => {
                expect(item).toHaveProperty('id');
                expect(item).toHaveProperty('name');
                expect(item).toHaveProperty('age');
                expect(item).toHaveProperty('birth');
                expect(item).toHaveProperty('bool');
            });
        });

        test('should insert a new data with selected fields', async () => {
            const data = {
                name: 'Repository::insert',
                age: 21,
                birth: new Date('2021-01-21'),
                bool: true
            };
            const items = await repository.insert(data, {
                selectedFields: ['id', 'name']
            });
            expect(items).toHaveLength(1);
            items.forEach((item) => {
                expect(item).toHaveProperty('id');
                expect(item).toHaveProperty('name');
                expect(item).not.toHaveProperty('age');
                expect(item).not.toHaveProperty('birth');
                expect(item).not.toHaveProperty('bool');
            });
        });

        test('should insert multiple new data', async () => {
            const data = Array.from({ length: 5 }, (_, i) => ({
                name: `Repository::insert-${i}`,
                age: 22 + i,
                birth: new Date(`2021-01-${21 + i}`),
                bool: i % 2 === 0
            }));
            const items = await repository.insert(data);
            expect(items).toHaveLength(5);
            items.forEach((item) => {
                expect(item).toHaveProperty('id');
                expect(item).toHaveProperty('name');
                expect(item).toHaveProperty('age');
                expect(item).toHaveProperty('birth');
                expect(item).toHaveProperty('bool');
            });
        });

        test('should throw an error when the data is invalid', async () => {
            try {
                await repository.insert({
                    id: 1
                });
            } catch (error) {
                expect(error).toBeInstanceOf(Error);
                expect(error).toBeInstanceOf(CoreError);
                expect(error).toHaveProperty('message');
                expect((error as { message: string }).message).toContain('An error occurred while executing the query.');
            }
        });
    });

    describe('update', () => {
        test('should update one row', async () => {
            const data = {
                name: 'Repository::update',
                age: 23,
                birth: new Date('2021-01-23'),
                bool: true
            };
            const items = await repository.update(data, {
                filters: {
                    id: 4
                }
            });
            expect(items).toHaveLength(1);
            expect(items[0]).toHaveProperty('id');
            expect(items[0].id).toBe(4);
            expect(items[0]).toHaveProperty('name');
            expect(items[0].name).toBe('Repository::update');
            expect(items[0]).toHaveProperty('age');
            expect(items[0].age).toBe(23);
            expect(items[0]).toHaveProperty('birth');
            expect(items[0].birth.getTime()).toBe(new Date('2021-01-23').getTime());
            expect(items[0]).toHaveProperty('bool');
            expect(items[0].bool).toBe(true);
        });

        test('should update multiple rows', async () => {
            const data = {
                name: 'Repository::update',
                age: 23,
                birth: new Date('2021-01-23'),
                bool: true
            };
            const items = await repository.update(data, {
                filters: {
                    id: { $in: [5, 6] }
                }
            });
            expect(items).toHaveLength(2);
            items.forEach((item) => {
                expect(item).toHaveProperty('id');
                expect(item).toHaveProperty('name');
                expect(item.name).toBe('Repository::update');
                expect(item).toHaveProperty('age');
                expect(item.age).toBe(23);
                expect(item).toHaveProperty('birth');
                expect(item.birth.getTime()).toBe(new Date('2021-01-23').getTime());
                expect(item).toHaveProperty('bool');
                expect(item.bool).toBe(true);
            });
        });

        test('should update one row with selected fields', async () => {
            const data = {
                name: 'Repository::update',
                age: 23,
                birth: new Date('2021-01-23'),
                bool: true
            };
            const items = await repository.update(data, {
                filters: {
                    id: 7
                },
                selectedFields: ['id', 'name']
            });
            expect(items).toHaveLength(1);
            items.forEach((item) => {
                expect(item).toHaveProperty('id');
                expect(item).toHaveProperty('name');
                expect(item).not.toHaveProperty('age');
                expect(item).not.toHaveProperty('birth');
                expect(item).not.toHaveProperty('bool');
            });
        });

        test('should throw an error when the data is invalid', async () => {
            try {
                await repository.update({
                    id: 1
                }, {
                    filters: {
                        id: -1
                    }
                });
            } catch (error) {
                expect(error).toBeInstanceOf(Error);
                expect(error).toBeInstanceOf(CoreError);
                expect(error).toHaveProperty('message');
                expect((error as { message: string }).message).toContain('An error occurred while executing the query.');
            }
        });
    });

    describe('delete', () => {
        test('should delete one row', async () => {
            const items = await repository.delete({
                filters: {
                    id: 1
                }
            });
            expect(items).toHaveLength(1);
            expect(items[0]).toHaveProperty('id');
            expect(items[0].id).toBe(1);
        });

        test('should delete multiple rows', async () => {
            const items = await repository.delete({
                filters: {
                    id: { $in: [2, 3] }
                }
            });
            expect(items).toHaveLength(2);
            items.forEach((item) => {
                expect(item).toHaveProperty('id');
                expect(item.id).toBeOneOf([2, 3]);
            });
        });

        test('should delete one row with selected fields', async () => {
            const items = await repository.delete({
                filters: {
                    id: 4
                },
                selectedFields: ['id', 'name']
            });
            expect(items).toHaveLength(1);
            items.forEach((item) => {
                expect(item).toHaveProperty('id');
                expect(item).toHaveProperty('name');
                expect(item).not.toHaveProperty('age');
                expect(item).not.toHaveProperty('birth');
                expect(item).not.toHaveProperty('bool');
            });
        });

        test('should throw an error when the query is invalid', async () => {
            try {
                await repository.delete({
                    filters: {
                        // @ts-expect-error - Invalid query to trigger an error
                        error: '2'
                    }
                });
            } catch (error) {
                expect(error).toBeInstanceOf(Error);
                expect(error).toBeInstanceOf(CoreError);
                expect(error).toHaveProperty('message');
                expect((error as { message: string }).message).toContain('An error occurred while executing the query.');
            }
        });
    });
    afterAll(dropDataTable);
});