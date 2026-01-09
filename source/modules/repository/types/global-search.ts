import type { SelectedFields } from './selected-fields';

/**
 * Defines a global search filter that can search across one or multiple fields.
 *
 * @template TModel - The model type to search against.
 */
export type GlobalSearch<TModel>
	= | string
		| number
		| {
			/** Fields to search in. */
			selectedFields: SelectedFields<TModel>;
			/** The value to search for. */
			value: string | number;
		};