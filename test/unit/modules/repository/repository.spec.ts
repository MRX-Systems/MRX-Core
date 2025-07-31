import { afterAll, beforeAll, describe, expect, test } from 'bun:test';
import { randomBytes } from 'crypto';
import knex from 'knex';
import { PassThrough, Stream, Transform } from 'stream';

import { HttpError } from '#/errors/httpError';
import { DATABASE_ERROR_KEYS } from '#/modules/database/enums/databaseErrorKeys';
import { Table } from '#/modules/database/table';
import { Repository } from '#/modules/repository/repository';
import type { Filter } from '#/modules/repository/types/filter';

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

const createDataTable = async (): Promise<void> => {
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
};

const dropDataTable = async (): Promise<void> => {
	await knexInstance.schema.dropTable(testTable);
	await knexInstance.destroy();
};

interface FilterTest<Data> {
	filters: Filter<Data> | Filter<Data>[];
	validator: (data: Data[], expectedCount: number) => void;
	expectedCount: number;
}

const filtersTests: [string, FilterTest<Data>][] = [
	[
		'Literal Equal',
		{
			filters: { id: 10 },
			validator: (data, expectedCount) => {
				expect(data).toHaveLength(expectedCount);
				expect(data[0].id).toBe(10);
			},
			expectedCount: 1
		}
	],
	[
		'Literal Equal OR Literal Equal',
		{
			filters: [
				{ id: 10 },
				{ id: 20 }
			],
			validator: (data, expectedCount) => {
				expect(data).toHaveLength(expectedCount);
				expect(data).toContainEqual(expect.objectContaining({ id: 10 }));
				expect(data).toContainEqual(expect.objectContaining({ id: 20 }));
			},
			expectedCount: 2
		}
	],
	[
		'Equal',
		{
			filters: { id: { $eq: 10 } },
			validator: (data, expectedCount) => {
				expect(data).toHaveLength(expectedCount);
				expect(data).toContainEqual(expect.objectContaining({ id: 10 }));
			},
			expectedCount: 1
		}
	],
	[
		'Equal OR Equal',
		{
			filters: [
				{ id: { $eq: 10 } },
				{ id: { $eq: 20 } }
			],
			validator: (data, expectedCount) => {
				expect(data).toHaveLength(expectedCount);
				expect(data).toContainEqual(expect.objectContaining({ id: 10 }));
				expect(data).toContainEqual(expect.objectContaining({ id: 20 }));
			},
			expectedCount: 2
		}
	],
	[
		'Not Equal',
		{
			filters: { id: { $neq: 10 } },
			validator: (data, expectedCount) => {
				expect(data).toHaveLength(expectedCount);
				expect(data).not.toContainEqual(expect.objectContaining({ id: 10 }));
			},
			expectedCount: 19
		}
	],
	[
		'Less Than',
		{
			filters: { id: { $lt: 5 } },
			validator: (data, expectedCount) => {
				if (!Array.isArray(data))
					throw new Error('Data should be an array');
				expect(data).toHaveLength(expectedCount);
				data.forEach((item) => expect(item.id).toBeLessThan(5));
			},
			expectedCount: 4
		}
	],
	[
		'Less Than or Equal',
		{
			filters: { id: { $lte: 5 } },
			validator: (data, expectedCount) => {
				if (!Array.isArray(data))
					throw new Error('Data should be an array');
				expect(data).toHaveLength(expectedCount);
				data.forEach((item) => expect(item.id).toBeLessThanOrEqual(5));
			},
			expectedCount: 5
		}
	],
	[
		'Greater Than',
		{
			filters: { id: { $gt: 5 } },
			validator: (data, expectedCount) => {
				if (!Array.isArray(data))
					throw new Error('Data should be an array');
				expect(data).toHaveLength(expectedCount);
				data.forEach((item) => expect(item.id).toBeGreaterThan(5));
			},
			expectedCount: 15
		}
	],
	[
		'Greater Than or Equal',
		{
			filters: { id: { $gte: 5 } },
			validator: (data, expectedCount) => {
				if (!Array.isArray(data))
					throw new Error('Data should be an array');
				expect(data).toHaveLength(expectedCount);
				data.forEach((item) => expect(item.id).toBeGreaterThanOrEqual(5));
			},
			expectedCount: 16
		}
	],
	[
		'In',
		{
			filters: { id: { $in: [2, 3] } },
			validator: (data, expectedCount) => {
				if (!Array.isArray(data))
					throw new Error('Data should be an array');
				expect(data).toHaveLength(expectedCount);
				data.forEach((item) => expect([2, 3]).toContain(item.id));
			},
			expectedCount: 2
		}
	],
	[
		'Not In',
		{
			filters: { id: { $nin: [2, 3] } },
			validator: (data, expectedCount) => {
				if (!Array.isArray(data))
					throw new Error('Data should be an array');
				expect(data).toHaveLength(expectedCount);
				data.forEach((item) => expect([2, 3]).not.toContain(item.id));
			},
			expectedCount: 18
		}
	],
	[
		'Between',
		{
			filters: { id: { $between: [2, 5] } },
			validator: (data, expectedCount) => {
				if (!Array.isArray(data))
					throw new Error('Data should be an array');
				expect(data).toHaveLength(expectedCount);
				data.forEach((item) => {
					expect(item.id).toBeGreaterThanOrEqual(2);
					expect(item.id).toBeLessThanOrEqual(5);
				});
			},
			expectedCount: 4
		}
	],
	[
		'Not Between',
		{
			filters: { id: { $nbetween: [3, 5] } },
			validator: (data, expectedCount) => {
				if (!Array.isArray(data))
					throw new Error('Data should be an array');
				expect(data).toHaveLength(expectedCount);
				data.forEach((item) => {
					if (item.id <= 3)
						expect(item.id).toBeLessThanOrEqual(3);
					else
						expect(item.id).toBeGreaterThanOrEqual(5);
				});
			},
			expectedCount: 17
		}
	],
	[
		'Like',
		{
			filters: { name: { $like: 'Repository::' } },
			validator: (data, expectedCount) => {
				if (!Array.isArray(data))
					throw new Error('Data should be an array');
				expect(data).toHaveLength(expectedCount);
				data.forEach((item) => expect(item.name).toMatch(/^Repository::/));
			},
			expectedCount: 20
		}
	],
	[
		'Not Like',
		{
			filters: { name: { $nlike: 'zRepositoryz' } },
			validator: (data, expectedCount) => {
				if (!Array.isArray(data))
					throw new Error('Data should be an array');
				expect(data).toHaveLength(expectedCount);
				data.forEach((item) => expect(item.name).not.toMatch(/zRepositoryz/));
			},
			expectedCount: 20
		}
	],
	[
		'Is Null',
		{
			filters: { n: { $isNull: true } },
			validator: (data, expectedCount) => {
				if (!Array.isArray(data))
					throw new Error('Data should be an array');
				expect(data).toHaveLength(expectedCount);
				data.forEach((item) => expect(item.n).toBeNull());
			},
			expectedCount: 7
		}
	],
	[
		'Is Not Null',
		{
			filters: { n: { $isNull: false } },
			validator: (data, expectedCount) => {
				if (!Array.isArray(data))
					throw new Error('Data should be an array');
				expect(data).toHaveLength(expectedCount);
				data.forEach((item) => expect(item.n).not.toBeNull());
			},
			expectedCount: 13
		}
	],
	[
		'Q operator string literal',
		{
			filters: { $q: 'Repository::' },
			validator: (data, expectedCount) => {
				if (!Array.isArray(data))
					throw new Error('Data should be an array');
				expect(data).toHaveLength(expectedCount);
			},
			expectedCount: 20
		}
	],
	[
		'Q operator numeric literal',
		{
			filters: { $q: 15 },
			validator: (data, expectedCount) => {
				if (!Array.isArray(data))
					throw new Error('Data should be an array');
				expect(data).toHaveLength(expectedCount);
			},
			expectedCount: 2
		}
	],
	[
		'Q operator with specified fields and string value',
		{
			filters: { $q: { selectedFields: ['name'], value: 'Repository::' } },
			validator: (data, expectedCount) => {
				if (!Array.isArray(data))
					throw new Error('Data should be an array');
				expect(data).toHaveLength(expectedCount);
			},
			expectedCount: 20
		}
	],
	[
		'Q operator with specified fields and numeric value',
		{
			filters: { $q: { selectedFields: ['age'], value: 15 } },
			validator: (data, expectedCount) => {
				if (!Array.isArray(data))
					throw new Error('Data should be an array');
				expect(data).toHaveLength(expectedCount);
			},
			expectedCount: 1
		}
	],
	[
		'Q operator with specified fields and string/numeric value',
		{
			filters: { $q: { selectedFields: ['name', 'id'], value: '15' } },
			validator: (data, expectedCount) => {
				if (!Array.isArray(data))
					throw new Error('Data should be an array');
				expect(data).toHaveLength(expectedCount);
			},
			expectedCount: 2
		}
	],
	[
		'Multiple conditions with AND',
		{
			filters: {
				id: { $gt: 2 },
				name: { $like: 'Repository::' },
				birth: { $between: [new Date('2021-01-01'), new Date('2021-01-10')] }
			},
			validator: (data, expectedCount) => {
				if (!Array.isArray(data))
					throw new Error('Data should be an array');
				expect(data).toHaveLength(expectedCount);
				data.forEach((item) => {
					expect(item.id).toBeGreaterThan(2);
					expect(item.name).toMatch(/^Repository::/);
					expect(item.birth.getTime()).toBeGreaterThanOrEqual(new Date('2021-01-01').getTime());
					expect(item.birth.getTime()).toBeLessThanOrEqual(new Date('2021-01-10').getTime());
				});
			},
			expectedCount: 8
		}
	],
	[
		'Filter with empty object should be ignored',
		{
			filters: {
				id: { $gt: 2 },
				// @ts-expect-error - Testing empty object filter
				emptyFilter: {},
				name: { $like: 'Repository::' }
			},
			validator: (data, expectedCount) => {
				if (!Array.isArray(data))
					throw new Error('Data should be an array');
				expect(data).toHaveLength(expectedCount);
				data.forEach((item) => {
					expect(item.id).toBeGreaterThan(2);
					expect(item.name).toMatch(/^Repository::/);
				});
			},
			expectedCount: 18
		}
	],
	[
		'Q operator with falsy value should not add conditions',
		{
			filters: {
				$q: '',
				id: { $lte: 5 }
			},
			validator: (data, expectedCount) => {
				if (!Array.isArray(data))
					throw new Error('Data should be an array');
				expect(data).toHaveLength(expectedCount);
				data.forEach((item) => {
					expect(item.id).toBeLessThanOrEqual(5);
				});
			},
			expectedCount: 5
		}
	],
	[
		'Filter with null value should work as literal comparison',
		{
			filters: {
				n: null
			},
			validator: (data, expectedCount) => {
				if (!Array.isArray(data))
					throw new Error('Data should be an array');
				expect(data).toHaveLength(expectedCount);
				data.forEach((item) => {
					expect(item.n).toBeNull();
				});
			},
			expectedCount: 7
		}
	],
	[
		'With AdaptiveWhereClause - undefined operator',
		{
			filters: {
				// @ts-expect-error - Testing undefined operator
				age: {
					$eq: undefined,
					$neq: undefined,
					$between: undefined,
					$nbetween: undefined,
					$gt: undefined,
					$gte: undefined,
					$lt: undefined,
					$lte: undefined,
					$in: undefined,
					$nin: undefined,
					$like: undefined,
					$nlike: undefined,
					$isNull: undefined
				}
			},
			validator: (data, expectedCount) => {
				if (!Array.isArray(data))
					throw new Error('Data should be an array');
				expect(data).toHaveLength(expectedCount);
				data.forEach((item) => {
					expect(item.age).toBeDefined();
				});
			},
			expectedCount: 20
		}
	]
];


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
				orderBy: {
					selectedField: 'id',
					direction: 'desc'
				}
			});
			let previousId = Number.MAX_SAFE_INTEGER;
			for await (const data of stream1) {
				expect(data).toHaveProperty('id');
				expect(data.id).toBeLessThanOrEqual(previousId);
				previousId = data.id;
			}

			const stream2 = repository.findStream<Data>({
				orderBy: {
					selectedField: 'id',
					direction: 'asc'
				}
			});
			previousId = Number.MIN_SAFE_INTEGER;
			for await (const data of stream2) {
				expect(data).toHaveProperty('id');
				expect(data.id).toBeGreaterThanOrEqual(previousId);
				previousId = data.id;
			}
		});

		test.each(filtersTests)(
			'should correctly apply filter <%s>',
			async (_, item) => {
				const stream = repository.findStream<Data>({
					filters: item.filters
				}) as AsyncIterable<Data>;

				const res = [];

				for await (const data of stream)
					res.push(data);
				item.validator(res, item.expectedCount);
			}
		);

		test('should allow async iteration over the data with a transform function', async () => {
			const stream = repository.findStream<Data>({
				transform: (chunk, _, callback) => {
					callback(null, { ...chunk, name: chunk.name.toUpperCase() });
				}
			}) as AsyncIterable<Data>;
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
				expect(error).toBeInstanceOf(HttpError);
				expect(error).toHaveProperty('message');
				expect((error as { message: string }).message).toContain(DATABASE_ERROR_KEYS.MSSQL_DATABASE_COLUMN_NOT_FOUND);
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
				expect(error).toBeInstanceOf(HttpError);
				expect(error).toHaveProperty('message');
				expect((error as { message: string }).message).toContain(DATABASE_ERROR_KEYS.MSSQL_DATABASE_COLUMN_NOT_FOUND);
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

		test('should return an array of data with limit and offset and filters', async () => {
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
				orderBy: {
					selectedField: 'id',
					direction: 'desc'
				}
			});
			let previousId = Number.MAX_SAFE_INTEGER;
			data1.forEach((item) => {
				expect(item).toHaveProperty('id');
				expect(item.id).toBeLessThanOrEqual(previousId);
				previousId = item.id;
			});

			const data2 = await repository.find<Data>({
				orderBy: {
					selectedField: 'id',
					direction: 'asc'
				}
			});
			previousId = Number.MIN_SAFE_INTEGER;
			data2.forEach((item) => {
				expect(item).toHaveProperty('id');
				expect(item.id).toBeGreaterThanOrEqual(previousId);
				previousId = item.id;
			});
		});

		test.each(filtersTests)(
			'should correctly apply filter <%s>',
			async (_, item) => {
				const data = await repository.find<Data>({
					filters: item.filters
				});
				item.validator(data, item.expectedCount);
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
				expect(error).toBeInstanceOf(HttpError);
				expect(error).toHaveProperty('message');
				expect((error as { message: string }).message).toContain(DATABASE_ERROR_KEYS.MSSQL_DATABASE_COLUMN_NOT_FOUND);
			}
		});

		test('should throw an error when they are no results', async () => {
			try {
				await repository.find<Data>({
					filters: {
						id: 100
					},
					throwIfNoResult: true
				});
			} catch (error) {
				expect(error).toBeInstanceOf(Error);
				expect(error).toBeInstanceOf(HttpError);
				expect(error).toHaveProperty('message');
				expect((error as { message: string }).message).toBe(DATABASE_ERROR_KEYS.MSSQL_NO_RESULT);
			}
		});

		test('should throw an error when they are no results with custom message', async () => {
			try {
				await repository.find<Data>({
					filters: {
						id: 100
					},
					throwIfNoResult: 'Custom error message'
				});
			} catch (error) {
				expect(error).toBeInstanceOf(Error);
				expect(error).toBeInstanceOf(HttpError);
				expect(error).toHaveProperty('message');
				expect((error as { message: string }).message).toBe(DATABASE_ERROR_KEYS.MSSQL_NO_RESULT);
			}
		});
	});

	describe('count', () => {
		test('should return the total number of data', async () => {
			const count = await repository.count();
			expect(count).toBe(20);
		});

		test.each(filtersTests)(
			'should correctly apply filter <%s>',
			async (_, item) => {
				const data = await repository.count<Data>({
					filters: item.filters
				});
				expect(data).toBe(item.expectedCount);
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
				expect(error).toBeInstanceOf(HttpError);
				expect(error).toHaveProperty('message');
				expect((error as { message: string }).message).toContain(DATABASE_ERROR_KEYS.MSSQL_DATABASE_COLUMN_NOT_FOUND);
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
				expect(error).toBeInstanceOf(HttpError);
				expect(error).toHaveProperty('message');
				expect((error as { message: string }).message).toContain(DATABASE_ERROR_KEYS.MSSQL_DATABASE_IDENTITY_INSERT_NOT_ALLOWED);
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
				expect(error).toBeInstanceOf(HttpError);
				expect(error).toHaveProperty('message');
				expect((error as { message: string }).message).toContain(DATABASE_ERROR_KEYS.MSSQL_DATABSE_CANNOT_UPDATE_IDENTITY_COLUMN);
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
				expect(error).toBeInstanceOf(HttpError);
				expect(error).toHaveProperty('message');
				expect((error as { message: string }).message).toContain(DATABASE_ERROR_KEYS.MSSQL_DATABASE_COLUMN_NOT_FOUND);
			}
		});
	});

	describe('transaction support', () => {
		test('should use transaction in find operation', async () => {
			await knexInstance.transaction(async (trx) => {
				const data = await repository.find({
					transaction: trx,
					limit: 1
				});
				expect(data).toBeInstanceOf(Array);
				expect(data.length).toBeGreaterThan(0);
			});
		});

		test('should use transaction in count operation', async () => {
			await knexInstance.transaction(async (trx) => {
				const count = await repository.count({
					transaction: trx
				});
				expect(typeof count).toBe('number');
				expect(count).toBeGreaterThan(0);
			});
		});

		test('should use transaction in insert operation', async () => {
			await knexInstance.transaction(async (trx) => {
				const data = {
					name: 'Repository::transaction-insert',
					age: 30,
					birth: new Date('2021-01-30'),
					bool: true
				};
				const items = await repository.insert(data, {
					transaction: trx
				});
				expect(items).toHaveLength(1);
				expect(items[0]).toHaveProperty('id');
				expect(items[0].name).toBe('Repository::transaction-insert');
			});
		});

		test('should use transaction in update operation', async () => {
			await knexInstance.transaction(async (trx) => {
				const data = {
					name: 'Repository::transaction-update'
				};
				const items = await repository.update(data, {
					filters: { id: 8 },
					transaction: trx
				});
				expect(items).toHaveLength(1);
				expect(items[0].name).toBe('Repository::transaction-update');
			});
		});

		test('should use transaction in delete operation', async () => {
			await knexInstance.transaction(async (trx) => {
				const items = await repository.delete({
					filters: { id: 9 },
					transaction: trx
				});
				expect(items).toHaveLength(1);
				expect(items[0].id).toBe(9);
			});
		});

		test('should rollback transaction on error', async () => {
			try {
				await knexInstance.transaction(async (trx) => {
					// Insert a record
					await repository.insert({
						name: 'Repository::transaction-rollback',
						age: 31,
						birth: new Date('2021-01-31'),
						bool: true
					}, {
						transaction: trx
					});

					// Force an error
					throw new Error('Test rollback');
				});
			} catch (error) {
				expect((error as Error).message).toBe('Test rollback');
			}

			// Verify the record was not inserted due to rollback
			const records = await repository.find({
				filters: {
					name: 'Repository::transaction-rollback'
				}
			});
			expect(records).toHaveLength(0);
		});

		test('should work with findStream and transaction', async () => {
			await knexInstance.transaction(async (trx) => {
				const stream = repository.findStream({
					transaction: trx,
					filters: { id: { $lte: 2 } }
				});

				const results = [];
				for await (const data of stream)
					results.push(data);

				expect(results.length).toBeGreaterThan(0);
				results.forEach((item) => {
					expect(item.id).toBeLessThanOrEqual(2);
				});
			});
		});
	});
	afterAll(dropDataTable);
});