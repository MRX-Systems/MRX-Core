import type { Static, TObject } from '@sinclair/typebox';
import type {
    Context,
    DefinitionBase,
    Elysia,
    EphemeralType,
    MetadataBase,
    RouteBase,
    RouteSchema,
    SingletonBase
} from 'elysia';

import type { CRUDRoutes } from './crudRoutes';
import type { DynamicDatabaseSelectorPluginOptions } from '#/modules/elysia/dynamicDatabaseSelectorPlugin/types/dynamicDatabaseSelectorPluginOptions';

/**
 * Options for the CRUD plugin
 *
 * @template TInferedObject - The type of the object to be used in the CRUD operations extending {@link TObject}
 * @template KEnumPermission - The type of the enum for permissions extending {@link String}
 */
export interface CrudOptions<
    TInferedObject extends TObject,
    KEnumPermission extends string
> {
    /**
     * Optional API path prefix for all generated routes.
     *
     * When specified, all routes will be prefixed with this path.
     * For example, if prefix is '/api/users', the find route will be '/api/users/count'.
     *
     * @defaultValue ''
     */
    prefix?: string;
    /**
     * The name of the table this CRUD interface will manage.
     *
     * This should match the database table name and will be used to identify
     * the repository and models in the generated API.
     */
    tableName: string;
    /**
     * Database configuration for the CRUD operations.
     *
     * This can either be a string (database name) for static connections or a
     * DynamicDatabaseSelectorPluginOptions object for dynamic database selection.
     *
     * @example
     * Static database connection
     * ```ts
     * database: 'my_database'
     * ```
     * @example
     * Dynamic database selection
     * ```ts
     * database: {
     *   baseDatabaseConfig: {
     *     host: 'localhost',
     *     port: 1433,
     *     user: 'sa',
     *     password: 'Password123'
     *   },
     *   headerKey: 'x-tenant-db'
     * }
     * ```
     *
     * @see {@link DynamicDatabaseSelectorPluginOptions}
     *
     */
    database: string | DynamicDatabaseSelectorPluginOptions;
    /**
     * The schema to be used for the CRUD operations {@link TInferedObject}
     * [TODO] - improve this description when working on the AND-188 ticket
     */
    baseSchema: TInferedObject;
    /**
     * Array of property names from the schema that should be required in insert operations.
     *
     * When specified, these properties will be required in the body of insert requests,
     * while other properties will remain optional.
     *
     * @example Makes name and email required for insertion, while other fields remain optional
     * ```ts
     * insertPropertiesSchemaRequired: ['name', 'email']
     * ```
     */
    insertPropertiesSchemaRequired?: (keyof Static<TInferedObject>)[];
    /**
     * Array of route types to include in the generated API.
     *
     * @see {@link CRUDRoutes}
     *
     * @example
     * Only generate read-only routes
     * ```ts
     * includedRoutes: ['find', 'findOne', 'count']
     * ```
     */
    includedRoutes?: CRUDRoutes[];
    /**
     * Array of route types to exclude from the generated API.
     *
     * @see {@link CRUDRoutes}
     *
     * @example
     * Generate all routes except delete operations
     * ```ts
     * excludedRoutes?: ['delete', 'deleteOne']
     * ```
     */
    excludedRoutes?: CRUDRoutes[];
    /** This allows configuring permissions for each CRUD route. */
    permissionConfig: {
        /**
        * A bit tricky: this should be an instance of {@link Elysia} that must have two macros
        * called `needsOnePermission` and `needsMultiplePermissions`, each taking an array of permissions {@link KEnumPermission}
        * as a parameter and throwing a {@link CoreError} if the user does not have the required permission.
        */
        permissionsPlugin: Elysia<
            '',
            SingletonBase,
            DefinitionBase,
            MetadataBase & {
                schema: RouteSchema;
                macro: Partial<{
                    readonly needsOnePermission: KEnumPermission[];
                    readonly needsMultiplePermissions: KEnumPermission[];
                }>;
                macroFn: {
                    readonly needsOnePermission: (permissions: KEnumPermission[]) => {
                        beforeHandle: (ctx: Context) => Promise<void>;
                    };
                    readonly needsMultiplePermissions: (permissions: KEnumPermission[]) => {
                        beforeHandle: (ctx: Context) => Promise<void>
                    };
                }
            },
            RouteBase,
            EphemeralType,
            EphemeralType
        >,
        /**
         * The permissions to be used for the CRUD operations
         * @see {@link CRUDRoutes}
         * @see {@link KEnumPermission}
         */
        operationsPermissions: Partial<Record<CRUDRoutes, KEnumPermission[]>>;
    }
}