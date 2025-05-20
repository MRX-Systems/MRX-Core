import pkg from './package.json';

const dependencies = 'dependencies' in pkg ? Object.keys(pkg.dependencies ?? {}) : [];
const devDependencies = 'devDependencies' in pkg ? Object.keys(pkg.devDependencies ?? {}) : [];
const peerDependencies = 'peerDependencies' in pkg ? Object.keys(pkg.peerDependencies ?? {}) : [];

await Bun.$`rm -rf dist`;
console.log('🗑️  Deleted dist folder if it existed. ✅');

await Bun.$`tsc --project tsconfig.dts.json`;
await Bun.$`tsc-alias -p tsconfig.dts.json`;
console.log('🔍 Type analysis and generation completed. ✅');

await Bun.build({
    target: 'bun',
    external: [...dependencies, ...devDependencies, ...peerDependencies],
    root: './source',
    entrypoints: [
        // Database
        './source/database/index.ts',
        './source/database/enums/index.ts',
        './source/database/events/index.ts',
        './source/database/types/index.ts',

        // Elysia
        './source/elysia/index.ts',
        './source/elysia/enums/index.ts',
        './source/elysia/schemas/index.ts',
        './source/elysia/types/index.ts',

        // Error
        './source/error/index.ts',
        './source/error/types/index.ts',

        // Mailer
        './source/mailer/index.ts',
        './source/mailer/enums/index.ts',
        './source/mailer/types/index.ts',

        // Repository
        './source/repository/index.ts',
        './source/repository/types/index.ts',

        // Store
        './source/store/index.ts',

        './source/index.ts'
    ],
    outdir: './dist',
    splitting: true,
    format: 'esm',
    minify: true,
    sourcemap: 'none'
});
console.log('🎉 Build completed successfully! 🎉');

process.exit(0);