/* eslint-disable max-classes-per-file */
import { afterEach, describe, expect, test } from 'bun:test';

import { SingletonManager } from '#/singletonManager/singletonManager';

class ExampleSingleton {
    public sayHello(): void {
        console.log('Hello!');
    }
}

class ExampleSingleton2 {
    private readonly _name: string;

    public constructor(name: string) {
        this._name = name;
    }

    public get name(): string {
        return this._name;
    }
}

class ExampleSingleton3 {
    private readonly _name: string;

    private readonly _age: number;

    public constructor(name: string, age: number) {
        this._name = name;
        this._age = age;
    }

    public get age(): number {
        return this._age;
    }

    public get name(): string {
        return this._name;
    }
}

describe('SingletonManager', () => {
    describe('register', () => {
        afterEach(() => {
            if (SingletonManager.has('ExampleSingleton'))
                SingletonManager.unregister('ExampleSingleton');
            if (SingletonManager.has('ExampleSingleton2'))
                SingletonManager.unregister('ExampleSingleton2');
            if (SingletonManager.has('ExampleSingleton3'))
                SingletonManager.unregister('ExampleSingleton3');
        });
        test('should register a class constructor', () => {
            SingletonManager.register('ExampleSingleton', ExampleSingleton);
            expect(SingletonManager.get('ExampleSingleton')).toBeDefined();
        });

        test('should register a class constructor with arguments', () => {
            SingletonManager.register('ExampleSingleton2', ExampleSingleton2, 'John');
            SingletonManager.register('ExampleSingleton3', ExampleSingleton3, 'John', 25);

            const example = SingletonManager.get<ExampleSingleton2>('ExampleSingleton2');
            const example2 = SingletonManager.get<ExampleSingleton3>('ExampleSingleton3');
            expect(example.name).toBe('John');
            expect(example2.name).toBe('John');
            expect(example2.age).toBe(25);
        });

        test('should throw an error when class constructor is not registered', () => {
            expect(() => SingletonManager.get('ExampleSingleton4')).toThrow('Class constructor is not registered.');
        });

        test('should throw an error when class constructor is already registered', () => {
            SingletonManager.register('ExampleSingleton', ExampleSingleton);
            expect(
                () => SingletonManager.register('ExampleSingleton', ExampleSingleton)
            ).toThrow('Class constructor is already registered.');
        });
    });

    describe('unregister', () => {
        test('should unregister a class constructor', () => {
            SingletonManager.register('ExampleSingleton', ExampleSingleton);
            SingletonManager.unregister('ExampleSingleton');
            expect(SingletonManager.has('ExampleSingleton')).toBe(false);
        });

        test('should throw an error when class constructor is not registered', () => {
            expect(() => {
                SingletonManager.unregister('ExampleSingleton');
            }).toThrow('Class constructor is not registered.');
        });
    });

    describe('get', () => {
        afterEach(() => {
            if (SingletonManager.has('ExampleSingleton'))
                SingletonManager.unregister('ExampleSingleton');
        });
        test('should return a class constructor', () => {
            SingletonManager.register('ExampleSingleton', ExampleSingleton);
            expect(SingletonManager.get('ExampleSingleton')).toBeDefined();
        });
    });

    describe('has', () => {
        afterEach(() => {
            if (SingletonManager.has('ExampleSingleton'))
                SingletonManager.unregister('ExampleSingleton');
        });
        test('should have a class constructor', () => {
            SingletonManager.register('ExampleSingleton', ExampleSingleton);
            expect(SingletonManager.has('ExampleSingleton')).toBe(true);
        });
    });
});