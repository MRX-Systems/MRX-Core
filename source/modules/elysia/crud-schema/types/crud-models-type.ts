import type {
	TArray,
	TObject,
	TUnion
} from '@sinclair/typebox';

import type { createCountResponse200Schema } from '#/modules/elysia/crud-schema/utils/create-count-response-200-schema';
import type { createCountSchema } from '#/modules/elysia/crud-schema/utils/create-count-schema';
import type { createDeleteSchema } from '#/modules/elysia/crud-schema/utils/create-delete-schema';
import type { createFindSchema } from '#/modules/elysia/crud-schema/utils/create-find-schema';
import type { createIdParamSchema } from '#/modules/elysia/crud-schema/utils/create-id-param-schema';
import type { createResponse200Schema } from '#/modules/elysia/crud-schema/utils/create-response-200-schema';
import type { createUpdateOneSchema } from '#/modules/elysia/crud-schema/utils/create-update-one-schema';
import type { createUpdateSchema } from '#/modules/elysia/crud-schema/utils/create-update-schema';
import type { CrudSchemaOperations } from './crud-schema-operations';

export type CrudModelsType<
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
		? Record<`${TSourceSchemaName}Insert`, TUnion<[
			TSourceInsertSchema,
			TArray<TSourceInsertSchema>
		]>>
		: {}
)
& (
	(
		TOperations['find'] extends true
			? true
			: false
	) extends true
		? Record<`${TSourceSchemaName}Find`, ReturnType<typeof createFindSchema<TSourceFindSchema>>>
		: {}
)
& (
	(
		TOperations['count'] extends true
			? true
			: false
	) extends true
		? Record<`${TSourceSchemaName}Count`, ReturnType<typeof createCountSchema<TSourceCountSchema>>>
		: {}
)
& (
	TOperations['update'] extends true
		? Record<`${TSourceSchemaName}Update`, ReturnType<typeof createUpdateSchema<TSourceUpdateSchema>>>
		: {}
) & (
	TOperations['updateOne'] extends true
		? Record<`${TSourceSchemaName}UpdateOne`, ReturnType<typeof createUpdateOneSchema<TSourceUpdateSchema>>>
		: {}
) & (
	TOperations['delete'] extends true
		? Record<`${TSourceSchemaName}Delete`, ReturnType<typeof createDeleteSchema<TSourceDeleteSchema>>>
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
			? Record<`${TSourceSchemaName}IdParam`, ReturnType<typeof createIdParamSchema>>
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
		? Record<`${TSourceSchemaName}Response200`, ReturnType<typeof createResponse200Schema<TSourceResponseSchema>>>
		: {}
)
& (
	TOperations['count'] extends true
		? Record<`${TSourceSchemaName}CountResponse200`, ReturnType<typeof createCountResponse200Schema>>
		: {}
);
