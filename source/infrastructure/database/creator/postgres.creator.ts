import type { PostgresDatabaseOptions } from '@/common/types/index.ts';
import { AbstractDatabaseCreator } from './abstractDatabase.creator.ts';

/**
 * Postgres Creator is a concrete creator for Postgres Database (Factory Pattern)
 *
 * Inherit from the File class ({@link AbstractDatabaseCreator})
 */
export class PostgresCreator extends AbstractDatabaseCreator {
    /**
     * Constructor of the PostgresCreator class
     *
     * @param options - The options for the Postgres Database. ({@link PostgresDatabaseOptions})
     */
    public constructor(options: Readonly<PostgresDatabaseOptions>) {
        super({
            dialect: {
                client: 'pg',
                debug: Boolean(options.log),
                acquireConnectionTimeout: 15000,
                connection: {
                    host: options.host,
                    port: options.port,
                    user: options.user,
                    password: options.password,
                    database: options.databaseName,
                },
                pool: {
                    min: options.poolMin ?? 2,
                    max: options.poolMax ?? 10
                }
            },
            log: options.log
        });
    }
}
