import { KindGuard } from '@sinclair/typebox';
import type { TSchema } from '@sinclair/typebox/type';
import { t } from 'elysia';

import type { TFlatten } from '#/modules/schema-builder/types/tflatten';

const _flattenInto = (type: TSchema, result: TSchema[]): void => {
	if (KindGuard.IsUnion(type))
		for (const subType of type.anyOf)
			_flattenInto(subType, result);
	else
		result.push(type);
};

export const flatten = <Type extends TSchema>(type: Type): TFlatten<Type> => {
	// Fast path for non-union types
	if (!KindGuard.IsUnion(type))
		return type as never;

	// Fast path for simple unions (already flat)
	const isAlreadyFlat = type.anyOf.every((subType) => !KindGuard.IsUnion(subType));
	if (isAlreadyFlat)
		return type as never;

	// Full flatten for nested unions
	const result: TSchema[] = [];
	_flattenInto(type, result);

	return t.Union(result) as never;
};