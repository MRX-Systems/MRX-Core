
## v2.13.0-1-and-293-20260113

[compare changes](https://github.com/MRX-Systems/MRX-Core/compare/v2.12.0-1-and-288-20251203...v2.13.0-1-and-293-20260113)

### 🚀 Enhancements

- **🚀:** [handle union schema handling in buildAdaptiveWhereClauseSchema] ([2b91cd69](https://github.com/MRX-Systems/MRX-Core/commit/2b91cd69))
- **🚀:** [Add HTTP 3xx Redirection Status Codes] ([28145b9f](https://github.com/MRX-Systems/MRX-Core/commit/28145b9f))
- **🚀:** [add clear method to SingletonManager] ([593a0762](https://github.com/MRX-Systems/MRX-Core/commit/593a0762))
- **🚀:** [add input validation and maxSize to MemoryStore] ([47955ca1](https://github.com/MRX-Systems/MRX-Core/commit/47955ca1))

### ⚡ Performance

- **⚡:** [optimize Base32 encode/decode performance] ([8a11e14c](https://github.com/MRX-Systems/MRX-Core/commit/8a11e14c))
- **⚡:** [optimize logger and worker for ~40% performance gain] ([02177319](https://github.com/MRX-Systems/MRX-Core/commit/02177319))
- **⚡:** [rewrite FileLoggerSink with Bun.FileSink] ([b36a73fe](https://github.com/MRX-Systems/MRX-Core/commit/b36a73fe))
- **⚡:** [optimize _isAdaptiveWhereClause for better performance] ([5f0b24d8](https://github.com/MRX-Systems/MRX-Core/commit/5f0b24d8))

### 🔧 Fixes

- **🔧:** [fix copilot comments] ([f7772010](https://github.com/MRX-Systems/MRX-Core/commit/f7772010))
- **🔧:** [fix buildFilterSchema by adding TPartial at runtime] ([ac0aed3b](https://github.com/MRX-Systems/MRX-Core/commit/ac0aed3b))
- **🔧:** [harden BunRedisStore with validation and security] ([58b7bd05](https://github.com/MRX-Systems/MRX-Core/commit/58b7bd05))
- **🔧:** [harden IoRedisStore with validation and security] ([7710485d](https://github.com/MRX-Systems/MRX-Core/commit/7710485d))
- **🔧:** [add security hardening across TOTP/HOTP implementation] ([d256d3c0](https://github.com/MRX-Systems/MRX-Core/commit/d256d3c0))

### 🧹 Refactors

- **🧹:** [Improve filter application logic in repository class] ([b0e04028](https://github.com/MRX-Systems/MRX-Core/commit/b0e04028))
- **🧹:** [Remove old builder] ([f9825bb3](https://github.com/MRX-Systems/MRX-Core/commit/f9825bb3))
- **🧹:** [Refactor secret type casting in hotp function] ([7d0717ae](https://github.com/MRX-Systems/MRX-Core/commit/7d0717ae))
- **🧹:** [replace useless getters with public readonly props in Table] ([ffca96f3](https://github.com/MRX-Systems/MRX-Core/commit/ffca96f3))
- **🧹:** [replace protected props with public readonly in Repository] ([376d5342](https://github.com/MRX-Systems/MRX-Core/commit/376d5342))
- **🧹:** [remove redundant _tables Map and simplify MSSQL class] ([d44f6e81](https://github.com/MRX-Systems/MRX-Core/commit/d44f6e81))
- **🧹:** [improve JWT signing and verification] ([0e584386](https://github.com/MRX-Systems/MRX-Core/commit/0e584386))

### 📖 Documentation

- **📖:** [Add development workflow and code standards documentation] ([056f9b0f](https://github.com/MRX-Systems/MRX-Core/commit/056f9b0f))
- **📖:** [fix MemoryStoreEntry TSDoc comment] ([ffdf1997](https://github.com/MRX-Systems/MRX-Core/commit/ffdf1997))

### 📦 Build

- **📦:** [Update dependencies in package.json] Updated versions of 'elysia', 'jose', and 'mssql' to their latest compatible releases to ensure better performance and security. ([c5385d04](https://github.com/MRX-Systems/MRX-Core/commit/c5385d04))
- **📦:** [Update version and dependencies in package.json] ([deb1fea1](https://github.com/MRX-Systems/MRX-Core/commit/deb1fea1))
- **📦:** [Update devDependencies for eslint and elysia] ([75eb3f44](https://github.com/MRX-Systems/MRX-Core/commit/75eb3f44))
- **📦:** [Update package dependencies and versioning] - Updated version to 2.12.0-1-and-290-20251215 - Upgraded @sinclair/typebox from 0.34.41 to 0.34.46 - Updated @types/bun from 1.3.4 to 1.3.5 - Upgraded globals from 16.5.0 to 17.0.0 - Updated nodemailer from 7.0.11 to 7.0.12 - Upgraded typescript-eslint from 8.49.0 to 8.51.0 - Updated peer dependency @sinclair/typebox to 0.34.46 - Updated peer dependency nodemailer to 7.0.12 ([de6a6b03](https://github.com/MRX-Systems/MRX-Core/commit/de6a6b03))
- **📦:** [update deps of deps] ([931f1b72](https://github.com/MRX-Systems/MRX-Core/commit/931f1b72))
- **📦:** [update version and dependencies] - Updated version to 2.12.0-2-and-291-20260102 - Updated 'elysia' dependency from 1.4.19 to 1.4.21 in devDependencies and peerDependencies ([4313f881](https://github.com/MRX-Systems/MRX-Core/commit/4313f881))
- **📦:** [update dependencies in package.json] Updated various devDependencies and peerDependencies to their latest versions for improved stability and performance. ([9e068e02](https://github.com/MRX-Systems/MRX-Core/commit/9e068e02))

### 🌊 Types

- **🌊:** [Handle TUnion in AdaptiveWhereClauseSchema definitions] ([bddf0116](https://github.com/MRX-Systems/MRX-Core/commit/bddf0116))
- **🌊:** [Optimize cache.d.ts size using inline Elysia types] ([c9d3c873](https://github.com/MRX-Systems/MRX-Core/commit/c9d3c873))
- **🌊:** [Optimize rate-limit.d.ts size using inline Elysia types] ([44009a7e](https://github.com/MRX-Systems/MRX-Core/commit/44009a7e))
- **🌊:** [Optimize db-resolver.d.ts size using inline Elysia types] ([7cfce82e](https://github.com/MRX-Systems/MRX-Core/commit/7cfce82e))
- **🌊:** [fix type of plugins] ([e566ac5e](https://github.com/MRX-Systems/MRX-Core/commit/e566ac5e))
- **🌊:** [add new error keys for validation] ([20a6f328](https://github.com/MRX-Systems/MRX-Core/commit/20a6f328))
- **🌊:** [add JWT verification error keys] ([43bff79e](https://github.com/MRX-Systems/MRX-Core/commit/43bff79e))
- **🌊:** [add HashAlgorithm, OtpDigits and new error keys] ([6f70ea39](https://github.com/MRX-Systems/MRX-Core/commit/6f70ea39))

### 🦉 Chore

- **🦉:** [change comment separator] ([bb4ccc96](https://github.com/MRX-Systems/MRX-Core/commit/bb4ccc96))
- **🦉:** [clean changelog] ([0ed06e6b](https://github.com/MRX-Systems/MRX-Core/commit/0ed06e6b))
- **🦉:** V2.12.0-1-and-291-20260102 ([8db75fc7](https://github.com/MRX-Systems/MRX-Core/commit/8db75fc7))
- **🦉:** V2.12.0 ([52124411](https://github.com/MRX-Systems/MRX-Core/commit/52124411))
- **🦉:** [Add new agents for code review, documentation, performance, security, and testing] ([2a7b4dbf](https://github.com/MRX-Systems/MRX-Core/commit/2a7b4dbf))

### 🧪 Tests

- **🧪:** [Remove old tests] ([a54966df](https://github.com/MRX-Systems/MRX-Core/commit/a54966df))
- **🧪:** [add tests for SingletonManager clear] ([16968689](https://github.com/MRX-Systems/MRX-Core/commit/16968689))
- **🧪:** [update test for integer-only increment amounts] ([45448e5a](https://github.com/MRX-Systems/MRX-Core/commit/45448e5a))
- **🧪:** [update JWT tests for throwing verifyJWT] ([86b6bee2](https://github.com/MRX-Systems/MRX-Core/commit/86b6bee2))
- **🧪:** [expand test coverage from 39 to 80 tests] ([113eaced](https://github.com/MRX-Systems/MRX-Core/commit/113eaced))

### 🤖 CI

- **🤖:** [try to fix publish npm] ([b32988eb](https://github.com/MRX-Systems/MRX-Core/commit/b32988eb))

### ❤️ Contributors

- Ruby <necrelox@proton.me>
- Komiriko <komiriko@pm.me>
- Github-actions <maxime.meriaux@mrxsys.com>

## v2.12.0

[compare changes](https://github.com/MRX-Systems/MRX-Core/compare/v2.12.0-1-and-288-20251203...v2.12.0)

### 🚀 Enhancements

- **🚀:** [handle union schema handling in buildAdaptiveWhereClauseSchema] ([2b91cd69](https://github.com/MRX-Systems/MRX-Core/commit/2b91cd69))

### 🔧 Fixes

- **🔧:** [fix copilot comments] ([f7772010](https://github.com/MRX-Systems/MRX-Core/commit/f7772010))
- **🔧:** [fix buildFilterSchema by adding TPartial at runtime] ([ac0aed3b](https://github.com/MRX-Systems/MRX-Core/commit/ac0aed3b))

### 🧹 Refactors

- **🧹:** [Improve filter application logic in repository class] ([b0e04028](https://github.com/MRX-Systems/MRX-Core/commit/b0e04028))
- **🧹:** [Remove old builder] ([f9825bb3](https://github.com/MRX-Systems/MRX-Core/commit/f9825bb3))
- **🧹:** [Refactor secret type casting in hotp function] ([7d0717ae](https://github.com/MRX-Systems/MRX-Core/commit/7d0717ae))
- **🧹:** [replace useless getters with public readonly props in Table] ([ffca96f3](https://github.com/MRX-Systems/MRX-Core/commit/ffca96f3))
- **🧹:** [replace protected props with public readonly in Repository] ([376d5342](https://github.com/MRX-Systems/MRX-Core/commit/376d5342))
- **🧹:** [remove redundant _tables Map and simplify MSSQL class] ([d44f6e81](https://github.com/MRX-Systems/MRX-Core/commit/d44f6e81))

### 📖 Documentation

- **📖:** [Add development workflow and code standards documentation] ([056f9b0f](https://github.com/MRX-Systems/MRX-Core/commit/056f9b0f))

### 📦 Build

- **📦:** [Update dependencies in package.json] Updated versions of 'elysia', 'jose', and 'mssql' to their latest compatible releases to ensure better performance and security. ([c5385d04](https://github.com/MRX-Systems/MRX-Core/commit/c5385d04))
- **📦:** [Update version and dependencies in package.json] ([deb1fea1](https://github.com/MRX-Systems/MRX-Core/commit/deb1fea1))
- **📦:** [Update devDependencies for eslint and elysia] ([75eb3f44](https://github.com/MRX-Systems/MRX-Core/commit/75eb3f44))
- **📦:** [Update package dependencies and versioning] - Updated version to 2.12.0-1-and-290-20251215 - Upgraded @sinclair/typebox from 0.34.41 to 0.34.46 - Updated @types/bun from 1.3.4 to 1.3.5 - Upgraded globals from 16.5.0 to 17.0.0 - Updated nodemailer from 7.0.11 to 7.0.12 - Upgraded typescript-eslint from 8.49.0 to 8.51.0 - Updated peer dependency @sinclair/typebox to 0.34.46 - Updated peer dependency nodemailer to 7.0.12 ([de6a6b03](https://github.com/MRX-Systems/MRX-Core/commit/de6a6b03))
- **📦:** [update deps of deps] ([931f1b72](https://github.com/MRX-Systems/MRX-Core/commit/931f1b72))
- **📦:** [update version and dependencies] - Updated version to 2.12.0-2-and-291-20260102 - Updated 'elysia' dependency from 1.4.19 to 1.4.21 in devDependencies and peerDependencies ([4313f881](https://github.com/MRX-Systems/MRX-Core/commit/4313f881))

### 🌊 Types

- **🌊:** [Handle TUnion in AdaptiveWhereClauseSchema definitions] ([bddf0116](https://github.com/MRX-Systems/MRX-Core/commit/bddf0116))
- **🌊:** [Optimize cache.d.ts size using inline Elysia types] ([c9d3c873](https://github.com/MRX-Systems/MRX-Core/commit/c9d3c873))
- **🌊:** [Optimize rate-limit.d.ts size using inline Elysia types] ([44009a7e](https://github.com/MRX-Systems/MRX-Core/commit/44009a7e))
- **🌊:** [Optimize db-resolver.d.ts size using inline Elysia types] ([7cfce82e](https://github.com/MRX-Systems/MRX-Core/commit/7cfce82e))
- **🌊:** [fix type of plugins] ([e566ac5e](https://github.com/MRX-Systems/MRX-Core/commit/e566ac5e))

### 🦉 Chore

- **🦉:** [change comment separator] ([bb4ccc96](https://github.com/MRX-Systems/MRX-Core/commit/bb4ccc96))
- **🦉:** [clean changelog] ([0ed06e6b](https://github.com/MRX-Systems/MRX-Core/commit/0ed06e6b))
- **🦉:** V2.12.0-1-and-291-20260102 ([8db75fc7](https://github.com/MRX-Systems/MRX-Core/commit/8db75fc7))

### 🧪 Tests

- **🧪:** [Remove old tests] ([a54966df](https://github.com/MRX-Systems/MRX-Core/commit/a54966df))

### 🤖 CI

- **🤖:** [try to fix publish npm] ([b32988eb](https://github.com/MRX-Systems/MRX-Core/commit/b32988eb))

### ❤️ Contributors

- Ruby <necrelox@proton.me>
- Github-actions <maxime.meriaux@mrxsys.com>

## v2.12.0-1-and-291-20260102

[compare changes](https://github.com/MRX-Systems/MRX-Core/compare/v2.12.0-1-and-288-20251203...v2.12.0-1-and-291-20260102)

### 🚀 Enhancements

- **🚀:** [handle union schema handling in buildAdaptiveWhereClauseSchema] ([f87947cc](https://github.com/MRX-Systems/MRX-Core/commit/f87947cc))

### 🔧 Fixes

- **🔧:** [fix buildFilterSchema by adding TPartial at runtime] ([79751af5](https://github.com/MRX-Systems/MRX-Core/commit/79751af5))

### 🧹 Refactors

- **🧹:** [Improve filter application logic in repository class] ([b0e04028](https://github.com/MRX-Systems/MRX-Core/commit/b0e04028))
- **🧹:** [Remove old builder] ([94d922ec](https://github.com/MRX-Systems/MRX-Core/commit/94d922ec))
- **🧹:** [Refactor secret type casting in hotp function] ([15a77506](https://github.com/MRX-Systems/MRX-Core/commit/15a77506))

### 📖 Documentation

- **📖:** [Add development workflow and code standards documentation] ([430f381e](https://github.com/MRX-Systems/MRX-Core/commit/430f381e))

### 📦 Build

- **📦:** [Update dependencies in package.json] Updated versions of 'elysia', 'jose', and 'mssql' to their latest compatible releases to ensure better performance and security. ([c5385d04](https://github.com/MRX-Systems/MRX-Core/commit/c5385d04))
- **📦:** [Update version and dependencies in package.json] ([deb1fea1](https://github.com/MRX-Systems/MRX-Core/commit/deb1fea1))
- **📦:** [Update devDependencies for eslint and elysia] ([e0961393](https://github.com/MRX-Systems/MRX-Core/commit/e0961393))
- **📦:** [Update package dependencies and versioning] - Updated version to 2.12.0-1-and-290-20251215 - Upgraded @sinclair/typebox from 0.34.41 to 0.34.46 - Updated @types/bun from 1.3.4 to 1.3.5 - Upgraded globals from 16.5.0 to 17.0.0 - Updated nodemailer from 7.0.11 to 7.0.12 - Upgraded typescript-eslint from 8.49.0 to 8.51.0 - Updated peer dependency @sinclair/typebox to 0.34.46 - Updated peer dependency nodemailer to 7.0.12 ([fef1fef0](https://github.com/MRX-Systems/MRX-Core/commit/fef1fef0))
- **📦:** [update deps of deps] ([3b30711d](https://github.com/MRX-Systems/MRX-Core/commit/3b30711d))

### 🌊 Types

- **🌊:** [Handle TUnion in AdaptiveWhereClauseSchema definitions] ([8791c7cc](https://github.com/MRX-Systems/MRX-Core/commit/8791c7cc))
- **🌊:** [Optimize cache.d.ts size using inline Elysia types] ([03d11448](https://github.com/MRX-Systems/MRX-Core/commit/03d11448))
- **🌊:** [Optimize rate-limit.d.ts size using inline Elysia types] ([899c4bae](https://github.com/MRX-Systems/MRX-Core/commit/899c4bae))
- **🌊:** [Optimize db-resolver.d.ts size using inline Elysia types] ([3b134abc](https://github.com/MRX-Systems/MRX-Core/commit/3b134abc))

### 🦉 Chore

- **🦉:** [change comment separator] ([d6c5b917](https://github.com/MRX-Systems/MRX-Core/commit/d6c5b917))
- **🦉:** [clean changelog] ([027410dd](https://github.com/MRX-Systems/MRX-Core/commit/027410dd))

### 🧪 Tests

- **🧪:** [Remove old tests] ([a717eef4](https://github.com/MRX-Systems/MRX-Core/commit/a717eef4))

### ❤️ Contributors

- Ruby <necrelox@proton.me>

