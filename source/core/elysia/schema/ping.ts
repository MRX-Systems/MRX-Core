import { t } from 'elysia';

export const pingResponse200Schema = t.Object({
    message: t.String({
        description: 'Message',
        example: 'pong'
    })
});