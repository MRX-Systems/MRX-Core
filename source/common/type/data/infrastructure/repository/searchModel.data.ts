import type { WhereClause } from './whereClause.data.ts';

/**
 * Defines a search model using either plain partials of the model T or a where clause filter for more dynamic querying.
 */
export type SearchModel<T> = {
    [P in keyof T]?: T[P] | Partial<WhereClause>;
} & Record<string, string | number | boolean | Date | Partial<WhereClause>>;
