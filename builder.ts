import pkg from './package.json';

const dependencies = 'dependencies' in pkg ? Object.keys(pkg.dependencies ?? {}) : [];
const devDependencies = 'devDependencies' in pkg ? Object.keys(pkg.devDependencies ?? {}) : [];
const peerDependencies = 'peerDependencies' in pkg ? Object.keys(pkg.peerDependencies ?? {}) : [];

await Bun.$`rm -rf dist`;
console.log('🗑️  Deleted dist folder if it existed. ✅');

await Bun.$`tsc --project tsconfig.build.json`;
await Bun.$`bunx tsc-alias -p tsconfig.build.json`;
console.log('🔍 Type analysis and generation completed. ✅');

await Bun.build({
	target: 'bun',
	external: [...dependencies, ...devDependencies, ...peerDependencies],
	root: './source',
	entrypoints: [
		// # ————————— Error ————————— #
		'./source/errors/index.ts',
		'./source/errors/enums/index.ts',

		// # ————————— Data ————————— #
		'./source/modules/data/index.ts',
		'./source/modules/data/enums/index.ts',
		'./source/modules/data/transformers/index.ts',
		'./source/modules/data/types/index.ts',

		// # ————————— Database ————————— #
		'./source/modules/database/index.ts',
		'./source/modules/database/enums/index.ts',
		'./source/modules/database/events/index.ts',
		'./source/modules/database/types/index.ts',

		// # ————————— Elysia Plugin ————————— #
		// cache
		'./source/modules/elysia/cache/index.ts',
		'./source/modules/elysia/cache/types/index.ts',

		// dbResolver
		'./source/modules/elysia/db-resolver/index.ts',
		'./source/modules/elysia/db-resolver/enums/index.ts',

		// error
		'./source/modules/elysia/error/index.ts',
		'./source/modules/elysia/error/enums/index.ts',

		// microservice
		'./source/modules/elysia/microservice/index.ts',
		'./source/modules/elysia/microservice/enums/index.ts',

		// rateLimit
		'./source/modules/elysia/rate-limit/index.ts',
		'./source/modules/elysia/rate-limit/enums/index.ts',
		'./source/modules/elysia/rate-limit/types/index.ts',

		// # ————————— JWT ————————— #
		'./source/modules/jwt/index.ts',
		'./source/modules/jwt/enums/index.ts',
		'./source/modules/jwt/utils/index.ts',

		// # ————————— kvStore ————————— #
		'./source/modules/kv-store/bun-redis/index.ts',
		'./source/modules/kv-store/enums/index.ts',
		'./source/modules/kv-store/ioredis/index.ts',
		'./source/modules/kv-store/memory/index.ts',
		'./source/modules/kv-store/types/index.ts',

		// # ————————— Logger ————————— #
		'./source/modules/logger/index.ts',
		'./source/modules/logger/enums/index.ts',
		'./source/modules/logger/events/index.ts',
		'./source/modules/logger/sinks/index.ts',
		'./source/modules/logger/types/index.ts',

		// # ————————— Mailer ————————— #
		'./source/modules/mailer/index.ts',
		'./source/modules/mailer/enums/index.ts',
		'./source/modules/mailer/types/index.ts',

		// # ————————— Repository ————————— #
		'./source/modules/repository/index.ts',
		'./source/modules/repository/types/index.ts',

		// # ————————— SchemaBuilder ————————— #
		'./source/modules/schema-builder/index.ts',
		'./source/modules/schema-builder/types/index.ts',
		'./source/modules/schema-builder/utils/index.ts',

		// # ————————— SingletonManager ————————— #
		'./source/modules/singleton-manager/index.ts',
		'./source/modules/singleton-manager/enums/index.ts',

		// # ————————— TOTP ————————— #
		'./source/modules/totp/index.ts',
		'./source/modules/totp/enums/index.ts',
		'./source/modules/totp/types/index.ts',
		'./source/modules/totp/utils/index.ts',

		// # ————————— TypedEventEmitter ————————— #
		'./source/modules/typed-event-emitter/index.ts',
		'./source/modules/typed-event-emitter/types/index.ts',

		// # ————————— Utils ————————— #
		'./source/shared/enums/index.ts',
		'./source/shared/types/index.ts',
		'./source/shared/utils/index.ts'
	],
	outdir: './dist',
	splitting: true,
	format: 'esm',
	minify: false,
	sourcemap: 'none'
});
console.log('🎉 Build completed successfully! 🎉');

process.exit(0);