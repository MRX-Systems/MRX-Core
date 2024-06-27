import * as tedious from 'tedious';
import * as tarn from 'tarn';
import { MssqlDialect, type TediousConnection } from 'kysely';

import { AbstractCreator } from './AbstractCreator.js';

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
     * The type of the authentication
     */
    type:   | 'default'
            | 'ntlm'
            | 'azure-active-directory-password'
            | 'azure-active-directory-access-token'
            | 'azure-active-directory-msi-vm'
            | 'azure-active-directory-msi-app-service'
            | 'azure-active-directory-service-principal-secret';
    /**
     * The pool size min of the database
     */
    poolSizeMax?: number;
    /**
     * Activate the log
     */
    log: boolean;
}
/**
 * MSSQL Creator is a concrete creator for MSSQL Database (Factory Pattern)
 *
 * @typeparam T - The database schema types
 */
export class MSSQLCreator<T> extends AbstractCreator<T> {

    /**
     * Constructor of the MSSQLCreator class
     *
     * @param options - The options of the database ({@link IMSSQLDatabaseOptions})
     */
    public constructor(options: IMSSQLDatabaseOptions) {
        super(new MssqlDialect({
            tarn: {
                ...tarn,
                options: {
                    min: 0,
                    max: options.poolSizeMax ?? 10
                }
            },
            tedious: {
                ...tedious,
                connectionFactory: (): TediousConnection | Promise<TediousConnection> => new tedious.Connection({
                    server: options.host,
                    authentication: {
                        type: options.type,
                        options: {
                            userName: options.user,
                            password: options.password
                        }
                    },
                    options: {
                        appName: 'Andesite-Core',
                        database: 'your_database',
                        encrypt: true
                    },
                }) as TediousConnection,
            }
        }));
    }
}
