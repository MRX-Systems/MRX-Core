import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, test } from 'bun:test';
import { randomBytes } from 'crypto';
import { Elysia } from 'elysia';

import { DATABASE_ERROR_KEYS } from '#/modules/database/enums/database-error-keys';
import { MSSQL } from '#/modules/database/mssql';
import type { MSSQLDatabaseOptions } from '#/modules/database/types/mssql-database-option';
import { dbResolver } from '#/modules/elysia/db-resolver/db-resolver';
import { DB_RESOLVER_ERROR_KEYS } from '#/modules/elysia/db-resolver/enums/db-resolver-error-keys';
import { SingletonManager } from '#/modules/singleton-manager/singleton-manager';

const databaseConfig: Omit<MSSQLDatabaseOptions, 'databaseName'> = {
	host: process.env.MSSQL_HOST ?? '',
	port: 1433,
	user: process.env.MSSQL_USER ?? '',
	password: process.env.MSSQL_PASSWORD ?? '',
	encrypt: true,
	isEventEnabled: false
};

const testDatabaseName = process.env.MSSQL_DATABASE ?? '';
const prefix = 'test:';

describe('dbResolver', () => {
	describe('injectStaticDB macro', () => {
		beforeAll(async () => {
			// Register a static database for testing
			SingletonManager.register(`${prefix}${testDatabaseName}`, new MSSQL({
				...databaseConfig,
				databaseName: testDatabaseName
			}));
			await SingletonManager.get<MSSQL>(`${prefix}${testDatabaseName}`).connect();
		});

		test('should inject staticDB when using injectStaticDB macro', async () => {
			const app = new Elysia()
				.use(dbResolver(prefix))
				.get('/test', ({ staticDB }) => ({
					hasStaticDB: staticDB instanceof MSSQL,
					dbConnected: staticDB.isConnected,
					dbName: staticDB.databaseName
				}), {
					injectStaticDB: testDatabaseName
				});

			const response = await app.handle(new Request('http://localhost/test'));
			const result = await response.json() as {
				hasStaticDB: boolean;
				dbConnected: boolean;
				dbName: string;
			};

			expect(response.status).toBe(200);
			expect(result.hasStaticDB).toBe(true);
			expect(result.dbConnected).toBe(true);
			expect(result.dbName).toBe(testDatabaseName);
		});

		test('should throw error when static database is not registered', async () => {
			const app = new Elysia()
				.use(dbResolver(prefix))
				.get('/test', ({ staticDB }) => ({
					dbName: staticDB.databaseName
				}), {
					injectStaticDB: 'non_existent_db'
				});

			const response = await app.handle(new Request('http://localhost/test'));

			expect(response.status).toBe(500);
			const responseText = await response.text();
			expect(responseText).toBeDefined();
			// expect(responseText).toHaveProperty('message');
			expect(responseText).toEqual(DB_RESOLVER_ERROR_KEYS.DB_RESOLVER_STATIC_DB_NOT_FOUND);
		});

		afterAll(async () => {
			await SingletonManager.get<MSSQL>(`${prefix}${testDatabaseName}`).disconnect();
			SingletonManager.unregister(`${prefix}${testDatabaseName}`);
		});
	});

	describe('injectDynamicDB macro', () => {
		beforeEach(async () => {
			// Clean up any registered databases before each test
			const dbName = `${prefix}${testDatabaseName}`;
			if (SingletonManager.has(dbName)) {
				await SingletonManager.get<MSSQL>(dbName).disconnect();
				SingletonManager.unregister(dbName);
			}
		});

		test('should inject dynamicDB when using injectDynamicDB macro', async () => {
			const app = new Elysia()
				.use(dbResolver(prefix))
				.get('/test', ({ dynamicDB }) => ({
					hasDynamicDB: dynamicDB instanceof MSSQL,
					dbConnected: dynamicDB.isConnected,
					dbName: dynamicDB.databaseName
				}), {
					injectDynamicDB: databaseConfig
				});

			const response = await app.handle(
				new Request('http://localhost/test', {
					headers: { 'database-using': testDatabaseName }
				})
			);
			const result = await response.json() as {
				hasDynamicDB: boolean;
				dbConnected: boolean;
				dbName: string;
			};

			expect(response.status).toBe(200);
			expect(result.hasDynamicDB).toBe(true);
			expect(result.dbConnected).toBe(true);
			expect(result.dbName).toBe(testDatabaseName);
		});

		test('should register new database when not already registered', async () => {
			// Ensure this specific registration is not already there
			expect(SingletonManager.has(`${prefix}${testDatabaseName}`)).toBe(false);

			const app = new Elysia()
				.use(dbResolver(prefix))
				.get('/test', ({ dynamicDB }) => ({
					dbName: dynamicDB.databaseName,
					dbConnected: dynamicDB.isConnected
				}), {
					injectDynamicDB: databaseConfig
				});

			const response = await app.handle(
				new Request('http://localhost/test', {
					headers: { 'database-using': testDatabaseName }
				})
			);
			const result = await response.json() as { dbName: string; dbConnected: boolean };

			expect(response.status).toBe(200);
			expect(result.dbName).toBe(testDatabaseName);
			expect(result.dbConnected).toBe(true);
			expect(SingletonManager.has(`${prefix}${testDatabaseName}`)).toBe(true);
		});

		test('should reuse existing database connection when already registered', async () => {
			// Pre-register the database
			SingletonManager.register(`${prefix}${testDatabaseName}`, new MSSQL({
				...databaseConfig,
				databaseName: testDatabaseName
			}));
			await SingletonManager.get<MSSQL>(`${prefix}${testDatabaseName}`).connect();

			const app = new Elysia()
				.use(dbResolver(prefix))
				.get('/test', ({ dynamicDB }) => ({
					dbName: dynamicDB.databaseName,
					dbConnected: dynamicDB.isConnected
				}), {
					injectDynamicDB: databaseConfig
				});

			const response = await app.handle(
				new Request('http://localhost/test', {
					headers: { 'database-using': testDatabaseName }
				})
			);
			const result = await response.json() as { dbName: string; dbConnected: boolean };

			expect(response.status).toBe(200);
			expect(result.dbName).toBe(testDatabaseName);
			expect(result.dbConnected).toBe(true);
		});

		test('should throw error when database connection fails', async () => {
			const invalidDbName = `invalid_db_${randomBytes(4).toString('hex')}`;

			const app = new Elysia()
				.use(dbResolver(prefix))
				.get('/test', ({ dynamicDB }) => ({
					dbName: dynamicDB.databaseName,
					dbConnected: dynamicDB.isConnected
				}), {
					injectDynamicDB: databaseConfig
				});

			const response = await app.handle(
				new Request('http://localhost/test', {
					headers: { 'database-using': invalidDbName }
				})
			);

			expect(response.status).toBe(500);
			const responseText = await response.text();
			expect(responseText).toEqual(DATABASE_ERROR_KEYS.MSSQL_CONNECTION_ERROR);
		});

		test('should throw error when required header is missing', async () => {
			const app = new Elysia()
				.use(dbResolver(prefix))
				.get('/test', ({ dynamicDB }) => ({ connected: dynamicDB.isConnected }), {
					injectDynamicDB: databaseConfig
				});

			const response = await app.handle(new Request('http://localhost/test'));
			expect(response.status).toBe(422);
		});

		afterEach(async () => {
			// Clean up any registered databases after each test
			const dbName = `${prefix}${testDatabaseName}`;
			if (SingletonManager.has(dbName)) {
				const db = SingletonManager.get<MSSQL>(dbName);
				if (db.isConnected)
					await db.disconnect();
				SingletonManager.unregister(dbName);
			}
		});
	});

	describe('combined usage (both static and dynamic)', () => {
		beforeAll(async () => {
			// Register a static database for testing
			SingletonManager.register(`${prefix}static_${testDatabaseName}`, new MSSQL({
				...databaseConfig,
				databaseName: testDatabaseName
			}));
			await SingletonManager.get<MSSQL>(`${prefix}static_${testDatabaseName}`).connect();
		});

		beforeEach(async () => {
			// Clean up dynamic database before each test
			const dynamicDbName = `${prefix}${testDatabaseName}`;
			if (SingletonManager.has(dynamicDbName)) {
				await SingletonManager.get<MSSQL>(dynamicDbName).disconnect();
				SingletonManager.unregister(dynamicDbName);
			}
		});

		test('should inject both staticDB and dynamicDB when using both macros', async () => {
			const app = new Elysia()
				.use(dbResolver(prefix))
				.get('/test', ({ staticDB, dynamicDB }) => ({
					hasStaticDB: staticDB instanceof MSSQL,
					hasDynamicDB: dynamicDB instanceof MSSQL,
					staticConnected: staticDB.isConnected,
					dynamicConnected: dynamicDB.isConnected,
					staticDbName: staticDB.databaseName,
					dynamicDbName: dynamicDB.databaseName
				}), {
					injectStaticDB: `static_${testDatabaseName}`,
					injectDynamicDB: databaseConfig
				});

			const response = await app.handle(
				new Request('http://localhost/test', {
					headers: { 'database-using': testDatabaseName }
				})
			);

			// Check if response is OK first
			if (!response.ok) {
				const errorText = await response.text();
				throw new Error(`Request failed with status ${response.status}: ${errorText}`);
			}

			const result = await response.json() as {
				hasStaticDB: boolean;
				hasDynamicDB: boolean;
				staticConnected: boolean;
				dynamicConnected: boolean;
				staticDbName: string;
				dynamicDbName: string;
			};

			expect(response.status).toBe(200);
			expect(result.hasStaticDB).toBe(true);
			expect(result.hasDynamicDB).toBe(true);
			expect(result.staticConnected).toBe(true);
			expect(result.dynamicConnected).toBe(true);
			expect(result.staticDbName).toBe(testDatabaseName);
			expect(result.dynamicDbName).toBe(testDatabaseName);
		});

		afterEach(async () => {
			// Clean up dynamic database after each test
			const dynamicDbName = `${prefix}${testDatabaseName}`;
			if (SingletonManager.has(dynamicDbName)) {
				const db = SingletonManager.get<MSSQL>(dynamicDbName);
				if (db.isConnected)
					await db.disconnect();
				SingletonManager.unregister(dynamicDbName);
			}
		});

		afterAll(async () => {
			await SingletonManager.get<MSSQL>(`${prefix}static_${testDatabaseName}`).disconnect();
			SingletonManager.unregister(`${prefix}static_${testDatabaseName}`);
		});
	});

	describe('prefix functionality', () => {
		test('should work without prefix', async () => {
			// Register database without prefix
			SingletonManager.register(testDatabaseName, new MSSQL({
				...databaseConfig,
				databaseName: testDatabaseName
			}));
			await SingletonManager.get<MSSQL>(testDatabaseName).connect();

			const app = new Elysia()
				.use(dbResolver()) // No prefix
				.get('/test', ({ staticDB }) => ({
					dbName: staticDB.databaseName
				}), {
					injectStaticDB: testDatabaseName
				});

			const response = await app.handle(new Request('http://localhost/test'));
			const result = await response.json() as { dbName: string };

			expect(response.status).toBe(200);
			expect(result.dbName).toBe(testDatabaseName);

			// Cleanup
			await SingletonManager.get<MSSQL>(testDatabaseName).disconnect();
			SingletonManager.unregister(testDatabaseName);
		});

		test('should work with custom prefix', async () => {
			const customPrefix = 'custom:';

			// Register database with custom prefix
			SingletonManager.register(`${customPrefix}${testDatabaseName}`, new MSSQL({
				...databaseConfig,
				databaseName: testDatabaseName
			}));
			await SingletonManager.get<MSSQL>(`${customPrefix}${testDatabaseName}`).connect();

			const app = new Elysia()
				.use(dbResolver(customPrefix))
				.get('/test', ({ staticDB }) => ({
					dbName: staticDB.databaseName
				}), {
					injectStaticDB: testDatabaseName
				});

			const response = await app.handle(new Request('http://localhost/test'));
			const result = await response.json() as { dbName: string };

			expect(response.status).toBe(200);
			expect(result.dbName).toBe(testDatabaseName);

			// Cleanup
			await SingletonManager.get<MSSQL>(`${customPrefix}${testDatabaseName}`).disconnect();
			SingletonManager.unregister(`${customPrefix}${testDatabaseName}`);
		});
	});
});