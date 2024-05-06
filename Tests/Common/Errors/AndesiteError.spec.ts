import { AndesiteError } from '../../../Source/Common/Error';

describe('AndesiteError', (): void => {
    let andesiteError: AndesiteError;

    beforeAll((): void => {
        andesiteError = new AndesiteError({
            messageKey: 'TestKey',
            code: 500,
            detail: 'TestDetail'
        });
    });

    describe('constructor', (): void => {
        it('should create an instance of AndesiteError', (): void => {
            expect(andesiteError).toBeInstanceOf(AndesiteError);
        });
    });


    describe('uuidError', (): void => {
        it('should return an unique identifier', (): void => {
            expect(andesiteError.uuidError).toBe(andesiteError.uuidError);
        });
    });

    describe('date', (): void => {
        it('should return the date when the error was created', (): void => {
            expect(andesiteError.date).toBeInstanceOf(Date);
        });
    });

    describe('code', (): void => {
        it('should return the error code', (): void => {
            expect(andesiteError.code).toBe(500);
        });
    });

    describe('detail', (): void => {
        it('should return the error detail', (): void => {
            expect(andesiteError.detail).toBe('TestDetail');
        });
    });

    describe('message', (): void => {
        it('should return the error message', (): void => {
            expect(andesiteError.message).toBe('TestKey');
        });
    });

});