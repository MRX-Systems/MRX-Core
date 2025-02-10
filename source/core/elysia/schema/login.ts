import { t } from 'elysia';

const email = t.String({
    format: 'email',
    error: 'Invalid email :c',
    description: 'The email of the user',
    example: 'example@eg.com'
});

const password = t.String({
    pattern: '^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,32}$',
    minLength: 8,
    maxLength: 32,
    error: 'The password must contain at least one uppercase letter, one lowercase letter, one number, one special character, and be between 8 and 32 characters long'
});

export const loginBodySchema = t.Object({
    email,
    password
});

export const loginResponse200Schema = t.Object({
    message: t.String({
        description: 'Indicates that the login was successful or that the MFA token was sent to the user',
        examples: ['Login success', 'MFA is required for this user and the token was sent to the user']
    })
});

export const loginResponse400Schema = t.Object({
    key: t.String({
        description: 'The key of the error',
        example: 'core.error.elysia.wrong_email_or_password'
    }),
    message: t.String({
        description: 'The message of the error',
        example: 'Invalid email or password'
    })
});

export const loginMfaBodySchema = t.Object({
    token: t.String({
        description: 'The MFA token',
        example: '617af89d19fc3445'
    }),
    email
});

export const loginMfaResponse200Schema = t.Object({
    message: t.String({
        description: 'Indicates that the MFA was successful and the login was successful',
        example: 'MFA success and login success'
    })
});