import { Elysia } from 'elysia';
import { existsSync } from 'fs';

import { infoSchema } from '#/core/elysia/schema/info';
import { pingSchema } from '#/core/elysia/schema/ping';

/**
 * Recursively finds the path to the nearest package.json file.
 *
 * @param path - The starting path to search for the package.json file.
 *
 * @returns The path to the package.json file if found, otherwise an empty string.
 */
const findPackageJson = (path: string): string => {
    const packageJsonPath = path + '/package.json';
    if (existsSync(packageJsonPath))
        return packageJsonPath;

    const newPath = path.split('/').slice(0, -1).join('/');
    if (newPath === '')
        return '';

    return findPackageJson(newPath);
};

/**
 * The package.json file of the current project.
 */
const packageJson = await import(findPackageJson(Bun.main));

/**
 * The `microservicePlugin` provides endpoints for microservice information and health checks.
 *
 * It includes the following endpoints:
 * - `/ping`: Checks if the microservice is alive.
 * - `/info`: Provides information about the microservice.
 */
export const microservicePlugin = new Elysia({
    name: 'microservice',
    prefix: '/microservice',
    detail: {
        tags: ['Microservice'],
        security: []
    }
})
    .model({
        info: infoSchema,
        ping: pingSchema
    })
    .get('/ping', () => ({
        message: 'pong'
    }), {
        summary: 'Ping',
        description: 'Ping the microservice to check if it is alive',
        response: {
            200: 'ping'
        }
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
        response: {
            200: 'info'
        }
    });