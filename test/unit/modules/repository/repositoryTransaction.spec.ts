import { describe, expect, test } from 'bun:test';
import type { Knex } from 'knex';

import { Table } from '#/modules/database/table';
import { Repository } from '#/modules/repository/repository';
import type { Transaction } from '#/modules/repository/types/transaction';

const mockTable = new Table(
	'testDatabase',
	'testTable',
	['id', 'name'],
	['id', 'NUMBER']
);

const mockTransaction = {} as Transaction;

interface TestData {
	id: number;
	name: string;
}

describe('Repository Transaction Support', () => {
	test('should apply transaction when provided in options', () => {
		// Mock query builder with minimal required methods
		let transactingCalled = false;
		let transactionValue: any = null;

		const mockQueryBuilder = {
			select: () => mockQueryBuilder,
			where: () => mockQueryBuilder,
			orderBy: () => mockQueryBuilder,
			transacting: (trx: any) => {
				transactingCalled = true;
				transactionValue = trx;
				return mockQueryBuilder;
			},
			_method: 'select'  // Simulate Knex internal property
		};

		const mockKnex = (() => mockQueryBuilder) as unknown as Knex;
		const repository = new Repository<TestData>(mockKnex, mockTable);

		// Use reflection to access the protected method
		const applyQueryOptions = (repository as any)._applyQueryOptions;
		
		applyQueryOptions.call(repository, mockQueryBuilder, {
			transaction: mockTransaction
		});

		expect(transactingCalled).toBe(true);
		expect(transactionValue).toBe(mockTransaction);
	});

	test('should not call transacting when transaction is not provided', () => {
		// Mock query builder with minimal required methods
		let transactingCalled = false;

		const mockQueryBuilder = {
			select: () => mockQueryBuilder,
			where: () => mockQueryBuilder,
			orderBy: () => mockQueryBuilder,
			transacting: () => {
				transactingCalled = true;
				return mockQueryBuilder;
			},
			_method: 'select'  // Simulate Knex internal property
		};

		const mockKnex = (() => mockQueryBuilder) as unknown as Knex;
		const repository = new Repository<TestData>(mockKnex, mockTable);

		// Use reflection to access the protected method
		const applyQueryOptions = (repository as any)._applyQueryOptions;
		
		applyQueryOptions.call(repository, mockQueryBuilder, {});

		expect(transactingCalled).toBe(false);
	});

	test('should not call transacting when options is undefined', () => {
		// Mock query builder with minimal required methods
		let transactingCalled = false;

		const mockQueryBuilder = {
			select: () => mockQueryBuilder,
			where: () => mockQueryBuilder,
			orderBy: () => mockQueryBuilder,
			transacting: () => {
				transactingCalled = true;
				return mockQueryBuilder;
			},
			_method: 'select'  // Simulate Knex internal property
		};

		const mockKnex = (() => mockQueryBuilder) as unknown as Knex;
		const repository = new Repository<TestData>(mockKnex, mockTable);

		// Use reflection to access the protected method
		const applyQueryOptions = (repository as any)._applyQueryOptions;
		
		applyQueryOptions.call(repository, mockQueryBuilder, undefined);

		expect(transactingCalled).toBe(false);
	});

	test('count method should apply transaction when provided', () => {
		let transactingCalled = false;
		let transactionValue: any = null;

		const mockQueryBuilder = {
			count: () => mockQueryBuilder,
			transacting: (trx: any) => {
				transactingCalled = true;
				transactionValue = trx;
				return mockQueryBuilder;
			}
		};

		const mockKnex = (() => mockQueryBuilder) as unknown as Knex;
		const repository = new Repository<TestData>(mockKnex, mockTable);

		// Mock the _executeQuery method to prevent actual execution
		const originalExecuteQuery = (repository as any)._executeQuery;
		(repository as any)._executeQuery = async () => [{ count: 5 }];

		// Call count method with transaction
		repository.count({
			transaction: mockTransaction
		});

		expect(transactingCalled).toBe(true);
		expect(transactionValue).toBe(mockTransaction);

		// Restore original method
		(repository as any)._executeQuery = originalExecuteQuery;
	});

	test('count method should not apply transaction when not provided', () => {
		let transactingCalled = false;

		const mockQueryBuilder = {
			count: () => mockQueryBuilder,
			transacting: () => {
				transactingCalled = true;
				return mockQueryBuilder;
			}
		};

		const mockKnex = (() => mockQueryBuilder) as unknown as Knex;
		const repository = new Repository<TestData>(mockKnex, mockTable);

		// Mock the _executeQuery method to prevent actual execution
		const originalExecuteQuery = (repository as any)._executeQuery;
		(repository as any)._executeQuery = async () => [{ count: 5 }];

		// Call count method without transaction
		repository.count({});

		expect(transactingCalled).toBe(false);

		// Restore original method
		(repository as any)._executeQuery = originalExecuteQuery;
	});
});