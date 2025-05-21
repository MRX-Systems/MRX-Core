import { describe, expect, mock, test } from 'bun:test';

import { TypedEventEmitter } from '#/typedEventEmitter/typedEventEmitter';

describe('TypedEventEmitter', () => {
    describe('emit and on', () => {
        test('should emit an event with no payload', (): void => {
            const emitter = new TypedEventEmitter<{
                testEvent: [];
            }>();
            const mockListener = mock();

            emitter.on('testEvent', mockListener);
            emitter.emit('testEvent');

            expect(mockListener).toHaveBeenCalledTimes(1);
            expect(mockListener).toHaveBeenCalledWith();
        });
        test('should emit an event with string payload', (): void => {
            const emitter = new TypedEventEmitter<{
                testEvent: [string];
            }>();
            const mockListener = mock();

            emitter.on('testEvent', mockListener);
            emitter.emit('testEvent', 'test payload');

            expect(mockListener).toHaveBeenCalledTimes(1);
            expect(mockListener).toHaveBeenCalledWith('test payload');
        });
        test('should emit an event with object payload', (): void => {
            const emitter = new TypedEventEmitter<{
                dataEvent: [{ id: number; value: string }];
            }>();
            const mockListener = mock();
            const testData = { id: 123, value: 'test value' };

            emitter.on('dataEvent', mockListener);
            emitter.emit('dataEvent', testData);

            expect(mockListener).toHaveBeenCalledTimes(1);
            expect(mockListener).toHaveBeenCalledWith(testData);
        });
    });

    describe('once', () => {
        test('should listen to an event only once', (): void => {
            const emitter = new TypedEventEmitter<{
                testEvent: [string];
            }>();
            const mockListener = mock();
            emitter.once('testEvent', mockListener);
            emitter.emit('testEvent', 'first emission');
            emitter.emit('testEvent', 'second emission');
            expect(mockListener).toHaveBeenCalledTimes(1);
            expect(mockListener).toHaveBeenCalledWith('first emission');
        });
    });

    describe('addListener', () => {
        test('should add a listener for an event', (): void => {
            const emitter = new TypedEventEmitter<{
                testEvent: [string];
            }>();
            const mockListener = mock();
            emitter.addListener('testEvent', mockListener);
            emitter.emit('testEvent', 'test payload');
            expect(mockListener).toHaveBeenCalledTimes(1);
            expect(mockListener).toHaveBeenCalledWith('test payload');
        });
        test('should add multiple listeners for the same event', (): void => {
            const emitter = new TypedEventEmitter<{
                testEvent: [string];
            }>();
            const mockListener1 = mock();
            const mockListener2 = mock();
            emitter.addListener('testEvent', mockListener1);
            emitter.addListener('testEvent', mockListener2);
            emitter.emit('testEvent', 'test payload');
            expect(mockListener1).toHaveBeenCalledTimes(1);
            expect(mockListener1).toHaveBeenCalledWith('test payload');
            expect(mockListener2).toHaveBeenCalledTimes(1);
            expect(mockListener2).toHaveBeenCalledWith('test payload');
        });
    });

    describe('removeListener', () => {
        test('should remove a specific listener', (): void => {
            const emitter = new TypedEventEmitter<{
                testEvent: [string];
            }>();
            const mockListener1 = mock();
            const mockListener2 = mock();
            emitter.addListener('testEvent', mockListener1);
            emitter.addListener('testEvent', mockListener2);
            emitter.removeListener('testEvent', mockListener1);
            emitter.emit('testEvent', 'test payload');
            expect(mockListener1).not.toHaveBeenCalled();
            expect(mockListener2).toHaveBeenCalledTimes(1);
            expect(mockListener2).toHaveBeenCalledWith('test payload');
        });
    });

    describe('off', () => {
        test('should remove a specific listener (alias for removeListener)', (): void => {
            const emitter = new TypedEventEmitter<{
                testEvent: [string];
            }>();
            const mockListener1 = mock();
            const mockListener2 = mock();
            emitter.addListener('testEvent', mockListener1);
            emitter.addListener('testEvent', mockListener2);
            emitter.off('testEvent', mockListener1);
            emitter.emit('testEvent', 'test payload');
            expect(mockListener1).not.toHaveBeenCalled();
            expect(mockListener2).toHaveBeenCalledTimes(1);
            expect(mockListener2).toHaveBeenCalledWith('test payload');
        });
    });

    describe('listenerCount', () => {
        test('should return the number of listeners for an event', (): void => {
            const emitter = new TypedEventEmitter<{
                testEvent: [string];
            }>();
            const mockListener1 = mock();
            const mockListener2 = mock();
            emitter.addListener('testEvent', mockListener1);
            emitter.addListener('testEvent', mockListener2);
            const count = emitter.listenerCount('testEvent');
            expect(count).toBe(2);
            emitter.removeListener('testEvent', mockListener1);
            const newCount = emitter.listenerCount('testEvent');
            expect(newCount).toBe(1);
            emitter.removeListener('testEvent', mockListener2);
            const finalCount = emitter.listenerCount('testEvent');
            expect(finalCount).toBe(0);
        });
    });

    describe('listeners', () => {
        test('should return the listeners for an event', (): void => {
            const emitter = new TypedEventEmitter<{
                testEvent: [string];
            }>();
            const mockListener1 = mock();
            const mockListener2 = mock();
            emitter.addListener('testEvent', mockListener1);
            emitter.addListener('testEvent', mockListener2);
            const listeners = emitter.listeners('testEvent');
            expect(listeners).toHaveLength(2);
            expect(listeners).toContain(mockListener1);
            expect(listeners).toContain(mockListener2);

            emitter.removeListener('testEvent', mockListener1);
            const newListeners = emitter.listeners('testEvent');
            expect(newListeners).toHaveLength(1);
            expect(newListeners).not.toContain(mockListener1);
            expect(newListeners).toContain(mockListener2);

            emitter.removeListener('testEvent', mockListener2);
            const finalListeners = emitter.listeners('testEvent');
            expect(finalListeners).toHaveLength(0);
            expect(finalListeners).not.toContain(mockListener1);
            expect(finalListeners).not.toContain(mockListener2);
        });
    });

    describe('rawListeners', () => {
        test('should return the raw listeners for an event', (): void => {
            const emitter = new TypedEventEmitter<{
                testEvent: [string];
            }>();
            const mockListener1 = mock();
            const mockListener2 = mock();
            emitter.addListener('testEvent', mockListener1);
            emitter.addListener('testEvent', mockListener2);
            const rawListeners = emitter.rawListeners('testEvent');
            expect(rawListeners).toHaveLength(2);
            expect(rawListeners).toContain(mockListener1);
            expect(rawListeners).toContain(mockListener2);
            emitter.removeListener('testEvent', mockListener1);
            const newRawListeners = emitter.rawListeners('testEvent');
            expect(newRawListeners).toHaveLength(1);
            expect(newRawListeners).not.toContain(mockListener1);
            expect(newRawListeners).toContain(mockListener2);
            emitter.removeListener('testEvent', mockListener2);
            const finalRawListeners = emitter.rawListeners('testEvent');
            expect(finalRawListeners).toHaveLength(0);
            expect(finalRawListeners).not.toContain(mockListener1);
            expect(finalRawListeners).not.toContain(mockListener2);
        });
    });

    describe('prependListener', () => {
        test('should add a listener to the beginning of the listeners array', (): void => {
            const emitter = new TypedEventEmitter<{
                testEvent: [string];
            }>();
            const mockListener1 = mock();
            const mockListener2 = mock();
            emitter.addListener('testEvent', mockListener1);
            emitter.prependListener('testEvent', mockListener2);
            const listeners = emitter.listeners('testEvent');
            expect(listeners).toHaveLength(2);
            expect(listeners[0]).toBe(mockListener2);
            expect(listeners[1]).toBe(mockListener1);
            emitter.emit('testEvent', 'test payload');
            expect(mockListener2).toHaveBeenCalledTimes(1);
            expect(mockListener2).toHaveBeenCalledWith('test payload');
            expect(mockListener1).toHaveBeenCalledTimes(1);
            expect(mockListener1).toHaveBeenCalledWith('test payload');
        });
        test('should add multiple listeners to the beginning of the listeners array', (): void => {
            const emitter = new TypedEventEmitter<{
                testEvent: [string];
            }>();
            const mockListener1 = mock();
            const mockListener2 = mock();
            const mockListener3 = mock();
            emitter.addListener('testEvent', mockListener1);
            emitter.prependListener('testEvent', mockListener2);
            emitter.prependListener('testEvent', mockListener3);
            const listeners = emitter.listeners('testEvent');
            expect(listeners).toHaveLength(3);
            expect(listeners[0]).toBe(mockListener3);
            expect(listeners[1]).toBe(mockListener2);
            expect(listeners[2]).toBe(mockListener1);
            emitter.emit('testEvent', 'test payload');
            expect(mockListener3).toHaveBeenCalledTimes(1);
            expect(mockListener3).toHaveBeenCalledWith('test payload');
            expect(mockListener2).toHaveBeenCalledTimes(1);
            expect(mockListener2).toHaveBeenCalledWith('test payload');
            expect(mockListener1).toHaveBeenCalledTimes(1);
            expect(mockListener1).toHaveBeenCalledWith('test payload');
        });
    });

    describe('prependOnceListener', () => {
        test('should add a one-time listener to the beginning of the listeners array', (): void => {
            const emitter = new TypedEventEmitter<{
                testEvent: [string];
            }>();
            const mockListener1 = mock();
            const mockListener2 = mock();
            emitter.addListener('testEvent', mockListener1);
            emitter.prependOnceListener('testEvent', mockListener2);
            const listeners = emitter.listeners('testEvent');
            expect(listeners).toHaveLength(2);
            expect(listeners[0]).toBe(mockListener2);
            expect(listeners[1]).toBe(mockListener1);
            emitter.emit('testEvent', 'test payload');
            expect(mockListener2).toHaveBeenCalledTimes(1);
            expect(mockListener2).toHaveBeenCalledWith('test payload');
            expect(mockListener1).toHaveBeenCalledTimes(1);
            expect(mockListener1).toHaveBeenCalledWith('test payload');
            emitter.emit('testEvent', 'test payload again');
            expect(mockListener2).toHaveBeenCalledTimes(1); // Should not be called again
            expect(mockListener1).toHaveBeenCalledTimes(2); // Should be called again
        });
        test('should add multiple one-time listeners to the beginning of the listeners array', (): void => {
            const emitter = new TypedEventEmitter<{
                testEvent: [string];
            }>();
            const mockListener1 = mock();
            const mockListener2 = mock();
            const mockListener3 = mock();
            emitter.addListener('testEvent', mockListener1);
            emitter.prependOnceListener('testEvent', mockListener2);
            emitter.prependOnceListener('testEvent', mockListener3);
            const listeners = emitter.listeners('testEvent');
            expect(listeners).toHaveLength(3);
            expect(listeners[0]).toBe(mockListener3);
            expect(listeners[1]).toBe(mockListener2);
            expect(listeners[2]).toBe(mockListener1);
            emitter.emit('testEvent', 'test payload');
            expect(mockListener3).toHaveBeenCalledTimes(1);
            expect(mockListener3).toHaveBeenCalledWith('test payload');
            expect(mockListener2).toHaveBeenCalledTimes(1);
            expect(mockListener2).toHaveBeenCalledWith('test payload');
            expect(mockListener1).toHaveBeenCalledTimes(1);
            expect(mockListener1).toHaveBeenCalledWith('test payload');
            emitter.emit('testEvent', 'test payload again');
            expect(mockListener3).toHaveBeenCalledTimes(1); // Should not be called again
            expect(mockListener2).toHaveBeenCalledTimes(1); // Should not be called again
            expect(mockListener1).toHaveBeenCalledTimes(2); // Should be called again
        });
    });
});

