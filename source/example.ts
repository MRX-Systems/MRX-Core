import { MSSQL, type MSSQLDatabaseOptions } from '#/core/database/mssql';
// Importez la définition mise à jour d'AdvancedSearch
import type { AdvancedSearch } from '#/types/data/advancedSearch';

const options: MSSQLDatabaseOptions = {
    databaseName: process.env.MSSQL_DATABASE ?? '',
    host: process.env.MSSQL_HOST ?? '',
    port: 1433,
    user: process.env.MSSQL_USER ?? '',
    password: process.env.MSSQL_PASSWORD ?? '',
    encrypt: true,
    poolMin: 2,
    poolMax: 10
} as const;

const mssql = new MSSQL(options);

await mssql.connect();

interface User {
    username: string,
    email: string,
    emailConfirmed: boolean,
    password: string,
    isActive: boolean,
    firstName: string,
    lastName: string,
    createdAt: Date,
    updatedAt: Date,
    uuid: string,
}


const repo = mssql.getRepository('User');


// Recherche globale sur toutes les colonnes
const searchGlobal: AdvancedSearch<User> = { $q: 'contact' };

const userGlobal = await repo.find<User>({
    advancedSearch: searchGlobal,
    selectedFields: {
        username: true
    }
});

console.log('Résultat de la recherche globale :', userGlobal);

// Recherche sur une colonne spécifique

const userCibleTest = await repo.find<User>({
    advancedSearch: {
        $q: {
            username: 'test'
        }
    },
    selectedFields: { email: true, username: true }
});

console.log('Résultat de la recherche de test :', userCibleTest);