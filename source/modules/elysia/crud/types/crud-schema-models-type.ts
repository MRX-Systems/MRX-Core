import type { TObject } from '@sinclair/typebox/type';

import type { CountResponse200Schema } from '#/modules/elysia/crud/types/count-response-200-schema';
import type { CountSchema } from '#/modules/elysia/crud/types/count-schema';
import type { DeleteSchema } from '#/modules/elysia/crud/types/delete-schema';
import type { FindSchema } from '#/modules/elysia/crud/types/find-schema';
import type { IdParamSchema } from '#/modules/elysia/crud/types/id-param-schema';
import type { InsertSchema } from '#/modules/elysia/crud/types/insert-schema';
import type { Response200Schema } from '#/modules/elysia/crud/types/response-200-schema';
import type { UpdateOneSchema } from '#/modules/elysia/crud/types/update-one-schema';
import type { UpdateSchema } from '#/modules/elysia/crud/types/update-schema';
import type { CrudSchemaOperations } from './crud-schema-operations';

export type CrudSchemaModelsType<
	TSourceSchemaName extends string,
	TOperations extends CrudSchemaOperations,
	TSourceInsertSchema extends TObject,
	TSourceFindSchema extends TObject,
	TSourceCountSchema extends TObject,
	TSourceUpdateSchema extends TObject,
	TSourceDeleteSchema extends TObject,
	TSourceResponseSchema extends TObject
>
	= (
	TOperations['insert'] extends true
		? Record<`${TSourceSchemaName}Insert`, InsertSchema<TSourceInsertSchema>>
		: {}
)
& (
	(
		TOperations['find'] extends true
			? true
			: false
	) extends true
		? Record<`${TSourceSchemaName}Find`, FindSchema<TSourceFindSchema>>
		: {}
)
& (
	(
		TOperations['count'] extends true
			? true
			: false
	) extends true
		? Record<`${TSourceSchemaName}Count`, CountSchema<TSourceCountSchema>>
		: {}
)
& (
	TOperations['update'] extends true
		? Record<`${TSourceSchemaName}Update`, UpdateSchema<TSourceUpdateSchema>>
		: {}
) & (
	TOperations['updateOne'] extends true
		? Record<`${TSourceSchemaName}UpdateOne`, UpdateOneSchema<TSourceUpdateSchema>>
		: {}
) & (
	TOperations['delete'] extends true
		? Record<`${TSourceSchemaName}Delete`, DeleteSchema<TSourceDeleteSchema>>
		: {}
) & (
	(
		(
			TOperations['findOne'] extends true
				? true
				: TOperations['updateOne'] extends true
					? true
					: TOperations['deleteOne'] extends true
						? true
						: false
		) extends true
			? Record<`${TSourceSchemaName}IdParam`, IdParamSchema>
			: {}
	)
)
& (
	(
		TOperations['find'] extends true
			? true
			: TOperations['findOne'] extends true
				? true
				: TOperations['insert'] extends true
					? true
					: TOperations['update'] extends true
						? true
						: TOperations['updateOne'] extends true
							? true
							: TOperations['delete'] extends true
								? true
								: TOperations['deleteOne'] extends true
									? true
									: false
	) extends true
		? Record<`${TSourceSchemaName}Response200`, Response200Schema<TSourceResponseSchema>>
		: {}
)
& (
	TOperations['count'] extends true
		? Record<`${TSourceSchemaName}CountResponse200`, CountResponse200Schema>
		: {}
);
