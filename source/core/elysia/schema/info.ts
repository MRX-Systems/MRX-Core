import { t } from 'elysia';

export const infoSchema = t.Object({
    message: t.String({
        description: 'Message',
        example: 'Microservice Information'
    }),
    content: t.Object({
        name: t.String({
            description: 'Name',
            example: 'MRX-API'
        }),
        version: t.String({
            description: 'Version',
            example: '1.0.0'
        }),
        description: t.String({
            description: 'Description',
            example: 'MRX-API is a REST API for the MRX project'
        })
    })
}, {
    title: 'info'
});