import type {
	Static,
	TArray,
	TComposite,
	TKeyOf,
	TLiteral,
	TNumber,
	TObject,
	TPartial,
	TString,
	TUndefined,
	TUnion
} from '@sinclair/typebox';

import type { DbSelectorOptions } from '#/modules/elysia/dbSelectorPlugin/types/dbSelectorOptions';
import type { AdaptiveWhereClauseSchema } from '#/modules/elysia/queryOptionsBuilderPlugin/types/adaptiveWhereClauseSchema';
import type { CrudOperationBaseOptions } from './crudOperationBaseOptions';
import type { CrudOperationsOptions } from './crudOperationsOptions';
import type { CrudOperationFindOptions } from './crudOperationFindOptions';
import type { CrudOperationInsertOptions } from './crudOperationInsertOptions';
import type { CrudOperationUpdateOptions } from './crudOperationUpdateOptions';
import type { CrudOperationDeleteOptions } from './crudOperationDeleteOptions';
import type { CrudOperationFindOneOptions } from './crudOperationFindOneOptions';
import type { CrudOperationUpdateOneOptions } from './crudOperationUpdateOneOptions';
import type { CrudOperationDeleteOneOptions } from './crudOperationDeleteOneOptions';
import type { CrudOperationCountOptions } from './crudOperationCountOptions';

export type CrudModelsType<
	TDatabase extends string | DbSelectorOptions,
	TTableName extends string,
	TSourceSearchSchema extends TObject,
	TSourceInsertSchema extends TObject,
	TSourceUpdateSchema extends TObject,
	TSourceResponseSchema extends TObject,
	TOperations extends CrudOperationsOptions
>
= (
	TOperations['insert'] extends CrudOperationInsertOptions | true
		? Record<`${TTableName}Insert`, TUnion<[
			TSourceInsertSchema,
			TArray<TSourceInsertSchema>
		]>>
		: {}
)
& (
	TOperations['update'] extends CrudOperationUpdateOptions | true
		? Record<`${TTableName}Update`, TPartial<TSourceUpdateSchema>>
		: {}
)
& (
	(
		TOperations['find'] extends CrudOperationFindOptions | true
			? true
			: TOperations['delete'] extends CrudOperationDeleteOptions | true
				? true
				: TOperations['update'] extends CrudOperationUpdateOptions | true
					? true
					: false
	) extends true
		? Record<`${TTableName}Search`, TPartial<TObject<{
			queryOptions: TPartial<TObject<{
				selectedFields: TUnion<[
					TKeyOf<TSourceSearchSchema>,
					TLiteral<'*'>,
					TArray<TKeyOf<TSourceSearchSchema>>
				]>;

				orderBy: TUnion<[
					TObject<{
						selectedField: TKeyOf<TSourceSearchSchema>;
						direction: TUnion<[TLiteral<'asc'>, TLiteral<'desc'>]>;
					}>,
					TArray<TObject<{
						selectedField: TKeyOf<TSourceSearchSchema>;
						direction: TUnion<[TLiteral<'asc'>, TLiteral<'desc'>]>;
					}>>
				]>;

				filters: TUnion<[
					TPartial<TComposite<[
						TObject<{
							$q: TUnion<[
								TObject<{
									selectedFields: TUnion<[
										TKeyOf<TSourceSearchSchema>,
										TArray<TKeyOf<TSourceSearchSchema>>
									]>;
									value: TUnion<[
										TNumber,
										TString
									]>;
								}>,
								TNumber,
								TString
							]>;
						}>,
						TObject<{
							[K in keyof Static<TSourceSearchSchema>]: TUnion<[
								AdaptiveWhereClauseSchema<TSourceSearchSchema['properties'][K]>,
								TSourceSearchSchema['properties'][K]
							]>
						}>
					]>>,
					TArray<
						TPartial<TComposite<[
							TObject<{
								$q: TUnion<[
									TObject<{
										selectedFields: TUnion<[
											TKeyOf<TSourceSearchSchema>,
											TArray<TKeyOf<TSourceSearchSchema>>
										]>;
										value: TUnion<[
											TNumber,
											TString
										]>;
									}>,
									TNumber,
									TString
								]>;
							}>,
							TObject<{
								[K in keyof Static<TSourceSearchSchema>]: TUnion<[
									AdaptiveWhereClauseSchema<TSourceSearchSchema['properties'][K]>,
									TSourceSearchSchema['properties'][K]
								]>
							}>
						]>>
					>
				]>;
				limit: TNumber;
				offset: TNumber;
			}>>
		}>>>
		: {}
)
& (
	(
		(
			TOperations['findOne'] extends CrudOperationFindOneOptions | true
				? true
				: TOperations['updateOne'] extends CrudOperationUpdateOneOptions | true
					? true
					: TOperations['deleteOne'] extends CrudOperationDeleteOneOptions | true
						? true
						: false
		) extends true
			? Record<`${TTableName}IdParam`, TObject<{
				id: TUnion<[TString, TNumber]>;
			}>>
			: {}
	)
)
& (
	(
		TOperations['find'] extends CrudOperationBaseOptions | true
			? true
			: TOperations['findOne'] extends CrudOperationBaseOptions | true
				? true
				: TOperations['insert'] extends CrudOperationBaseOptions | true
					? true
					: TOperations['update'] extends CrudOperationBaseOptions | true
						? true
						: TOperations['updateOne'] extends CrudOperationBaseOptions | true
							? true
							: TOperations['delete'] extends CrudOperationBaseOptions | true
								? true
								: TOperations['deleteOne'] extends CrudOperationBaseOptions | true
									? true
									: false
	) extends true
		? Record<`${TTableName}Response200`, TObject<{
			message: TString;
			content: TArray<TPartial<TObject<{
				[K in keyof Static<TSourceResponseSchema>]: TUnion<[
					TUndefined,
					TLiteral<''>,
					TSourceResponseSchema['properties'][K]
				]>
			}>>>
		}>>
		: {}
)
& (
	TOperations['count'] extends CrudOperationCountOptions | true
		? Record<`${TTableName}CountResponse200`, TObject<{
			message: TString;
			content: TNumber;
		}>>
		: {}
)
& (
	TDatabase extends DbSelectorOptions
		? {
			dbSelectorHeader: TObject<
				Record<
					TDatabase['headerKey'] extends string
						? TDatabase['headerKey']
						: 'database-using',
					TString
				>
			>
		}
		: {}
);