import knex, { type Knex } from 'knex';

export default knex;

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
