import { Redis as IoRedis, type RedisOptions } from 'ioredis';

export class Redis {
	private readonly _client: IoRedis;

	public constructor(options: RedisOptions) {
		this._client = new IoRedis(options);
	}

	public get client(): IoRedis {
		return this._client;
	}
}