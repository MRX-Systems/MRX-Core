export interface MemoryStoreEntry {
	/**
	 * Current count value for the key.
	 */
	readonly value: unknown;
	/**
	 * Timestamp when this entry expires (in milliseconds).
	 * -1 means no expiration (like Redis behavior).
	 */
	expiresAt: number;
}