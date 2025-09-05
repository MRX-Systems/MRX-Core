/* eslint-disable max-classes-per-file */
import { afterEach, beforeEach, describe, expect, test } from 'bun:test';

import { SINGLETON_MANAGER_ERROR_KEYS } from '#/modules/singleton-manager/enums/singleton-manager-error-keys';
import { SingletonManager } from '#/modules/singleton-manager/singleton-manager';

/**
* Test singleton class without constructor parameters
*/
class ExampleSingleton {
	private static _instanceCount = 0;

	private readonly _instanceId: number;

	public constructor() {
		ExampleSingleton._instanceCount++;
		this._instanceId = ExampleSingleton._instanceCount;
	}

	public get instanceId(): number {
		return this._instanceId;
	}

	public static get instanceCount(): number {
		return ExampleSingleton._instanceCount;
	}

	public static resetCount(): void {
		ExampleSingleton._instanceCount = 0;
	}

	public sayHello(): void {
		console.log(`Hello from instance ${this._instanceId}!`);
	}
}

/**
* Test singleton class with one constructor parameter
*/
class ExampleSingleton2 {
	private readonly _name: string;

	public constructor(name: string) {
		this._name = name;
	}

	public get name(): string {
		return this._name;
	}
}

/**
* Test singleton class with multiple constructor parameters
*/
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

/**
* Test singleton class with complex constructor behavior
*/
class ExampleSingleton4 {
	private readonly _config: Record<string, unknown>;

	public constructor(config: Record<string, unknown> = {}) {
		this._config = { ...config, initialized: true };
	}

	public get config(): Record<string, unknown> {
		return this._config;
	}
}

/**
* Test constants for singleton names
*/
const singletonNames = {
	EXAMPLE: 'ExampleSingleton',
	EXAMPLE_2: 'ExampleSingleton2',
	EXAMPLE_3: 'ExampleSingleton3',
	EXAMPLE_4: 'ExampleSingleton4',
	NON_EXISTENT: 'NonExistentSingleton'
} as const;

/**
* Helper function to clean up all registered singletons
*/
function cleanupSingletons(): void {
	for (const name of Object.values(singletonNames))
		if (SingletonManager.has(name))
			SingletonManager.unregister(name);

	// Reset instance counter for ExampleSingleton
	ExampleSingleton.resetCount();
}

describe('SingletonManager', () => {
	beforeEach(() => {
		cleanupSingletons();
	});

	afterEach(() => {
		cleanupSingletons();
	});

	describe('Singleton Pattern Behavior', () => {
		test('should return the same SingletonManager instance', () => {
			const manager1 = SingletonManager;
			const manager2 = SingletonManager;

			expect(manager1).toBe(manager2);
			expect(manager1).toStrictEqual(manager2);
		});
	});

	describe('register', () => {
		test('should register a class constructor without parameters', () => {
			SingletonManager.register(singletonNames.EXAMPLE, ExampleSingleton);

			expect(SingletonManager.has(singletonNames.EXAMPLE)).toBe(true);

			const instance = SingletonManager.get<ExampleSingleton>(singletonNames.EXAMPLE);
			expect(instance).toBeDefined();
			expect(instance).toBeInstanceOf(ExampleSingleton);
		});

		test('should register a class constructor with single parameter', () => {
			const expectedName = 'John';

			SingletonManager.register(singletonNames.EXAMPLE_2, ExampleSingleton2, expectedName);

			expect(SingletonManager.has(singletonNames.EXAMPLE_2)).toBe(true);

			const instance = SingletonManager.get<ExampleSingleton2>(singletonNames.EXAMPLE_2);
			expect(instance).toBeDefined();
			expect(instance).toBeInstanceOf(ExampleSingleton2);
			expect(instance.name).toBe(expectedName);
		});

		test('should register a class constructor with multiple parameters', () => {
			const expectedName = 'Jane';
			const expectedAge = 30;

			SingletonManager.register(singletonNames.EXAMPLE_3, ExampleSingleton3, expectedName, expectedAge);

			expect(SingletonManager.has(singletonNames.EXAMPLE_3)).toBe(true);

			const instance = SingletonManager.get<ExampleSingleton3>(singletonNames.EXAMPLE_3);
			expect(instance).toBeDefined();
			expect(instance).toBeInstanceOf(ExampleSingleton3);
			expect(instance.name).toBe(expectedName);
			expect(instance.age).toBe(expectedAge);
		});

		test('should register a class with complex constructor parameters', () => {
			const expectedConfig = { database: 'test', port: 3000 };

			SingletonManager.register(singletonNames.EXAMPLE_4, ExampleSingleton4, expectedConfig);

			const instance = SingletonManager.get<ExampleSingleton4>(singletonNames.EXAMPLE_4);
			expect(instance.config).toEqual({ ...expectedConfig, initialized: true });
		});

		test('should register a class with default constructor parameters', () => {
			SingletonManager.register(singletonNames.EXAMPLE_4, ExampleSingleton4);

			const instance = SingletonManager.get<ExampleSingleton4>(singletonNames.EXAMPLE_4);
			expect(instance.config).toEqual({ initialized: true });
		});

		test('should throw an error when trying to register an already registered class', () => {
			SingletonManager.register(singletonNames.EXAMPLE, ExampleSingleton);

			expect(() => {
				SingletonManager.register(singletonNames.EXAMPLE, ExampleSingleton);
			}).toThrow(SINGLETON_MANAGER_ERROR_KEYS.CLASS_CONSTRUCTOR_ALREADY_REGISTERED);
		});

		test('should create only one instance per registered class', () => {
			SingletonManager.register(singletonNames.EXAMPLE, ExampleSingleton);

			expect(ExampleSingleton.instanceCount).toBe(1);

			const instance1 = SingletonManager.get<ExampleSingleton>(singletonNames.EXAMPLE);
			const instance2 = SingletonManager.get<ExampleSingleton>(singletonNames.EXAMPLE);

			// Should not create additional instances
			expect(ExampleSingleton.instanceCount).toBe(1);
			expect(instance1).toBe(instance2);
			expect(instance1.instanceId).toBe(instance2.instanceId);
		});

		test('should allow registering multiple different classes', () => {
			SingletonManager.register(singletonNames.EXAMPLE, ExampleSingleton);
			SingletonManager.register(singletonNames.EXAMPLE_2, ExampleSingleton2, 'Test');
			SingletonManager.register(singletonNames.EXAMPLE_3, ExampleSingleton3, 'Test', 25);

			expect(SingletonManager.has(singletonNames.EXAMPLE)).toBe(true);
			expect(SingletonManager.has(singletonNames.EXAMPLE_2)).toBe(true);
			expect(SingletonManager.has(singletonNames.EXAMPLE_3)).toBe(true);
		});
	});

	describe('unregister', () => {
		test('should unregister a registered class', () => {
			SingletonManager.register(singletonNames.EXAMPLE, ExampleSingleton);
			expect(SingletonManager.has(singletonNames.EXAMPLE)).toBe(true);

			SingletonManager.unregister(singletonNames.EXAMPLE);
			expect(SingletonManager.has(singletonNames.EXAMPLE)).toBe(false);
		});

		test('should throw an error when trying to unregister a non-registered class', () => {
			expect(() => {
				SingletonManager.unregister(singletonNames.NON_EXISTENT);
			}).toThrow(SINGLETON_MANAGER_ERROR_KEYS.CLASS_CONSTRUCTOR_NOT_REGISTERED);
		});

		test('should not affect other registered classes when unregistering one', () => {
			SingletonManager.register(singletonNames.EXAMPLE, ExampleSingleton);
			SingletonManager.register(singletonNames.EXAMPLE_2, ExampleSingleton2, 'Test');

			SingletonManager.unregister(singletonNames.EXAMPLE);

			expect(SingletonManager.has(singletonNames.EXAMPLE)).toBe(false);
			expect(SingletonManager.has(singletonNames.EXAMPLE_2)).toBe(true);

			const instance2 = SingletonManager.get<ExampleSingleton2>(singletonNames.EXAMPLE_2);
			expect(instance2.name).toBe('Test');
		});

		test('should allow re-registration after unregistering', () => {
			SingletonManager.register(singletonNames.EXAMPLE, ExampleSingleton);
			const firstInstance = SingletonManager.get<ExampleSingleton>(singletonNames.EXAMPLE);
			const firstInstanceId = firstInstance.instanceId;

			SingletonManager.unregister(singletonNames.EXAMPLE);
			SingletonManager.register(singletonNames.EXAMPLE, ExampleSingleton);

			const secondInstance = SingletonManager.get<ExampleSingleton>(singletonNames.EXAMPLE);

			// Should be a new instance with a different ID
			expect(secondInstance.instanceId).not.toBe(firstInstanceId);
			expect(secondInstance).not.toBe(firstInstance);
		});
	});

	describe('get', () => {
		test('should return the registered singleton instance', () => {
			SingletonManager.register(singletonNames.EXAMPLE, ExampleSingleton);

			const instance = SingletonManager.get<ExampleSingleton>(singletonNames.EXAMPLE);

			expect(instance).toBeDefined();
			expect(instance).toBeInstanceOf(ExampleSingleton);
		});

		test('should return the same instance on multiple calls', () => {
			SingletonManager.register(singletonNames.EXAMPLE_2, ExampleSingleton2, 'TestUser');

			const instance1 = SingletonManager.get<ExampleSingleton2>(singletonNames.EXAMPLE_2);
			const instance2 = SingletonManager.get<ExampleSingleton2>(singletonNames.EXAMPLE_2);
			const instance3 = SingletonManager.get<ExampleSingleton2>(singletonNames.EXAMPLE_2);

			expect(instance1).toBe(instance2);
			expect(instance2).toBe(instance3);
			expect(instance1.name).toBe('TestUser');
		});

		test('should throw an error when trying to get a non-registered class', () => {
			expect(() => {
				SingletonManager.get(singletonNames.NON_EXISTENT);
			}).toThrow(SINGLETON_MANAGER_ERROR_KEYS.CLASS_CONSTRUCTOR_NOT_REGISTERED);
		});

		test('should throw an error after unregistering a class', () => {
			SingletonManager.register(singletonNames.EXAMPLE, ExampleSingleton);
			SingletonManager.unregister(singletonNames.EXAMPLE);

			expect(() => {
				SingletonManager.get(singletonNames.EXAMPLE);
			}).toThrow(SINGLETON_MANAGER_ERROR_KEYS.CLASS_CONSTRUCTOR_NOT_REGISTERED);
		});
	});

	describe('has', () => {
		test('should return true for registered classes', () => {
			SingletonManager.register(singletonNames.EXAMPLE, ExampleSingleton);

			expect(SingletonManager.has(singletonNames.EXAMPLE)).toBe(true);
		});

		test('should return false for non-registered classes', () => {
			expect(SingletonManager.has(singletonNames.NON_EXISTENT)).toBe(false);
		});

		test('should return false after unregistering a class', () => {
			SingletonManager.register(singletonNames.EXAMPLE, ExampleSingleton);
			expect(SingletonManager.has(singletonNames.EXAMPLE)).toBe(true);

			SingletonManager.unregister(singletonNames.EXAMPLE);
			expect(SingletonManager.has(singletonNames.EXAMPLE)).toBe(false);
		});

		test('should correctly track multiple registrations', () => {
			expect(SingletonManager.has(singletonNames.EXAMPLE)).toBe(false);
			expect(SingletonManager.has(singletonNames.EXAMPLE_2)).toBe(false);

			SingletonManager.register(singletonNames.EXAMPLE, ExampleSingleton);
			expect(SingletonManager.has(singletonNames.EXAMPLE)).toBe(true);
			expect(SingletonManager.has(singletonNames.EXAMPLE_2)).toBe(false);

			SingletonManager.register(singletonNames.EXAMPLE_2, ExampleSingleton2, 'Test');
			expect(SingletonManager.has(singletonNames.EXAMPLE)).toBe(true);
			expect(SingletonManager.has(singletonNames.EXAMPLE_2)).toBe(true);
		});
	});

	describe('Edge Cases', () => {
		test('should handle empty string as class name', () => {
			expect(() => {
				SingletonManager.register('', ExampleSingleton);
			}).not.toThrow();

			expect(SingletonManager.has('')).toBe(true);
			expect(SingletonManager.get<ExampleSingleton>('')).toBeInstanceOf(ExampleSingleton);

			// Cleanup
			SingletonManager.unregister('');
		});

		test('should handle special characters in class names', () => {
			const specialName = 'Class-With_Special$Characters@123';

			SingletonManager.register(specialName, ExampleSingleton);

			expect(SingletonManager.has(specialName)).toBe(true);
			expect(SingletonManager.get<ExampleSingleton>(specialName)).toBeInstanceOf(ExampleSingleton);

			SingletonManager.unregister(specialName);
		});

		test('should handle classes with complex inheritance', () => {
			class BaseClass {
				public readonly baseType: string = 'base';
			}

			class DerivedClass extends BaseClass {
				public override readonly baseType: string = 'derived';

				public readonly value: string;

				public constructor(value: string) {
					super();
					this.value = value;
				}
			}

			const derivedName = 'DerivedClass';
			SingletonManager.register(derivedName, DerivedClass, 'test-value');

			const instance = SingletonManager.get<DerivedClass>(derivedName);
			expect(instance).toBeInstanceOf(DerivedClass);
			expect(instance).toBeInstanceOf(BaseClass);
			expect(instance.baseType).toBe('derived');
			expect(instance.value).toBe('test-value');

			SingletonManager.unregister(derivedName);
		});
	});

	describe('Type Safety', () => {
		test('should maintain proper typing for generic get method', () => {
			SingletonManager.register(singletonNames.EXAMPLE_2, ExampleSingleton2, 'TypedTest');

			const instance = SingletonManager.get<ExampleSingleton2>(singletonNames.EXAMPLE_2);

			// TypeScript should infer the correct type
			expect(typeof instance.name).toBe('string');
			expect(instance.name).toBe('TypedTest');

			// This should compile without issues due to proper typing
			instance.name.toUpperCase();
		});
	});
});