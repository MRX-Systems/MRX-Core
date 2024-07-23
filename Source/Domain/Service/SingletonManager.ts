import { DomainErrorKeys } from '@/Common/Error/Enum/index.js';
import { AndesiteError } from '@/Common/Error/index.js';

/**
 * SingletonManagerSingleton is a singleton class that manages the singletons in the application.
 * When a class is registered, the SingletonManagerSingleton creates a new instance of the class when it is requested.
 * 
 * @example
 * ```typescript
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
    private readonly _classConstructor: Map<string, new(...args: unknown[]) => unknown> = new Map();
    /**
     * _singletons is a private property that holds the singletons that are created in the SingletonManagerSingleton.
     */
    private readonly _singletons: Map<string, unknown> = new Map();

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
     * @param name - The name of the class.
     * @typeParam T - The type of the class.
     * @param instance - The constructor of the class.
     */
    public register<T>(name: string, instance: new(...args: unknown[]) => T): void {    
        if (this._classConstructor.has(name))
            throw new AndesiteError({
                messageKey: DomainErrorKeys.ERROR_CLASS_CONSTRUCTOR_ALREADY_REGISTERED
            });
        this._classConstructor.set(name, instance);
    }

    /**
     * Gets the singleton instance of the class. If the class is not registered, it throws an error.
     * 
     * @typeParam T - The type of the class.
     * @param name - The name of the class to get the singleton instance.
     * 
     * @throws ({@link AndesiteError}) If the class is not registered, it throws an error. ({@link DomainErrorKeys.ERROR_CLASS_CONSTRUCTOR_NOT_REGISTERED})
     * 
     * @returns The singleton instance of the class. ({@link T})
     */
    public get<T>(name: string): T {
        if (!this._classConstructor.has(name))
            throw new AndesiteError({
                messageKey: DomainErrorKeys.ERROR_CLASS_CONSTRUCTOR_NOT_REGISTERED
            });
        if (!this._singletons.has(name))
            this._singletons.set(name, new (this._classConstructor.get(name) as new(...args: unknown[]) => T)());
        return this._singletons.get(name) as T;
    }
}

export const SingletonManager = SingletonManagerSingleton.instance;
