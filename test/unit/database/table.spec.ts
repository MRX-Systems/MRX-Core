import { describe, expect, test } from 'bun:test';

import { Table } from '#/database/table';

describe('Table', () => {
    describe('constructor', () => {
        test('should create a table instance', () => {
            const table = new Table('database', 'table', ['field'], ['field', 'STRING']);
            expect(table).toBeDefined();
        });
    });

    describe('getters', () => {
        test('should return the database name', () => {
            const table = new Table('database', 'table', ['field'], ['field', 'STRING']);
            expect(table.databaseName).toBe('database');
        });

        test('should return the table name', () => {
            const table = new Table('database', 'table', ['field'], ['field', 'STRING']);
            expect(table.name).toBe('table');
        });

        test('should return the fields', () => {
            const table = new Table('database', 'table', ['field'], ['field', 'STRING']);
            expect(table.fields).toEqual(['field']);
        });

        test('should return the primary key', () => {
            const table = new Table('database', 'table', ['field'], ['field', 'STRING']);
            expect(table.primaryKey).toEqual(['field', 'STRING']);
        });
    });
});