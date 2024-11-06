import { AbstractRepository } from './abstract.repository.ts';
/**
 * The CrudRepository class. It's a repository for Crud Handler.
 *
 * Inherit from the File class ({@link AbstractRepository})
 *
 * @typeparam T - The type of the data.
 */
export class CrudRepository<T> extends AbstractRepository<T> {}