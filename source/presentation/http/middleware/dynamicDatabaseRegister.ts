import { CoreError } from '#/common/error/core.error.ts';
import { ErrorKeys } from '#/common/error/keys.error.ts';
import type { FastifyRequest } from '#/common/lib/required/fastify/fastify.lib.ts';
import type { DynamicDatabaseOptions } from '#/common/type/data/infrastructure/dynamicDatabaseOptions.data.ts';
import { FactoryDatabase } from '#/infrastructure/database/index.ts';

/**
 * Middleware to register a dynamic database.
 *
 * @param options - The options for the dynamic database register middleware.
 *
 * @throws ({@link CoreError}) If the database name is not specified in the header. ({@link ErrorKeys.DATABASE_NOT_SPECIFIED_IN_HEADER})
 * @throws ({@link CoreError}) If the dynamic database configuration is not set. ({@link ErrorKeys.DYNAMIC_DATABASE_CONFIG_NOT_SET})
 *
 * @returns The middleware function.
 */
export function dynamicDatabaseRegister(dynamicDatabaseConfig: DynamicDatabaseOptions | undefined) {
    return async (req: FastifyRequest): Promise<void> => {
        const databaseName = req.headers[dynamicDatabaseConfig?.headerKey ?? 'database-using'] as string;
        req.headers.databaseName = databaseName;
        if (!databaseName) throw new CoreError({
            messageKey: ErrorKeys.DATABASE_NOT_SPECIFIED_IN_HEADER,
            code: 400
        });
        if (!FactoryDatabase.has(databaseName)) {
            if (!dynamicDatabaseConfig)
                throw new CoreError({
                    messageKey: ErrorKeys.DYNAMIC_DATABASE_CONFIG_NOT_SET,
                    code: 500
                });
            await FactoryDatabase.register(
                databaseName,
                dynamicDatabaseConfig.databaseType,
                {
                    ...dynamicDatabaseConfig.databaseOptions,
                    databaseName
                }
            );
        }
    };
}
