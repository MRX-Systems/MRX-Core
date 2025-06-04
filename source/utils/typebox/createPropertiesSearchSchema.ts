import { TypeGuard, type TArray, type TObject, type TSchema, type TUnion } from '@sinclair/typebox';
import { t } from 'elysia/type-system';

/**
 * Creates a where clause schema with appropriate operators based on the property type.
 * Boolean properties get fewer operators than other types.
 *
 * @param schema - The base property schema to create where clauses for. ({@link TSchema})
 *
 * @returns A TypeBox object schema with where clause operators
 */
const _createWhereClauseSchema = <TInferedSchema extends TSchema>(schema: TInferedSchema) => {
    // Define basic operators that apply to all types
    const operators: Record<string, TSchema> = {
        $eq: ({
            ...schema,
            description: `Equal to the specified value of type ${schema.type}`,
            examples: [],
            example: undefined
        }),
        $neq: ({
            ...schema,
            description: `Not equal to the specified value of type ${schema.type}`,
            examples: [],
            example: undefined
        }),
        $isNull: t.Boolean({
            description: 'Check if the value is null',
            examples: [true, false]
        })
    };

    // For string, number, date only
    if (
        TypeGuard.IsString(schema)
        || TypeGuard.IsNumber(schema)
        || TypeGuard.IsInteger(schema)
        || TypeGuard.IsDate(schema)
    ) {
        operators.$in = t.Array(schema, {
            description: `Array of values to match against the value of type ${schema.type}`,
            minItems: 1,
            uniqueItems: true
        });
        operators.$nin = t.Array(schema, {
            description: `Array of values to exclude from matching the value of type ${schema.type}`,
            minItems: 1,
            uniqueItems: true
        });
        operators.$like = t.String({
            description: `Pattern to match against the string value of type ${schema.type}. Supports SQL-like wildcards (%)`
        });
        operators.$nlike = t.String({
            description: `Pattern to exclude from matching the string value of type ${schema.type}. Supports SQL-like wildcards (%)`
        });
    }

    // For number, date only
    if (TypeGuard.IsNumber(schema)
        || TypeGuard.IsInteger(schema)
        || TypeGuard.IsDate(schema)
    ) {
        operators.$lt = ({ ...schema, description: `Less than the specified value of type ${schema.type}`, examples: [], example: undefined });
        operators.$lte = ({ ...schema, description: `Less than or equal to the specified value of type ${schema.type}`, examples: [], example: undefined });
        operators.$gt = ({ ...schema, description: `Greater than the specified value of type ${schema.type}`, examples: [], example: undefined });
        operators.$gte = ({ ...schema, description: `Greater than or equal to the specified value of type ${schema.type}`, examples: [], example: undefined });
        operators.$between = t.Tuple([schema, schema], {
            description: `Between two values for type ${schema.type}`
        });
        operators.$nbetween = t.Tuple([schema, schema], {
            description: `Not between two values for type ${schema.type}`
        });
    }

    return t.Partial(t.Object(operators));
};


/**
 * Creates property schemas that support multiple query formats:
 * - Direct value matching
 * - Array of values for OR operations
 * - Where clause objects for complex filtering
 * - Array of where clause objects for multiple conditions
 *
 * @param schema - The base object schema to create property schemas for. ({@link TObject})
 *
 * @returns Record of property schemas with union types
 */
export const createPropertiesSearchSchema = <TInferedObject extends TObject>(schema: TInferedObject) => {
    const { properties } = schema;
    const clauseSchema = {} as Record<
        string,
        TArray<
            TUnion<[
                ReturnType<typeof _createWhereClauseSchema>,
                TSchema
            ]>>
    >;

    for (const [key, propertySchema] of Object.entries(properties))
        clauseSchema[key] = t.Array(t.Union([
            _createWhereClauseSchema(propertySchema), // Array of where clauses: [{ $gt: 18 }, { $lt: 65 }]
            propertySchema // Array of values: ["john", "jane"]
        ]));

    return clauseSchema;
};