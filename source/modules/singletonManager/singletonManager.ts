import { CoreError } from '#/error/coreError';
import { singletonManagerErrorKeys } from './enums/singletonManagerErrorKeys';

/**
 * SingletonManagerSingleton is a singleton class that manages the singletons in the application.
 * When a class is registered, the SingletonManagerSingleton creates a new instance of the class when it is requested.
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
class SingletonManagerSingleton {
    /**
     * _instance is a private static property that holds the singleton instance of the class. ({@link SingletonManagerSingleton})
     */
    private static _instance: SingletonManagerSingleton;

    /**
     * _classConstructor is a private property that holds the class constructors that are registered
     * in the SingletonManagerSingleton. The key is the name of the class and the value is the constructor of the class.
     */
    private readonly _registry = new Map<string, unknown>();

    /**
     * Constructor of the SingletonManagerSingleton class.
     *
     * @returns The singleton instance of the SingletonManagerSingleton class. ({@link SingletonManagerSingleton})
     */
    public static get instance(): SingletonManagerSingleton {
        if (!this._instance)
            this._instance = new SingletonManagerSingleton();
        return this._instance;
    }

    /**
     * Registers a class constructor in the SingletonManagerSingleton.
     *
     * @template TClass - The type of the class.
     * @template TArgs - The tuple type of the constructor arguments.
     * @param name - The name of the class.
     * @param constructor - The constructor of the class.
     * @param args - The arguments to pass to the constructor of the class.
     *
     * @throws ({@link CoreError}) If the class constructor is already registered, it throws an error. ({@link singletonManagerErrorKeys.classConstructorAlreadyRegistered})
     */
    public register<
        TClass extends object,
        TArgs extends unknown[]
    >(
        name: string,
        constructor: new (...args: TArgs) => TClass,
        ...args: TArgs
    ): void {
        if (this._registry.has(name))
            throw new CoreError({
                key: singletonManagerErrorKeys.classConstructorAlreadyRegistered,
                message: 'Class constructor is already registered.',
                cause: { name }
            });
        this._registry.set(name, new constructor(...args));
    }

    /**
     * Unregisters a class from the SingletonManagerSingleton.
     *
     * @param name - The name of the class to unregister.
     *
     * @throws ({@link CoreError}) If the class constructor is not registered, it throws an error. ({@link singletonManagerErrorKeys.classConstructorNotRegistered})
     */
    public unregister(name: string): void {
        if (!this._registry.has(name))
            throw new CoreError({
                key: singletonManagerErrorKeys.classConstructorNotRegistered,
                message: 'Class constructor is not registered.',
                cause: { name }
            });
        this._registry.delete(name);
    }

    /**
     * Gets the singleton instance of the class. If the class is not registered, it throws an error.
     *
     * @template TClass - The type of the class.
     * @param name - The name of the class to get the singleton instance.
     *
     * @throws ({@link CoreError}) If the class is not registered, it throws an error. ({@link singletonManagerErrorKeys.classConstructorNotRegistered})
     *
     * @returns The singleton instance of the class. ({@link TClass})
     */
    public get<TClass>(name: string): TClass {
        if (!this._registry.has(name))
            throw new CoreError({
                key: singletonManagerErrorKeys.classConstructorNotRegistered,
                message: 'Class constructor is not registered.',
                cause: { name }
            });
        return this._registry.get(name) as TClass;
    }

    /**
     * Checks if the class is registered in the SingletonManagerSingleton.
     *
     * @param name - The name of the class to check if it is registered.
     *
     * @returns True if the class is registered, otherwise false.
     */
    public has(name: string): boolean {
        return this._registry.has(name);
    }
}

/**
 * SingletonManager is an instance of the SingletonManagerSingleton class that manages the singletons in the application.
 * When a class is registered, the SingletonManagerSingleton creates a new instance of the class when it is requested.
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
export const SingletonManager = SingletonManagerSingleton.instance;