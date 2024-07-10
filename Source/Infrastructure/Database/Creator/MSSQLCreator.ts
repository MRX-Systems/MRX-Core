import type { BasaltLogger } from '@basalt-lab/basalt-logger';

import { AbstractCreator } from './AbstractCreator.js';

/**
 * Options for the MSSQL Database
 */
export interface IMSSQLDatabaseOptions {
    /**
     * Database Name
     */
    databaseName: string;
    /**
     * The server of the database
     */
    host: string;
    /**
     * The port of the database
     */
    port: number;
    /**
     * The user of the database
     */
    user: string;
    /**
     * The password of the database
     */
    password: string;
    /**
     * Active encryption
     * default: true
     */
    encrypt?: boolean;
    /**
     * The minimum pool size of the database
     */
    poolMin?: number;
    /**
     * The maximum pool size of the database
     */
    poolMax?: number;
    /**
     * Instance of BasaltLogger allowing to log messages in one or more strategies. ({@link BasaltLogger})
     */
    log?: BasaltLogger;
}
/**
 * MSSQL Creator is a concrete creator for MSSQL Database (Factory Pattern) extending ({@link AbstractCreator})
 */
export class MSSQLCreator extends AbstractCreator {

    /**
     * Constructor of the MSSQLCreator class
     *
     * @param options - The options of the database ({@link IMSSQLDatabaseOptions})
     */
    public constructor(options: IMSSQLDatabaseOptions) {
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
