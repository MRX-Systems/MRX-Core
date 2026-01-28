export interface MemoryStoreEntry {
	/**
	 * The stored value for this entry.
	 */
	readonly value: unknown;
	/**
	 * Timestamp when this entry expires (in milliseconds).
	 * -1 means no expiration (like Redis behavior).
	 */
	expiresAt: number;
}