import type { MSSQLDatabaseOptions } from '#/common/types/index.ts';
import { AbstractDatabaseCreator } from './abstractDatabase.creator.ts';

/**
 * MSSQL Creator is a concrete creator for MSSQL Database (Factory Pattern)
 *
 * Inherit from the File class ({@link AbstractDatabaseCreator})
 */
export class MSSQLCreator extends AbstractDatabaseCreator {

    /**
     * Constructor of the MSSQLCreator class
     *
     * @param options - The options of the database ({@link MSSQLDatabaseOptions})
     */
    public constructor(options: MSSQLDatabaseOptions) {
        super({
            dialect: {
                client: 'mssql',
                debug: Boolean(options.log),
                connection: {
                    database: options.databaseName,
                    server: options.host,
                    port: options.port,
                    user: options.user,
                    password: options.password,
                    connectionTimeout: 20000,
                    options: {
                        encrypt: options.encrypt ?? true,
                    } as unknown as string
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
