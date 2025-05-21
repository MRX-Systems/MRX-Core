
## v2.4.0-canary-20250521-731c6b4

[compare changes](https://github.com/MRX-Systems/MRX-Core/compare/v2.3.5-canary-20250520-f78ef3f...v2.4.0-canary-20250521-731c6b4)

### 🚀 Enhancements

- **🚀:** [Add TypedEventEmitter and EventMap for type-safe event handling] ([e0f221d7](https://github.com/MRX-Systems/MRX-Core/commit/e0f221d7))
- **🚀:** [Implement a type-safe logging system with strategies] ([93072596](https://github.com/MRX-Systems/MRX-Core/commit/93072596))
- **🚀:** [Add SingletonManager and error handling enums] ([dd0eb052](https://github.com/MRX-Systems/MRX-Core/commit/dd0eb052))
- **🚀:** [Add data validation and transformation utilities] ([3aff1742](https://github.com/MRX-Systems/MRX-Core/commit/3aff1742))

### 🔧 Fixes

- **🔧:** [Correction pull request] ([28bfd9be](https://github.com/MRX-Systems/MRX-Core/commit/28bfd9be))

### 🧹 Refactors

- **🧹:** [Organize exports in index.ts for better clarity] ## Refactoring - Restructured export statements in `index.ts` for improved organization. - Grouped related exports under clear section headers for Database, Elysia, Error, Mailer, and Repository. ([fe7da3ca](https://github.com/MRX-Systems/MRX-Core/commit/fe7da3ca))
- **🧹:** [rename tranformer folder to transformers] ([739fffea](https://github.com/MRX-Systems/MRX-Core/commit/739fffea))
- **🧹:** [Update import paths for consistency and clarity] ([42d1d56d](https://github.com/MRX-Systems/MRX-Core/commit/42d1d56d))
- **🧹:** [Organize and update exports in  index files] ([d077840a](https://github.com/MRX-Systems/MRX-Core/commit/d077840a))

### 📦 Build

- **📦:** [clean build entry point] ([0109b161](https://github.com/MRX-Systems/MRX-Core/commit/0109b161))
- **📦:** [Remove unused peer dependencies from package.json] ([83c381a4](https://github.com/MRX-Systems/MRX-Core/commit/83c381a4))
- **📦:** [Organize and update entry points in builder.ts and package.json] ([29942972](https://github.com/MRX-Systems/MRX-Core/commit/29942972))
- **📦:** [Update dependencies to latest versions] Updated all devDependencies and peerDependencies in bun.lock to their latest versions for improved compatibility and security. ([e4bd5874](https://github.com/MRX-Systems/MRX-Core/commit/e4bd5874))
- **📦:** [Organize and update exports for utils module] ## Refactoring - Added exports for utils and their types in index files. - Updated package.json to include new utils paths. ([aeedb9a8](https://github.com/MRX-Systems/MRX-Core/commit/aeedb9a8))

### 🌊 Types

- **🌊:** [Don't worry typescript, it's ok] ([a04c0192](https://github.com/MRX-Systems/MRX-Core/commit/a04c0192))

### 🦉 Chore

- **🦉:** V2.3.5-canary-20250520-f78ef3f ([9dcef466](https://github.com/MRX-Systems/MRX-Core/commit/9dcef466))
- **🦉:** V2.3.5-canary-20250520-f78ef3f ([84e1c9e5](https://github.com/MRX-Systems/MRX-Core/commit/84e1c9e5))
- **🦉:** V2.3.5 ([c62e1461](https://github.com/MRX-Systems/MRX-Core/commit/c62e1461))
- **🦉:** [Remove unused server.ts file] ([e1c1d557](https://github.com/MRX-Systems/MRX-Core/commit/e1c1d557))
- **🦉:** [Remove outdated changelog entries] ([b13e823d](https://github.com/MRX-Systems/MRX-Core/commit/b13e823d))

### 🧪 Tests

- **🧪:** [Add unit tests for TypedEventEmitter functionality] ([201d9b32](https://github.com/MRX-Systems/MRX-Core/commit/201d9b32))
- **🧪:** [Add comprehensive tests for Logger class functionality] ([c460845e](https://github.com/MRX-Systems/MRX-Core/commit/c460845e))
- **🧪:** [Add tests for SingletonManager functionality] ([d473a2a1](https://github.com/MRX-Systems/MRX-Core/commit/d473a2a1))
- **🧪:** [Add comprehensive data filtering and transformation tests] ([e7a3c2cc](https://github.com/MRX-Systems/MRX-Core/commit/e7a3c2cc))
- **🧪:** [Update transformer import paths for consistency] ([aead523c](https://github.com/MRX-Systems/MRX-Core/commit/aead523c))
- **🧪:** [Add tests for key transformation functions] ## Tests - Added tests for `CamelCaseTransformer`, `KebabCaseTransformer`, `PascalCaseTransformer`, and `SnakeCaseTransformer` to ensure correct key transformations. - Each transformer now includes tests for edge cases, such as transforming keys that are already in the desired format. ([43c82d00](https://github.com/MRX-Systems/MRX-Core/commit/43c82d00))

### 🎨 Styles

- **🎨:** [Disable no-empty-object-type rule in ESLint config] Updated the ESLint configuration to turn off the '@typescript-eslint/no-empty-object-type' rule for improved flexibility in type definitions. ([78af9f9c](https://github.com/MRX-Systems/MRX-Core/commit/78af9f9c))

### ❤️ Contributors

- Ruby <necrelox@proton.me>
- Github-actions <maxime.meriaux@mrxsys.com>

