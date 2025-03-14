import { describe, expect, test } from 'bun:test';
import Elysia from 'elysia';

import { author, description, name, version } from '#/root/package.json';
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
                author,
                description,
                name,
                version
            }
        });
    });
});
