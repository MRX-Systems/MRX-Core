import type { TObject } from '@sinclair/typebox/type';

import type { CrudOperationCount } from './crud-operation-count';
import type { CrudOperationDelete } from './crud-operation-delete';
import type { CrudOperationDeleteOne } from './crud-operation-delete-one';
import type { CrudOperationFind } from './crud-operation-find';
import type { CrudOperationFindOne } from './crud-operation-find-one';
import type { CrudOperationInsert } from './crud-operation-insert';
import type { CrudOperationUpdate } from './crud-operation-update';
import type { CrudOperationUpdateOne } from './crud-operation-update-one';

export interface CrudOperations<
	THeaderSchema extends TObject,
	TSourceSchema extends TObject,
	TSourceFindSchema extends TObject = TSourceSchema,
	TSourceCountSchema extends TObject = TSourceSchema,
	TSourceInsertSchema extends TObject = TSourceSchema,
	TSourceUpdateSchema extends TObject = TSourceSchema,
	TSourceDeleteSchema extends TObject = TSourceSchema,
	TSourceResponseSchema extends TObject = TSourceSchema
> {
	readonly find?: CrudOperationFind<
		THeaderSchema,
		TSourceFindSchema,
		TSourceResponseSchema
	> | true;
	readonly findOne?: CrudOperationFindOne<
		THeaderSchema,
		TSourceResponseSchema
	> | true;
	readonly insert?: CrudOperationInsert<
		THeaderSchema,
		TSourceInsertSchema,
		TSourceResponseSchema
	> | true;
	readonly update?: CrudOperationUpdate<
		THeaderSchema,
		TSourceUpdateSchema,
		TSourceResponseSchema
	> | true;
	readonly updateOne?: CrudOperationUpdateOne<
		THeaderSchema,
		TSourceUpdateSchema,
		TSourceResponseSchema
	> | true;
	readonly delete?: CrudOperationDelete<
		THeaderSchema,
		TSourceDeleteSchema,
		TSourceResponseSchema
	> | true;
	readonly deleteOne?: CrudOperationDeleteOne<
		THeaderSchema,
		TSourceResponseSchema
	> | true;
	readonly count?: CrudOperationCount<
		THeaderSchema,
		TSourceCountSchema
	> | true;
}