export interface QueryContext {
    method: string,
    options: Record<string, unknown>,
    timeout: number,
    cancelOnTimeout: boolean,
    bindings: unknown[],
    sql: string,
    queryContext: Record<string, unknown>,
    __knexUid: string,
    __knexQueryUid: string,
}