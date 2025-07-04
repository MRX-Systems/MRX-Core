import { describe, test, expect } from 'bun:test';
import { t } from 'elysia';

import { crudPlugin } from '#/modules/elysia/crudPlugin/crud';
import { Kind } from '@sinclair/typebox';

const schema = t.Object({
	id: t.String({ format: 'uuid', description: 'Unique identifier' }),
	name: t.String({ description: 'Name of the item', maxLength: 100 }),
	createdAt: t.Date({ description: 'Creation timestamp' }),
	price: t.Number({ description: 'Price of the item', minimum: 0 }),
	isActive: t.Boolean({ description: 'Is the item active?' })
});

describe('crudPlugin', () => {
	describe('Model', () => {
		describe('Schema Insert', () => {
			const plugin = crudPlugin({
				tableName: 'Schema',
				schema,
				database: 'testDatabase'
			});


			test('should contain the query options builder schema', () => {
				expect(plugin['definitions'].type).toHaveProperty('SchemaInsert');
			});

			test('should the schema insert equal the provided schema', () => {
				const e = plugin['definitions'].type.SchemaInsert;
				expect(e.type).toBe(schema.type);
				expect(e.properties).toEqual(schema.properties);
				expect(e.required).toBe(schema.required);
				expect(e.$id).toBe('#/components/schemas/SchemaInsert');
				expect(e[Kind]).toBe('Object');
			});
		});

		describe('Schema Update', () => {
			const plugin = crudPlugin({
				tableName: 'Schema',
				schema,
				database: 'testDatabase'
			});

			test('should contain the schema update model', () => {
				expect(plugin['definitions'].type).toHaveProperty('SchemaUpdate');
			});

			test('should the schema update be a partial of the provided schema', () => {
				const e = plugin['definitions'].type.SchemaUpdate;

				const resExpected = t.Partial(t.Object(schema.properties));

				expect(e.type).toBe('object');
				expect(e.properties).toEqual(resExpected.properties);
				expect(e.$id).toBe('#/components/schemas/SchemaUpdate');
				expect(e[Kind]).toBe('Object');
			});
		});

		describe('Schema Query Options', () => {
			const plugin = crudPlugin({
				tableName: 'Schema',
				schema,
				database: 'testDatabase'
			});

			test('should contain the query options builder schema', () => {
				expect(plugin['definitions'].type).toHaveProperty('SchemaSearch');
			});

			test('should the search schema be an object with QueryOptions property', () => {
				const e = plugin['definitions'].type.SchemaSearch;
				expect(e.type).toBe('object');
				expect(e.properties).toBeDefined();
				expect(e.properties).toHaveProperty('queryOptions');
				expect(e.properties.queryOptions.type).toBe('object');
				expect(e.$id).toBe('#/components/schemas/SchemaSearch');
				expect(e[Kind]).toBe('Object');
			});
		});
	});
});