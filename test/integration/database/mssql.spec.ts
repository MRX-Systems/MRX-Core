import { afterAll, beforeAll, describe, expect, mock, test } from 'bun:test';
import { randomBytes } from 'crypto';
import knex from 'knex';

import { DATABASE_ERROR_KEYS } from '#/modules/database/enums/databaseErrorKeys';
import { Repository } from '#/modules/repository/repository';

/**
 * Database connection options for MSSQL testing.
 * Configuration is pulled from environment variables for security.
 */
const databaseOptions = {
	databaseName: process.env.MSSQL_DATABASE ?? '',
	host: process.env.MSSQL_HOST ?? '',
	port: 1433,
	user: process.env.MSSQL_USER ?? '',
	password: process.env.MSSQL_PASSWORD ?? '',
	encrypt: true,
	poolMin: 2,
	poolMax: 10
};

/**
 * Invalid database connection options for error testing scenarios.
 */
const invalidDatabaseOptions = {
	...databaseOptions,
	host: 'invalid-host-name-for-testing',
	connectionTimeout: 2500
};

/**
 * Minimal database connection options for edge case testing.
 */
const minimalDatabaseOptions = {
	databaseName: databaseOptions.databaseName,
	host: databaseOptions.host,
	port: databaseOptions.port,
	user: databaseOptions.user,
	password: databaseOptions.password
};

/**
 * Create a connection pool to the database for test setup and teardown.
 */
const knexInstance = knex({
	client: 'mssql',
	connection: {
		database: databaseOptions.databaseName,
		host: databaseOptions.host,
		port: databaseOptions.port,
		user: databaseOptions.user,
		password: databaseOptions.password,
		options: { encrypt: true },
		pool: {
			min: databaseOptions.poolMin,
			max: databaseOptions.poolMax
		}
	}
});

/**
 * Generate unique table names for each test run to avoid conflicts.
 */
const nanoId = randomBytes(4).toString('hex');
const primaryTestTable = `unit_test_mssql_primary_${nanoId}`;
const secondaryTestTable = `unit_test_mssql_secondary_${nanoId}`;
const complexTestTable = `unit_test_mssql_complex_${nanoId}`;

/**
 * Custom repository class for testing repository functionality.
 */
class CustomTestRepository extends Repository<{ id: number; name: string; email?: string }> {
	/**
	 * Custom method to test repository extension capabilities.
	 * @returns A test string value
	 */
	public getTestValue(): string {
		return 'custom-repository-test-value';
	}

	/**
	 * Find records by name pattern.
	 * @param pattern - The name pattern to search for
	 * @returns Promise resolving to matching records
	 */
	public async findByNamePattern(pattern: string): Promise<{ id: number; name: string; email?: string }[]> {
		return this.find({
			filters: {
				name: { $like: `%${pattern}%` }
			}
		});
	}
}

describe('MSSQL', () => {
	beforeAll(async () => {
		// Create primary test table with basic structure
		await knexInstance.schema.createTable(primaryTestTable, (table) => {
			table.increments('id').primary();
			table.string('name').notNullable();
			table.string('email').nullable();
			table.timestamp('createdAt').defaultTo(knexInstance.fn.now());
		});

		// Create secondary test table for relationship testing
		await knexInstance.schema.createTable(secondaryTestTable, (table) => {
			table.increments('id').primary();
			table.string('description').notNullable();
			table.integer('primaryId').references('id').inTable(primaryTestTable);
		});

		// Create complex test table with various data types
		await knexInstance.schema.createTable(complexTestTable, (table) => {
			table.increments('id').primary();
			table.text('largeText').nullable();
			table.decimal('price', 10, 2).nullable();
			table.boolean('isActive').defaultTo(true);
			table.json('metadata').nullable();
			table.timestamp('createdAt').defaultTo(knexInstance.fn.now());
			table.timestamp('updatedAt').nullable();
		});
	});

	describe('Constructor and Initialization', () => {
		test('should create MSSQL instance with complete configuration', async () => {
			const { MSSQL } = await import('#/modules/database/mssql');
			const mssql = new MSSQL(databaseOptions);

			expect(mssql).toBeInstanceOf(MSSQL);
			expect(mssql.databaseName).toBe(databaseOptions.databaseName);
			expect(mssql.isConnected).toBe(false);
		});

		test('should create MSSQL instance with minimal configuration', async () => {
			const { MSSQL } = await import('#/modules/database/mssql');
			const mssql = new MSSQL(minimalDatabaseOptions);

			expect(mssql).toBeInstanceOf(MSSQL);
			expect(mssql.databaseName).toBe(minimalDatabaseOptions.databaseName);
			expect(mssql.isConnected).toBe(false);
		});

		test('should create MSSQL instance with event system disabled by default', async () => {
			const { MSSQL } = await import('#/modules/database/mssql');
			const mssql = new MSSQL(databaseOptions);

			expect(mssql).toBeInstanceOf(MSSQL);
			// Events should be disabled by default based on test behavior
		});

		test('should create MSSQL instance with event system explicitly enabled', async () => {
			const { MSSQL } = await import('#/modules/database/mssql');
			const mssql = new MSSQL({ ...databaseOptions, isEventEnabled: true });

			expect(mssql).toBeInstanceOf(MSSQL);
		});

		test('should handle configuration with custom pool settings', async () => {
			const { MSSQL } = await import('#/modules/database/mssql');
			const customOptions = {
				...databaseOptions,
				poolMin: 1,
				poolMax: 5
			};
			const mssql = new MSSQL(customOptions);

			expect(mssql).toBeInstanceOf(MSSQL);
		});
	});

	describe('Connection Management', () => {
		describe('Successful Connection Scenarios', () => {
			test('should establish connection to database with valid credentials', async () => {
				const { MSSQL } = await import('#/modules/database/mssql');
				const mssql = new MSSQL(databaseOptions);

				await mssql.connect();

				expect(mssql.isConnected).toBe(true);
				expect(mssql.db).toBeDefined();

				await mssql.disconnect();
			});

			test('should maintain connection state after successful connection', async () => {
				const { MSSQL } = await import('#/modules/database/mssql');
				const mssql = new MSSQL(databaseOptions);

				expect(mssql.isConnected).toBe(false);
				await mssql.connect();
				expect(mssql.isConnected).toBe(true);

				await mssql.disconnect();
			});

			test('should allow multiple connections with different instances', async () => {
				const { MSSQL } = await import('#/modules/database/mssql');
				const mssql1 = new MSSQL(databaseOptions);
				const mssql2 = new MSSQL(databaseOptions);

				await Promise.all([mssql1.connect(), mssql2.connect()]);

				expect(mssql1.isConnected).toBe(true);
				expect(mssql2.isConnected).toBe(true);

				await Promise.all([mssql1.disconnect(), mssql2.disconnect()]);
			});
		});

		describe('Connection Failure Scenarios', () => {
			test('should throw descriptive error for invalid host', async () => {
				const { MSSQL } = await import('#/modules/database/mssql');
				const mssql = new MSSQL(invalidDatabaseOptions);

				expect(mssql.connect()).rejects.toThrow(DATABASE_ERROR_KEYS.MSSQL_CONNECTION_ERROR);
			});

			test('should throw error for invalid credentials', async () => {
				const { MSSQL } = await import('#/modules/database/mssql');
				const invalidCredentials = {
					...databaseOptions,
					user: 'invalid_user',
					password: 'invalid_password',
					connectionTimeout: 2500
				};
				const mssql = new MSSQL(invalidCredentials);

				expect(mssql.connect()).rejects.toThrow(DATABASE_ERROR_KEYS.MSSQL_CONNECTION_ERROR);
			});

			test('should throw error for invalid port', async () => {
				const { MSSQL } = await import('#/modules/database/mssql');
				const invalidPort = {
					...databaseOptions,
					port: 99999,
					connectionTimeout: 2500
				};
				const mssql = new MSSQL(invalidPort);

				expect(mssql.connect()).rejects.toThrow(DATABASE_ERROR_KEYS.MSSQL_CONNECTION_ERROR);
			});

			test('should handle connection timeout gracefully', async () => {
				const { MSSQL } = await import('#/modules/database/mssql');
				const timeoutOptions = {
					...invalidDatabaseOptions,
					connectionTimeout: 1000
				};
				const mssql = new MSSQL(timeoutOptions);

				expect(mssql.connect()).rejects.toThrow(DATABASE_ERROR_KEYS.MSSQL_CONNECTION_ERROR);
			});
		});

		describe('Disconnection Management', () => {
			test('should successfully disconnect from established connection', async () => {
				const { MSSQL } = await import('#/modules/database/mssql');
				const mssql = new MSSQL(databaseOptions);

				await mssql.connect();
				expect(mssql.isConnected).toBe(true);

				await mssql.disconnect();
				expect(mssql.isConnected).toBe(false);
			});

			test('should throw error when disconnecting without connection', async () => {
				const { MSSQL } = await import('#/modules/database/mssql');
				const mssql = new MSSQL(databaseOptions);

				expect(mssql.disconnect()).rejects.toThrow(DATABASE_ERROR_KEYS.MSSQL_NOT_CONNECTED);
			});

			test('should handle multiple disconnect attempts gracefully', async () => {
				const { MSSQL } = await import('#/modules/database/mssql');
				const mssql = new MSSQL(databaseOptions);

				await mssql.connect();
				await mssql.disconnect();

				expect(mssql.disconnect()).rejects.toThrow(DATABASE_ERROR_KEYS.MSSQL_NOT_CONNECTED);
			});
		});
	});

	describe('Event System Functionality', () => {
		describe('Query Event Management', () => {
			test('should emit query events when event system is enabled', async () => {
				const { MSSQL } = await import('#/modules/database/mssql');
				const mssql = new MSSQL({ ...databaseOptions, isEventEnabled: true });
				await mssql.connect();

				const queryEventSpy = mock();
				mssql.on('query', queryEventSpy);

				await mssql.db(primaryTestTable).select('*').limit(1);

				expect(queryEventSpy).toHaveBeenCalled();
				await mssql.disconnect();
			});

			test('should not emit query events when event system is disabled', async () => {
				const { MSSQL } = await import('#/modules/database/mssql');
				const mssql = new MSSQL({ ...databaseOptions, isEventEnabled: false });
				await mssql.connect();

				const queryEventSpy = mock();
				mssql.on('query', queryEventSpy);

				await mssql.db(primaryTestTable).select('*').limit(1);

				expect(queryEventSpy).not.toHaveBeenCalled();
				await mssql.disconnect();
			});

			test('should emit query response events for successful queries', async () => {
				const { MSSQL } = await import('#/modules/database/mssql');
				const mssql = new MSSQL({ ...databaseOptions, isEventEnabled: true });
				await mssql.connect();

				const responseEventSpy = mock();
				mssql.on('query:response', responseEventSpy);

				await mssql.db(primaryTestTable).select('*').limit(1);

				expect(responseEventSpy).toHaveBeenCalled();
				await mssql.disconnect();
			});

			test('should emit query error events for failed queries', async () => {
				const { MSSQL } = await import('#/modules/database/mssql');
				const mssql = new MSSQL({ ...databaseOptions, isEventEnabled: true });
				await mssql.connect();

				const errorEventSpy = mock();
				mssql.on('query:error', errorEventSpy);

				try {
					await mssql.db('non_existent_table').select('*');
				} catch {
					// Expected error - ignore
				}

				expect(errorEventSpy).toHaveBeenCalled();
				await mssql.disconnect();
			});

			test('should maintain correct event order for successful operations', async () => {
				const { MSSQL } = await import('#/modules/database/mssql');
				const mssql = new MSSQL({ ...databaseOptions, isEventEnabled: true });
				await mssql.connect();

				const eventSequence: string[] = [];

				mssql.on('query', () => eventSequence.push('query'));
				mssql.on('query:response', () => eventSequence.push('query:response'));
				mssql.getTable(primaryTestTable).on('selected', () => eventSequence.push('table:selected'));

				await mssql.db(primaryTestTable).select('*').limit(1);

				expect(eventSequence).toEqual(['query', 'query:response', 'table:selected']);
				await mssql.disconnect();
			});

			test('should maintain correct event order for failed operations', async () => {
				const { MSSQL } = await import('#/modules/database/mssql');
				const mssql = new MSSQL({ ...databaseOptions, isEventEnabled: true });
				await mssql.connect();

				const eventSequence: string[] = [];

				mssql.on('query', () => eventSequence.push('query'));
				mssql.on('query:error', () => eventSequence.push('query:error'));

				try {
					await mssql.db('non_existent_table').select('*');
				} catch {
					// Expected error - ignore
				}

				expect(eventSequence).toEqual(['query', 'query:error']);
				await mssql.disconnect();
			});
		});

		describe('Table-Level Event Management', () => {
			test('should emit table selected events when event system is enabled', async () => {
				const { MSSQL } = await import('#/modules/database/mssql');
				const mssql = new MSSQL({ ...databaseOptions, isEventEnabled: true });
				await mssql.connect();

				const selectedEventSpy = mock();
				mssql.getTable(primaryTestTable).on('selected', selectedEventSpy);

				await mssql.db(primaryTestTable).select('*').limit(1);

				expect(selectedEventSpy).toHaveBeenCalled();
				await mssql.disconnect();
			});

			test('should emit table inserted events when event system is enabled', async () => {
				const { MSSQL } = await import('#/modules/database/mssql');
				const mssql = new MSSQL({ ...databaseOptions, isEventEnabled: true });
				await mssql.connect();

				const insertedEventSpy = mock();
				mssql.getTable(primaryTestTable).on('inserted', insertedEventSpy);

				await mssql.db(primaryTestTable).insert({ name: 'test-insert', email: 'test@example.com' });

				expect(insertedEventSpy).toHaveBeenCalled();
				await mssql.disconnect();
			});

			test('should emit table updated events when event system is enabled', async () => {
				const { MSSQL } = await import('#/modules/database/mssql');
				const mssql = new MSSQL({ ...databaseOptions, isEventEnabled: true });
				await mssql.connect();

				// Insert a record to update
				await mssql.db(primaryTestTable).insert({ name: 'test-update', email: 'update@example.com' });

				const updatedEventSpy = mock();
				mssql.getTable(primaryTestTable).on('updated', updatedEventSpy);

				await mssql.db(primaryTestTable).where('name', 'test-update').update({ email: 'updated@example.com' });

				expect(updatedEventSpy).toHaveBeenCalled();
				await mssql.disconnect();
			});

			test('should emit table deleted events when event system is enabled', async () => {
				const { MSSQL } = await import('#/modules/database/mssql');
				const mssql = new MSSQL({ ...databaseOptions, isEventEnabled: true });
				await mssql.connect();

				// Insert a record to delete
				await mssql.db(primaryTestTable).insert({ name: 'test-delete', email: 'delete@example.com' });

				const deletedEventSpy = mock();
				mssql.getTable(primaryTestTable).on('deleted', deletedEventSpy);

				await mssql.db(primaryTestTable).where('name', 'test-delete').del();

				expect(deletedEventSpy).toHaveBeenCalled();
				await mssql.disconnect();
			});

			test('should not emit table events when event system is disabled', async () => {
				const { MSSQL } = await import('#/modules/database/mssql');
				const mssql = new MSSQL({ ...databaseOptions, isEventEnabled: false });
				await mssql.connect();

				const selectedEventSpy = mock();
				const insertedEventSpy = mock();
				const updatedEventSpy = mock();
				const deletedEventSpy = mock();

				mssql.getTable(primaryTestTable).on('selected', selectedEventSpy);
				mssql.getTable(primaryTestTable).on('inserted', insertedEventSpy);
				mssql.getTable(primaryTestTable).on('updated', updatedEventSpy);
				mssql.getTable(primaryTestTable).on('deleted', deletedEventSpy);

				// Perform all operations
				await mssql.db(primaryTestTable).select('*').limit(1);
				await mssql.db(primaryTestTable).insert({ name: 'test-no-events', email: 'noevents@example.com' });
				await mssql.db(primaryTestTable).where('name', 'test-no-events').update({ email: 'updated-noevents@example.com' });
				await mssql.db(primaryTestTable).where('name', 'test-no-events').del();

				expect(selectedEventSpy).not.toHaveBeenCalled();
				expect(insertedEventSpy).not.toHaveBeenCalled();
				expect(updatedEventSpy).not.toHaveBeenCalled();
				expect(deletedEventSpy).not.toHaveBeenCalled();

				await mssql.disconnect();
			});
		});
	});

	describe('Repository Management', () => {
		describe('Default Repository Operations', () => {
			test('should return default repository instance for valid table', async () => {
				const { MSSQL } = await import('#/modules/database/mssql');
				const mssql = new MSSQL(databaseOptions);
				await mssql.connect();

				const repository = mssql.getRepository(primaryTestTable);

				expect(repository).toBeInstanceOf(Repository);
				await mssql.disconnect();
			}, {
				timeout: 5500
			});

			test('should return same repository instance for repeated calls', async () => {
				const { MSSQL } = await import('#/modules/database/mssql');
				const mssql = new MSSQL(databaseOptions);
				await mssql.connect();

				const repository1 = mssql.getRepository(primaryTestTable);
				const repository2 = mssql.getRepository(primaryTestTable);

				expect(repository1).toBe(repository2);
				await mssql.disconnect();
			});

			test('should throw error when accessing repository without connection', async () => {
				const { MSSQL } = await import('#/modules/database/mssql');
				const mssql = new MSSQL(databaseOptions);

				expect(() => mssql.getRepository(primaryTestTable)).toThrow(DATABASE_ERROR_KEYS.MSSQL_NOT_CONNECTED);
			});

			test('should throw error for non-existent table repository', async () => {
				const { MSSQL } = await import('#/modules/database/mssql');
				const mssql = new MSSQL(databaseOptions);
				await mssql.connect();

				expect(() => mssql.getRepository('non_existent_table')).toThrow(DATABASE_ERROR_KEYS.MSSQL_TABLE_NOT_FOUND);
				await mssql.disconnect();
			});
		});

		describe('Custom Repository Operations', () => {
			test('should return custom repository instance for valid table', async () => {
				const { MSSQL } = await import('#/modules/database/mssql');
				const mssql = new MSSQL(databaseOptions);
				await mssql.connect();

				const repository = mssql.getRepository(primaryTestTable, CustomTestRepository);

				expect(repository).toBeInstanceOf(CustomTestRepository);
				expect(repository.getTestValue()).toBe('custom-repository-test-value');
				await mssql.disconnect();
			});

			test('should maintain custom repository methods functionality', async () => {
				const { MSSQL } = await import('#/modules/database/mssql');
				const mssql = new MSSQL(databaseOptions);
				await mssql.connect();

				// Insert test data
				await mssql.db(primaryTestTable).insert([
					{ name: 'John Test', email: 'john@test.com' },
					{ name: 'Jane Test', email: 'jane@test.com' },
					{ name: 'Bob Sample', email: 'bob@sample.com' }
				]);

				const repository = mssql.getRepository(primaryTestTable, CustomTestRepository);
				const results = await repository.findByNamePattern('Test');

				expect(results).toHaveLength(2);
				expect(results.every((r) => r.name.includes('Test'))).toBe(true);

				await mssql.disconnect();
			});

			test('should return same custom repository instance for repeated calls', async () => {
				const { MSSQL } = await import('#/modules/database/mssql');
				const mssql = new MSSQL(databaseOptions);
				await mssql.connect();

				const repository1 = mssql.getRepository(primaryTestTable, CustomTestRepository);
				const repository2 = mssql.getRepository(primaryTestTable, CustomTestRepository);

				expect(repository1).toBe(repository2);
				expect(repository1).toBeInstanceOf(CustomTestRepository);
				await mssql.disconnect();
			});

			test('should handle switching between default and custom repositories', async () => {
				const { MSSQL } = await import('#/modules/database/mssql');
				const mssql = new MSSQL(databaseOptions);
				await mssql.connect();

				const defaultRepo = mssql.getRepository(primaryTestTable);
				const customRepo = mssql.getRepository(primaryTestTable, CustomTestRepository);

				expect(defaultRepo).toBeInstanceOf(Repository);
				expect(customRepo).toBeInstanceOf(CustomTestRepository);
				expect(defaultRepo).not.toBe(customRepo);

				await mssql.disconnect();
			});
		});

		describe('Repository Collection Management', () => {
			test('should provide access to repositories collection', async () => {
				const { MSSQL } = await import('#/modules/database/mssql');
				const mssql = new MSSQL(databaseOptions);
				await mssql.connect();

				// Create a repository to populate the collection
				mssql.getRepository(primaryTestTable);

				const { repositories } = mssql;
				expect(repositories).toBeDefined();
				expect(typeof repositories).toBe('object');

				await mssql.disconnect();
			});

			test('should handle multiple repositories in collection', async () => {
				const { MSSQL } = await import('#/modules/database/mssql');
				const mssql = new MSSQL(databaseOptions);
				await mssql.connect();

				// Create multiple repositories
				const repo1 = mssql.getRepository(primaryTestTable);
				const repo2 = mssql.getRepository(secondaryTestTable);
				const repo3 = mssql.getRepository(complexTestTable);

				const { repositories } = mssql;
				expect(repositories).toBeDefined();

				// Verify repositories are accessible
				expect(repo1).toBeInstanceOf(Repository);
				expect(repo2).toBeInstanceOf(Repository);
				expect(repo3).toBeInstanceOf(Repository);

				await mssql.disconnect();
			});
		});
	});

	describe('Table Management', () => {
		describe('Table Instance Operations', () => {
			test('should return table instance for valid table name', async () => {
				const { MSSQL } = await import('#/modules/database/mssql');
				const mssql = new MSSQL(databaseOptions);
				await mssql.connect();

				const table = mssql.getTable(primaryTestTable);

				expect(table).toBeDefined();
				expect(typeof table).toBe('object');
				await mssql.disconnect();
			});

			test('should return same table instance for repeated calls', async () => {
				const { MSSQL } = await import('#/modules/database/mssql');
				const mssql = new MSSQL(databaseOptions);
				await mssql.connect();

				const table1 = mssql.getTable(primaryTestTable);
				const table2 = mssql.getTable(primaryTestTable);

				expect(table1).toBe(table2);
				await mssql.disconnect();
			});

			test('should throw error when accessing table without connection', async () => {
				const { MSSQL } = await import('#/modules/database/mssql');
				const mssql = new MSSQL(databaseOptions);

				expect(() => mssql.getTable(primaryTestTable)).toThrow(DATABASE_ERROR_KEYS.MSSQL_NOT_CONNECTED);
			});

			test('should throw error for non-existent table', async () => {
				const { MSSQL } = await import('#/modules/database/mssql');
				const mssql = new MSSQL(databaseOptions);
				await mssql.connect();

				expect(() => mssql.getTable('non_existent_table')).toThrow(DATABASE_ERROR_KEYS.MSSQL_TABLE_NOT_FOUND);
				await mssql.disconnect();
			});

			test('should handle table names with special characters', async () => {
				const { MSSQL } = await import('#/modules/database/mssql');
				const mssql = new MSSQL(databaseOptions);
				await mssql.connect();

				// Test with underscore (our test tables have underscores)
				const table = mssql.getTable(primaryTestTable);
				expect(table).toBeDefined();

				await mssql.disconnect();
			});
		});

		describe('Table Collection Management', () => {
			test('should provide access to tables collection', async () => {
				const { MSSQL } = await import('#/modules/database/mssql');
				const mssql = new MSSQL(databaseOptions);
				await mssql.connect();

				// Access a table to populate the collection
				mssql.getTable(primaryTestTable);

				const { tables } = mssql;
				expect(tables).toBeDefined();
				expect(typeof tables).toBe('object');

				await mssql.disconnect();
			});

			test('should handle multiple tables in collection', async () => {
				const { MSSQL } = await import('#/modules/database/mssql');
				const mssql = new MSSQL(databaseOptions);
				await mssql.connect();

				// Access multiple tables
				const table1 = mssql.getTable(primaryTestTable);
				const table2 = mssql.getTable(secondaryTestTable);
				const table3 = mssql.getTable(complexTestTable);

				const { tables } = mssql;
				expect(tables).toBeDefined();

				// Verify tables are accessible
				expect(table1).toBeDefined();
				expect(table2).toBeDefined();
				expect(table3).toBeDefined();

				await mssql.disconnect();
			});
		});
	});

	describe('Database Access and Getters', () => {
		describe('Database Instance Access', () => {
			test('should provide access to knex database instance when connected', async () => {
				const { MSSQL } = await import('#/modules/database/mssql');
				const mssql = new MSSQL(databaseOptions);
				await mssql.connect();

				const { db } = mssql;

				expect(db).toBeDefined();
				expect(typeof db).toBe('function'); // Knex instance is a function

				await mssql.disconnect();
			});

			test('should throw error when accessing database instance without connection', async () => {
				const { MSSQL } = await import('#/modules/database/mssql');
				const mssql = new MSSQL(databaseOptions);

				expect(() => mssql.db).toThrow(DATABASE_ERROR_KEYS.MSSQL_NOT_CONNECTED);
			});

			test('should allow database queries through knex instance', async () => {
				const { MSSQL } = await import('#/modules/database/mssql');
				const mssql = new MSSQL(databaseOptions);
				await mssql.connect();

				// Insert test data
				await mssql.db(primaryTestTable).insert({ name: 'db-test', email: 'db@test.com' });

				// Query through database instance
				const results = await mssql.db(primaryTestTable).where('name', 'db-test').select('*');

				expect(results).toHaveLength(1);
				expect(results[0].name).toBe('db-test');
				expect(results[0].email).toBe('db@test.com');

				await mssql.disconnect();
			});
		});

		describe('Property Getters', () => {
			test('should return correct database name', async () => {
				const { MSSQL } = await import('#/modules/database/mssql');
				const mssql = new MSSQL(databaseOptions);

				expect(mssql.databaseName).toBe(databaseOptions.databaseName);
			});

			test('should return correct connection status when not connected', async () => {
				const { MSSQL } = await import('#/modules/database/mssql');
				const mssql = new MSSQL(databaseOptions);

				expect(mssql.isConnected).toBe(false);
			});

			test('should return correct connection status when connected', async () => {
				const { MSSQL } = await import('#/modules/database/mssql');
				const mssql = new MSSQL(databaseOptions);

				await mssql.connect();
				expect(mssql.isConnected).toBe(true);

				await mssql.disconnect();
				expect(mssql.isConnected).toBe(false);
			});

			test('should provide access to tables collection through getter', async () => {
				const { MSSQL } = await import('#/modules/database/mssql');
				const mssql = new MSSQL(databaseOptions);
				await mssql.connect();

				const { tables } = mssql;
				expect(tables).toBeDefined();
				expect(typeof tables).toBe('object');

				await mssql.disconnect();
			});

			test('should provide access to repositories collection through getter', async () => {
				const { MSSQL } = await import('#/modules/database/mssql');
				const mssql = new MSSQL(databaseOptions);
				await mssql.connect();

				const { repositories } = mssql;
				expect(repositories).toBeDefined();
				expect(typeof repositories).toBe('object');

				await mssql.disconnect();
			});
		});
	});

	describe('Concurrent Operations and Stress Testing', () => {
		test('should handle concurrent connections from multiple instances', async () => {
			const { MSSQL } = await import('#/modules/database/mssql');
			const instances = Array.from({ length: 5 }, () => new MSSQL(databaseOptions));

			// Connect all instances concurrently
			await Promise.all(instances.map((instance) => instance.connect()));

			// Verify all connections are established
			instances.forEach((instance) => {
				expect(instance.isConnected).toBe(true);
			});

			// Disconnect all instances
			await Promise.all(instances.map((instance) => instance.disconnect()));
		});

		test('should handle concurrent database operations', async () => {
			const { MSSQL } = await import('#/modules/database/mssql');
			const mssql = new MSSQL(databaseOptions);
			await mssql.connect();

			// Perform multiple concurrent operations
			const operations = Array.from({ length: 10 }, (_, index) => mssql.db(primaryTestTable).insert({
				name: `concurrent-test-${index}`,
				email: `concurrent${index}@test.com`
			}));

			await Promise.all(operations);

			// Verify all records were inserted
			const results = await mssql.db(primaryTestTable)
				.where('name', 'like', 'concurrent-test-%')
				.select('*');

			expect(results).toHaveLength(10);

			await mssql.disconnect();
		}, {
			timeout: 5500
		});

		test('should handle rapid connect/disconnect cycles', async () => {
			const { MSSQL } = await import('#/modules/database/mssql');

			// Perform rapid connect/disconnect cycles with different instances
			const cycles = [];
			for (let i = 0; i < 3; ++i)
				cycles.push(async () => {
					const mssql = new MSSQL(databaseOptions);
					await mssql.connect();
					expect(mssql.isConnected).toBe(true);

					// Perform a simple operation to verify connection
					await mssql.db.raw('SELECT 1 as test');

					await mssql.disconnect();
					expect(mssql.isConnected).toBe(false);
				});


			// Execute cycles sequentially to avoid connection pool conflicts
			for (const cycle of cycles)
				await cycle();
		});

		test('should handle concurrent repository access', async () => {
			const { MSSQL } = await import('#/modules/database/mssql');
			const mssql = new MSSQL(databaseOptions);
			await mssql.connect();

			// Access repositories concurrently
			const repositoryPromises = [
				Promise.resolve(mssql.getRepository(primaryTestTable)),
				Promise.resolve(mssql.getRepository(secondaryTestTable)),
				Promise.resolve(mssql.getRepository(complexTestTable))
			];

			const repositories = await Promise.all(repositoryPromises);

			repositories.forEach((repo) => {
				expect(repo).toBeInstanceOf(Repository);
			});

			await mssql.disconnect();
		});
	});

	describe('Edge Cases and Error Handling', () => {
		test('should handle empty result sets gracefully', async () => {
			const { MSSQL } = await import('#/modules/database/mssql');
			const mssql = new MSSQL(databaseOptions);
			await mssql.connect();

			const results = await mssql.db(primaryTestTable)
				.where('name', 'non-existent-record')
				.select('*');

			expect(results).toEqual([]);

			await mssql.disconnect();
		});

		test('should handle complex data types in operations', async () => {
			const { MSSQL } = await import('#/modules/database/mssql');
			const mssql = new MSSQL(databaseOptions);
			await mssql.connect();

			const complexData = {
				largeText: 'This is a very long text that tests the text field capacity and handling.',
				price: 999.99,
				isActive: true,
				metadata: { key: 'value', nested: { array: [1, 2, 3] } }
			};

			const [insertedId] = await mssql.db(complexTestTable).insert(complexData).returning('id');
			const results = await mssql.db(complexTestTable).where('id', (insertedId as { id: number }).id).select('*');

			expect(results).toHaveLength(1);
			expect(results[0].largeText).toBe(complexData.largeText);
			expect(results[0].price).toBe(complexData.price);
			expect(results[0].isActive).toBe(complexData.isActive);

			await mssql.disconnect();
		});

		test('should handle null and undefined values properly', async () => {
			const { MSSQL } = await import('#/modules/database/mssql');
			const mssql = new MSSQL(databaseOptions);
			await mssql.connect();

			// Insert record with null values
			await mssql.db(primaryTestTable).insert({
				name: 'null-test',
				email: null
			});

			const results = await mssql.db(primaryTestTable)
				.where('name', 'null-test')
				.select('*');

			expect(results).toHaveLength(1);
			expect(results[0].name).toBe('null-test');
			expect(results[0].email).toBeNull();

			await mssql.disconnect();
		});

		test('should handle transactions rollback on error', async () => {
			const { MSSQL } = await import('#/modules/database/mssql');
			const mssql = new MSSQL(databaseOptions);
			await mssql.connect();

			try {
				await mssql.db.transaction(async (trx) => {
					// Insert valid record
					await trx(primaryTestTable).insert({ name: 'transaction-test', email: 'tx@test.com' });

					// Attempt invalid operation to trigger rollback
					await trx('non_existent_table').insert({ name: 'invalid' });
				});
			} catch {
				// Expected error - transaction should rollback
			}

			// Verify the first insert was rolled back
			const results = await mssql.db(primaryTestTable)
				.where('name', 'transaction-test')
				.select('*');

			expect(results).toHaveLength(0);

			await mssql.disconnect();
		});

		test('should handle special characters in data', async () => {
			const { MSSQL } = await import('#/modules/database/mssql');
			const mssql = new MSSQL(databaseOptions);
			await mssql.connect();

			const specialData = {
				name: 'O\'Reilly & Co. - \'Special\' Characters',
				email: 'special+chars@example.com'
			};

			await mssql.db(primaryTestTable).insert(specialData);
			const results = await mssql.db(primaryTestTable)
				.where('email', specialData.email)
				.select('*');

			expect(results).toHaveLength(1);
			expect(results[0].name).toBe(specialData.name);

			await mssql.disconnect();
		});
	});

	afterAll(async () => {
		// Clean up test tables
		await knexInstance.schema.dropTableIfExists(complexTestTable);
		await knexInstance.schema.dropTableIfExists(secondaryTestTable);
		await knexInstance.schema.dropTableIfExists(primaryTestTable);

		// Close database connection
		await knexInstance.destroy();
	});
});
