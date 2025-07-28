import type { TObject, TSchema } from '@sinclair/typebox/type';
import { Elysia, type SingletonBase } from 'elysia';

import type { CrudModelsType } from './types/crudModelsType';
import type { CrudSchemaOperations } from './types/crudSchemaOperations';
import type { CrudSchemaOptions } from './types/crudSchemaOptions';
import { createCountResponse200Schema } from './utils/createCountResponse200Schema';
import { createCountSchema } from './utils/createCountSchema';
import { createDeleteSchema } from './utils/createDeleteSchema';
import { createFindSchema } from './utils/createFindSchema';
import { createIdParamSchema } from './utils/createIdParamSchema';
import { createInsertSchema } from './utils/createInsertSchema';
import { createResponse200Schema } from './utils/createResponse200Schema';
import { createUpdateOneSchema } from './utils/createUpdateOneSchema';
import { createUpdateSchema } from './utils/createUpdateSchema';

export const crudSchemaPlugin = <
	const TSourceSchemaName extends string,
	const TSourceSchema extends TObject,
	const TSourceInsertSchema extends TObject = TSourceSchema,
	const TSourceFindSchema extends TObject = TSourceSchema,
	const TSourceCountSchema extends TObject = TSourceSchema,
	const TSourceUpdateSchema extends TObject = TSourceSchema,
	const TSourceDeleteSchema extends TObject = TSourceSchema,
	const TSourceResponseSchema extends TObject = TSourceSchema,
	const TOperations extends CrudSchemaOperations = {
		count: true;
		find: true;
		findOne: true;
		insert: true;
		update: true;
		updateOne: true;
		delete: true;
		deleteOne: true;
	}
> (
	{
		sourceSchemaName,
		sourceSchema,
		sourceInsertSchema = sourceSchema as unknown as TSourceInsertSchema,
		sourceFindSchema = sourceSchema as unknown as TSourceFindSchema,
		sourceCountSchema = sourceSchema as unknown as TSourceCountSchema,
		sourceUpdateSchema = sourceSchema as unknown as TSourceUpdateSchema,
		sourceDeleteSchema = sourceSchema as unknown as TSourceDeleteSchema,
		sourceResponseSchema = sourceSchema as unknown as TSourceResponseSchema,
		operations = {
			count: true,
			find: true,
			findOne: true,
			insert: true,
			update: true,
			updateOne: true,
			delete: true,
			deleteOne: true
		} as TOperations
	}: CrudSchemaOptions<
		TSourceSchemaName,
		TSourceSchema,
		TSourceInsertSchema,
		TSourceFindSchema,
		TSourceCountSchema,
		TSourceUpdateSchema,
		TSourceDeleteSchema,
		TSourceResponseSchema,
		TOperations
	>
): Elysia<
	TSourceSchemaName,
	SingletonBase,
	{
		typebox: CrudModelsType<
			TSourceSchemaName,
			TOperations,
			TSourceInsertSchema,
			TSourceFindSchema,
			TSourceCountSchema,
			TSourceUpdateSchema,
			TSourceDeleteSchema,
			TSourceResponseSchema
		>;
		error: {};
	}
> => {
	const models: Record<string, TSchema> = {};

	if (operations.insert)
		models[`${sourceSchemaName}Insert`] = createInsertSchema(sourceInsertSchema);

	if (operations.find)
		models[`${sourceSchemaName}Find`] = createFindSchema(sourceFindSchema);

	if (operations.count)
		models[`${sourceSchemaName}Count`] = createCountSchema(sourceCountSchema);

	if (operations.update)
		models[`${sourceSchemaName}Update`] = createUpdateSchema(sourceUpdateSchema);

	if (operations.updateOne)
		models[`${sourceSchemaName}UpdateOne`] = createUpdateOneSchema(sourceUpdateSchema);

	if (operations.delete)
		models[`${sourceSchemaName}Delete`] = createDeleteSchema(sourceDeleteSchema);

	if (
		operations.findOne
		|| operations.updateOne
		|| operations.deleteOne
	)
		models[`${sourceSchemaName}IdParam`] = createIdParamSchema();

	if (operations.find
		|| operations.findOne
		|| operations.insert
		|| operations.update
		|| operations.updateOne
		|| operations.delete
		|| operations.deleteOne
	)
		models[`${sourceSchemaName}Response200`] = createResponse200Schema(sourceResponseSchema);

	if (operations.count)
		models[`${sourceSchemaName}CountResponse200`] = createCountResponse200Schema();

	const app = new Elysia<TSourceSchemaName>({
		name: `crudSchemaPlugin-${sourceSchemaName}`
	})
		.model(models as CrudModelsType<
			TSourceSchemaName,
			TOperations,
			TSourceInsertSchema,
			TSourceFindSchema,
			TSourceCountSchema,
			TSourceUpdateSchema,
			TSourceDeleteSchema,
			TSourceResponseSchema
		>);
	return app;
};