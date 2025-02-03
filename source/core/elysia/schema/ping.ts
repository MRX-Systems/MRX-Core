import { t } from 'elysia';

export const pingSchema = t.Object({
    message: t.String({
        description: 'Message',
        example: 'pong'
    })
}, {
    title: 'ping'
});