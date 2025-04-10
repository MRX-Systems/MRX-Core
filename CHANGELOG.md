# Changelog

## v2.1.0-canary-20250410-da98e5bc

[compare changes](https://github.com/Andesite-Lab/Core/compare/v2.1.0-canary-20250408-4bfc53ad...v2.1.0-canary-20250410-da98e5bc)

### 🧹 Refactors

- **🧹:** [correct bundler file name in .npmignore] Updated the .npmignore file to replace 'bundler.ts' with 'builder.ts' for accurate file exclusion. ([5158bba4](https://github.com/Andesite-Lab/Core/commit/5158bba4))
- **🧹:** [add test coverage thresholds to bunfig.toml] ([460ca7a0](https://github.com/Andesite-Lab/Core/commit/460ca7a0))

### 📦 Build

- **📦:** [update dependencies in package.json] ## Build Changes - Updated `@types/bun` from `^1.2.8` to `^1.2.9` - Updated `tsc-alias` from `^1.8.13` to `^1.8.14` - Updated `@basalt-lab/basalt-helper` from `^1.12.1` to `^1.13.0` - Updated `@basalt-lab/basalt-logger` from `^1.12.0` to `^1.12.1` ## Description This commit updates several dependencies in the `package.json` file to their latest versions to ensure compatibility and take advantage of improvements and bug fixes. ([cbd7008c](https://github.com/Andesite-Lab/Core/commit/cbd7008c))

### 🧪 Tests

- **🧪:** Split unit and integration tests ([6614e557](https://github.com/Andesite-Lab/Core/commit/6614e557))

### 🤖 CI

- **🤖:** [update pull request checker and CI configurations] ## CI Changes - Added build-test job to the pull request checker workflow. - Updated test job to depend on build-test. - Enhanced the build-test job with steps for checking out code, setting up Bun, installing dependencies, and running the build. - Added coverage option to the test script in package.json. - Specified output directory in tsconfig.json. ([44119db3](https://github.com/Andesite-Lab/Core/commit/44119db3))
- **🤖:** [refactor pull request checker workflow steps] - Removed unnecessary blank line before the build-test job. - Renamed the "Check if build" step to "Run build" for clarity. ([f63e291d](https://github.com/Andesite-Lab/Core/commit/f63e291d))
- **🤖:** [refactor build-test job in CI workflows] ## CI Changes - Added a new `build-test` job to both `merge-dev.yml` and `merge-main.yml`. - The job includes steps for checking out the code, setting up Bun, installing dependencies, and running the build process. - Updated the `test` job to depend on the `build-test` job instead of `lint`. ([86cebc4f](https://github.com/Andesite-Lab/Core/commit/86cebc4f))

### ❤️ Contributors

- Ruby <necrelox@proton.me>

## v2.1.0-canary-20250408-4bfc53ad

[compare changes](https://github.com/Andesite-Lab/Core/compare/v2.1.0-canary-20250327-8f2cd369...v2.1.0-canary-20250408-4bfc53ad)

### 🧹 Refactors

- **🧹:** [refactor TypeScript configuration files for clarity] - Improved organization of `tsconfig.json` and `tsconfig.dts.json`. - Consolidated type checking options and module settings for better readability. - Updated output directory from `build` to `dist` for consistency. - Enhanced JavaScript support with new options for interop and completeness. ([519d9bfe](https://github.com/Andesite-Lab/Core/commit/519d9bfe))

### 📖 Documentation

- **📖:** Add todo in repository ([689c441b](https://github.com/Andesite-Lab/Core/commit/689c441b))

### 📦 Build

- **📦:** [update build output directory from 'build' to 'dist'] Changed the output directory for the build process from './build' to './dist' to align with the project's structure. This ensures that all built files are consistently placed in the designated distribution folder. ([697926d1](https://github.com/Andesite-Lab/Core/commit/697926d1))
- **📦:** [update package.json] - Updated description and license fields. - Removed old exports and added new exports pointing to the dist directory. - Updated build script to only run bun builder.ts. - Bumped devDependencies:   - @eslint/js from ^9.23.0 to ^9.24.0   - @types/bun from ^1.2.6 to ^1.2.8   - eslint from ^9.23.0 to ^9.24.0   - tsc-alias from ^1.8.11 to ^1.8.13   - typedoc from ^0.28.1 to ^0.28.2   - typescript-eslint from ^8.28.0 to ^8.29.1 - Bumped typescript from ^5.8.2 to ^5.8.3 ([3a226fc4](https://github.com/Andesite-Lab/Core/commit/3a226fc4))

### 🦉 Chore

- **🦉:** [update dotenv files in .gitignore] Updated the .gitignore to include standard dotenv files without the local suffix. This change ensures that the environment variable files are ignored correctly during version control. ([257f2066](https://github.com/Andesite-Lab/Core/commit/257f2066))
- **🦉:** [add telemetry configuration to bunfig.toml] ([b1dc98ce](https://github.com/Andesite-Lab/Core/commit/b1dc98ce))

### 🤖 CI

- **🤖:** [update GitHub Actions workflows for publishing] ([1e9e56b5](https://github.com/Andesite-Lab/Core/commit/1e9e56b5))

### ❤️ Contributors

- Ruby <necrelox@proton.me>

## v2.1.0-canary-20250327-8f2cd369

[compare changes](https://github.com/Andesite-Lab/Core/compare/v2.1.0-canary-20250324-f2b16212...v2.1.0-canary-20250327-8f2cd369)

### 🧹 Refactors

- **🧹:** [update ESLint configuration for consistent return rule] - Disabled '@typescript-eslint/prefer-for-of' rule. - Maintained existing warning for '@typescript-eslint/consistent-return'. ([42892b59](https://github.com/Andesite-Lab/Core/commit/42892b59))
- **🧹:** [remove tsdoclint from ESLint configuration] Updated the ESLint configuration to remove the unused tsdoclint plugin, streamlining the setup and improving maintainability. ([8304e4f7](https://github.com/Andesite-Lab/Core/commit/8304e4f7))
- **🧹:** [remove 'const' from generic type parameters] ([1bc41927](https://github.com/Andesite-Lab/Core/commit/1bc41927))

### 📖 Documentation

- **📖:** [update typeParam to template in type definitions] ## Type Changes - Changed `@typeParam` to `@template` in multiple type definition files. ## Description This commit updates the JSDoc annotations in various type definition files to use `@template` instead of `@typeParam`, aligning with the correct JSDoc syntax for generic type parameters. This change improves clarity and consistency across the codebase. ([c12ec0b5](https://github.com/Andesite-Lab/Core/commit/c12ec0b5))

### 📦 Build

- **📦:** [update devDependencies for bun and typescript-eslint] ## Build Changes - Updated `@types/bun` from `^1.2.5` to `^1.2.6` - Updated `typescript-eslint` from `^8.27.0` to `^8.28.0` ([2c651669](https://github.com/Andesite-Lab/Core/commit/2c651669))
- **📦:** [update @basalt-lab/basalt-helper to version 1.12.1] Updated the dependency @basalt-lab/basalt-helper from version 1.11.1 to 1.12.1 to incorporate the latest features and improvements. (`TypedEventEmitter` class) ([418e4fd2](https://github.com/Andesite-Lab/Core/commit/418e4fd2))
- **📦:** [move dependencies to peerDependencies] Updated the package.json to move dependencies under "dependencies" to "peerDependencies" for better compatibility and to clarify the intended usage of these packages. ([e8deda53](https://github.com/Andesite-Lab/Core/commit/e8deda53))
- **📦:** [update dependencies to latest versions] - Updated all dependencies to their latest versions in the bun.lock file. - Moved some dependencies to peerDependencies for better compatibility. ([704bc929](https://github.com/Andesite-Lab/Core/commit/704bc929))

### 🌊 Types

- **🌊:** [update type parameters for CRUD options] - Added KEnumPermission type parameter for permissions-based access control. - Updated type definitions to use @template instead of @typeParam for clarity. - Adjusted operationsPermissions to utilize KEnumPermission for better type safety. ([d229cad6](https://github.com/Andesite-Lab/Core/commit/d229cad6))

### 🤖 CI

- **🤖:** [update merge workflows to simplify merge checks] ([7dba1a14](https://github.com/Andesite-Lab/Core/commit/7dba1a14))

### ❤️ Contributors

- Ruby <necrelox@proton.me>

## v2.1.0-canary-20250324-f2b16212

[compare changes](https://github.com/Andesite-Lab/Core/compare/v2.1.0-canary-20250320-1ee10333...v2.1.0-canary-20250324-f2b16212)

### 🧹 Refactors

- **🧹:** Convert function to arrow functions in modules and rename ([2f8151c0](https://github.com/Andesite-Lab/Core/commit/2f8151c0))
- **🧹:** Improve crud ([71130ce5](https://github.com/Andesite-Lab/Core/commit/71130ce5))
- **🧹:** Rename crud operation path ([b838879b](https://github.com/Andesite-Lab/Core/commit/b838879b))

### 📦 Build

- **📦:** Update dependencies ([c1626f10](https://github.com/Andesite-Lab/Core/commit/c1626f10))
- **📦:** Update elysia to experimental ([5171bb0b](https://github.com/Andesite-Lab/Core/commit/5171bb0b))
- **📦:** Update dependencies ([90b6dbb7](https://github.com/Andesite-Lab/Core/commit/90b6dbb7))
- **📦:** Elysia to stable branch ([dc98c8cb](https://github.com/Andesite-Lab/Core/commit/dc98c8cb))

### 🧪 Tests

- **🧪:** Remove console logs and correction error summary messages ([5b7aaf49](https://github.com/Andesite-Lab/Core/commit/5b7aaf49))
- **🧪:** Add spaces temp ([99a74808](https://github.com/Andesite-Lab/Core/commit/99a74808))

### 🤖 CI

- **🤖:** Add provenance flag to bun publish commands in workflow files ([fb18014e](https://github.com/Andesite-Lab/Core/commit/fb18014e))

### ❤️ Contributors

- Ruby <necrelox@proton.me>

## v2.1.0-canary-20250320-1ee10333

[compare changes](https://github.com/Andesite-Lab/Core/compare/v2.1.0-canary-20250319-42563e32...v2.1.0-canary-20250320-1ee10333)

### 🚀 Enhancements

- **🚀:** Add prefix option to crud plugin ([abb56086](https://github.com/Andesite-Lab/Core/commit/abb56086))

### ❤️ Contributors

- Ruby <necrelox@proton.me>

## v2.1.0-canary-20250319-42563e32

[compare changes](https://github.com/Andesite-Lab/Core/compare/v2.1.0-canary-20250317-d4670d75...v2.1.0-canary-20250319-42563e32)

### 🚀 Enhancements

- **🚀:** Add scope instance ([5821d122](https://github.com/Andesite-Lab/Core/commit/5821d122))
- **🚀:** Add jwt plugin (rework) ([fa8582f3](https://github.com/Andesite-Lab/Core/commit/fa8582f3))

### 🔧 Fixes

- **🔧:** Import correction in jwt plugin ([de45ef52](https://github.com/Andesite-Lab/Core/commit/de45ef52))

### 🧹 Refactors

- **🧹:** Simplify plugin definitions and improve readability ([d5239c0e](https://github.com/Andesite-Lab/Core/commit/d5239c0e))
- **🧹:** Remove auth + clean ([960f996f](https://github.com/Andesite-Lab/Core/commit/960f996f))

### 📖 Documentation

- **📖:** Enhance tsDoc and clean changelog ([c72a7ebc](https://github.com/Andesite-Lab/Core/commit/c72a7ebc))

### 🧪 Tests

- **🧪:** Add comprehensive tests for jwtPlugin functionalityv ([12d41f13](https://github.com/Andesite-Lab/Core/commit/12d41f13))

### 🎨 Styles

- **🎨:** Remove useless rules ([58a41bec](https://github.com/Andesite-Lab/Core/commit/58a41bec))

### 🤖 CI

- **🤖:** Add contain pull request to dev workflow ([95eed2a5](https://github.com/Andesite-Lab/Core/commit/95eed2a5))

### ❤️ Contributors

- Ruby <necrelox@proton.me>

## v2.1.0-canary-20250317-d4670d75

[compare changes](https://github.com/Andesite-Lab/Core/compare/v1.43.2...v2.1.0-canary-20250317-d4670d75)

### 🚀 Enhancements

- **🚀:** Add TypeBox Config allow to configure TypeBox ([7ef7f3ea](https://github.com/Andesite-Lab/Core/commit/7ef7f3ea))
- **🚀:** Integrate translation ([c4f03624](https://github.com/Andesite-Lab/Core/commit/c4f03624))
- **🚀:** Add HTTP status code enum for standardized response handling ([136b195e](https://github.com/Andesite-Lab/Core/commit/136b195e))
- **🚀:** Add environment variable validation utility function ([d57808e1](https://github.com/Andesite-Lab/Core/commit/d57808e1))
- **✨:** Add Table class for database management with event handling ([5c51f648](https://github.com/Andesite-Lab/Core/commit/5c51f648))
- **🚀:** Implement MSSQL class with advanced database handling and event ([c1e4b386](https://github.com/Andesite-Lab/Core/commit/c1e4b386))
- **🚀:** Add database module and update exports for MSSQL handling ([47c3c19a](https://github.com/Andesite-Lab/Core/commit/47c3c19a))
- **🚀:** Add repository and types and export ([b745dcc1](https://github.com/Andesite-Lab/Core/commit/b745dcc1))
- **🚀:** Enhance findStream & add transform option ([40b9cb75](https://github.com/Andesite-Lab/Core/commit/40b9cb75))
- **🚀:** Add support for $between, $nbetween, $like, and $nlike clauses ([6fd0feff](https://github.com/Andesite-Lab/Core/commit/6fd0feff))
- **🚀:** Add localized database error messages for multiple languages ([ffb101a0](https://github.com/Andesite-Lab/Core/commit/ffb101a0))
- **🚀:** Add pulse option to MSSQL class for event listener conf ([5528c8dc](https://github.com/Andesite-Lab/Core/commit/5528c8dc))
- **🚀:** Add Redis class wrapper for ioredis library ([9e4ab561](https://github.com/Andesite-Lab/Core/commit/9e4ab561))
- **🚀:** Add Elysia, and README ([01338114](https://github.com/Andesite-Lab/Core/commit/01338114))
- **🚀:** Add plugin microservice and error ([64852a5c](https://github.com/Andesite-Lab/Core/commit/64852a5c))
- **🚀:** Handle validation error ([39f139d9](https://github.com/Andesite-Lab/Core/commit/39f139d9))
- **🚀:** Handle not found ([11714531](https://github.com/Andesite-Lab/Core/commit/11714531))
- **🚀:** Now getRepository can set custom repository ([5a69178f](https://github.com/Andesite-Lab/Core/commit/5a69178f))
- **🚀:** Add Auth and jwtPlugin ! ([03ab1c02](https://github.com/Andesite-Lab/Core/commit/03ab1c02))
- **🚀:** Now we can disable login mfa if isEnable is false ([3d37c2be](https://github.com/Andesite-Lab/Core/commit/3d37c2be))
- **🚀:** Add getters tables and repositories to mssql class ([609bdcca](https://github.com/Andesite-Lab/Core/commit/609bdcca))
- Add request limit ([e9f4f70b](https://github.com/Andesite-Lab/Core/commit/e9f4f70b))
- Enhance rateLimitPlugin with seed options and error key ([a6ba8996](https://github.com/Andesite-Lab/Core/commit/a6ba8996))
- Enhanced  to default to all columns and allow specifying desired columns ([9229255a](https://github.com/Andesite-Lab/Core/commit/9229255a))
- Allow  to specify the desired columns ([95e0288d](https://github.com/Andesite-Lab/Core/commit/95e0288d))
- Update  type to include number in advancedSearch ([d5ae7706](https://github.com/Andesite-Lab/Core/commit/d5ae7706))
- Enhance  parameter in advancedSearch to support selected fields and values ([a1e425b0](https://github.com/Andesite-Lab/Core/commit/a1e425b0))
- Enhance  operator to support string and number types in advanced search ([b12dcf82](https://github.com/Andesite-Lab/Core/commit/b12dcf82))
- **🚀:** Add error handling method for query execution in Repositoryy ([01e9dab6](https://github.com/Andesite-Lab/Core/commit/01e9dab6))
- **🚀:** Add schema exports and update package.json for new schema path ([78f69766](https://github.com/Andesite-Lab/Core/commit/78f69766))
- **🚀:** Add dynamic database selector plugin & error handling ([c0ddb66f](https://github.com/Andesite-Lab/Core/commit/c0ddb66f))
- **🚀:** Add advanced search plugin ([04f21c61](https://github.com/Andesite-Lab/Core/commit/04f21c61))
- **🚀:** Add crud plugin and export ([2010e727](https://github.com/Andesite-Lab/Core/commit/2010e727))
- **🚀:** Enhance CRUD plugin with detailed type definitions and improved documentation ([7a338f56](https://github.com/Andesite-Lab/Core/commit/7a338f56))
- **🚀:** Enforce advanced search requirement for record updates ([77f197a6](https://github.com/Andesite-Lab/Core/commit/77f197a6))
- **🚀:** Update count method to omit selectedFields and orderBy from QueryOptions ([e76cd22b](https://github.com/Andesite-Lab/Core/commit/e76cd22b))

### 🔧 Fixes

- **🔧:** Some fixes ([2c35ebf6](https://github.com/Andesite-Lab/Core/commit/2c35ebf6))
- **🔧:** Add 'as const' assert to CONFIG_ERRORS and UTIL_ERRORS, immuable ([742ae1fe](https://github.com/Andesite-Lab/Core/commit/742ae1fe))
- **🔧:** Refactor CoreError constructor to use defaulterrormessage & code ([d433c3a7](https://github.com/Andesite-Lab/Core/commit/d433c3a7))
- **🔧:** Remove useless parenthese ([3c2dae75](https://github.com/Andesite-Lab/Core/commit/3c2dae75))
- **🔧:** Correction comment ([9737e81e](https://github.com/Andesite-Lab/Core/commit/9737e81e))
- **🔧:** Update column names in Table instantiation for repository tests ([19f5576b](https://github.com/Andesite-Lab/Core/commit/19f5576b))
- **🔧:** Ensure knex instance is properly destroyed after dropping data table ([abdcea86](https://github.com/Andesite-Lab/Core/commit/abdcea86))
- **🔧:** Fix codefactor ([d5d54b9d](https://github.com/Andesite-Lab/Core/commit/d5d54b9d))
- Better treatment of the count system for the ratelimit plugin ([2299b86b](https://github.com/Andesite-Lab/Core/commit/2299b86b))
- Update rate limit plugin tests for environment configuration and error messages ([77be498a](https://github.com/Andesite-Lab/Core/commit/77be498a))
- Reorganize import of Elysia in rate limit plugin tests ([728d19a8](https://github.com/Andesite-Lab/Core/commit/728d19a8))
- Fix advancedSearch wrongly stashed ([a87d2643](https://github.com/Andesite-Lab/Core/commit/a87d2643))
- Improve query handling for  to support string and number types ([033182c6](https://github.com/Andesite-Lab/Core/commit/033182c6))
- Streamline query handling for  to improve performance and readability ([7ca4cc1c](https://github.com/Andesite-Lab/Core/commit/7ca4cc1c))
- Update AdvancedSearch type to improve handling of query parameters ([badc0ca4](https://github.com/Andesite-Lab/Core/commit/badc0ca4))
- Uncomment the previous unit tests ([d1ff5606](https://github.com/Andesite-Lab/Core/commit/d1ff5606))
- Remove unnecessary field check in query processing for advanced search ([3d20a30b](https://github.com/Andesite-Lab/Core/commit/3d20a30b))
- Simplify query handling in advanced search and update test descriptions for clarity ([daa27235](https://github.com/Andesite-Lab/Core/commit/daa27235))
- **🔧:** DONT USE BARREL FILE OR 1V1 NUKETOWN ([75dcc114](https://github.com/Andesite-Lab/Core/commit/75dcc114))
- **🔧:** Rename selectedField to selectedFields in advanced search ([3fa83e69](https://github.com/Andesite-Lab/Core/commit/3fa83e69))

### 🧹 Refactors

- **🧹:** Clean all ([71b83cb2](https://github.com/Andesite-Lab/Core/commit/71b83cb2))
- **🧹:** Refacto Error Systems ([9546f7f4](https://github.com/Andesite-Lab/Core/commit/9546f7f4))
- **🧹:** Architecture + code + tests ([fa5dd3b6](https://github.com/Andesite-Lab/Core/commit/fa5dd3b6))
- **🧹:** Update error key definitions and improve documentation ([c0bc26fd](https://github.com/Andesite-Lab/Core/commit/c0bc26fd))
- **🧹:** Update repository name & enhance JSDoc for getRepository ([ebbfd179](https://github.com/Andesite-Lab/Core/commit/ebbfd179))
- **🧹:** Move interface, constants, .. to dedicated files ([6af5d722](https://github.com/Andesite-Lab/Core/commit/6af5d722))
- **🧹:** Enhance getRepository signature for improved type inference ([8546b31b](https://github.com/Andesite-Lab/Core/commit/8546b31b))
- **🧹:** Improve type inference for generic methods & enhance error handling ([d9f03ade](https://github.com/Andesite-Lab/Core/commit/d9f03ade))
- **🔧:** Update findOne and delete to require advancedSearch option ([2b620e9e](https://github.com/Andesite-Lab/Core/commit/2b620e9e))
- **🧹:** Remove translation, typebox and json utils ([a187c864](https://github.com/Andesite-Lab/Core/commit/a187c864))
- **🧹:** Refactor error system ([140c1050](https://github.com/Andesite-Lab/Core/commit/140c1050))
- **🧹:** Rename jwt to jwtPlugin ([fb37a95c](https://github.com/Andesite-Lab/Core/commit/fb37a95c))
- **🧹:** Take directly an instance of Redis ([c6c04f2f](https://github.com/Andesite-Lab/Core/commit/c6c04f2f))
- **🧹:** Set sendToken optional ([02f930da](https://github.com/Andesite-Lab/Core/commit/02f930da))
- **🧹:** Remove basalt auth use jose instead ([b4b9c719](https://github.com/Andesite-Lab/Core/commit/b4b9c719))
- **🧹:** Simplify field selection handling and improve types ([a1fb53b7](https://github.com/Andesite-Lab/Core/commit/a1fb53b7))
- Remove example plugin and improve query handling for empty values ([04b1d8ed](https://github.com/Andesite-Lab/Core/commit/04b1d8ed))
- **🧹:** AuthPlugin macro returns an object instead of a function ([5bcf74c6](https://github.com/Andesite-Lab/Core/commit/5bcf74c6))
- **🧹:** Improvement of auth plugins ([acf1409a](https://github.com/Andesite-Lab/Core/commit/acf1409a))

### 📖 Documentation

- **📖:** Add detailed JSDoc/TSDoc comments to Table class ([a870ff8c](https://github.com/Andesite-Lab/Core/commit/a870ff8c))
- **📖:** Add jsdoc ([796423e6](https://github.com/Andesite-Lab/Core/commit/796423e6))
- **📖:** Enhance jwtPlugin JSDoc comments for better documentation ([14978411](https://github.com/Andesite-Lab/Core/commit/14978411))
- **📖:** Enhance authPlugin JSDoc comments for better documentation ([0d881dcb](https://github.com/Andesite-Lab/Core/commit/0d881dcb))
- **📖:** Add jsdoc ([116b6a52](https://github.com/Andesite-Lab/Core/commit/116b6a52))
- **📖:** Enhance advancedSearch documentation JSDoc ([39979233](https://github.com/Andesite-Lab/Core/commit/39979233))

### 📦 Build

- **📦:** Update deps and move to peer deps + change export ([9f495a5f](https://github.com/Andesite-Lab/Core/commit/9f495a5f))
- **📦:** Update dependencies ([d432c790](https://github.com/Andesite-Lab/Core/commit/d432c790))
- **📦:** Update @sinclair/typebox, @types/node, and typescript-eslint to latest versions ([cee09f6a](https://github.com/Andesite-Lab/Core/commit/cee09f6a))
- **📦:** Mark knex and tedious as optional peer deps in package.json ([426aa2ea](https://github.com/Andesite-Lab/Core/commit/426aa2ea))
- **📦:** Update @types/bun & add ioredis as an optional peer deps ([d616226c](https://github.com/Andesite-Lab/Core/commit/d616226c))
- **📦:** Refactor build system node -> bun and use tsc && tsc-alias ([1720e666](https://github.com/Andesite-Lab/Core/commit/1720e666))
- **📦:** Update dependencies ([94e05d7c](https://github.com/Andesite-Lab/Core/commit/94e05d7c))
- **📦:** Add and updates dependencies + add env exemple (for test) ([98c1d409](https://github.com/Andesite-Lab/Core/commit/98c1d409))
- **📦:** Update dependencies and remove basalt auth ([d8ec0b08](https://github.com/Andesite-Lab/Core/commit/d8ec0b08))
- **📦:** Update dependencies + correction optionnal peerdeps ([5bc409b8](https://github.com/Andesite-Lab/Core/commit/5bc409b8))
- **📦:** Update deps ([d0d4cd52](https://github.com/Andesite-Lab/Core/commit/d0d4cd52))
- **📦:** Update dependencies ([efcd00a7](https://github.com/Andesite-Lab/Core/commit/efcd00a7))
- **📦:** Update dependencies ([274dad2b](https://github.com/Andesite-Lab/Core/commit/274dad2b))
- **📦:** Update bun lock ([b566d725](https://github.com/Andesite-Lab/Core/commit/b566d725))

### 🌊 Types

- **🌊:** Add NoInfer to Array of Advanced Search and improve other type ([c7f45198](https://github.com/Andesite-Lab/Core/commit/c7f45198))
- **🌊:** Remove useless const ([b5223afc](https://github.com/Andesite-Lab/Core/commit/b5223afc))
- **🌊:** Add string array to selected field (useful when type is infer) ([c14e6adb](https://github.com/Andesite-Lab/Core/commit/c14e6adb))
- **🌊:** Set explicit return type infer ([7038df82](https://github.com/Andesite-Lab/Core/commit/7038df82))
- **🌊:** Export DynamicDatabaseSelectorPluginOptions ([403a0f5e](https://github.com/Andesite-Lab/Core/commit/403a0f5e))

### 🦉 Chore

- **🦉:** Update .npmignore ([28962a1e](https://github.com/Andesite-Lab/Core/commit/28962a1e))
- **🦉:** Remove nvmrc ([95338b26](https://github.com/Andesite-Lab/Core/commit/95338b26))

### 🧪 Tests

- **🧪:** Add units tests for CoreError and TypeBoxConfig ([4c0fb8c5](https://github.com/Andesite-Lab/Core/commit/4c0fb8c5))
- **🧪:** Categorize tests ([c3411e96](https://github.com/Andesite-Lab/Core/commit/c3411e96))
- **🧪:** Add tests for validateEnv util ([425eed0b](https://github.com/Andesite-Lab/Core/commit/425eed0b))
- **🧪:** Add unit tests for Table class constructor and getters ([b56e7c02](https://github.com/Andesite-Lab/Core/commit/b56e7c02))
- **🧪:** Add comprehensive tests for MSSQL class functionality ([4c269146](https://github.com/Andesite-Lab/Core/commit/4c269146))
- **🧪:** Enhance MSSQL tests with setup and teardown using knex and add repository tests ([3ec5bc0f](https://github.com/Andesite-Lab/Core/commit/3ec5bc0f))
- **🧪:** Refactor repository stream test to iterate over data values ([0dd6dbc8](https://github.com/Andesite-Lab/Core/commit/0dd6dbc8))
- **🧪:** Add unit test for makeStreamAsyncIterable function ([da745f24](https://github.com/Andesite-Lab/Core/commit/da745f24))
- **🧪:** Add unit tests for elysia plugin microservice and error ([f843dd2e](https://github.com/Andesite-Lab/Core/commit/f843dd2e))
- **🧪:** Fix tests for error plugin ([a5e21e6b](https://github.com/Andesite-Lab/Core/commit/a5e21e6b))
- **🧪:** Add some test for not found and validation ([2f990f57](https://github.com/Andesite-Lab/Core/commit/2f990f57))
- **🧪:** Fix test 'should handle unknown errors with status 500' ([63aa2a45](https://github.com/Andesite-Lab/Core/commit/63aa2a45))
- **🧪:** Add unit test for authPlugin (cover jwt too) ([d4747f05](https://github.com/Andesite-Lab/Core/commit/d4747f05))
- **🧪:** Tests for selected fields in insert, update, and delete ops ([0ecb0a5b](https://github.com/Andesite-Lab/Core/commit/0ecb0a5b))
- Adding unit test for rateLimitPlugin ([a649808e](https://github.com/Andesite-Lab/Core/commit/a649808e))
- Adding the unit test for the $q ([46d8690b](https://github.com/Andesite-Lab/Core/commit/46d8690b))
- **🧪:** Add nanoId identifier for temp table ([143ef378](https://github.com/Andesite-Lab/Core/commit/143ef378))
- **🧪:** Add test for getter tables and repositories ([890709af](https://github.com/Andesite-Lab/Core/commit/890709af))
- **🧪:** Add test to check when isAuth is defined & when isAuth is false ([ff95d790](https://github.com/Andesite-Lab/Core/commit/ff95d790))
- **🧪:** Add tests for dynamic database selector plugin functionality ([9a12cc53](https://github.com/Andesite-Lab/Core/commit/9a12cc53))
- **🧪:** Add test to repository ([e718bfb7](https://github.com/Andesite-Lab/Core/commit/e718bfb7))

### 🎨 Styles

- **🎨:** Fix CodeFactor ([cb79867d](https://github.com/Andesite-Lab/Core/commit/cb79867d))

### 🤖 CI

- **🤖:** Update pull request checker to trigger on all branches ([c2f7ab58](https://github.com/Andesite-Lab/Core/commit/c2f7ab58))

### ❤️ Contributors

- Ruby <necrelox@proton.me>
- Vanbaelinghem ([@BenjaminVanba](https://github.com/BenjaminVanba))
