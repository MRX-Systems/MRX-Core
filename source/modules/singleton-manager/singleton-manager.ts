import { BaseError } from '#/errors/base-error';

import { SINGLETON_MANAGER_ERROR_KEYS } from './enums/singleton-manager-error-keys';

/**
* SingletonManager is a static class that manages the singletons in the application.
* When a class instance is registered, the SingletonManager stores it and returns the same instance when requested.
*
* @example
* ```ts
* class ExampleSingleton {
*    private static _count = 0;
*    private readonly _id: number;
*
*    public constructor() {
*       ExampleSingleton._count += 1;
*      this._id = ExampleSingleton._count;
*      console.log(`ExampleSingleton created with ID: ${this._id}`);
*    }
*
*    public sayHello(): void {
*      console.log(`Hello from instance ${this._id}!`);
*    }
* }
*
* SingletonManager.register('ExampleSingleton', new ExampleSingleton());
*
* SingletonManager.get<ExampleSingleton>('ExampleSingleton').sayHello(); // Output: Hello from instance 1!
* SingletonManager.get<ExampleSingleton>('ExampleSingleton').sayHello(); // Output: Hello from instance 1!
* ```
*/
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class SingletonManager {
	/**
	* _registry is a private static property that holds the class instances that are registered
	* in the SingletonManager. The key is the name of the class and the value is the instance of the class.
	*/
	private static readonly _registry = new Map<string, unknown>();

	/**
	* Registers a class instance in the SingletonManager.
	*
	* @template TClass - The type of the class instance.
	*
	* @param name - The name of the class.
	* @param instance - The instance of the class to register as singleton.
	*
	* @throws ({@link BaseError}) If the name is already registered, it throws an error.
	*/
	public static register<TClass extends object>(
		name: string,
		instance: TClass
	): void {
		if (this._registry.has(name))
			throw new BaseError(SINGLETON_MANAGER_ERROR_KEYS.CLASS_INSTANCE_ALREADY_REGISTERED, { name });
		this._registry.set(name, instance);
	}

	/**
	* Unregisters a class from the SingletonManager.
	*
	* @param name - The name of the class to unregister.
	*
	* @throws ({@link BaseError}) If the name is not registered, it throws an error.
	*/
	public static unregister(name: string): void {
		if (!this._registry.has(name))
			throw new BaseError(SINGLETON_MANAGER_ERROR_KEYS.CLASS_INSTANCE_NOT_REGISTERED, { name });
		this._registry.delete(name);
	}

	/**
	* Gets the singleton instance of the class. If the class is not registered, it throws an error.
	*
	* @template TClass - The type of the class.
	*
	* @param name - The name of the class to get the singleton instance.
	*
	* @throws ({@link BaseError}) If the class is not registered, it throws an error.
	*
	* @returns The singleton instance of the class.
	*/
	public static get<TClass>(name: string): TClass {
		if (!this._registry.has(name))
			throw new BaseError(SINGLETON_MANAGER_ERROR_KEYS.CLASS_INSTANCE_NOT_REGISTERED, { name });
		return this._registry.get(name) as TClass;
	}

	/**
	* Checks if the class is registered in the SingletonManager.
	*
	* @param name - The name of the class to check if it is registered.
	*
	* @returns True if the class is registered, otherwise false.
	*/
	public static has(name: string): boolean {
		return this._registry.has(name);
	}
}