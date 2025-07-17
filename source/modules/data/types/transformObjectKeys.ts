import type { CamelCaseTransformer } from '#/modules/data/transformers/camelCase';
import type { KebabCaseTransformer } from '#/modules/data/transformers/kebabCase';
import type { PascalCaseTransformer } from '#/modules/data/transformers/pascalCase';
import type { SnakeCaseTransformer } from '#/modules/data/transformers/snakeCase';
import type { TransformKeysCamelCase } from './transformKeysCamelCase';
import type { TransformKeysKebabCase } from './transformKeysKebabCase';
import type { TransformKeysPascalCase } from './transformKeysPascalCase';
import type { TransformKeysSnakeCase } from './transformKeysSnakeCase';

export type TransformObjectKeys<T, TTransformer> =
    TTransformer extends PascalCaseTransformer ? TransformKeysPascalCase<T> :
        TTransformer extends KebabCaseTransformer ? TransformKeysKebabCase<T> :
            TTransformer extends SnakeCaseTransformer ? TransformKeysSnakeCase<T> :
                TTransformer extends CamelCaseTransformer ? TransformKeysCamelCase<T> :
                    Record<string, T[keyof T]>;
