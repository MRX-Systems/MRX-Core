import type { Stream } from 'stream';

/**
 * Makes a stream async iterable.
 *
 * @typeParam TModel - The type of the data emitted by the stream.
 * @typeParam KStream - The type of the stream.
 * @param stream - The stream to make async iterable.
 *
 * @returns The stream as an async iterable. ({@link KStream} extends {@link Stream} & {@link AsyncIterable})
 */
export function makeStreamAsyncIterable<TModel, KStream extends Stream = Stream>(stream: KStream): KStream & AsyncIterable<TModel> {
    const asyncIterable = {
        [Symbol.asyncIterator]: (): AsyncIterator<TModel> => ({
            next(): Promise<IteratorResult<TModel>> {
                return new Promise((resolve, reject) => {
                    const cleanup = (): void => {
                        // eslint-disable-next-line @typescript-eslint/no-use-before-define
                        stream.off('data', onData);
                        // eslint-disable-next-line @typescript-eslint/no-use-before-define
                        stream.off('end', onEnd);
                        // eslint-disable-next-line @typescript-eslint/no-use-before-define
                        stream.off('error', onError);
                    };

                    const onData = (data: TModel): void => {
                        cleanup();
                        resolve({ value: data, done: false });
                    };

                    const onEnd = (): void => {
                        cleanup();
                        resolve({ value: undefined, done: true });
                    };

                    const onError = (error: Error): void => {
                        cleanup();
                        reject(error);
                    };

                    stream.on('data', onData);
                    stream.on('end', onEnd);
                    stream.on('error', onError);
                });
            }
        })
    };
    (stream as KStream & AsyncIterable<TModel>)[Symbol.asyncIterator] = asyncIterable[Symbol.asyncIterator];
    return stream as KStream & AsyncIterable<TModel>;
}
