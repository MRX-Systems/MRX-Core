import { afterAll, beforeAll, beforeEach, describe, expect, test } from 'bun:test';
import { randomBytes } from 'crypto';
import { Elysia } from 'elysia';

import { MSSQL } from '#/modules/database/mssql';
import { dbResolver } from '#/modules/elysia/dbResolver/dbResolver';
import { error } from '#/modules/elysia/error/error';
import { SingletonManager } from '#/modules/singletonManager/singletonManager';

const options = {
	databaseName: process.env.MSSQL_DATABASE ?? '',
	host: process.env.MSSQL_HOST ?? '',
	port: 1433,
	user: process.env.MSSQL_USER ?? '',
	password: process.env.MSSQL_PASSWORD ?? ''
};

describe('dbResolver', () => {
	describe('dbResolver with static database', () => {
		beforeAll(async () => {
			SingletonManager.register(`database:${options.databaseName}`, MSSQL, options);
			await SingletonManager.get<MSSQL>(`database:${options.databaseName}`).connect();
		});
		test('should resolve static database connection when database name is provided', async () => {
			const app = new Elysia()
				.use(dbResolver(options.databaseName))
				.get('/test', ({ staticDB }) => ({
					hasStaticDB: staticDB instanceof MSSQL,
					dbConnected: staticDB.isConnected
				}));

			const response = await app.handle(new Request('http://localhost/test'));
			const result = await response.json() as { hasStaticDB: boolean; dbConnected: boolean };

			expect(response.status).toBe(200);
			expect(result.hasStaticDB).toBe(true);
			expect(result.dbConnected).toBe(true);
		});

		test('should not inject dynamicDB property in static mode', async () => {
			const app = new Elysia()
				.use(dbResolver(options.databaseName))
				.get('/test', (context) => ({
					hasStaticDB: 'staticDB' in context,
					hasDynamicDB: 'dynamicDB' in context
				}));

			const response = await app.handle(new Request('http://localhost/test'));
			const result = await response.json() as { hasStaticDB: boolean; hasDynamicDB: boolean };

			expect(response.status).toBe(200);
			expect(result.hasStaticDB).toBe(true);
			expect(result.hasDynamicDB).toBe(false);
		});
		afterAll(async () => {
			await SingletonManager.get<MSSQL>(`database:${options.databaseName}`).disconnect();
			SingletonManager.unregister(`database:${options.databaseName}`);
		});
	});

	describe('dbResolver with dynamic database', () => {
		// Using the default header key to avoid type conflicts
		const dynamicDbConfig = {
			config: {
				host: options.host,
				port: options.port,
				user: options.user,
				password: options.password
			}
		};

		beforeEach(() => {
			// Clean up any registered databases after each test
			const dbName = `database:${options.databaseName}`;
			if (SingletonManager.has(dbName))
				SingletonManager.unregister(dbName);
		});

		test('should resolve dynamic database connection when header is provided', async () => {
			const app = new Elysia()
				.use(dbResolver(dynamicDbConfig))
				.get('/test', ({ dynamicDB }) => ({
					hasDynamicDB: dynamicDB instanceof MSSQL,
					dbConnected: dynamicDB.isConnected
				}));

			const response = await app.handle(
				new Request('http://localhost/test', {
					headers: { 'database-using': options.databaseName }
				})
			);
			const result = await response.json() as { hasDynamicDB: boolean; dbConnected: boolean };

			expect(response.status).toBe(200);
			expect(result.hasDynamicDB).toBe(true);
			expect(result.dbConnected).toBe(true);
		});

		test('should not inject staticDB property in dynamic mode', async () => {
			const app = new Elysia()
				.use(dbResolver(dynamicDbConfig))
				.get('/test', (context) => ({
					hasStaticDB: 'staticDB' in context,
					hasDynamicDB: 'dynamicDB' in context
				}));

			const response = await app.handle(
				new Request('http://localhost/test', {
					headers: { 'database-using': options.databaseName }
				})
			);
			const result = await response.json() as { hasStaticDB: boolean; hasDynamicDB: boolean };

			expect(response.status).toBe(200);
			expect(result.hasStaticDB).toBe(false);
			expect(result.hasDynamicDB).toBe(true);
		});

		test('should register new database when not already registered', async () => {
			// Ensure this specific registration is not already there
			expect(SingletonManager.has(`database:${options.databaseName}`)).toBe(false);

			const app = new Elysia()
				.use(error)
				.use(dbResolver(dynamicDbConfig))
				.get('/test', ({ dynamicDB }) => ({
					dbName: dynamicDB.databaseName,
					dbConnected: dynamicDB.isConnected
				}));

			const response = await app.handle(
				new Request('http://localhost/test', {
					headers: { 'database-using': options.databaseName }
				})
			);
			const result = await response.json() as { dbName: string; dbConnected: boolean };

			expect(response.status).toBe(200);
			expect(result.dbName).toBe(options.databaseName);
			expect(result.dbConnected).toBe(true);
			expect(SingletonManager.has(`database:${options.databaseName}`)).toBe(true);
		});

		test('should throw error when database connection fails', async () => {
			const invalidDbName = `invalid_db_${randomBytes(4).toString('hex')}`;

			const app = new Elysia()
				.use(error)
				.use(dbResolver(dynamicDbConfig))
				.get('/test', ({ dynamicDB }) => ({
					dbName: dynamicDB.databaseName,
					dbConnected: dynamicDB.isConnected
				}));

			const response = await app.handle(
				new Request('http://localhost/test', {
					headers: { 'database-using': invalidDbName }
				})
			);

			expect(response.status).toBe(500);
			const responseText = await response.text();
			expect(responseText).toContain('mssql.error.database.connection_error');
		});

		test('should throw error when required header is missing', async () => {
			const app = new Elysia()
				.use(error)
				.use(dbResolver(dynamicDbConfig))
				.get('/test', ({ dynamicDB }) => ({ connected: dynamicDB.isConnected }), {
					headers: 'ResolveDbHeader'
				});

			const response = await app.handle(new Request('http://localhost/test'));
			expect(response.status).toBe(400);
		});

		test('should use default header key name when not specified', async () => {
			const app = new Elysia()
				.use(error)
				.use(dbResolver(dynamicDbConfig))
				.get('/test', ({ dynamicDB }) => ({
					dbConnected: dynamicDB.isConnected
				}));

			const response = await app.handle(
				new Request('http://localhost/test', {
					headers: { 'database-using': options.databaseName }
				})
			);
			const result = await response.json() as { dbConnected: boolean };

			expect(response.status).toBe(200);
			expect(result.dbConnected).toBe(true);
		});

		test('should fail when wrong header key is used', async () => {
			const app = new Elysia()
				.use(error)
				.use(dbResolver(dynamicDbConfig))
				.get('/test', ({ dynamicDB }) => ({ connected: dynamicDB.isConnected }));

			// Using wrong header key
			const response = await app.handle(
				new Request('http://localhost/test', {
					headers: { 'wrong-header-key': options.databaseName }
				})
			);
			expect(response.status).toBe(400); // BAD_REQUEST
		});
	});
});