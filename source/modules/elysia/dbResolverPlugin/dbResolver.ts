import type { TObject, TString } from '@sinclair/typebox';
import { Elysia, t, type DefinitionBase, type SingletonBase } from 'elysia';

import { CoreError } from '#/error/coreError';
import { MSSQL } from '#/modules/database/mssql';
import { SingletonManager } from '#/modules/singletonManager/singletonManager';
import { errorKeys } from './enums/errorKeys';
import type { DynamicDbOptions } from './types/dynamicDbOptions';

/**
 * Internal function to resolve database connection based on configuration type (static or dynamic)
 *
 * @param database - Database configuration (string for static, DbSelectorOptions for dynamic)
 * @param headers - Request headers containing database selection information
 *
 * @throws ({@link CoreError}): When database header key is not found in dynamic mode
 *
 * @returns Database instance wrapped in appropriate record type
 */
const _resolveDatabaseConnection = async <
	const TDatabase extends DynamicDbOptions<THeaderKeyName> | string,
	const THeaderKeyName extends string = 'database-using'
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
	const databaseName = headers[database.headerKeyName || 'database-using'];

	if (!databaseName)
		throw new CoreError({
			key: errorKeys.dbResolverHeaderKeyNotFound,
			message: 'Database Selector key not found in the request headers.',
			httpStatusCode: 400
		});

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

export const dbResolverPlugin = <
	const TDatabase extends DynamicDbOptions<THeaderKeyName> | string,
	const THeaderKeyName extends string = 'database-using'
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
				ResolveDbHeader: TObject<Record<THeaderKeyName, TString>>;
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
		> => _resolveDatabaseConnection<TDatabase, THeaderKeyName>(database, headers));

	if (typeof database === 'object' && 'headerKeyName' in database) {
		const dynamicConf = database;
		app.model({
			ResolveDbHeader: t.Object({
				[dynamicConf.headerKeyName ?? 'database-using']: t.String({
					description: 'The name of the database to be used for the request'
				})
			})
		});
	}
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
					ResolveDbHeader: TObject<Record<THeaderKeyName, TString>>;
				};
				error: {};
			}
	>;
};
