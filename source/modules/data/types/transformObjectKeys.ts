import type { CamelCaseTransformer } from '#/data/transformers/camelCase';
import type { KebabCaseTransformer } from '#/data/transformers/kebabCase';
import type { PascalCaseTransformer } from '#/data/transformers/pascalCase';
import type { SnakeCaseTransformer } from '#/data/transformers/snakeCase';
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
