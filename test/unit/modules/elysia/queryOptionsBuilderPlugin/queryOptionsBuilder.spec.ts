import { describe, test, expect } from 'bun:test';
import { t } from 'elysia';

import { queryOptionsBuilderPlugin } from '#/modules/elysia/queryOptionsBuilderPlugin/queryOptionsBuilder';

describe('queryOptionsBuilderPlugin', () => {
    describe('Model', () => {
        describe('queryOptionsBuilderTestSchema', () => {
            const plugin = queryOptionsBuilderPlugin({
                schemaName: 'TestSchema',
                baseSchema: t.Object({
                    id: t.String({ description: 'Unique identifier' }),
                    name: t.String({ description: 'Name of the item' }),
                    createdAt: t.String({ description: 'Creation timestamp', format: 'date-time' }),
                    price: t.Number({ description: 'Price of the item', minimum: 0 }),
                    isActive: t.Boolean({ description: 'Is the item active?' })
                })
            });


            test('should contain the query options builder schema', () => {
                expect(plugin['definitions'].type).toHaveProperty('queryOptionsBuilderTestSchema');
            });
        });
    });
});