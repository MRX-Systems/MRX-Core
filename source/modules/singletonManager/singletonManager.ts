import { BaseError } from '#/errors/baseError';
import { SINGLETON_MANAGER_ERROR_KEYS } from './enums/singletonManagerErrorKeys';

/**
* SingletonManager is a static class that manages the singletons in the application.
* When a class is registered, the SingletonManager creates a new instance of the class when it is requested.
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
* SingletonManager.register('ExampleSingleton', ExampleSingleton);
*
* SingletonManager.get<ExampleSingleton>('ExampleSingleton').sayHello(); // Output: ExampleSingleton created with ID: 1 /n Hello from instance 1!
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
	* Registers a class constructor in the SingletonManager.
	*
	* @template TClass - The type of the class.
	* @template TArgs - The tuple type of the constructor arguments.
	*
	* @param name - The name of the class.
	* @param constructor - The constructor of the class.
	* @param args - The arguments to pass to the constructor of the class.
	*
	* @throws ({@link BaseError}) If the class constructor is already registered, it throws an error.
	*/
	public static register<
		TClass extends object,
		TArgs extends unknown[]
	>(
		name: string,
		constructor: new (...args: TArgs) => TClass,
		...args: TArgs
	): void {
		if (this._registry.has(name))
			throw new BaseError({
				message: SINGLETON_MANAGER_ERROR_KEYS.CLASS_CONSTRUCTOR_ALREADY_REGISTERED,
				cause: { name }
			});
		this._registry.set(name, new constructor(...args));
	}

	/**
	* Unregisters a class from the SingletonManager.
	*
	* @param name - The name of the class to unregister.
	*²
	* @throws ({@link BaseError}) If the class constructor is not registered, it throws an error.
	*/
	public static unregister(name: string): void {
		if (!this._registry.has(name))
			throw new BaseError({
				message: SINGLETON_MANAGER_ERROR_KEYS.CLASS_CONSTRUCTOR_NOT_REGISTERED,
				cause: { name }
			});
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
			throw new BaseError({
				message: SINGLETON_MANAGER_ERROR_KEYS.CLASS_CONSTRUCTOR_NOT_REGISTERED,
				cause: { name }
			});
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