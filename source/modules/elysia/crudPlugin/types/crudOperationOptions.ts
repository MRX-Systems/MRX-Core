export type CrudOperationOptions = true | {
    readonly path?: string;
    readonly method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
};
