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
import type { CrudOperations } from './crudOpterations';

export type CrudModelsType<
	TTableName extends string,
	TInferedObject extends TObject,
	TDatabase extends string | DbSelectorOptions,
	TOperations extends CrudOperations<TInferedObject>
>
= (
	TOperations['insert'] extends CrudOperationBaseOptions<TInferedObject> | true
		? Record<`${TTableName}Insert`, TUnion<[
			TInferedObject,
			TArray<TInferedObject>
		]>>
		: {}
)
& (
	TOperations['update'] extends CrudOperationBaseOptions<TInferedObject> | true
		? Record<`${TTableName}Update`, TPartial<TInferedObject>>
		: {}
)
& (
	(
		TOperations['find'] extends CrudOperationBaseOptions<TInferedObject> | true
			? true
			: TOperations['delete'] extends CrudOperationBaseOptions<TInferedObject> | true
				? true
				: TOperations['update'] extends CrudOperationBaseOptions<TInferedObject> | true
					? true
					: false
	) extends true
		? Record<`${TTableName}Search`, TPartial<TObject<{
			queryOptions: TPartial<TObject<{
				selectedFields: TUnion<[
					TKeyOf<TInferedObject>,
					TLiteral<'*'>,
					TArray<TKeyOf<TInferedObject>>
				]>;

				orderBy: TUnion<[
					TObject<{
						selectedField: TKeyOf<TInferedObject>;
						direction: TUnion<[TLiteral<'asc'>, TLiteral<'desc'>]>;
					}>,
					TArray<TObject<{
						selectedField: TKeyOf<TInferedObject>;
						direction: TUnion<[TLiteral<'asc'>, TLiteral<'desc'>]>;
					}>>
				]>;

				filters: TUnion<[
					TPartial<TComposite<[
						TObject<{
							$q: TUnion<[
								TObject<{
									selectedFields: TUnion<[
										TKeyOf<TInferedObject>,
										TArray<TKeyOf<TInferedObject>>
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
							[K in keyof Static<TInferedObject>]: TUnion<[
								AdaptiveWhereClauseSchema<TInferedObject['properties'][K]>,
								TInferedObject['properties'][K]
							]>
						}>
					]>>,
					TArray<
						TPartial<TComposite<[
							TObject<{
								$q: TUnion<[
									TObject<{
										selectedFields: TUnion<[
											TKeyOf<TInferedObject>,
											TArray<TKeyOf<TInferedObject>>
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
								[K in keyof Static<TInferedObject>]: TUnion<[
									AdaptiveWhereClauseSchema<TInferedObject['properties'][K]>,
									TInferedObject['properties'][K]
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
			TOperations['findOne'] extends CrudOperationBaseOptions<TInferedObject> | true
				? true
				: TOperations['updateOne'] extends CrudOperationBaseOptions<TInferedObject> | true
					? true
					: TOperations['deleteOne'] extends CrudOperationBaseOptions<TInferedObject> | true
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
		TOperations['find'] extends CrudOperationBaseOptions<TInferedObject> | true
			? true
			: TOperations['findOne'] extends CrudOperationBaseOptions<TInferedObject> | true
				? true
				: TOperations['insert'] extends CrudOperationBaseOptions<TInferedObject> | true
					? true
					: TOperations['update'] extends CrudOperationBaseOptions<TInferedObject> | true
						? true
						: TOperations['updateOne'] extends CrudOperationBaseOptions<TInferedObject> | true
							? true
							: TOperations['delete'] extends CrudOperationBaseOptions<TInferedObject> | true
								? true
								: TOperations['deleteOne'] extends CrudOperationBaseOptions<TInferedObject> | true
									? true
									: false
	) extends true
		? Record<`${TTableName}Response200`, TObject<{
			message: TString;
			content: TArray<TPartial<TObject<{
				[K in keyof Static<TInferedObject>]: TUnion<[
					TUndefined,
					TLiteral<''>,
					TInferedObject['properties'][K]
				]>
			}>>>
		}>>
		: {}
)
& (
	TOperations['count'] extends CrudOperationBaseOptions<TInferedObject> | true
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