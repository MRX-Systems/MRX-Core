import pkg from './package.json';

const dependencies = 'dependencies' in pkg ? Object.keys(pkg.dependencies ?? {}) : [];
const devDependencies = 'devDependencies' in pkg ? Object.keys(pkg.devDependencies ?? {}) : [];
const peerDependencies = 'peerDependencies' in pkg ? Object.keys(pkg.peerDependencies ?? {}) : [];

await Bun.$`rm -rf dist`;
console.log('🗑️  Deleted dist folder if it existed. ✅');

await Bun.$`tsc --project tsconfig.dts.json`;
await Bun.$`bunx tsc-alias -p tsconfig.dts.json`;
console.log('🔍 Type analysis and generation completed. ✅');

await Bun.build({
	target: 'bun',
	external: [...dependencies, ...devDependencies, ...peerDependencies],
	root: './source',
	entrypoints: [
		// # ————————— Data ————————— #
		'./source/modules/data/index.ts',
		'./source/modules/data/transformers/index.ts',
		'./source/modules/data/types/index.ts',

		// # ————————— Database ————————— #
		'./source/modules/database/index.ts',
		'./source/modules/database/events/index.ts',
		'./source/modules/database/types/index.ts',

		// # ————————— Elysia Plugin ————————— #

		// dbSelectorPlugin
		'./source/modules/elysia/dbSelectorPlugin/index.ts',
		'./source/modules/elysia/dbSelectorPlugin/types/index.ts',

		// errorPlugin
		'./source/modules/elysia/errorPlugin/index.ts',

		// jwtPlugin
		'./source/modules/elysia/jwtPlugin/index.ts',
		'./source/modules/elysia/jwtPlugin/types/index.ts',

		// microservicePlugin
		'./source/modules/elysia/microservicePlugin/index.ts',

		// queryOptionsBuilderPlugin
		'./source/modules/elysia/queryOptionsBuilderPlugin/index.ts',
		'./source/modules/elysia/queryOptionsBuilderPlugin/types/index.ts',

		// rateLimitPlugin
		'./source/modules/elysia/ratelimitPlugin/index.ts',
		'./source/modules/elysia/ratelimitPlugin/types/index.ts',

		// # ————————— Error ————————— #
		'./source/error/index.ts',
		'./source/error/types/index.ts',

		// # ————————— Logger ————————— #
		'./source/modules/logger/index.ts',
		'./source/modules/logger/events/index.ts',
		'./source/modules/logger/strategies/index.ts',
		'./source/modules/logger/types/index.ts',

		// # ————————— Mailer ————————— #
		'./source/modules/mailer/index.ts',
		'./source/modules/mailer/types/index.ts',

		// # ————————— Repository ————————— #
		'./source/modules/repository/index.ts',
		'./source/modules/repository/types/index.ts',

		// # ————————— SingletonManager ————————— #
		'./source/modules/singletonManager/index.ts',

		// # ————————— Store ————————— #
		'./source/modules/store/index.ts',

		// # ————————— TypedEventEmitter ————————— #
		'./source/modules/typedEventEmitter/index.ts',
		'./source/modules/typedEventEmitter/types/index.ts',

		// # ————————— Utils ————————— #
		'./source/utils/index.ts',
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