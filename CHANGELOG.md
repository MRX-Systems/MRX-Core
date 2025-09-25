
## v2.11.0-1-and-267-20250925

[compare changes](https://github.com/MRX-Systems/MRX-Core/compare/v2.10.1-1-and-263-20250924...v2.11.0-1-and-267-20250925)

### 🚀 Enhancements

- **🚀:** [Add microservice success keys for responses] ## Features - Introduced `MICROSERVICE_SUCCESS_KEYS` for consistent success messages. ([1e8020c6](https://github.com/MRX-Systems/MRX-Core/commit/1e8020c6))
- **🚀:** [Add CRUD success keys enumeration] ([98c53251](https://github.com/MRX-Systems/MRX-Core/commit/98c53251))
- **🚀:** [Integrate CRUD success keys into response messages] ([a0d20b27](https://github.com/MRX-Systems/MRX-Core/commit/a0d20b27))
- **🚀:** [Add new entrypoints] ([eae4a1c6](https://github.com/MRX-Systems/MRX-Core/commit/eae4a1c6))

### 🔧 Fixes

- **🔧:** [Update error response structure to use 'content' instead of 'cause'] ## Bug Fixes - Changed the error response property from 'cause' to 'content' for consistency. ([2fd8fab3](https://github.com/MRX-Systems/MRX-Core/commit/2fd8fab3))
- **🔧:** [Add missing error handling for 'PARSE' case] ## Bug Fixes - Added error handling for the 'PARSE' case in the error plugin. ([395f2265](https://github.com/MRX-Systems/MRX-Core/commit/395f2265))
- **🔧:** [Update error keys to include 'mrx-core' prefix] ([0dd9ba3d](https://github.com/MRX-Systems/MRX-Core/commit/0dd9ba3d))
- **🔧:** [Refactor error handling to use ERROR_KEYS constants] ## Bug Fixes - Updated error messages to utilize constants from ERROR_KEYS. ([e1a2e9d2](https://github.com/MRX-Systems/MRX-Core/commit/e1a2e9d2))
- **🔧:** [WTF] ([9e33e9dc](https://github.com/MRX-Systems/MRX-Core/commit/9e33e9dc))

### 📦 Build

- **📦:** [Add new entrypoits] ([8815abfb](https://github.com/MRX-Systems/MRX-Core/commit/8815abfb))

### 🧪 Tests

- **🧪:** [Update error response structure to use 'content' instead of 'cause'] ([7071a151](https://github.com/MRX-Systems/MRX-Core/commit/7071a151))
- **🧪:** [Update error handling for static database not found] ([f3f89593](https://github.com/MRX-Systems/MRX-Core/commit/f3f89593))
- **🧪:** [Update error messages to include 'mrx-core' prefix] ## Tests - Updated error messages in the `parseHumanTimeToSeconds` tests to include the 'mrx-core' prefix. ([6898c33a](https://github.com/MRX-Systems/MRX-Core/commit/6898c33a))
- **🧪:** [Update error message to include 'mrx-core' prefix] ## Tests - Updated the error message for rate limit exceeded response. ([8e2e2f79](https://github.com/MRX-Systems/MRX-Core/commit/8e2e2f79))
- **🧪:** [Integrate success keys for microservice responses] ([ab39a2d5](https://github.com/MRX-Systems/MRX-Core/commit/ab39a2d5))

### ❤️ Contributors

- Ruby <necrelox@proton.me>

## v2.10.1-1-and-263-20250924

[compare changes](https://github.com/MRX-Systems/MRX-Core/compare/v2.10.0-and-262-20250924...v2.10.1-1-and-263-20250924)

### 🔧 Fixes

- **🔧:** [Correct expiration calculation in signJWT function] ## Bug Fixes - Fixed the expiration time calculation in the `signJWT` function to ensure it correctly adds the parsed human-readable time to the current timestamp. ([3493f499](https://github.com/MRX-Systems/MRX-Core/commit/3493f499))

### 📦 Build

- **📦:** [Update peer dependencies for elysia and ioredis] Updated the peer dependencies for `elysia` to version `^1.4.7` and `ioredis` to version `^5.8.0` in package.json to ensure compatibility with the latest features and improvements. ([b2aa92d0](https://github.com/MRX-Systems/MRX-Core/commit/b2aa92d0))

### 🦉 Chore

- **🦉:** V2.10.0 ([b99a11ce](https://github.com/MRX-Systems/MRX-Core/commit/b99a11ce))

### 🧪 Tests

- **🧪:** [Enhance JWT expiration tests with additional scenarios] ## Tests - Added new test cases for various expiration scenarios including:   - Date expiration for 30 minutes and 1 day.   - Human-readable time expressions for 15 minutes, 2 hours, and 30 minutes.   - Additional checks for past expiration handling. - Improved tolerance checks for expiration validation. ([eefe5aca](https://github.com/MRX-Systems/MRX-Core/commit/eefe5aca))

### ❤️ Contributors

- Ruby <necrelox@proton.me>
- Github-actions <maxime.meriaux@mrxsys.com>

## v2.10.0

[compare changes](https://github.com/MRX-Systems/MRX-Core/compare/v2.10.0-and-262-20250924...v2.10.0)

## v2.10.0-and-262-20250924

[compare changes](https://github.com/MRX-Systems/MRX-Core/compare/v2.9.0-1-and-259-20250918...v2.10.0-and-262-20250924)

### 🚀 Enhancements

- **🚀:** [Refactor CRUD operations to use getDbInjection utility] ([13eac707](https://github.com/MRX-Systems/MRX-Core/commit/13eac707))

### 📦 Build

- **📦:** [Update elysia dependency version in package.json] ([54db5ba5](https://github.com/MRX-Systems/MRX-Core/commit/54db5ba5))

### 🌊 Types

- **🌊:** [Enhance RenameKey type definition for clarity] ([41c26e24](https://github.com/MRX-Systems/MRX-Core/commit/41c26e24))
- **🌊:** [Add AddPrefixToAllKeys type definition] ([d2c0544d](https://github.com/MRX-Systems/MRX-Core/commit/d2c0544d))

### 🦉 Chore

- **🦉:** V2.9.0 ([2a7532dc](https://github.com/MRX-Systems/MRX-Core/commit/2a7532dc))

### ❤️ Contributors

- Ruby <necrelox@proton.me>
- Github-actions <maxime.meriaux@mrxsys.com>

## v2.9.0

[compare changes](https://github.com/MRX-Systems/MRX-Core/compare/v2.9.0-1-and-259-20250918...v2.9.0)

### 🚀 Enhancements

- **🚀:** [Refactor CRUD operations to use getDbInjection utility] ([13eac707](https://github.com/MRX-Systems/MRX-Core/commit/13eac707))

### 📦 Build

- **📦:** [Update elysia dependency version in package.json] ([54db5ba5](https://github.com/MRX-Systems/MRX-Core/commit/54db5ba5))

### ❤️ Contributors

- Ruby <necrelox@proton.me>

## v2.9.0-1-and-259-20250918

[compare changes](https://github.com/MRX-Systems/MRX-Core/compare/v2.8.0...v2.9.0-1-and-259-20250918)

### 🚀 Enhancements

- **🚀:** [Add new CrudSchema] ([5820a1d0](https://github.com/MRX-Systems/MRX-Core/commit/5820a1d0))
- **🚀:** [Add flatten utility for nested union types] ([f856ebb2](https://github.com/MRX-Systems/MRX-Core/commit/f856ebb2))
- **🚀:** [Add CRUD operations for count, delete, find, insert, and update] ([71a03b21](https://github.com/MRX-Systems/MRX-Core/commit/71a03b21))
- **🚀:** [Add crud plugin] ([913bcdba](https://github.com/MRX-Systems/MRX-Core/commit/913bcdba))
- **🚀:** [Add CRUD module exports and type definitions] ([abd8d243](https://github.com/MRX-Systems/MRX-Core/commit/abd8d243))
- **🚀:** [Add db-resolver module export] ([2bbcfead](https://github.com/MRX-Systems/MRX-Core/commit/2bbcfead))

### ⚡ Performance

- **⚡:** [Replace TypeGuard with KindGuard in adaptive where clause schema] ([039baae5](https://github.com/MRX-Systems/MRX-Core/commit/039baae5))

### 🔧 Fixes

- **🔧:** [Fix entrypoint and other] ([ef213c5f](https://github.com/MRX-Systems/MRX-Core/commit/ef213c5f))
- **🔧:** [Fix pr] ([1f951675](https://github.com/MRX-Systems/MRX-Core/commit/1f951675))
- **🔧:** [Fix pr 2] ([8c4509ff](https://github.com/MRX-Systems/MRX-Core/commit/8c4509ff))
- **🔧:** [Update test/unit/modules/jwt/jwt.spec.ts] ([e88996fc](https://github.com/MRX-Systems/MRX-Core/commit/e88996fc))
- **🔧:** [Update source/modules/elysia/crud-schema/utils/create-response-200-schema.ts] ([524f94cb](https://github.com/MRX-Systems/MRX-Core/commit/524f94cb))
- **🔧:** [fix handling of selectedFields in query builder] ([1e6aea40](https://github.com/MRX-Systems/MRX-Core/commit/1e6aea40))
- **🔧:** [Fix update & delete method to exec query with option throwIfNoResult] ([569fc41e](https://github.com/MRX-Systems/MRX-Core/commit/569fc41e))
- **🔧:** [PR Correction] ([0ea07dae](https://github.com/MRX-Systems/MRX-Core/commit/0ea07dae))
- **🔧:** [Update path for find operation to '/find'] ## Bug Fixes - Corrected the default path for the find operation from '/search' to '/find'. ([45c6085e](https://github.com/MRX-Systems/MRX-Core/commit/45c6085e))
- **🔧:** [Change deprecated response parameter to responseValue in afterHandle] ([b6bb9580](https://github.com/MRX-Systems/MRX-Core/commit/b6bb9580))
- **🔧:** [Update db-resolver, add prefix in cause] ([cd1351a8](https://github.com/MRX-Systems/MRX-Core/commit/cd1351a8))

### 🧹 Refactors

- **🧹:** [error module rename files to kebab-case and refacto BaseError] ([51334872](https://github.com/MRX-Systems/MRX-Core/commit/51334872))
- **🧹:** [error module rename files to kebab-case and refacto BaseError] ([84cb8951](https://github.com/MRX-Systems/MRX-Core/commit/84cb8951))
- **🧹:** [database module rename files to kebab-case and refacto BaseError] ([7ed791ac](https://github.com/MRX-Systems/MRX-Core/commit/7ed791ac))
- **🧹:** [repository module rename files to kebab-case and refacto BaseError] ([f8ffde81](https://github.com/MRX-Systems/MRX-Core/commit/f8ffde81))
- **🧹:** [totp module rename files to kebab-case and refacto BaseError] ([64656932](https://github.com/MRX-Systems/MRX-Core/commit/64656932))
- **🧹:** [typed-event-emitter module rename files to kebab-case and refacto BaseError] ([767b024f](https://github.com/MRX-Systems/MRX-Core/commit/767b024f))
- **🧹:** [singleton-manager module rename files to kebab-case and refacto BaseError] ([0f44c222](https://github.com/MRX-Systems/MRX-Core/commit/0f44c222))
- **🧹:** [mailer module rename files to kebab-case and refacto BaseError] ([9191f7a4](https://github.com/MRX-Systems/MRX-Core/commit/9191f7a4))
- **🧹:** [logger module rename files to kebab-case and refacto BaseError] ([0e88299e](https://github.com/MRX-Systems/MRX-Core/commit/0e88299e))
- **🧹:** [kv-store module rename files to kebab-case and refacto BaseError] ([5240ebe8](https://github.com/MRX-Systems/MRX-Core/commit/5240ebe8))
- **🧹:** [jwt module rename files to kebab-case and refacto BaseError] ([59d38869](https://github.com/MRX-Systems/MRX-Core/commit/59d38869))
- **🧹:** [ratelimit module rename files to kebab-case and refacto BaseError] ([18383311](https://github.com/MRX-Systems/MRX-Core/commit/18383311))
- **🧹:** [db-resolver module rename files to kebab-case and refacto BaseError] ([493dd447](https://github.com/MRX-Systems/MRX-Core/commit/493dd447))
- **🧹:** [crud schema module rename files to kebab-case and refacto BaseError] ([1ee9af34](https://github.com/MRX-Systems/MRX-Core/commit/1ee9af34))
- **🧹:** [crud module rename files to kebab-case and refacto BaseError] ([7282132c](https://github.com/MRX-Systems/MRX-Core/commit/7282132c))
- **🧹:** [cache module rename files to kebab-case and refacto BaseError] ([2a229985](https://github.com/MRX-Systems/MRX-Core/commit/2a229985))
- **🧹:** [refactor imports and clean up code structure] ([e0ca7178](https://github.com/MRX-Systems/MRX-Core/commit/e0ca7178))
- **🧹:** [Remove old crud-schema module] ([76e1975b](https://github.com/MRX-Systems/MRX-Core/commit/76e1975b))
- **🧹:** [Remove old crud] ([72423e48](https://github.com/MRX-Systems/MRX-Core/commit/72423e48))
- **🧹:** [rename crud-models-type to crud-schema-models-type] ([b3269ea7](https://github.com/MRX-Systems/MRX-Core/commit/b3269ea7))
- **🧹:** [Rename global utils to shared for types enums and utils] ([42b57652](https://github.com/MRX-Systems/MRX-Core/commit/42b57652))
- **🧹:** [Refactor isDateFromElysiaTypeBox for clarity and consistency] ## Refactoring - Updated the import statements for clarity. - Replaced direct property access with KindGuard methods for better readability and maintainability. ([1461fb40](https://github.com/MRX-Systems/MRX-Core/commit/1461fb40))
- **🧹:** [Refactor createPropertiesSchema for improved clarity] ## Refactoring - Updated the type definition for `clauseSchema` to use `TFlatten` for better type handling. - Replaced direct usage of `t.Union` with `flatten(t.Union(...))` to enhance readability and maintainability. ([6664fbc3](https://github.com/MRX-Systems/MRX-Core/commit/6664fbc3))
- **🧹:** [Refactor TFlatten] ([2816c18c](https://github.com/MRX-Systems/MRX-Core/commit/2816c18c))
- **🧹:** [Update import paths for shared utilities] ([115298e7](https://github.com/MRX-Systems/MRX-Core/commit/115298e7))
- **🧹:** [Refactor response schema handling for clarity] ([995ff541](https://github.com/MRX-Systems/MRX-Core/commit/995ff541))
- **🧹:** [Refactor type exports in index files] - Updated type exports in `source/shared/types/index.ts` to include `TFlatten`. - Corrected export statement in `source/shared/utils/index.ts` for `flatten`. ([a5495345](https://github.com/MRX-Systems/MRX-Core/commit/a5495345))
- **🧹:** [Update CRUD and crud-schema module imports] ([7a3b4226](https://github.com/MRX-Systems/MRX-Core/commit/7a3b4226))
- **🧹:** [Uncomment params in CRUD operations] ([94251627](https://github.com/MRX-Systems/MRX-Core/commit/94251627))
- **🧹:** [Improve SingletonManager registration logic] ([1d2fb5f8](https://github.com/MRX-Systems/MRX-Core/commit/1d2fb5f8))
- **🧹:** [use new prototype of SingletonManager.register] ([1b7055cb](https://github.com/MRX-Systems/MRX-Core/commit/1b7055cb))
- **🧹:** [Update error keys for SingletonManager] Refactored error keys in SingletonManager to use more accurate terminology. - Changed CLASS_CONSTRUCTOR_ALREADY_REGISTERED to CLASS_INSTANCE_ALREADY_REGISTERED - Changed CLASS_CONSTRUCTOR_NOT_REGISTERED to CLASS_INSTANCE_NOT_REGISTERED Updated corresponding tests to reflect these changes. ([6b4368eb](https://github.com/MRX-Systems/MRX-Core/commit/6b4368eb))
- **🧹:** [Simplify dbResolver implementation and remove unused code] ## Refactoring - Removed unused imports and types related to dynamic database options. - Simplified the `dbResolver` function by eliminating unnecessary complexity. - Streamlined the error handling for static database resolution. ## Description This commit refactors the `dbResolver` implementation by removing unused code and simplifying the logic. The changes enhance readability and maintainability while ensuring that the core functionality remains intact. ([2ce26419](https://github.com/MRX-Systems/MRX-Core/commit/2ce26419))
- **🧹:** [Refactor CRUD operations to use new dbResolver] ([2070b4d1](https://github.com/MRX-Systems/MRX-Core/commit/2070b4d1))

### 📖 Documentation

- **📖:** [Update tsdoc singleton-manager.register] ([ec420015](https://github.com/MRX-Systems/MRX-Core/commit/ec420015))
- **📖:** [Update tsdoc singleton-manager.unregister] ([e97233b4](https://github.com/MRX-Systems/MRX-Core/commit/e97233b4))

### 📦 Build

- **📦:** [update error module import path] Changed the import path for error types from 'types/index.ts' to 'utils/index.ts' to better reflect the structure and purpose of the files. ([d3adc500](https://github.com/MRX-Systems/MRX-Core/commit/d3adc500))
- **📦:** [update exports path for error utilities] Updated the exports path for error utilities in package.json to point to the correct utils directory. This change ensures that the application correctly references the utility functions for error handling. ([d38ec275](https://github.com/MRX-Systems/MRX-Core/commit/d38ec275))
- **📦:** [Update test timeout values in package.json] ([84128961](https://github.com/MRX-Systems/MRX-Core/commit/84128961))
- **📦:** [Update dependencies in package.json] ([d782c873](https://github.com/MRX-Systems/MRX-Core/commit/d782c873))
- **📦:** [Update package dependencies and exports] ([3cadc25a](https://github.com/MRX-Systems/MRX-Core/commit/3cadc25a))
- **📦:** [Update elysia dependency to version 1.4.5] ([18320d6d](https://github.com/MRX-Systems/MRX-Core/commit/18320d6d))
- **📦:** [Update typescript-eslint dependency to version 8.44.0] ([92bcd88f](https://github.com/MRX-Systems/MRX-Core/commit/92bcd88f))
- **📦:** [Remove old entrypoint] ([56bb697c](https://github.com/MRX-Systems/MRX-Core/commit/56bb697c))

### 🌊 Types

- **🌊:** [Improve return type with conditionnal header] ([1f304cec](https://github.com/MRX-Systems/MRX-Core/commit/1f304cec))
- **🌊:** [Add TFlatten type for flattening nested union types] ([b3771d09](https://github.com/MRX-Systems/MRX-Core/commit/b3771d09))
- **🌊:** [Refactor PropertiesSchema] ([39635ee5](https://github.com/MRX-Systems/MRX-Core/commit/39635ee5))
- **🌊:** [Add CRUD operation interfaces for count, delete, find, insert, and update] ([0ea2c52b](https://github.com/MRX-Systems/MRX-Core/commit/0ea2c52b))
- **🌊:** [Update LocalHook to Elysia 1.4.5 types] ([5fe24ecb](https://github.com/MRX-Systems/MRX-Core/commit/5fe24ecb))

### 🦉 Chore

- **🦉:** [Update Dependabot schedule to weekly] ([3bd835bb](https://github.com/MRX-Systems/MRX-Core/commit/3bd835bb))
- **🦉:** [For the moment remove old db-resolver] ([19aaa85b](https://github.com/MRX-Systems/MRX-Core/commit/19aaa85b))

### 🧪 Tests

- **🧪:** [error module rename files to kebab-case and refacto BaseError] ([76c8c3e7](https://github.com/MRX-Systems/MRX-Core/commit/76c8c3e7))
- **🧪:** [add test for CrudSchema and its utilities] ([4f61f4a2](https://github.com/MRX-Systems/MRX-Core/commit/4f61f4a2))
- **🧪:** [Refactor tests for createAdaptiveWhereClauseSchema] ([2c1200f7](https://github.com/MRX-Systems/MRX-Core/commit/2c1200f7))
- **🧪:** [Refactor tests for createCountResponse200Schema] Updated tests for createCountResponse200Schema to improve clarity and accuracy. - Removed unnecessary checks for 'type' and 'kind'. - Utilized KindGuard for type validation of schema properties. ([129dbe14](https://github.com/MRX-Systems/MRX-Core/commit/129dbe14))
- **🧪:** [Refactor createCountSchema tests for clarity and consistency] - Updated test descriptions for better clarity. - Replaced direct property checks with KindGuard assertions for type validation. - Removed unnecessary checks related to Kind and OptionalKind. ([9f5e67d2](https://github.com/MRX-Systems/MRX-Core/commit/9f5e67d2))
- **🧪:** [Refactor createDeleteSchema tests for clarity and consistency] Refactored tests for createDeleteSchema to improve clarity and consistency. - Removed unnecessary checks for 'type' and 'kind' properties. - Utilized KindGuard for type verification in tests. - Enhanced test descriptions for better understanding. ([f4bb606b](https://github.com/MRX-Systems/MRX-Core/commit/f4bb606b))
- **🧪:** [Refactor createFiltersSchema tests for clarity and consistency] ([cb8112ea](https://github.com/MRX-Systems/MRX-Core/commit/cb8112ea))
- **🧪:** [Refactor createFindSchema tests for clarity and consistency] Refactored the tests for createFindSchema to improve clarity and consistency. - Replaced usage of `Kind` and `OptionalKind` with `KindGuard` for better type checking. - Simplified test descriptions to focus on the core functionality being tested. - Ensured all optional properties are validated using `KindGuard`. ([3c35bdb9](https://github.com/MRX-Systems/MRX-Core/commit/3c35bdb9))
- **🧪:** [Refactor createIdParamSchema tests for clarity and consistency] ([4bcec05c](https://github.com/MRX-Systems/MRX-Core/commit/4bcec05c))
- **🧪:** [Refactor createInsertSchema tests for clarity and consistency] Refactored the tests for createInsertSchema to improve clarity and consistency. - Removed redundant checks for type and kind. - Utilized KindGuard for type validation. - Simplified test descriptions for better readability. ([594e4688](https://github.com/MRX-Systems/MRX-Core/commit/594e4688))
- **🧪:** [Refactor createOrderSchema tests for clarity and consistency] ([60dd45f0](https://github.com/MRX-Systems/MRX-Core/commit/60dd45f0))
- **🧪:** [Refactor createPropertiesSchema tests for clarity and consistency] Refactored the tests for createPropertiesSchema to improve clarity and consistency. - Updated test descriptions for better understanding. - Replaced direct property checks with KindGuard assertions for type validation. - Removed redundant checks related to 'kind' to streamline the tests. ([297e4fec](https://github.com/MRX-Systems/MRX-Core/commit/297e4fec))
- **🧪:** [Refactor createQSchema tests for improved clarity and consistency] ([2fd71132](https://github.com/MRX-Systems/MRX-Core/commit/2fd71132))
- **🧪:** [Refactor createResponse200Schema tests for improved validation] - Updated tests to utilize KindGuard for type validation. - Removed direct type checks and replaced with guard functions for better clarity. - Enhanced readability and consistency across schema property validations. ([271c022c](https://github.com/MRX-Systems/MRX-Core/commit/271c022c))
- **🧪:** [Refactor createSelectedFieldsSchema tests for improved validation] Refactored tests for createSelectedFieldsSchema to utilize KindGuard for type validation. This enhances clarity and ensures accurate type checking for union, literal, and array elements in the schema. ([b046d270](https://github.com/MRX-Systems/MRX-Core/commit/b046d270))
- **🧪:** [Refactor createUpdateOneSchema tests for improved validation] Refactored tests for createUpdateOneSchema to enhance validation checks. - Replaced direct property checks with KindGuard assertions for better type validation. - Ensured all schema properties are validated against expected types and structures. ([43d17a61](https://github.com/MRX-Systems/MRX-Core/commit/43d17a61))
- **🧪:** [Refactor createUpdateSchema tests for improved clarity] - Updated test descriptions for better clarity and consistency. - Replaced direct property checks with type guard assertions for validation. - Ensured all schema properties are validated using KindGuard methods. ([08b9bd68](https://github.com/MRX-Systems/MRX-Core/commit/08b9bd68))
- **🧪:** [Add error handling tests for various error types] ([4db818ba](https://github.com/MRX-Systems/MRX-Core/commit/4db818ba))
- **🧪:** [Add tests for flatten utility functionality] ([1c2cead5](https://github.com/MRX-Systems/MRX-Core/commit/1c2cead5))
- **🧪:** [Add test for handling union types in createPropertiesSchema] ([15786d56](https://github.com/MRX-Systems/MRX-Core/commit/15786d56))
- **🧪:** [Refactor tests for createResponse200Schema] ([ba8f4f39](https://github.com/MRX-Systems/MRX-Core/commit/ba8f4f39))
- **🧪:** [Delete timeout to "should connect to the SMTP server successfully"] ([51b56fe8](https://github.com/MRX-Systems/MRX-Core/commit/51b56fe8))
- **🧪:** [add tests for repository methods with selectedFields set to "*"] ([111bc580](https://github.com/MRX-Systems/MRX-Core/commit/111bc580))
- **🧪:** [Update SingletonManager registration to use instances] ([f3a8d91e](https://github.com/MRX-Systems/MRX-Core/commit/f3a8d91e))
- **🧪:** [Refactor db-resolver tests for improved clarity and structure] ([a77ec879](https://github.com/MRX-Systems/MRX-Core/commit/a77ec879))
- **🧪:** [Update injectDynamicDB macro cleanup process] ## Refactoring - Changed `beforeEach` in `injectDynamicDB` to be asynchronous. - Ensured proper disconnection of the database before each test. ([2b4d3491](https://github.com/MRX-Systems/MRX-Core/commit/2b4d3491))
- **🧪:** [Improve dynamic database cleanup process] ([c18a0902](https://github.com/MRX-Systems/MRX-Core/commit/c18a0902))

### 🎨 Styles

- **🎨:** Auto-fix lint issues ([d85bca25](https://github.com/MRX-Systems/MRX-Core/commit/d85bca25))

### 🤖 CI

- **🤖:** [update CI workflows and add Dependabot configuration] ## CI Changes - Removed specific Bun version from setup in integration and unit test workflows. - Added a new Dependabot configuration file for automatic updates. ([60b1ebf6](https://github.com/MRX-Systems/MRX-Core/commit/60b1ebf6))
- **🤖:** [Add bun-version specification to integration and unit test jobs] - Added `bun-version: 1.2.21` to the setup steps in both job-integration-test.yml and job-unit-test.yml to ensure consistent Bun version usage during CI runs. ([f4b7826d](https://github.com/MRX-Systems/MRX-Core/commit/f4b7826d))
- **🤖:** [Specify bun version to 1.2.20 for the moment] ([63cf4c1b](https://github.com/MRX-Systems/MRX-Core/commit/63cf4c1b))

### ❤️ Contributors

- Ruby <necrelox@proton.me>
- Necrelox ([@Necrelox](https://github.com/Necrelox))
- Komiroko <komiriko@pm.me>

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

