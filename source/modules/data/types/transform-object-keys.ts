import type { CamelCaseTransformer } from '#/modules/data/transformers/camel-case';
import type { KebabCaseTransformer } from '#/modules/data/transformers/kebab-case';
import type { PascalCaseTransformer } from '#/modules/data/transformers/pascal-case';
import type { SnakeCaseTransformer } from '#/modules/data/transformers/snake-case';
import type { TransformKeysCamelCase } from './transform-keys-camel-case';
import type { TransformKeysKebabCase } from './transform-keys-kebab-case';
import type { TransformKeysPascalCase } from './transform-keys-pascal-case';
import type { TransformKeysSnakeCase } from './transform-keys-snake-case';

export type TransformObjectKeys<T, TTransformer>
	= TTransformer extends PascalCaseTransformer ? TransformKeysPascalCase<T>
		: TTransformer extends KebabCaseTransformer ? TransformKeysKebabCase<T>
			: TTransformer extends SnakeCaseTransformer ? TransformKeysSnakeCase<T>
				: TTransformer extends CamelCaseTransformer ? TransformKeysCamelCase<T>
					: Record<string, T[keyof T]>;
