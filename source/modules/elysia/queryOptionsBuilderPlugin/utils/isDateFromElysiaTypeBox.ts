import { Kind, type TSchema } from '@sinclair/typebox/type';

export const isDateFromElysiaTypeBox = <TInferedSchema extends TSchema>(schema: TInferedSchema) => schema[Kind] === 'Union'
	&& Array.isArray(schema.anyOf)
	&& schema.anyOf.length === 4
	&& schema.anyOf.some((item) => item[Kind] === 'Date')
	&& schema.anyOf.some((item) => item[Kind] === 'String' && item.format === 'date-time')
	&& schema.anyOf.some((item) => item[Kind] === 'String' && item.format === 'date')
	&& schema.anyOf.some((item) => item[Kind] === 'Number');
