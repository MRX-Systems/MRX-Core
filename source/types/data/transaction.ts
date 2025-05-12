import type { Knex } from 'knex';

/**
 * Represents a database transaction object provided by Knex.
 *
 * This type is used to perform a series of database operations as a single unit of work,
 * ensuring that either all operations succeed or none are applied.
 *
 * @see {@link https://knexjs.org/ Knex documentation} for more details on transaction usage. ({@link Knex.Transaction})
 */
export type Transaction = Knex.Transaction;