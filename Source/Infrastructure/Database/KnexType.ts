import type { Knex } from 'knex';

/**
 * Migration type for Knex migration. ({@link Knex.Migration})
 */
export type Migration = Knex.Migration;

/**
 * Seed type for Knex seed. ({@link Knex.Seed})
 */
export type Seed = Knex.Seed;

/**
 * Dialect of the database ({@link Knex.Config})
 */
export type Dialect = Knex.Config;

/**
 * Transaction type ({@link Knex.Transaction})
 */
export type Transaction = Knex.Transaction;

/**
 * Knex type ({@link Knex})
 */
export type { Knex };
