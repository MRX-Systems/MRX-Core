import { Elysia } from 'elysia';
import { Redis } from '#/core/store/redis';
import { rateLimitPlugin } from '#/core/elysia/plugin/ratelimit';

const redis = new Redis({
    host: 'localhost',
    port: 6379
});

const app = new Elysia()
    .use(rateLimitPlugin({
        redis,
        limit: 5, // 5 requêtes maximum
        window: 60, // par minute
        message: 'Trop de requêtes, veuillez réessayer plus tard'
    }))
    .get('/', () => 'Hello World!')
    .listen(3000);

console.log(`🦊 Server is running at ${app.server?.url}`);