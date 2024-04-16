import { ErrorCommon } from '@/lib';

describe('ErrorCommon', () => {
    describe('constructor', () => {
        it('should create an instance of ErrorCommon with code and message', () => {
            const error = new ErrorCommon('TestError', 'TestMessage');
            expect(error).toBeInstanceOf(ErrorCommon);
            expect(error.code).toBe('TestError');
            expect(error.detail).toBe('TestMessage');
        });
    });
});