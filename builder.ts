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
		'./source/errors/utils/index.ts',

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

		// // # ————————— Elysia Plugin ————————— #
		// cache
		'./source/modules/elysia/cache/index.ts',
		'./source/modules/elysia/cache/types/index.ts',
		'./source/modules/elysia/cache/utils/index.ts',

		// crud
		'./source/modules/elysia/crud/index.ts',
		'./source/modules/elysia/crud/types/index.ts',

		// crudSchema
		'./source/modules/elysia/crudSchema/index.ts',
		'./source/modules/elysia/crudSchema/types/index.ts',
		'./source/modules/elysia/crudSchema/utils/index.ts',

		// dbResolver
		'./source/modules/elysia/dbResolver/index.ts',
		'./source/modules/elysia/dbResolver/enums/index.ts',
		'./source/modules/elysia/dbResolver/types/index.ts',

		// error
		'./source/modules/elysia/error/index.ts',

		// microservice
		'./source/modules/elysia/microservice/index.ts',

		// rateLimit
		'./source/modules/elysia/rateLimit/index.ts',
		'./source/modules/elysia/rateLimit/enums/index.ts',
		'./source/modules/elysia/rateLimit/types/index.ts',

		// # ————————— JWT ————————— #
		'./source/modules/jwt/index.ts',
		'./source/modules/jwt/enums/index.ts',
		'./source/modules/jwt/utils/index.ts',

		// # ————————— kvStore ————————— #
		'./source/modules/kvStore/enums/index.ts',
		'./source/modules/kvStore/ioredis/index.ts',
		'./source/modules/kvStore/memory/index.ts',
		'./source/modules/kvStore/types/index.ts',

		// # ————————— Logger ————————— #
		'./source/modules/logger/index.ts',
		'./source/modules/logger/enums/index.ts',
		'./source/modules/logger/events/index.ts',
		'./source/modules/logger/strategies/index.ts',
		'./source/modules/logger/types/index.ts',

		// # ————————— Mailer ————————— #
		'./source/modules/mailer/index.ts',
		'./source/modules/mailer/enums/index.ts',
		'./source/modules/mailer/types/index.ts',

		// # ————————— Repository ————————— #
		'./source/modules/repository/index.ts',
		'./source/modules/repository/types/index.ts',

		// # ————————— SingletonManager ————————— #
		'./source/modules/singletonManager/index.ts',
		'./source/modules/singletonManager/enums/index.ts',

		// # ————————— TOTP ————————— #
		'./source/modules/totp/index.ts',
		'./source/modules/totp/enums/index.ts',
		'./source/modules/totp/types/index.ts',
		'./source/modules/totp/utils/index.ts',

		// # ————————— TypedEventEmitter ————————— #
		'./source/modules/typedEventEmitter/index.ts',
		'./source/modules/typedEventEmitter/types/index.ts',

		// # ————————— Utils ————————— #
		'./source/utils/index.ts',
		'./source/utils/enums/index.ts',
		'./source/utils/types/index.ts'
	],
	outdir: './dist',
	splitting: true,
	format: 'esm',
	minify: false,
	sourcemap: 'none'
});
console.log('🎉 Build completed successfully! 🎉');

process.exit(0);