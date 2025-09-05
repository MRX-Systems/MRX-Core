import type { TObject, TString } from '@sinclair/typebox';
import { Elysia, t, type DefinitionBase, type SingletonBase } from 'elysia';

import { HttpError } from '#/errors/http-error';
import { MSSQL } from '#/modules/database/mssql';
import { SingletonManager } from '#/modules/singleton-manager/singleton-manager';
import { DB_RESOLVER_ERROR_KEYS } from './enums/db-resolver-error-keys';
import type { DynamicDbOptions } from './types/dynamic-db-options';

/**
 * Internal function to resolve database connection based on configuration type (static or dynamic)
 *
 * @param database - Database configuration (string for static, DbSelectorOptions for dynamic)
 * @param headers - Request headers containing dynamic database selection key
 *
 * @throws ({@link HttpError}): When database header key is not found in dynamic mode
 *
 * @returns Database instance wrapped in appropriate record type
 */
const _resolveDatabaseConnection = async <
	const TDatabase extends DynamicDbOptions | string
>(
	database: TDatabase,
	headers: Record<string, string | undefined>
): Promise<Record<TDatabase extends string ? 'staticDB' : 'dynamicDB', MSSQL>> => {
	// Static database case - database name is provided as string
	if (typeof database === 'string')
		return {
			staticDB: SingletonManager.get<MSSQL>(`database:${database}`)
		} as Record<TDatabase extends string ? 'staticDB' : 'dynamicDB', MSSQL>;

	// Dynamic database case - database selected via header
	const databaseName = headers['database-using'];

	if (!databaseName)
		throw new HttpError(DB_RESOLVER_ERROR_KEYS.DB_RESOLVER_HEADER_KEY_NOT_FOUND, 'BAD_REQUEST');

	// Register and connect database if not already available
	if (!SingletonManager.has(`database:${databaseName}`)) {
		SingletonManager.register(`database:${databaseName}`, MSSQL, {
			...database.config,
			databaseName
		});
		await SingletonManager.get<MSSQL>(`database:${databaseName}`).connect();
	}

	return {
		dynamicDB: SingletonManager.get<MSSQL>(`database:${databaseName}`)
	} as Record<TDatabase extends string ? 'staticDB' : 'dynamicDB', MSSQL>;
};

export const dbResolver = <
	const TDatabase extends DynamicDbOptions | string
>(database: TDatabase): Elysia<
	'dbResolverPlugin',
	{
		decorator: SingletonBase['decorator'];
		store: SingletonBase['store'];
		derive: SingletonBase['derive'];
		resolve: Record<
			TDatabase extends string ? 'staticDB' : 'dynamicDB',
			MSSQL
		>
	},
	TDatabase extends string
		? DefinitionBase
		: {
			typebox: {
				dbResolverHeader: TObject<{
					'database-using': TString;
				}>;
			};
			error: {};
		}
> => {
	const app = new Elysia<'dbResolverPlugin'>({
		name: 'dbResolverPlugin',
		seed: database
	})
		.resolve({ as: 'global' }, async ({ headers }): Promise<
			Record<
				TDatabase extends string
					? 'staticDB'
					: 'dynamicDB',
				MSSQL
			>
		> => _resolveDatabaseConnection<TDatabase>(database, headers));

	if (typeof database === 'object')
		app.model({
			dbResolverHeader: t.Object({
				'database-using': t.String({
					description: 'The name of the database to be used for the request'
				})
			})
		});

	return app as unknown as Elysia<
		'dbResolverPlugin',
		{
			decorator: SingletonBase['decorator'];
			store: SingletonBase['store'];
			derive: SingletonBase['derive'];
			resolve: Record<
				TDatabase extends string ? 'staticDB' : 'dynamicDB',
				MSSQL
			>
		},
		TDatabase extends string
			? DefinitionBase
			: {
				typebox: {
					dbResolverHeader: TObject<{
						'database-using': TString;
					}>;
				};
				error: {};
			}
	>;
};