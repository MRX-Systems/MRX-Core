import { Elysia, t } from 'elysia';
import { swagger } from '@elysiajs/swagger';

import { MSSQL, type MSSQLDatabaseOptions } from '#/core/database/mssql';
import { crudPlugin } from '#/core/elysia/plugin/crud';
import { errorPlugin } from '#/core/elysia/plugin/error';
import { advancedSearchPlugin, buildBaseSearchSchema } from '#/core/elysia/plugin/advancedSearch';
import { dynamicDatabaseSelectorPlugin } from '#/core/elysia/plugin/dynamicDatabaseSelector';
import { SingletonManager } from '@basalt-lab/basalt-helper/util';

const baseDatabaseConfig: Omit<MSSQLDatabaseOptions, 'databaseName'> = {
    host: process.env.MSSQL_HOST ?? '',
    port: 1433,
    user: process.env.MSSQL_USER ?? '',
    password: process.env.MSSQL_PASSWORD ?? '',
    encrypt: true,
    poolMin: 2,
    poolMax: 10
};

SingletonManager.register('database:auth', MSSQL, {
    ...baseDatabaseConfig,
    databaseName: 'auth_dev'
});
await SingletonManager.get<MSSQL>('database:auth').connect();

export const UserSchema = t.Object({
    username: t.String(),
    email: t.String(),
    emailConfirmed: t.Boolean(),
    password: t.String(),
    isActive: t.Boolean(),
    firstName: t.String(),
    lastName: t.String(),
    createdAt: t.Date(),
    updatedAt: t.Date(),
    isMfaEnabled: t.Boolean(),
    uuid: t.String()
});

export type UserModel = typeof UserSchema.static;


export const CustomeSchema = t.Composite([
    UserSchema,
    t.Object({
        customField: t.String()
    })
]);

const userRouter = new Elysia()
    .use(crudPlugin({
        name: 'User',
        database: {
            baseDatabaseConfig
        },
        baseSchema: UserSchema
    }));
    
    
    // .use(advancedSearchPlugin('User', CustomeSchema))

    
    // .use(dynamicDatabaseSelectorPlugin({
    //     baseDatabaseConfig
    // }))




    // .get('/', ({ advancedSearch, selectedFields }) => {
    //     const repo = SingletonManager.get<MSSQL>('database:auth').getRepository<UserModel>('User');

    //     return repo.find({
    //         advancedSearch,
    //         selectedFields
    //     });
    // }, {
    //     query: buildBaseSearchSchema(UserSchema),
    //     hasAdvancedSearch: true
    // });

const app = new Elysia()
    .use(errorPlugin)
    .use(swagger())
    .use(userRouter)
    .listen(3000, () => {
        console.log('Server is running on port 3000');
    });
