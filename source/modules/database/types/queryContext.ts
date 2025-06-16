export interface QueryContext {
    readonly method: string,
    readonly options: Record<string, unknown>,
    readonly timeout: number,
    readonly cancelOnTimeout: boolean,
    readonly bindings: unknown[],
    readonly sql: string,
    readonly queryContext: Record<string, unknown>,
    readonly __knexUid: string,
    readonly __knexQueryUid: string,
}