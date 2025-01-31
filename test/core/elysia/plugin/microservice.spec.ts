import { describe, expect, test } from 'bun:test';
import Elysia from 'elysia';

import { microservicePlugin } from '#/core/elysia/plugin/microservice';

describe('Microservice Plugin', () => {
    test('ping', async () => {
        const app = new Elysia()
            .use(microservicePlugin);

        const res = await app
            .handle(new Request('http://localhost/microservice/ping'))
            .then((res) => res.json());

        expect(res).toEqual({
            message: 'pong'
        });
    });

    test('info', async () => {
        const app = new Elysia()
            .use(microservicePlugin);

        const res = await app
            .handle(new Request('http://localhost/microservice/info'))
            .then((res) => res.json());

        expect(res).toEqual({
            message: 'Microservice Information',
            content: {
                author: 'Ruby',
                description: 'Andesite - Core provides a set of tools to help you build a microservice',
                name: '@andesite-lab/andesite-core',
                version: '1.43.2'
            }
        });
    });
});
