import { t } from 'elysia';

export const infoResponse200Schema = t.Object({
    message: t.String({
        description: 'Message',
        example: 'Microservice Information'
    }),
    content: t.Object({
        author: t.String({
            description: 'Author',
            example: 'Ruby'
        }),
        name: t.String({
            description: 'Name',
            example: 'API'
        }),
        version: t.String({
            description: 'Version',
            example: '1.0.0'
        }),
        description: t.String({
            description: 'Description',
            example: 'Is a microservice that provides a RESTful API for the application.'
        })
    })
});