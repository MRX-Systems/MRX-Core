import type { TSchema } from '@sinclair/typebox/type';
import { KindGuard } from '@sinclair/typebox';

export const isDateFromElysiaTypeBox = <TFieldSchema extends TSchema>(schema: TFieldSchema): boolean => KindGuard.IsUnion(schema)
	&& schema.anyOf.length === 4
	&& schema.anyOf.some((item) => KindGuard.IsDate(item))
	&& schema.anyOf.some((item) => KindGuard.IsString(item) && item.format === 'date-time')
	&& schema.anyOf.some((item) => KindGuard.IsString(item) && item.format === 'date')
	&& schema.anyOf.some((item) => KindGuard.IsNumber(item));
