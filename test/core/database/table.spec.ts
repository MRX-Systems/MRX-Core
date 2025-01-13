import { describe, expect, test } from 'bun:test';

import { Table } from '#/core/database/table';

describe('Table', () => {
    describe('constructor', () => {
        test('should create a table instance', () => {
            const table = new Table('database', 'table', ['column'], ['column', 'STRING']);
            expect(table).toBeDefined();
        });
    });

    describe('getters', () => {
        test('should return the database name', () => {
            const table = new Table('database', 'table', ['column'], ['column', 'STRING']);
            expect(table.databaseName).toBe('database');
        });

        test('should return the table name', () => {
            const table = new Table('database', 'table', ['column'], ['column', 'STRING']);
            expect(table.tableName).toBe('table');
        });

        test('should return the columns', () => {
            const table = new Table('database', 'table', ['column'], ['column', 'STRING']);
            expect(table.columns).toEqual(['column']);
        });

        test('should return the primary key', () => {
            const table = new Table('database', 'table', ['column'], ['column', 'STRING']);
            expect(table.primaryKey).toEqual(['column', 'STRING']);
        });
    });
});