import { ErrorEntity } from '@/lib';

describe('ErrorEntity', (): void => {
    let errorEntity: ErrorEntity;

    beforeAll((): void => {
        errorEntity = new ErrorEntity('TestError', 'TestMessage');
    });

    describe('constructor', (): void => {
        it('should create an instance of ErrorEntity', (): void => {
            expect(errorEntity).toBeInstanceOf(ErrorEntity);
        });
    });

    describe('code', (): void => {
        it('should return the error code', (): void => {
            expect(errorEntity.code).toBe('TestError');
        });
    });

    describe('message', (): void => {
        it('should return the error message', (): void => {
            expect(errorEntity.message).toBe('TestError');
        });
    });

    describe('name', (): void => {
        it('should return the error name', (): void => {
            expect(errorEntity.name).toBe('ErrorEntity');
        });
    });

    describe('detail', (): void => {
        it('should return the error detail', (): void => {
            expect(errorEntity.detail).toBe('TestMessage');
        });
    });

    describe('uuid', (): void => {
        it('should return an unique identifier', (): void => {
            expect(errorEntity.uuidError).toBe(errorEntity.uuidError);
        });
    });
});