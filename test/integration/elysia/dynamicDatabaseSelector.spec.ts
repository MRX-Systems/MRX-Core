import { describe, expect, test } from 'bun:test';
import { Elysia } from 'elysia';

import type { MSSQLDatabaseOptions } from '#/database/types/mssqlDatabaseOption';
import { dynamicDatabaseSelectorPlugin } from '#/elysia/dynamicDatabaseSelector';
import { errorPlugin } from '#/elysia/error';

const baseDatabaseConfig: Omit<MSSQLDatabaseOptions, 'databaseName'> = {
    host: process.env.MSSQL_HOST ?? '',
    port: 1433,
    user: process.env.MSSQL_USER ?? '',
    password: process.env.MSSQL_PASSWORD ?? '',
    encrypt: true,
    poolMin: 2,
    poolMax: 10
};

const databaseName = 'auth_dev';

describe('Database Switcher Plugin', () => {
    describe('Macro', () => {
        test('should not add dynamicDB to context when hasDatabaseSwitcher is not provided', async () => {
            const app = new Elysia()
                .use(errorPlugin)
                .use(dynamicDatabaseSelectorPlugin({
                    baseDatabaseConfig
                }))
                .get('/', ({ dynamicDB }: { dynamicDB: unknown }) => ({ dynamicDB }));
            const res = await app.handle(new Request('http://localhost:3000/'));
            const data = await res.json();
            expect(data).toEqual({});
        });

        test('should not add dynamicDB to context when hasDatabaseSwitcher is false', async () => {
            const app = new Elysia()
                .use(errorPlugin)
                .use(dynamicDatabaseSelectorPlugin({
                    baseDatabaseConfig
                }))
                .get('/', ({ dynamicDB }: { dynamicDB: unknown }) => ({ dynamicDB }), { hasDynamicDatabaseSelector: false });
            const res = await app.handle(new Request('http://localhost:3000/'));
            const data = await res.json();
            expect(data).toEqual({});
        });

        test('should add dynamicDB to context when hasDatabaseSwitcher is true', async () => {
            const app = new Elysia()
                .use(errorPlugin)
                .use(dynamicDatabaseSelectorPlugin({
                    baseDatabaseConfig
                }))
                .get('/', ({ dynamicDB }: { dynamicDB: unknown }) => ({ dynamicDB }), { hasDynamicDatabaseSelector: true });
            const res = await app.handle(new Request('http://localhost:3000/', { headers: { 'database-using': databaseName } }));
            const data = await res.json();
            expect(data).toEqual({ dynamicDB: expect.any(Object) });
        });

        test('should add dynamicDB to context when hasDatabaseSwitcher is true and with specific headerKey', async () => {
            const app = new Elysia()
                .use(errorPlugin)
                .use(dynamicDatabaseSelectorPlugin({
                    baseDatabaseConfig,
                    headerKey: 'x-database-using'
                }))
                .get('/', ({ dynamicDB }: { dynamicDB: unknown }) => ({ dynamicDB }), { hasDynamicDatabaseSelector: true });
            const res = await app.handle(new Request('http://localhost:3000/', { headers: { 'x-database-using': databaseName } }));
            const data = await res.json();
            expect(data).toEqual({ dynamicDB: expect.any(Object) });
        });

        test('should throw error when databaseName key not found in headers', async () => {
            const app = new Elysia()
                .use(errorPlugin)
                .use(dynamicDatabaseSelectorPlugin({
                    baseDatabaseConfig
                }))
                .get('/', ({ dynamicDB }: { dynamicDB: unknown }) => ({ dynamicDB }), { hasDynamicDatabaseSelector: true });
            const res = await app.handle(new Request('http://localhost:3000/'));
            const data = await res.json();
            expect(data).toEqual({
                key: 'core.error.elysia.dynamic_database_key_not_found',
                message: 'Dynamic Database key not found in the request headers.'
            });
            expect(res.status).toBe(400);
        });
    });
});