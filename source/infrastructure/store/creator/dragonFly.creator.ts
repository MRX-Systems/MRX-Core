
import type { DragonFlyStoreOptions } from '@/common/types/index.ts';
import { AbstractStoreCreator } from './abstractStore.creator.ts';

/**
 * DragonFly Creator is a concrete creator for DragonFly Store (Factory Pattern) extending ({@link AbstractStoreCreator})
 */
export class DragonFlyCreator extends AbstractStoreCreator {

    /**
     * Constructor of the DragonFlyCreator class
     *
     * @param options - The options of the store ({@link DragonFlyStoreOptions})
     */
    public constructor(options: DragonFlyStoreOptions) {
        super({
            config: {
                host: options.host ?? 'localhost',
                port: options.port ?? 6379,
                ...(options.password && { password: options.password }),
                ...(options.username && { username: options.username }),
                ...(options.tls && { tls: {} }),
            },
            log: options.log,
        });
    }
}
