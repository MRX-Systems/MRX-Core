import { describe, expect, test } from 'bun:test';
import { Readable } from 'stream';

import { makeStreamAsyncIterable } from '#/utils/stream';

describe('makeStreamAsyncIterable', () => {
    test('should make a stream async iterable', async () => {
        const stream = new Readable({
            read(): void {
                this.push('data');
                this.push(null);
            }
        });
        const asyncIterable = makeStreamAsyncIterable(stream);

        const iterator = asyncIterable[Symbol.asyncIterator]();
        const result = await iterator.next();
        expect(result).toEqual({ value: Buffer.from('data'), done: false });
    });
});