import type { TComposite, TObject } from '@sinclair/typebox/type';

import type { PropertiesSchema } from './properties-schema';
import type { QSchema } from './q-schema';

export type FiltersSchema<TSourceSchema extends TObject> = TComposite<[
	TObject<{
		$q: QSchema<TSourceSchema>;
	}>,
	PropertiesSchema<TSourceSchema>
]>;