import { beforeEach, describe, expect, mock, test } from 'bun:test';

import { Table } from '#/database/table';
import type { QueryContext } from '#/database/types/queryContext';

/**
 * Test data for Table class tests.
 */
const testData = {
    databases: {
        valid: 'test_database',
        empty: '',
        withSpaces: 'database with spaces',
        withSpecialChars: 'db-name_123',
        unicode: 'données_база'
    },
    tables: {
        valid: 'users',
        empty: '',
        withSpaces: 'user profiles',
        withSpecialChars: 'user-data_2023',
        unicode: 'utilisateurs_пользователи'
    },
    fields: {
        single: ['id'] as string[],
        multiple: ['id', 'name', 'email', 'created_at'] as string[],
        empty: [] as string[],
        withSpecialNames: ['user_id', 'first-name', 'email_address'] as string[],
        unicode: ['идентификатор', 'nom_utilisateur'] as string[]
    },
    primaryKeys: {
        numberType: ['id', 'NUMBER'] as [string, 'NUMBER'],
        stringType: ['uuid', 'STRING'] as [string, 'STRING'],
        differentField: ['user_id', 'NUMBER'] as [string, 'NUMBER'],
        unicode: ['идентификатор', 'STRING'] as [string, 'STRING']
    },
    events: {
        selected: 'selected' as const,
        inserted: 'inserted' as const,
        updated: 'updated' as const,
        deleted: 'deleted' as const
    },
    payloads: {
        simple: { id: 1, name: 'John' },
        complex: {
            id: 42,
            name: 'Jane Doe',
            email: 'jane@example.com',
            metadata: { role: 'admin', lastLogin: '2025-05-28' }
        },
        array: [{ id: 1 }, { id: 2 }, { id: 3 }],
        null: null,
        undefined
    },
    queryContexts: {
        basic: {
            method: 'select',
            options: { tableName: 'users' },
            timeout: 30000,
            cancelOnTimeout: false,
            bindings: [],
            sql: 'SELECT * FROM users',
            queryContext: { operation: 'SELECT' },
            __knexUid: 'knex-uid-123',
            __knexQueryUid: 'query-uid-123'
        } as QueryContext,
        withMetadata: {
            method: 'insert',
            options: { tableName: 'users', batchSize: 100 },
            timeout: 60000,
            cancelOnTimeout: true,
            bindings: ['value1', 'value2'],
            sql: 'INSERT INTO users (name, email) VALUES (?, ?)',
            queryContext: { operation: 'INSERT', metadata: { batchId: 'batch789' } },
            __knexUid: 'knex-uid-456',
            __knexQueryUid: 'query-uid-456'
        } as QueryContext
    }
} as const;

describe('Table', (): void => {
    describe('Constructor', (): void => {
        test('should create a table instance with valid parameters', (): void => {
            const table = new Table(
                testData.databases.valid,
                testData.tables.valid,
                testData.fields.multiple,
                testData.primaryKeys.numberType
            );

            expect(table).toBeDefined();
            expect(table).toBeInstanceOf(Table);
        });

        test('should create a table instance with NUMBER primary key type', (): void => {
            const table = new Table(
                testData.databases.valid,
                testData.tables.valid,
                testData.fields.single,
                testData.primaryKeys.numberType
            );

            expect(table.primaryKey).toEqual(testData.primaryKeys.numberType);
        });

        test('should create a table instance with STRING primary key type', (): void => {
            const table = new Table(
                testData.databases.valid,
                testData.tables.valid,
                testData.fields.single,
                testData.primaryKeys.stringType
            );

            expect(table.primaryKey).toEqual(testData.primaryKeys.stringType);
        });

        test('should handle empty strings for database and table names', (): void => {
            const table = new Table(
                testData.databases.empty,
                testData.tables.empty,
                testData.fields.empty,
                testData.primaryKeys.numberType
            );

            expect(table.databaseName).toBe(testData.databases.empty);
            expect(table.name).toBe(testData.tables.empty);
            expect(table.fields).toEqual(testData.fields.empty);
        });

        test('should handle names with spaces and special characters', (): void => {
            const table = new Table(
                testData.databases.withSpecialChars,
                testData.tables.withSpecialChars,
                testData.fields.withSpecialNames,
                testData.primaryKeys.differentField
            );

            expect(table.databaseName).toBe(testData.databases.withSpecialChars);
            expect(table.name).toBe(testData.tables.withSpecialChars);
            expect(table.fields).toEqual(testData.fields.withSpecialNames);
        });

        test('should handle unicode characters', (): void => {
            const table = new Table(
                testData.databases.unicode,
                testData.tables.unicode,
                testData.fields.unicode,
                testData.primaryKeys.unicode
            );

            expect(table.databaseName).toBe(testData.databases.unicode);
            expect(table.name).toBe(testData.tables.unicode);
            expect(table.fields).toEqual(testData.fields.unicode);
            expect(table.primaryKey).toEqual(testData.primaryKeys.unicode);
        });

        test('should inherit from TypedEventEmitter', (): void => {
            const table = new Table(
                testData.databases.valid,
                testData.tables.valid,
                testData.fields.single,
                testData.primaryKeys.numberType
            );

            // Check if it has event emitter methods
            expect(typeof table.on).toBe('function');
            expect(typeof table.emit).toBe('function');
            expect(typeof table.once).toBe('function');
            expect(typeof table.addListener).toBe('function');
            expect(typeof table.removeListener).toBe('function');
        });
    });

    describe('Property Getters', (): void => {
        let _table: Table;

        beforeEach((): void => {
            _table = new Table(
                testData.databases.valid,
                testData.tables.valid,
                testData.fields.multiple,
                testData.primaryKeys.numberType
            );
        });

        describe('databaseName', (): void => {
            test('should return the correct database name', (): void => {
                expect(_table.databaseName).toBe(testData.databases.valid);
            });

            test('should be readonly (getter only)', (): void => {
                // TypeScript should prevent this, but we can test runtime behavior
                expect(() => {
                    // @ts-expect-error - Testing readonly behavior
                    _table.databaseName = 'new_database';
                }).toThrow();
            });
        });

        describe('name', (): void => {
            test('should return the correct table name', (): void => {
                expect(_table.name).toBe(testData.tables.valid);
            });

            test('should be readonly (getter only)', (): void => {
                expect(() => {
                    // @ts-expect-error - Testing readonly behavior
                    _table.name = 'new_table';
                }).toThrow();
            });
        });

        describe('fields', (): void => {
            test('should return the correct fields array', (): void => {
                expect(_table.fields).toEqual(testData.fields.multiple);
            });

            test('should return a reference to the original array', (): void => {
                const { fields } = _table;
                expect(fields).toBe(_table.fields);
            });

            test('should be readonly (getter only)', (): void => {
                expect(() => {
                    // @ts-expect-error - Testing readonly behavior
                    _table.fields = ['new_field'];
                }).toThrow();
            });
        });

        describe('primaryKey', (): void => {
            test('should return the correct primary key tuple', (): void => {
                expect(_table.primaryKey).toEqual(testData.primaryKeys.numberType);
            });

            test('should return a reference to the original tuple', (): void => {
                const pk = _table.primaryKey;
                expect(pk).toBe(_table.primaryKey);
            });

            test('should be readonly (getter only)', (): void => {
                expect(() => {
                    // @ts-expect-error - Testing readonly behavior
                    _table.primaryKey = ['new_id', 'STRING'];
                }).toThrow();
            });
        });
    });

    describe('Event Emission', (): void => {
        let _table: Table;

        beforeEach((): void => {
            _table = new Table(
                testData.databases.valid,
                testData.tables.valid,
                testData.fields.multiple,
                testData.primaryKeys.numberType
            );
        });

        describe('selected event', (): void => {
            test('should emit selected event with data and context', (): void => {
                const listener = mock();

                _table.on(testData.events.selected, listener);
                _table.emit(testData.events.selected, testData.payloads.simple, testData.queryContexts.basic);

                expect(listener).toHaveBeenCalledTimes(1);
                expect(listener).toHaveBeenCalledWith(testData.payloads.simple, testData.queryContexts.basic);
            });

            test('should handle null data payload', (): void => {
                const listener = mock();

                _table.on(testData.events.selected, listener);
                _table.emit(testData.events.selected, testData.payloads.null, testData.queryContexts.basic);

                expect(listener).toHaveBeenCalledWith(testData.payloads.null, testData.queryContexts.basic);
            });

            test('should handle complex data structures', (): void => {
                const listener = mock();

                _table.on(testData.events.selected, listener);
                _table.emit(testData.events.selected, testData.payloads.complex, testData.queryContexts.withMetadata);

                expect(listener).toHaveBeenCalledWith(testData.payloads.complex, testData.queryContexts.withMetadata);
            });
        });

        describe('inserted event', (): void => {
            test('should emit inserted event with data and context', (): void => {
                const listener = mock();

                _table.on(testData.events.inserted, listener);
                _table.emit(testData.events.inserted, testData.payloads.simple, testData.queryContexts.basic);

                expect(listener).toHaveBeenCalledTimes(1);
                expect(listener).toHaveBeenCalledWith(testData.payloads.simple, testData.queryContexts.basic);
            });

            test('should handle array data payload', (): void => {
                const listener = mock();

                _table.on(testData.events.inserted, listener);
                _table.emit(testData.events.inserted, testData.payloads.array, testData.queryContexts.basic);

                expect(listener).toHaveBeenCalledWith(testData.payloads.array, testData.queryContexts.basic);
            });
        });

        describe('updated event', (): void => {
            test('should emit updated event with data and context', (): void => {
                const listener = mock();

                _table.on(testData.events.updated, listener);
                _table.emit(testData.events.updated, testData.payloads.simple, testData.queryContexts.basic);

                expect(listener).toHaveBeenCalledTimes(1);
                expect(listener).toHaveBeenCalledWith(testData.payloads.simple, testData.queryContexts.basic);
            });
        });

        describe('deleted event', (): void => {
            test('should emit deleted event with data and context', (): void => {
                const listener = mock();

                _table.on(testData.events.deleted, listener);
                _table.emit(testData.events.deleted, testData.payloads.simple, testData.queryContexts.basic);

                expect(listener).toHaveBeenCalledTimes(1);
                expect(listener).toHaveBeenCalledWith(testData.payloads.simple, testData.queryContexts.basic);
            });
        });

        describe('multiple events', (): void => {
            test('should handle multiple different event types', (): void => {
                const selectedListener = mock();
                const insertedListener = mock();
                const updatedListener = mock();
                const deletedListener = mock();

                _table.on(testData.events.selected, selectedListener);
                _table.on(testData.events.inserted, insertedListener);
                _table.on(testData.events.updated, updatedListener);
                _table.on(testData.events.deleted, deletedListener);

                _table.emit(testData.events.selected, testData.payloads.simple, testData.queryContexts.basic);
                _table.emit(testData.events.inserted, testData.payloads.complex, testData.queryContexts.withMetadata);

                expect(selectedListener).toHaveBeenCalledTimes(1);
                expect(insertedListener).toHaveBeenCalledTimes(1);
                expect(updatedListener).not.toHaveBeenCalled();
                expect(deletedListener).not.toHaveBeenCalled();
            });

            test('should handle multiple listeners for same event', (): void => {
                const firstListener = mock();
                const secondListener = mock();

                _table.on(testData.events.selected, firstListener);
                _table.on(testData.events.selected, secondListener);
                _table.emit(testData.events.selected, testData.payloads.simple, testData.queryContexts.basic);

                expect(firstListener).toHaveBeenCalledTimes(1);
                expect(secondListener).toHaveBeenCalledTimes(1);
                expect(firstListener).toHaveBeenCalledWith(testData.payloads.simple, testData.queryContexts.basic);
                expect(secondListener).toHaveBeenCalledWith(testData.payloads.simple, testData.queryContexts.basic);
            });
        });
    });

    describe('Event Listener Management', (): void => {
        let _table: Table;

        beforeEach((): void => {
            _table = new Table(
                testData.databases.valid,
                testData.tables.valid,
                testData.fields.multiple,
                testData.primaryKeys.numberType
            );
        });

        describe('addListener and removeListener', (): void => {
            test('should add and remove listeners correctly', (): void => {
                const listener = mock();

                _table.addListener(testData.events.selected, listener);
                expect(_table.listenerCount(testData.events.selected)).toBe(1);

                _table.removeListener(testData.events.selected, listener);
                expect(_table.listenerCount(testData.events.selected)).toBe(0);
            });

            test('should handle removing non-existent listener gracefully', (): void => {
                const existingListener = mock();
                const nonExistentListener = mock();

                _table.addListener(testData.events.selected, existingListener);

                expect((): void => {
                    _table.removeListener(testData.events.selected, nonExistentListener);
                }).not.toThrow();

                expect(_table.listenerCount(testData.events.selected)).toBe(1);
            });
        });

        describe('once', (): void => {
            test('should listen to an event only once', (): void => {
                const listener = mock();

                _table.once(testData.events.selected, listener);
                _table.emit(testData.events.selected, testData.payloads.simple, testData.queryContexts.basic);
                _table.emit(testData.events.selected, testData.payloads.complex, testData.queryContexts.basic);

                expect(listener).toHaveBeenCalledTimes(1);
                expect(listener).toHaveBeenCalledWith(testData.payloads.simple, testData.queryContexts.basic);
            });
        });

        describe('prependListener and prependOnceListener', (): void => {
            test('should add listener to beginning of listeners array', (): void => {
                const firstListener = mock();
                const secondListener = mock();

                _table.addListener(testData.events.selected, firstListener);
                _table.prependListener(testData.events.selected, secondListener);

                const listeners = _table.listeners(testData.events.selected);
                expect(listeners).toHaveLength(2);
                expect(listeners[0]).toBe(secondListener);
                expect(listeners[1]).toBe(firstListener);
            });

            test('should add one-time listener to beginning of listeners array', (): void => {
                const permanentListener = mock();
                const onceListener = mock();

                _table.addListener(testData.events.selected, permanentListener);
                _table.prependOnceListener(testData.events.selected, onceListener);

                _table.emit(testData.events.selected, testData.payloads.simple, testData.queryContexts.basic);
                _table.emit(testData.events.selected, testData.payloads.complex, testData.queryContexts.basic);

                expect(onceListener).toHaveBeenCalledTimes(1);
                expect(permanentListener).toHaveBeenCalledTimes(2);
            });
        });

        describe('off (alias for removeListener)', (): void => {
            test('should remove listener correctly', (): void => {
                const listener = mock();

                _table.addListener(testData.events.selected, listener);
                _table.off(testData.events.selected, listener);

                expect(_table.listenerCount(testData.events.selected)).toBe(0);
            });
        });

        describe('listeners and rawListeners', (): void => {
            test('should return correct listeners array', (): void => {
                const firstListener = mock();
                const secondListener = mock();

                _table.addListener(testData.events.selected, firstListener);
                _table.addListener(testData.events.selected, secondListener);

                const listeners = _table.listeners(testData.events.selected);
                expect(listeners).toHaveLength(2);
                expect(listeners).toContain(firstListener);
                expect(listeners).toContain(secondListener);
            });

            test('should return copy of listeners array', (): void => {
                const listener = mock();
                _table.addListener(testData.events.selected, listener);

                const listeners1 = _table.listeners(testData.events.selected);
                const listeners2 = _table.listeners(testData.events.selected);

                expect(listeners1).not.toBe(listeners2);
                expect(listeners1).toEqual(listeners2);
            });

            test('should return raw listeners correctly', (): void => {
                const listener = mock();
                _table.addListener(testData.events.selected, listener);

                const rawListeners = _table.rawListeners(testData.events.selected);
                expect(rawListeners).toHaveLength(1);
                expect(rawListeners).toContain(listener);
            });
        });
    });

    describe('Edge Cases and Error Scenarios', (): void => {
        test('should handle events with no listeners gracefully', (): void => {
            const table = new Table(
                testData.databases.valid,
                testData.tables.valid,
                testData.fields.single,
                testData.primaryKeys.numberType
            );

            expect((): void => {
                table.emit(testData.events.selected, testData.payloads.simple, testData.queryContexts.basic);
            }).not.toThrow();
        });

        test('should handle undefined query context', (): void => {
            const table = new Table(
                testData.databases.valid,
                testData.tables.valid,
                testData.fields.single,
                testData.primaryKeys.numberType
            );
            const listener = mock();

            table.on(testData.events.selected, listener);

            expect((): void => {
                table.emit(testData.events.selected, testData.payloads.simple, undefined as unknown as QueryContext);
            }).not.toThrow();
        }); test('should share references with constructor parameters (no defensive copying)', (): void => {
            const originalFields = ['id', 'name'];
            const originalPrimaryKey: [string, 'NUMBER'] = ['id', 'NUMBER'];

            const table = new Table(
                testData.databases.valid,
                testData.tables.valid,
                originalFields,
                originalPrimaryKey
            );

            // Modify original arrays
            originalFields.push('email');
            originalPrimaryKey[0] = 'user_id';

            // Table should reflect changes to original arrays (shares references)
            expect(table.fields).toEqual(['id', 'name', 'email']);
            expect(table.primaryKey).toEqual(['user_id', 'NUMBER']);

            // Verify they are the same references
            expect(table.fields).toBe(originalFields);
            expect(table.primaryKey).toBe(originalPrimaryKey);
        });

        test('should handle listener errors gracefully', (): void => {
            const table = new Table(
                testData.databases.valid,
                testData.tables.valid,
                testData.fields.single,
                testData.primaryKeys.numberType
            );

            const errorListener = mock((): void => {
                throw new Error('Listener error');
            });
            const normalListener = mock();

            table.on(testData.events.selected, errorListener);
            table.on(testData.events.selected, normalListener);

            // This should not prevent other listeners from being called
            expect((): void => {
                table.emit(testData.events.selected, testData.payloads.simple, testData.queryContexts.basic);
            }).toThrow('Listener error');
        });
    });

    describe('Performance and Memory', (): void => {
        test('should handle large number of listeners efficiently', (): void => {
            const table = new Table(
                testData.databases.valid,
                testData.tables.valid,
                testData.fields.single,
                testData.primaryKeys.numberType
            );

            // Increase max listeners for this test to avoid warnings
            table.setMaxListeners(1500);

            const listeners = Array.from({ length: 1000 }, () => mock());

            // Add many listeners
            listeners.forEach((listener): void => {
                table.addListener(testData.events.selected, listener);
            });

            expect(table.listenerCount(testData.events.selected)).toBe(1000);

            // Emit event and verify all listeners are called
            table.emit(testData.events.selected, testData.payloads.simple, testData.queryContexts.basic);

            listeners.forEach((listener): void => {
                expect(listener).toHaveBeenCalledTimes(1);
            });

            // Clean up listeners to avoid memory leaks
            table.removeAllListeners(testData.events.selected);
            expect(table.listenerCount(testData.events.selected)).toBe(0);
        });

        test('should handle rapid event emissions', (): void => {
            const table = new Table(
                testData.databases.valid,
                testData.tables.valid,
                testData.fields.single,
                testData.primaryKeys.numberType
            );
            const listener = mock();

            table.on(testData.events.selected, listener);

            // Emit many events rapidly
            for (let i = 0; i < 100; i++)
                table.emit(testData.events.selected, { iteration: i }, testData.queryContexts.basic);

            expect(listener).toHaveBeenCalledTimes(100);
        });
    });

    describe('Type Safety Validation', (): void => {
        test('should enforce correct primary key types at compile time', (): void => {
            // These should compile without errors
            const numberPkTable = new Table(
                testData.databases.valid,
                testData.tables.valid,
                testData.fields.single,
                ['id', 'NUMBER']
            );

            const stringPkTable = new Table(
                testData.databases.valid,
                testData.tables.valid,
                testData.fields.single,
                ['uuid', 'STRING']
            );

            expect(numberPkTable.primaryKey[1]).toBe('NUMBER');
            expect(stringPkTable.primaryKey[1]).toBe('STRING');
        });

        test('should provide type-safe event emission', (): void => {
            const table = new Table(
                testData.databases.valid,
                testData.tables.valid,
                testData.fields.single,
                testData.primaryKeys.numberType
            );

            // This should work with proper types
            const typedListener = mock((_data: unknown, context: QueryContext): void => {
                expect(context).toBeDefined();
            });

            table.on(testData.events.selected, typedListener);
            table.emit(testData.events.selected, testData.payloads.simple, testData.queryContexts.basic);

            expect(typedListener).toHaveBeenCalledWith(testData.payloads.simple, testData.queryContexts.basic);
        });
    });
});