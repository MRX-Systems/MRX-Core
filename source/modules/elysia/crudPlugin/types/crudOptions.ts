import type { TObject } from '@sinclair/typebox';

import type { CrudOperations } from './crudOpterations';
import type { DbSelectorOptions } from '../../dbSelectorPlugin/types';

/**
 * Options for the CRUD plugin
 *
 * @template TInferedObject - The type of the object to be used in the CRUD operations extending {@link TObject}
 * @template KEnumPermission - The type of the enum for permissions extending {@link String}
 */
export interface CrudOptions<
	TTableName extends string,
	TInferedObject extends TObject,
	TDatabase extends string | DbSelectorOptions,
	TOperations extends CrudOperations<TInferedObject>
> {
	/**
     * The name of the table this CRUD interface will manage.
     *
     * This should match the database table name and will be used to identify
     * the repository and models in the generated API.
     */
	readonly tableName: TTableName;
	/**
     * The schema to be used for the CRUD operations
     */
	readonly schema: TInferedObject;

	readonly database: TDatabase;
	readonly operations?: TOperations;

}