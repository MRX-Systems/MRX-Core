import pkg from './package.json';

const dependencies = 'dependencies' in pkg ? Object.keys(pkg.dependencies ?? {}) : [];
const devDependencies = 'devDependencies' in pkg ? Object.keys(pkg.devDependencies ?? {}) : [];
const peerDependencies = 'peerDependencies' in pkg ? Object.keys(pkg.peerDependencies ?? {}) : [];

await Bun.build({
    external: [...dependencies, ...devDependencies, ...peerDependencies],
    root: './source',
    entrypoints: [
        './source/index.ts',
        './source/common/error/index.ts',
        './source/common/lib/optional/ioredis/index.ts',
        './source/common/lib/optional/knex/index.ts',
        './source/common/lib/optional/vine/index.ts',
        './source/common/lib/required/fastify/index.ts',
        './source/common/lib/required/fluent-json-schema/index.ts',
        './source/common/lib/required/i18n/index.ts',
        './source/common/type/data/index.ts',
        './source/common/util/index.ts',

        './source/domain/usecase/index.ts',

        './source/infrastructure/database/creator/index.ts',
        './source/infrastructure/database/index.ts',
        './source/infrastructure/repository/index.ts',
        './source/infrastructure/storage/creator/index.ts',
        './source/infrastructure/storage/index.ts',
        './source/infrastructure/store/creator/index.ts',
        './source/infrastructure/store/index.ts',

        './source/presentation/http/index.ts',
        './source/presentation/schema/index.ts',
    ],
    splitting: true,
    outdir: './build',
    format: 'esm',
    minify: true,
    sourcemap: process.env.NODE_ENV === 'development' ? 'external' : 'none',
    target: 'node',
});
