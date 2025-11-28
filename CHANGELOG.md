
## v2.11.0

[compare changes](https://github.com/MRX-Systems/MRX-Core/compare/v2.10.0...v2.11.0)

### 🚀 Enhancements

- **🚀:** [Add microservice success keys for responses] ## Features - Introduced `MICROSERVICE_SUCCESS_KEYS` for consistent success messages. ([2d32f8fc](https://github.com/MRX-Systems/MRX-Core/commit/2d32f8fc))
- **🚀:** [Add CRUD success keys enumeration] ([bcd9e4b0](https://github.com/MRX-Systems/MRX-Core/commit/bcd9e4b0))
- **🚀:** [Integrate CRUD success keys into response messages] ([e276e3c4](https://github.com/MRX-Systems/MRX-Core/commit/e276e3c4))
- **🚀:** [Add new entrypoints] ([674069d3](https://github.com/MRX-Systems/MRX-Core/commit/674069d3))
- **🚀:** [Add status code] ([171d47d7](https://github.com/MRX-Systems/MRX-Core/commit/171d47d7))
- **🚀:** [Add detailed summaries and descriptions for CRUD operations] ([8b789998](https://github.com/MRX-Systems/MRX-Core/commit/8b789998))
- **🚀:** [Introduce new Logger] ([6426545a](https://github.com/MRX-Systems/MRX-Core/commit/6426545a))
- **🚀:** [Add bun store implementation to kv-store] ([8b60966c](https://github.com/MRX-Systems/MRX-Core/commit/8b60966c))
- **🚀:** [Add new ratelimit plugin with macro] ([700e3da1](https://github.com/MRX-Systems/MRX-Core/commit/700e3da1))
- **🚀:** [Add new cache plugin] ([5b9b071f](https://github.com/MRX-Systems/MRX-Core/commit/5b9b071f))
- **🚀:** [Update query options to extend pagination support] ([55900906](https://github.com/MRX-Systems/MRX-Core/commit/55900906))

### 🔧 Fixes

- **🔧:** [Correct expiration calculation in signJWT function] ## Bug Fixes - Fixed the expiration time calculation in the `signJWT` function to ensure it correctly adds the parsed human-readable time to the current timestamp. ([3493f499](https://github.com/MRX-Systems/MRX-Core/commit/3493f499))
- **🔧:** [Update error response structure to use 'content' instead of 'cause'] ## Bug Fixes - Changed the error response property from 'cause' to 'content' for consistency. ([4839dbea](https://github.com/MRX-Systems/MRX-Core/commit/4839dbea))
- **🔧:** [Add missing error handling for 'PARSE' case] ## Bug Fixes - Added error handling for the 'PARSE' case in the error plugin. ([ae0c422f](https://github.com/MRX-Systems/MRX-Core/commit/ae0c422f))
- **🔧:** [Update error keys to include 'mrx-core' prefix] ([852a3071](https://github.com/MRX-Systems/MRX-Core/commit/852a3071))
- **🔧:** [Refactor error handling to use ERROR_KEYS constants] ## Bug Fixes - Updated error messages to utilize constants from ERROR_KEYS. ([3252fd84](https://github.com/MRX-Systems/MRX-Core/commit/3252fd84))
- **🔧:** [WTF] ([085f3cfd](https://github.com/MRX-Systems/MRX-Core/commit/085f3cfd))
- **🔧:** [correction key nam] ([155ed99c](https://github.com/MRX-Systems/MRX-Core/commit/155ed99c))
- **🔧:** [Correct typos in database error keys] ([d65bc3f2](https://github.com/MRX-Systems/MRX-Core/commit/d65bc3f2))
- **🔧:** [Fix Review] ([032e1622](https://github.com/MRX-Systems/MRX-Core/commit/032e1622))
- **🔧:** [fix pr] ([15667790](https://github.com/MRX-Systems/MRX-Core/commit/15667790))
- **🔧:** [correction review of copilot] ([bf42bc92](https://github.com/MRX-Systems/MRX-Core/commit/bf42bc92))
- **🔧:** [remove barrel file import and use directly file] ([620e8479](https://github.com/MRX-Systems/MRX-Core/commit/620e8479))
- **🔧:** [prefer function toString for worker for compile build] ([b2d5d3fd](https://github.com/MRX-Systems/MRX-Core/commit/b2d5d3fd))
- **🔧:** [use console level instead bun write for console sink] ([d10bf1e1](https://github.com/MRX-Systems/MRX-Core/commit/d10bf1e1))

### 🧹 Refactors

- **🧹:** [Improve updateOne operation detail descriptions] ([19c726ad](https://github.com/MRX-Systems/MRX-Core/commit/19c726ad))
- **🧹:** [Refactor JWT expiration handling and signing process] ([e5e68c40](https://github.com/MRX-Systems/MRX-Core/commit/e5e68c40))
- **🧹:** [update new error class] ([ef63c77f](https://github.com/MRX-Systems/MRX-Core/commit/ef63c77f))
- **🧹:** [Changed return types of  _executeQuery to Required<KModel>] ([a89bdc68](https://github.com/MRX-Systems/MRX-Core/commit/a89bdc68))
- **🧹:** [Update response schema to require content properties] ([e411a84b](https://github.com/MRX-Systems/MRX-Core/commit/e411a84b))
- **🧹:** [use good return type to create insert schema function] ([6fc2571e](https://github.com/MRX-Systems/MRX-Core/commit/6fc2571e))

### 📦 Build

- **📦:** [Update peer dependencies for elysia and ioredis] Updated the peer dependencies for `elysia` to version `^1.4.7` and `ioredis` to version `^5.8.0` in package.json to ensure compatibility with the latest features and improvements. ([b2aa92d0](https://github.com/MRX-Systems/MRX-Core/commit/b2aa92d0))
- **📦:** [Update dependencies in package.json for improved stability] ([bbc02f9d](https://github.com/MRX-Systems/MRX-Core/commit/bbc02f9d))
- **📦:** [Add new entrypoits] ([56a4c519](https://github.com/MRX-Systems/MRX-Core/commit/56a4c519))
- **📦:** [Update dependencies in package.json] ([671bbc22](https://github.com/MRX-Systems/MRX-Core/commit/671bbc22))
- **📦:** [Update mssql dependency version] ([a6e25667](https://github.com/MRX-Systems/MRX-Core/commit/a6e25667))
- **📦:** [Update devDependencies in package.json] ([083df286](https://github.com/MRX-Systems/MRX-Core/commit/083df286))
- **📦:** [Add kv-store module and logger event type export] ([0fb3331c](https://github.com/MRX-Systems/MRX-Core/commit/0fb3331c))
- **📦:** [Update dependencies in package.json] ([bfaec4ff](https://github.com/MRX-Systems/MRX-Core/commit/bfaec4ff))
- **📦:** [update package.json dependencies] ## Build Changes - Updated dev dependency "@types/bun" from "^1.3.0" to "^1.3.1". - Updated dev dependency "@types/nodemailer" from "^7.0.2" to "^7.0.3". - Updated peer dependency "elysia" from "^1.4.12" to "^1.4.13". ## Description This commit updates the package version and several dependencies in the package.json file to ensure compatibility and incorporate the latest improvements and fixes. ([fb48f19d](https://github.com/MRX-Systems/MRX-Core/commit/fb48f19d))
- **📦:** [Update elysia dependency version to 1.4.15] ([fd98f429](https://github.com/MRX-Systems/MRX-Core/commit/fd98f429))
- **📦:** [Update dependencies in package.json] ([0ec5ad2f](https://github.com/MRX-Systems/MRX-Core/commit/0ec5ad2f))
- **📦:** [Update deps] ([c93f4c95](https://github.com/MRX-Systems/MRX-Core/commit/c93f4c95))
- **📦:** [Update package dependencies and version number] - Updated version from 2.11.0-1-and-283-20251112 to 2.11.0-1-and-284-20251113. - Upgraded @stylistic/eslint-plugin from ^5.5.0 to ^5.6.1. - Updated @types/nodemailer from ^7.0.3 to ^7.0.4. - Upgraded jose from ^6.1.1 to ^6.1.2. - Updated typescript-eslint from ^8.46.4 to ^8.47.0. ([2ce39935](https://github.com/MRX-Systems/MRX-Core/commit/2ce39935))
- **📦:** [Update package dependencies for improved compatibility] - Updated `@types/bun` from `^1.3.2` to `^1.3.3` - Updated `mssql` from `^12.1.0` to `^12.1.1` ([afbbf460](https://github.com/MRX-Systems/MRX-Core/commit/afbbf460))
- **📦:** [Update version and dependencies for improved compatibility] ([c1696c56](https://github.com/MRX-Systems/MRX-Core/commit/c1696c56))

### 🌊 Types

- **🌊:** [add NoInfer to data param in update repo method] ([62f98739](https://github.com/MRX-Systems/MRX-Core/commit/62f98739))
- **🌊:** [add NoInfer to insert and remove some useless Noinfer] ([565cd106](https://github.com/MRX-Systems/MRX-Core/commit/565cd106))

### 🦉 Chore

- **🦉:** V2.10.1-1-and-263-20250924 ([20aaf4f3](https://github.com/MRX-Systems/MRX-Core/commit/20aaf4f3))
- **🦉:** V2.11.0-1-and-267-20250925 ([80b7c006](https://github.com/MRX-Systems/MRX-Core/commit/80b7c006))
- **🦉:** V2.11.0-1-and-269-20251003 ([d1d85215](https://github.com/MRX-Systems/MRX-Core/commit/d1d85215))
- **🦉:** [add semver for various sections] ([6f6506be](https://github.com/MRX-Systems/MRX-Core/commit/6f6506be))
- **🦉:** [Add .zed to .gitignore] ([ede6fcd2](https://github.com/MRX-Systems/MRX-Core/commit/ede6fcd2))
- **🦉:** [Update .npmignore for improved file exclusions] ([cece049a](https://github.com/MRX-Systems/MRX-Core/commit/cece049a))

### 🧪 Tests

- **🧪:** [Enhance JWT expiration tests with additional scenarios] ## Tests - Added new test cases for various expiration scenarios including:   - Date expiration for 30 minutes and 1 day.   - Human-readable time expressions for 15 minutes, 2 hours, and 30 minutes.   - Additional checks for past expiration handling. - Improved tolerance checks for expiration validation. ([eefe5aca](https://github.com/MRX-Systems/MRX-Core/commit/eefe5aca))
- **🧪:** [Update unreachable expectation in signJWT test case] ([82a6c71d](https://github.com/MRX-Systems/MRX-Core/commit/82a6c71d))
- **🧪:** [Refactor expiration checks in signJWT test case] ([fe75f283](https://github.com/MRX-Systems/MRX-Core/commit/fe75f283))
- **🧪:** [Update error response structure to use 'content' instead of 'cause'] ([f103783e](https://github.com/MRX-Systems/MRX-Core/commit/f103783e))
- **🧪:** [Update error handling for static database not found] ([84085956](https://github.com/MRX-Systems/MRX-Core/commit/84085956))
- **🧪:** [Update error messages to include 'mrx-core' prefix] ## Tests - Updated error messages in the `parseHumanTimeToSeconds` tests to include the 'mrx-core' prefix. ([fdf9594f](https://github.com/MRX-Systems/MRX-Core/commit/fdf9594f))
- **🧪:** [Update error message to include 'mrx-core' prefix] ## Tests - Updated the error message for rate limit exceeded response. ([a7e60dce](https://github.com/MRX-Systems/MRX-Core/commit/a7e60dce))
- **🧪:** [Integrate success keys for microservice responses] ([8ecc26a4](https://github.com/MRX-Systems/MRX-Core/commit/8ecc26a4))
- **🧪:** [Add test for onError handling of PARSE code] ([37fa84d5](https://github.com/MRX-Systems/MRX-Core/commit/37fa84d5))
- **🧪:** [Refactor HTTP status code references in tests] ([e8a19c87](https://github.com/MRX-Systems/MRX-Core/commit/e8a19c87))
- **🧪:** [remove old test & add temp test] ([a111692a](https://github.com/MRX-Systems/MRX-Core/commit/a111692a))
- **🧪:** [add some module tests to concurrent] ([52c13cd4](https://github.com/MRX-Systems/MRX-Core/commit/52c13cd4))
- **🧪:** [Add new tests for rate limit] ([1a979a2d](https://github.com/MRX-Systems/MRX-Core/commit/1a979a2d))
- **🧪:** [add new test for cache plugin] ([e5b742ca](https://github.com/MRX-Systems/MRX-Core/commit/e5b742ca))
- **🧪:** [fix name test] ([1276688c](https://github.com/MRX-Systems/MRX-Core/commit/1276688c))
- **🧪:** [Refactor JWT expiration handling in tests] ([78952df3](https://github.com/MRX-Systems/MRX-Core/commit/78952df3))
- **🧪:** [add test for update with limit] ([57a95345](https://github.com/MRX-Systems/MRX-Core/commit/57a95345))

### 🎨 Styles

- **🎨:** [Update ESLint configuration for improved styling rules] ([6feb6764](https://github.com/MRX-Systems/MRX-Core/commit/6feb6764))

### 🤖 CI

- **🤖:** [Refactor CI/CD workflows and actions] ([f98bbd88](https://github.com/MRX-Systems/MRX-Core/commit/f98bbd88))
- **🤖:** [Update CI configuration for MSSQL secrets management] ([afc8011d](https://github.com/MRX-Systems/MRX-Core/commit/afc8011d))
- **🤖:** [Add Bun version input to CI workflows] ([bdc97e31](https://github.com/MRX-Systems/MRX-Core/commit/bdc97e31))
- **🤖:** [Refacto CI/CD] ([f791df26](https://github.com/MRX-Systems/MRX-Core/commit/f791df26))
- **🤖:** [Bun 1.3.2 IS FIXED WAHOU] ([273b1c44](https://github.com/MRX-Systems/MRX-Core/commit/273b1c44))

### ❤️ Contributors

- Ruby <necrelox@proton.me>
- Github-actions <maxime.meriaux@mrxsys.com>

