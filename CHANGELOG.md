
## v2.7.0

[compare changes](https://github.com/MRX-Systems/MRX-Core/compare/v2.6.0-canary-20250805-40e4647...v2.7.0)

### 🚀 Enhancements

- **🚀:** AND-228 fix throwIfNoResult custom message ([a1228463](https://github.com/MRX-Systems/MRX-Core/commit/a1228463))
- **🚀:** [add Base32 encoding and decoding utilities] ([e64b06cd](https://github.com/MRX-Systems/MRX-Core/commit/e64b06cd))
- **🚀:** [add createCounterBuffer utility function] ([29af86e4](https://github.com/MRX-Systems/MRX-Core/commit/29af86e4))
- **🚀:** [add generateHmac utility function] ([30142a1e](https://github.com/MRX-Systems/MRX-Core/commit/30142a1e))
- **🚀:** [add unit tests for generateHmac utility function] ([9ff1643a](https://github.com/MRX-Systems/MRX-Core/commit/9ff1643a))
- **🚀:** [add TOTP error keys and generateSecretBytes utility function] ([527008ea](https://github.com/MRX-Systems/MRX-Core/commit/527008ea))
- **🚀:** [add dynamic truncation utility function for HMAC results] ([31c261b0](https://github.com/MRX-Systems/MRX-Core/commit/31c261b0))
- **🚀:** [add utility functions exports for TOTP module] ## Features - Exported utility functions: base32Decode, base32Encode, createCounterBuffer, generateSecretBytes, generateHmac, and dynamicTruncation. ([c92359bd](https://github.com/MRX-Systems/MRX-Core/commit/c92359bd))
- **🚀:** [implement TOTP and HOTP functionalities] ([9a9a3983](https://github.com/MRX-Systems/MRX-Core/commit/9a9a3983))
- **🚀:** [add TOTP module exports for better accessibility] ([aec89c93](https://github.com/MRX-Systems/MRX-Core/commit/aec89c93))
- **🚀:** [add TOTP_ERROR_KEYS export for error handling] ([73e361e3](https://github.com/MRX-Systems/MRX-Core/commit/73e361e3))
- **🚀:** [Add OtpAuth URI type and refactor related code] ([2c2d2b88](https://github.com/MRX-Systems/MRX-Core/commit/2c2d2b88))
- **🚀:** [refactor rate limiting implementation and add MemoryStore] ([158b7ddf](https://github.com/MRX-Systems/MRX-Core/commit/158b7ddf))

### 🔧 Fixes

- **🔧:** [Improve error message handling for no results] ([76c297fa](https://github.com/MRX-Systems/MRX-Core/commit/76c297fa))
- **🔧:** [Fix review] ([87c68deb](https://github.com/MRX-Systems/MRX-Core/commit/87c68deb))

### 🧹 Refactors

- **🧹:** [Change in tenary expression] ([4b4c4864](https://github.com/MRX-Systems/MRX-Core/commit/4b4c4864))
- **🧹:** [Update orderBy syntax for query builder] - Refactored the orderBy method to include table name in the query. - Ensured that selected fields are properly referenced with the table name for better clarity and to avoid potential conflicts. ([53eb355e](https://github.com/MRX-Systems/MRX-Core/commit/53eb355e))
- **🧹:** [Refactor query returning and selection logic] ([a6b46fb2](https://github.com/MRX-Systems/MRX-Core/commit/a6b46fb2))
- **🧹:** [Simplify query returning and selection logic] ([b6c04169](https://github.com/MRX-Systems/MRX-Core/commit/b6c04169))
- **🧹:** [Refactor HOTP options parameter initialization] ## Refactoring - Updated the HOTP function's options parameter to provide a default value. ([3937ae22](https://github.com/MRX-Systems/MRX-Core/commit/3937ae22))
- **🧹:** [correct export name for rate limiting module] ([cbb3e9f7](https://github.com/MRX-Systems/MRX-Core/commit/cbb3e9f7))
- **🧹:** [standardize rate limit module exports and structure] ## Refactoring - Corrected export names in the rate limiting module for consistency. - Removed outdated `ratelimitErrorKeys` file and integrated its functionality into the main rate limiting logic. - Updated test cases to reflect the new export structure and ensure proper functionality. - Introduced a new `rateLimit` function with comprehensive documentation. ([f192bb39](https://github.com/MRX-Systems/MRX-Core/commit/f192bb39))

### 📖 Documentation

- **📖:** [Update documentation for RenameKey type utility] ([379a2403](https://github.com/MRX-Systems/MRX-Core/commit/379a2403))

### 📦 Build

- **📦:** [update devDependencies to latest versions] Updated @eslint/js, @stylistic/eslint-plugin, @types/bun, eslint, and typescript-eslint to their latest versions for improved functionality and compatibility. ([1c40c8e7](https://github.com/MRX-Systems/MRX-Core/commit/1c40c8e7))
- **📦:** [add TOTP module paths to builder and package.json] ([d5ad0b26](https://github.com/MRX-Systems/MRX-Core/commit/d5ad0b26))

### 🌊 Types

- **🌊:** [fix TOperations with default CrudOperationsOptions] ([b8b6169d](https://github.com/MRX-Systems/MRX-Core/commit/b8b6169d))
- **🌊:** [add RenameKey type utility for key renaming in objects] ([0d661646](https://github.com/MRX-Systems/MRX-Core/commit/0d661646))
- **🌊:** [Add RenameKey type to type definitions] ## Type Changes - Added `RenameKey` type to the type definitions in `index.ts`. ([e389bcba](https://github.com/MRX-Systems/MRX-Core/commit/e389bcba))
- **🌊:** [add type definitions for TOTP module] ([03917acc](https://github.com/MRX-Systems/MRX-Core/commit/03917acc))
- **🌊:** [Update OtpAuthUri interface for optional properties] ## Type Changes - Made `algorithm`, `digits`, and `period` properties optional in the `OtpAuthUri` interface. ([d1d47681](https://github.com/MRX-Systems/MRX-Core/commit/d1d47681))

### 🦉 Chore

- **🦉:** V2.6.0 ([3a016766](https://github.com/MRX-Systems/MRX-Core/commit/3a016766))
- **🦉:** [clean up CHANGELOG.md for better readability] ([ab70e0fc](https://github.com/MRX-Systems/MRX-Core/commit/ab70e0fc))

### 🧪 Tests

- **🧪:** [Update error message for no result case] ## Tests - Changed the error message for the no result case in the repository tests. ([0f71ce8f](https://github.com/MRX-Systems/MRX-Core/commit/0f71ce8f))
- **🧪:** [add unit tests for Base32 encoding and decoding] ([2b25e11d](https://github.com/MRX-Systems/MRX-Core/commit/2b25e11d))
- **🧪:** [add unit tests for createCounterBuffer function] ([71153e42](https://github.com/MRX-Systems/MRX-Core/commit/71153e42))
- **🧪:** [add unit tests for generateSecretBytes utility function] ([bb33cd78](https://github.com/MRX-Systems/MRX-Core/commit/bb33cd78))
- **🧪:** [add unit tests for dynamic truncation utility function] ([ba6fee56](https://github.com/MRX-Systems/MRX-Core/commit/ba6fee56))
- **🧪:** [add comprehensive unit tests for TOTP functionalities] ([82d5f4d1](https://github.com/MRX-Systems/MRX-Core/commit/82d5f4d1))
- **🧪:** [add comprehensive tests for MemoryStore functionality] ([d1364340](https://github.com/MRX-Systems/MRX-Core/commit/d1364340))
- **🧪:** Enhance rate limiting tests for Redis and memory stores ([2df081e1](https://github.com/MRX-Systems/MRX-Core/commit/2df081e1))

### 🤖 CI

- **🤖:** [Add CI workflows for build, test, and deployment] ([7d98d68b](https://github.com/MRX-Systems/MRX-Core/commit/7d98d68b))
- **🤖:** [update copilot instructions] ([a8540b78](https://github.com/MRX-Systems/MRX-Core/commit/a8540b78))

### ❤️ Contributors

- Ruby <necrelox@proton.me>
- Github-actions <maxime.meriaux@mrxsys.com>

