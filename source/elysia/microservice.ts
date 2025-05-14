import { Elysia } from 'elysia';
import { existsSync } from 'fs';
import { platform } from 'os';

import { infoResponse200Schema } from './schemas/info';
import { pingResponse200Schema } from './schemas/ping';

const findPackageJson = (path: string): string => {
    const isWin = platform() === 'win32';
    const separator = isWin ? '\\' : '/';

    if ((isWin && /^[A-Z]:\\$/i.test(path)) || (!isWin && path === '/'))
        return '';

    const packageJsonPath = path + separator + 'package.json';
    if (existsSync(packageJsonPath))
        return packageJsonPath;

    const pathParts = path.split(separator);
    if (pathParts.length <= 1)
        return '';

    const newPath = pathParts.slice(0, -1).join(separator);
    if (newPath === '')
        return '';


    return findPackageJson(newPath);
};

const packageJson = await import(findPackageJson(Bun.main));

export const microservicePlugin = new Elysia({
    name: 'microservicePlugin',
    prefix: '/microservice',
    detail: {
        tags: ['Microservice'],
        security: []
    }
})
    .model({
        infoResponse200: infoResponse200Schema,
        pingResponse200: pingResponse200Schema
    })
    .get('/ping', () => ({
        message: 'pong'
    }), {
        detail: {
            summary: 'Ping',
            description: 'Ping the microservice to check if it is alive'
        },
        response: 'pingResponse200'
    })
    .get('/info', () => ({
        message: 'Microservice Information',
        content: {
            name: packageJson.default.name,
            version: packageJson.default.version,
            description: packageJson.default.description,
            author: packageJson.default.author
        }
    }), {
        detail: {
            summary: 'Info',
            description: 'Get information about the microservice'
        },
        response: 'infoResponse200'
    })
    .as('scoped');