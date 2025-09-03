
## v2.8.0

[compare changes](https://github.com/MRX-Systems/MRX-Core/compare/v2.7.0...v2.8.0)

### 🚀 Enhancements

- **🚀:** [Add tags support to CRUD options] ([f38ec111](https://github.com/MRX-Systems/MRX-Core/commit/f38ec111))
- **🚀:** [Add prefix option to CRUD options] ([6305bcf3](https://github.com/MRX-Systems/MRX-Core/commit/6305bcf3))
- **🚀:** [Add JWT error keys enumeration] ([5fce607d](https://github.com/MRX-Systems/MRX-Core/commit/5fce607d))
- **🚀:** [Add parseHumanTimeToSeconds utility function] ([829511bc](https://github.com/MRX-Systems/MRX-Core/commit/829511bc))
- **🚀:** [Add JWT signing and verification functions] ([82fe48c3](https://github.com/MRX-Systems/MRX-Core/commit/82fe48c3))
- **🚀:** [Add error keys for human time parsing] ([d566df3e](https://github.com/MRX-Systems/MRX-Core/commit/d566df3e))
- **🚀:** [Enhance query returning with trigger modifications] ([c5b62b91](https://github.com/MRX-Systems/MRX-Core/commit/c5b62b91))
- **🚀:** [Add KV_STORE_ERROR_KEYS enum for error handling] ## Features - Introduced `KV_STORE_ERROR_KEYS` enum to standardize error messages. ([45fc7119](https://github.com/MRX-Systems/MRX-Core/commit/45fc7119))
- **🚀:** [Add IoRedisStore class for Redis-based key-value store] ([0181be2b](https://github.com/MRX-Systems/MRX-Core/commit/0181be2b))
- **🚀:** [Add MemoryStore class for in-memory key-value storage] ([4342e1f7](https://github.com/MRX-Systems/MRX-Core/commit/4342e1f7))
- **🚀:** [Add RATE_LIMIT_ERROR_KEYS export] ([1b819bea](https://github.com/MRX-Systems/MRX-Core/commit/1b819bea))
- **🚀:** [Add generateCacheKey utility for caching requests] ## Features - Introduced `generateCacheKey` function to create a unique cache key based on request properties. ([b80bd5e2](https://github.com/MRX-Systems/MRX-Core/commit/b80bd5e2))
- **🚀:** [Add caching functionality with cache utility] ([a54cd86f](https://github.com/MRX-Systems/MRX-Core/commit/a54cd86f))
- **🚀:** [Enhance caching mechanism with route tracking and metadata] ## Features - Implemented route tracking to cache responses based on request method and URL. - Enhanced cache storage to include metadata alongside the response. - Updated cache control headers to reflect cache hits and misses. ([1e77647f](https://github.com/MRX-Systems/MRX-Core/commit/1e77647f))

### 🔧 Fixes

- **🔧:** [Improve error handling in Repository class] ([af8b8ef2](https://github.com/MRX-Systems/MRX-Core/commit/af8b8ef2))
- **🔧:** [fix add x-cache MISS to the first request] - Added a check to ensure 'x-cache' header is set to 'MISS' if not already defined. - This change enhances the clarity of cache status in responses. ([26eb7929](https://github.com/MRX-Systems/MRX-Core/commit/26eb7929))
- **🔧:** [Update cache control headers to use metadata TTL] ([d70ce44a](https://github.com/MRX-Systems/MRX-Core/commit/d70ce44a))

### 🧹 Refactors

- **🧹:** [Totp module little clean] ([701c9a3b](https://github.com/MRX-Systems/MRX-Core/commit/701c9a3b))
- **🧹:** [Enhance error handling structure in error plugin] ## Refactoring - Improved the structure of the error handling in the error plugin. - Updated the validation error response to include detailed error information. ([883a17d2](https://github.com/MRX-Systems/MRX-Core/commit/883a17d2))
- **🧹:** [Remove JWT plugin and related files for cleanup] ([4805d0d0](https://github.com/MRX-Systems/MRX-Core/commit/4805d0d0))
- **🧹:** [Rename ResolveDbHeader to dbResolverHeader for consistency] ([239b7898](https://github.com/MRX-Systems/MRX-Core/commit/239b7898))
- **🧹:** [Refactor like operator to use where clause] ## Refactoring - Changed the implementation of the `$like` operator to use `where` instead of `whereLike`. (for non case sensitive) ([a2cf66d2](https://github.com/MRX-Systems/MRX-Core/commit/a2cf66d2))
- **🧹:** [Change 'like' operator to use uppercase syntax] ## Refactoring - Updated the 'like' operator in the query builder to use uppercase 'LIKE'. ([19057d82](https://github.com/MRX-Systems/MRX-Core/commit/19057d82))
- **🧹:** [Remove return await in ioredisStore] ([2019a41c](https://github.com/MRX-Systems/MRX-Core/commit/2019a41c))
- **🧹:** [Remove rate limiting store implementation] ([aec26501](https://github.com/MRX-Systems/MRX-Core/commit/aec26501))
- **🧹:** [Refactor rate limiting to use kvStore] ([1d42fb97](https://github.com/MRX-Systems/MRX-Core/commit/1d42fb97))

### 📖 Documentation

- **📖:** [fix tsdoc CoreError to BaseError] ([8db68847](https://github.com/MRX-Systems/MRX-Core/commit/8db68847))

### 📦 Build

- **📦:** [update dependencies in package.json] ([2c69bbb5](https://github.com/MRX-Systems/MRX-Core/commit/2c69bbb5))
- **📦:** [Update nodemailer type definitions to version 7.0.1] ([387ac697](https://github.com/MRX-Systems/MRX-Core/commit/387ac697))
- **📦:** [Refactor JWT module paths for better organization] ([9f504873](https://github.com/MRX-Systems/MRX-Core/commit/9f504873))
- **📦:** [Update JWT module paths and dependencies] ([71eaca98](https://github.com/MRX-Systems/MRX-Core/commit/71eaca98))
- **📦:** [Update package.json for improved dependency management] ([f48a7fa6](https://github.com/MRX-Systems/MRX-Core/commit/f48a7fa6))
- **📦:** [Add kvStore module paths to builder] ([3020bf8a](https://github.com/MRX-Systems/MRX-Core/commit/3020bf8a))
- **📦:** [Update dependencies and add kvStore module paths] ([056c4b2b](https://github.com/MRX-Systems/MRX-Core/commit/056c4b2b))
- **📦:** [Remove kvStore module from build process] ## Build Changes - Removed './source/modules/kvStore/index.ts' from the build configuration. ([502e25a2](https://github.com/MRX-Systems/MRX-Core/commit/502e25a2))
- **📦:** [Remove kvStore module from exports] ([b2a02bc6](https://github.com/MRX-Systems/MRX-Core/commit/b2a02bc6))
- **📦:** [Add cache module to builder configuration] ## Build - Included cache module paths in the builder configuration. ([63681c8b](https://github.com/MRX-Systems/MRX-Core/commit/63681c8b))
- **📦:** [Add cache module exports to package.json] ([ef662af9](https://github.com/MRX-Systems/MRX-Core/commit/ef662af9))

### 🌊 Types

- **🌊:** [Update throwIfNoResult type in QueryOptions interface] Updated the `throwIfNoResult` property in the `QueryOptions` interface to accept an object with optional `message` and `code` properties, enhancing error handling capabilities. ([644ff8be](https://github.com/MRX-Systems/MRX-Core/commit/644ff8be))
- **🌊:** [Add KvStore interface for key-value store operations] ([ec2c8dea](https://github.com/MRX-Systems/MRX-Core/commit/ec2c8dea))
- **🌊:** [Add CacheOptions type definition and index export] ([7f17d79b](https://github.com/MRX-Systems/MRX-Core/commit/7f17d79b))
- **🌊:** [Add CacheItem type definition for caching mechanism] ([a10a15f7](https://github.com/MRX-Systems/MRX-Core/commit/a10a15f7))

### 🦉 Chore

- **🦉:** [Clean up CHANGELOG.md for better readability] ([d66fac36](https://github.com/MRX-Systems/MRX-Core/commit/d66fac36))

### 🧪 Tests

- **🧪:** [totp tests little clean] ([238ac25b](https://github.com/MRX-Systems/MRX-Core/commit/238ac25b))
- **🧪:** [Add test to hande custom code and refacto custom message] ([c7737572](https://github.com/MRX-Systems/MRX-Core/commit/c7737572))
- **🧪:** [Update validation error handling tests for new structure] ([42184d86](https://github.com/MRX-Systems/MRX-Core/commit/42184d86))
- **🧪:** [Remove JWT tests for cleanup] ([08ca9a71](https://github.com/MRX-Systems/MRX-Core/commit/08ca9a71))
- **🧪:** [[Add comprehensive tests for parseHumanTimeToSeconds function] ([8d2c37c1](https://github.com/MRX-Systems/MRX-Core/commit/8d2c37c1))
- **🧪:** [Add comprehensive tests for JWT signing and verification] ([6c281486](https://github.com/MRX-Systems/MRX-Core/commit/6c281486))
- **🧪:** [Add tests for parseHumanTimeToSeconds utility function] ([6bf5dbca](https://github.com/MRX-Systems/MRX-Core/commit/6bf5dbca))
- **🧪:** [Rename ResolveDbHeader to dbResolverHeader for consistency] ([8a5a4dd2](https://github.com/MRX-Systems/MRX-Core/commit/8a5a4dd2))
- **🧪:** [Add case insensitive Q operator filter test] ## Tests - Introduced a new test case for the Q operator to ensure it is case insensitive. ([fccfb182](https://github.com/MRX-Systems/MRX-Core/commit/fccfb182))
- **🧪:** [Refactor MSSQL test setup and enhance findByNamePattern] ([e1dcea34](https://github.com/MRX-Systems/MRX-Core/commit/e1dcea34))
- **🧪:** [Add comprehensive tests for MemoryStore functionality] ([25c165ec](https://github.com/MRX-Systems/MRX-Core/commit/25c165ec))
- **🧪:** [Refactor rate limit tests to use MemoryStore] ([1311cd07](https://github.com/MRX-Systems/MRX-Core/commit/1311cd07))
- **🧪:** [Remove MemoryStore test suite] ([e0fe6f39](https://github.com/MRX-Systems/MRX-Core/commit/e0fe6f39))
- **🧪:** [Add tests for generateCacheKey utility function] ## Tests - Implement unit tests for the `generateCacheKey` function. - Cover scenarios for requests with and without bodies. - Validate that identical requests produce the same cache key. - Ensure different bodies generate different cache keys. ([90562c7a](https://github.com/MRX-Systems/MRX-Core/commit/90562c7a))
- **🧪:** [Add comprehensive tests for cache module functionality] ([28d28d3d](https://github.com/MRX-Systems/MRX-Core/commit/28d28d3d))
- **🧪:** [Add test for specific TTL handling in cache logic] - Implemented a test to verify that the cache correctly handles specific TTL values in the `isCached` option. - The test checks that the cache returns a MISS header on the first request and verifies the cache-control header. - It also ensures that after the TTL expires, the cache still returns a MISS header on subsequent requests. ([9ca8a99c](https://github.com/MRX-Systems/MRX-Core/commit/9ca8a99c))
- **🧪:** [fix test name CoreError to BaseError] ([c02afec2](https://github.com/MRX-Systems/MRX-Core/commit/c02afec2))

### 🎨 Styles

- **🎨:** [fix import order in HOTP tests] Rearranged the import statements in the HOTP test file for consistency and improved readability. ([a66d34d6](https://github.com/MRX-Systems/MRX-Core/commit/a66d34d6))
- **🎨:** [Remove unnecessary blank line in signJWT function] Removed an extra blank line in the signJWT function for improved code readability and consistency. ([8ea44aef](https://github.com/MRX-Systems/MRX-Core/commit/8ea44aef))

### ❤️ Contributors

- Ruby <necrelox@proton.me>

