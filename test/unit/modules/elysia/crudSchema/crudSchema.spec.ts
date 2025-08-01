import { Type } from '@sinclair/typebox';
import { describe, expect, test } from 'bun:test';

import { crudSchema } from '#/modules/elysia/crudSchema/crudSchema';

describe('crudSchema', () => {
	const mockSchema = Type.Object({
		id: Type.Number(),
		name: Type.String(),
		email: Type.String()
	});

	const schemaName = 'User';

	/**
	 * Helper function to extract model names from the Elysia app instance
	 */
	const getModelNames = (app: unknown): string[] => {
		try {
			const appWithDefinitions = app as { definitions?: { type?: Record<string, unknown> } };
			return Object.keys(appWithDefinitions.definitions?.type || {});
		} catch {
			return [];
		}
	};

	test('should create an Elysia app with correct name', () => {
		const app = crudSchema({
			sourceSchemaName: schemaName,
			sourceSchema: mockSchema
		});

		const appWithConfig = app as { config?: { name?: string } };
		expect(appWithConfig.config?.name).toBe(`crudSchemaPlugin-${schemaName}`);
	});

	test('should add Insert model when insert operation is enabled', () => {
		const app = crudSchema({
			sourceSchemaName: schemaName,
			sourceSchema: mockSchema,
			operations: { insert: true }
		});

		const models = getModelNames(app);
		expect(models).toContain(`${schemaName}Insert`);
		expect(models).toContain(`${schemaName}Response200`);
	});

	test('should add Find model when find operation is enabled', () => {
		const app = crudSchema({
			sourceSchemaName: schemaName,
			sourceSchema: mockSchema,
			operations: { find: true }
		});

		const models = getModelNames(app);
		expect(models).toContain(`${schemaName}Find`);
		expect(models).toContain(`${schemaName}Response200`);
	});

	test('should add Count model when count operation is enabled', () => {
		const app = crudSchema({
			sourceSchemaName: schemaName,
			sourceSchema: mockSchema,
			operations: { count: true }
		});

		const models = getModelNames(app);
		expect(models).toContain(`${schemaName}Count`);
		expect(models).toContain(`${schemaName}CountResponse200`);
	});

	test('should add Update model when update operation is enabled', () => {
		const app = crudSchema({
			sourceSchemaName: schemaName,
			sourceSchema: mockSchema,
			operations: { update: true }
		});

		const models = getModelNames(app);
		expect(models).toContain(`${schemaName}Update`);
		expect(models).toContain(`${schemaName}Response200`);
	});

	test('should add UpdateOne model when updateOne operation is enabled', () => {
		const app = crudSchema({
			sourceSchemaName: schemaName,
			sourceSchema: mockSchema,
			operations: { updateOne: true }
		});

		const models = getModelNames(app);
		expect(models).toContain(`${schemaName}UpdateOne`);
		expect(models).toContain(`${schemaName}IdParam`);
		expect(models).toContain(`${schemaName}Response200`);
	});

	test('should add Delete model when delete operation is enabled', () => {
		const app = crudSchema({
			sourceSchemaName: schemaName,
			sourceSchema: mockSchema,
			operations: { delete: true }
		});

		const models = getModelNames(app);
		expect(models).toContain(`${schemaName}Delete`);
		expect(models).toContain(`${schemaName}Response200`);
	});

	test('should add IdParam model when findOne operation is enabled', () => {
		const app = crudSchema({
			sourceSchemaName: schemaName,
			sourceSchema: mockSchema,
			operations: { findOne: true }
		});

		const models = getModelNames(app);
		expect(models).toContain(`${schemaName}IdParam`);
		expect(models).toContain(`${schemaName}Response200`);
	});

	test('should add IdParam model when deleteOne operation is enabled', () => {
		const app = crudSchema({
			sourceSchemaName: schemaName,
			sourceSchema: mockSchema,
			operations: { deleteOne: true }
		});

		const models = getModelNames(app);
		expect(models).toContain(`${schemaName}IdParam`);
		expect(models).toContain(`${schemaName}Response200`);
	});

	test('should add all models when all operations are enabled', () => {
		const app = crudSchema({
			sourceSchemaName: schemaName,
			sourceSchema: mockSchema,
			operations: {
				insert: true,
				find: true,
				findOne: true,
				count: true,
				update: true,
				updateOne: true,
				delete: true,
				deleteOne: true
			}
		});

		const models = getModelNames(app);
		expect(models).toContain(`${schemaName}Insert`);
		expect(models).toContain(`${schemaName}Find`);
		expect(models).toContain(`${schemaName}Count`);
		expect(models).toContain(`${schemaName}Update`);
		expect(models).toContain(`${schemaName}UpdateOne`);
		expect(models).toContain(`${schemaName}Delete`);
		expect(models).toContain(`${schemaName}IdParam`);
		expect(models).toContain(`${schemaName}Response200`);
		expect(models).toContain(`${schemaName}CountResponse200`);
	});

	test('should not add any models when all operations are disabled', () => {
		const app = crudSchema({
			sourceSchemaName: schemaName,
			sourceSchema: mockSchema,
			operations: {
				insert: false,
				find: false,
				findOne: false,
				count: false,
				update: false,
				updateOne: false,
				delete: false,
				deleteOne: false
			}
		});

		const models = getModelNames(app);
		expect(models).toHaveLength(0);
	});

	test('should use default operations when not specified', () => {
		const app = crudSchema({
			sourceSchemaName: schemaName,
			sourceSchema: mockSchema
		});

		const models = getModelNames(app);
		expect(models).toContain(`${schemaName}Insert`);
		expect(models).toContain(`${schemaName}Find`);
		expect(models).toContain(`${schemaName}Count`);
		expect(models).toContain(`${schemaName}Update`);
		expect(models).toContain(`${schemaName}UpdateOne`);
		expect(models).toContain(`${schemaName}Delete`);
		expect(models).toContain(`${schemaName}IdParam`);
		expect(models).toContain(`${schemaName}Response200`);
		expect(models).toContain(`${schemaName}CountResponse200`);
	});

	test('should work with different schema names', () => {
		const customSchemaName = 'Product';
		const app = crudSchema({
			sourceSchemaName: customSchemaName,
			sourceSchema: mockSchema,
			operations: { insert: true, find: true }
		});

		const models = getModelNames(app);
		expect(models).toContain('ProductInsert');
		expect(models).toContain('ProductFind');
		expect(models).toContain('ProductResponse200');
	});
});