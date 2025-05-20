
## v2.3.5-canary-20250520-f78ef3f

[compare changes](https://github.com/MRX-Systems/MRX-Core/compare/v2.3.5-canary-20250516-ec25fa6...v2.3.5-canary-20250520-f78ef3f)

### 🔧 Fixes

- **🔧:** [Fix import] ([1f326f0b](https://github.com/MRX-Systems/MRX-Core/commit/1f326f0b))

### 🧹 Refactors

- **🧹:** [refactor error handling and update package.json scripts] ([70532ad0](https://github.com/MRX-Systems/MRX-Core/commit/70532ad0))
- **🧹:** [update Table class to extend TypedEventEmitter] ([b4ea82c9](https://github.com/MRX-Systems/MRX-Core/commit/b4ea82c9))
- **🧹:** [refactor MSSQL class to use TypedEventEmitter] ([acaf2e8a](https://github.com/MRX-Systems/MRX-Core/commit/acaf2e8a))
- **🧹:** [update event names and variable for clarity] - Renamed 'query-response' to 'query:response' in MssqlEventMap for consistency. - Changed private variable '_pulse' to '_isEventEnabled' for better readability. - Updated constructor and event emission to reflect the new variable name. ([5775b626](https://github.com/MRX-Systems/MRX-Core/commit/5775b626))
- **🧹:** [Enhance _addRoutes function with operationsPermissions] ([d19118f1](https://github.com/MRX-Systems/MRX-Core/commit/d19118f1))
- **🧹:** [Remove unnecessary line in _addRoutes function] ([7c85d70a](https://github.com/MRX-Systems/MRX-Core/commit/7c85d70a))
- **🧹:** [Update permissions handling in _addRoutes function] ([da6bb6aa](https://github.com/MRX-Systems/MRX-Core/commit/da6bb6aa))

### 📦 Build

- **📦:** [update devDependencies versions in package.json] ([55b4254f](https://github.com/MRX-Systems/MRX-Core/commit/55b4254f))
- **📦:** [Update peer dependencies for basalt-helper and basalt-logger] ([ac324212](https://github.com/MRX-Systems/MRX-Core/commit/ac324212))

### 🌊 Types

- **🌊:** [add QueryContext interface for database queries] ([3b01ba7c](https://github.com/MRX-Systems/MRX-Core/commit/3b01ba7c))
- **🌊:** [remove debug option from MSSQLDatabaseOptions interface] ([558f8270](https://github.com/MRX-Systems/MRX-Core/commit/558f8270))
- **🌊:** [add event mapping interfaces for MSSQL and table events] ([cc3d3339](https://github.com/MRX-Systems/MRX-Core/commit/cc3d3339))
- **🌊:** [update MSSQLDatabaseOptions to replace pulse with isEventEnabled] ## Type Changes - Replaced the `pulse` property with `isEventEnabled` in the MSSQLDatabaseOptions interface. ([e672062e](https://github.com/MRX-Systems/MRX-Core/commit/e672062e))

### 🦉 Chore

- **🦉:** V2.3.5-canary-20250516-82ef1fb ([c2553c50](https://github.com/MRX-Systems/MRX-Core/commit/c2553c50))

### 🧪 Tests

- **🧪:** [reorganize MSSQL test structure and enhance event handling] ([0c446cf9](https://github.com/MRX-Systems/MRX-Core/commit/0c446cf9))
- **🧪:** [util to utils] ([b3cac0b6](https://github.com/MRX-Systems/MRX-Core/commit/b3cac0b6))

### ❤️ Contributors

- Ruby <necrelox@proton.me>
- Github-actions <maxime.meriaux@mrxsys.com>

## v2.3.5-canary-20250516-82ef1fb

[compare changes](https://github.com/MRX-Systems/MRX-Core/compare/v2.3.5-canary-20250516-ec25fa6...v2.3.5-canary-20250516-82ef1fb)

### 🧹 Refactors

- **🧹:** [refactor error handling and update package.json scripts] ([70532ad0](https://github.com/MRX-Systems/MRX-Core/commit/70532ad0))

### ❤️ Contributors

- Ruby <necrelox@proton.me>

## v2.3.5-canary-20250516-ec25fa6

[compare changes](https://github.com/MRX-Systems/MRX-Core/compare/v2.3.4-canary-20250515-0a404bc...v2.3.5-canary-20250516-ec25fa6)

### 🧹 Refactors

- **🧹:** [update error handling content-type header] ([e17ed9f1](https://github.com/MRX-Systems/MRX-Core/commit/e17ed9f1))

### 🦉 Chore

- **🦉:** V2.3.4 ([d29a8952](https://github.com/MRX-Systems/MRX-Core/commit/d29a8952))

### ❤️ Contributors

- Ruby <necrelox@proton.me>
- Github-actions <maxime.meriaux@mrxsys.com>

## v2.3.4

[compare changes](https://github.com/MRX-Systems/MRX-Core/compare/v2.3.4-canary-20250515-0a404bc...v2.3.4)

## v2.3.4-canary-20250515-0a404bc

[compare changes](https://github.com/MRX-Systems/MRX-Core/compare/v2.3.3-canary-20250514-ce5e64c...v2.3.4-canary-20250515-0a404bc)

### 🔧 Fixes

- **🔧:** [Remove t.ts] ([253a76bd](https://github.com/MRX-Systems/MRX-Core/commit/253a76bd))

### 🧹 Refactors

- **🧹:** [remove unused color enum exports] ([9daea580](https://github.com/MRX-Systems/MRX-Core/commit/9daea580))
- **🧹:** [Refactor file structure, export, comments] ([f7e58962](https://github.com/MRX-Systems/MRX-Core/commit/f7e58962))
- **🧹:** [rename package and update metadata] ([a4a081ce](https://github.com/MRX-Systems/MRX-Core/commit/a4a081ce))
- **🧹:** [update exports path for store module] ([84d4346a](https://github.com/MRX-Systems/MRX-Core/commit/84d4346a))

### 📖 Documentation

- **📖:** [enhance HTTP status code documentation and structure] ([c6e65b86](https://github.com/MRX-Systems/MRX-Core/commit/c6e65b86))
- **📖:** [update WhereClause interface documentation] ([a8a40f58](https://github.com/MRX-Systems/MRX-Core/commit/a8a40f58))
- **📖:** [enhance Transaction type documentation] ([bc19f4c8](https://github.com/MRX-Systems/MRX-Core/commit/bc19f4c8))
- **📖:** [update async iterable interface documentation] ([f42d90b1](https://github.com/MRX-Systems/MRX-Core/commit/f42d90b1))
- **📖:** [improve documentation for QueryOptionsExtendPagination] ([304258f5](https://github.com/MRX-Systems/MRX-Core/commit/304258f5))
- **📖:** [clarify throwIfNoResult and transaction properties] ([3fa97eaa](https://github.com/MRX-Systems/MRX-Core/commit/3fa97eaa))
- **📖:** [update OrderBy type documentation for clarity] ([4b6366e6](https://github.com/MRX-Systems/MRX-Core/commit/4b6366e6))
- **📖:** [add remarks for MssqlEventLog interface clarity] ([84ffca77](https://github.com/MRX-Systems/MRX-Core/commit/84ffca77))
- **📖:** [Add detailed documentation for plugins] ([f2019ea8](https://github.com/MRX-Systems/MRX-Core/commit/f2019ea8))

### 📦 Build

- **📦:** [update @types/bun dependency version] ([94db9e9a](https://github.com/MRX-Systems/MRX-Core/commit/94db9e9a))
- **📦:** [update docs script in package.json] ## Refactoring - Updated the "docs" script in package.json to include the tsconfig file. ([6727b000](https://github.com/MRX-Systems/MRX-Core/commit/6727b000))

### 🌊 Types

- **🌊:** [refine advanced search type definitions and examples] ([f1d9a5fb](https://github.com/MRX-Systems/MRX-Core/commit/f1d9a5fb))

### 🦉 Chore

- **🦉:** V2.3.3-canary-20250514-764de87 ([79956e3c](https://github.com/MRX-Systems/MRX-Core/commit/79956e3c))
- **🦉:** V2.3.3-canary-20250514-a17e993 ([e32c5077](https://github.com/MRX-Systems/MRX-Core/commit/e32c5077))
- **🦉:** V2.3.3 ([a76f6879](https://github.com/MRX-Systems/MRX-Core/commit/a76f6879))

### ❤️ Contributors

- Ruby <necrelox@proton.me>
- Github-actions <maxime.meriaux@mrxsys.com>

## v2.3.3

[compare changes](https://github.com/MRX-Systems/MRX-Core/compare/v2.3.3-canary-20250514-ce5e64c...v2.3.3)

### 🔧 Fixes

- **🔧:** [Remove t.ts] ([253a76bd](https://github.com/MRX-Systems/MRX-Core/commit/253a76bd))

### 🧹 Refactors

- **🧹:** [remove unused color enum exports] ([9daea580](https://github.com/MRX-Systems/MRX-Core/commit/9daea580))
- **🧹:** [Refactor file structure, export, comments] ([f7e58962](https://github.com/MRX-Systems/MRX-Core/commit/f7e58962))
- **🧹:** [rename package and update metadata] ([a4a081ce](https://github.com/MRX-Systems/MRX-Core/commit/a4a081ce))

### 📖 Documentation

- **📖:** [enhance HTTP status code documentation and structure] ([c6e65b86](https://github.com/MRX-Systems/MRX-Core/commit/c6e65b86))
- **📖:** [update WhereClause interface documentation] ([a8a40f58](https://github.com/MRX-Systems/MRX-Core/commit/a8a40f58))
- **📖:** [enhance Transaction type documentation] ([bc19f4c8](https://github.com/MRX-Systems/MRX-Core/commit/bc19f4c8))
- **📖:** [update async iterable interface documentation] ([f42d90b1](https://github.com/MRX-Systems/MRX-Core/commit/f42d90b1))
- **📖:** [improve documentation for QueryOptionsExtendPagination] ([304258f5](https://github.com/MRX-Systems/MRX-Core/commit/304258f5))
- **📖:** [clarify throwIfNoResult and transaction properties] ([3fa97eaa](https://github.com/MRX-Systems/MRX-Core/commit/3fa97eaa))
- **📖:** [update OrderBy type documentation for clarity] ([4b6366e6](https://github.com/MRX-Systems/MRX-Core/commit/4b6366e6))
- **📖:** [add remarks for MssqlEventLog interface clarity] ([84ffca77](https://github.com/MRX-Systems/MRX-Core/commit/84ffca77))
- **📖:** [Add detailed documentation for plugins] ([f2019ea8](https://github.com/MRX-Systems/MRX-Core/commit/f2019ea8))

### 📦 Build

- **📦:** [update @types/bun dependency version] ([94db9e9a](https://github.com/MRX-Systems/MRX-Core/commit/94db9e9a))
- **📦:** [update docs script in package.json] ## Refactoring - Updated the "docs" script in package.json to include the tsconfig file. ([6727b000](https://github.com/MRX-Systems/MRX-Core/commit/6727b000))

### 🌊 Types

- **🌊:** [refine advanced search type definitions and examples] ([f1d9a5fb](https://github.com/MRX-Systems/MRX-Core/commit/f1d9a5fb))

### 🦉 Chore

- **🦉:** V2.3.3-canary-20250514-764de87 ([79956e3c](https://github.com/MRX-Systems/MRX-Core/commit/79956e3c))
- **🦉:** V2.3.3-canary-20250514-a17e993 ([e32c5077](https://github.com/MRX-Systems/MRX-Core/commit/e32c5077))

### ❤️ Contributors

- Github-actions <maxime.meriaux@mrxsys.com>
- Ruby <necrelox@proton.me>

## v2.3.3-canary-20250514-a17e993

[compare changes](https://github.com/MRX-Systems/MRX-Core/compare/v2.3.3-canary-20250514-ce5e64c...v2.3.3-canary-20250514-a17e993)

### 🔧 Fixes

- **🔧:** [Remove t.ts] ([253a76bd](https://github.com/MRX-Systems/MRX-Core/commit/253a76bd))

### 🧹 Refactors

- **🧹:** [remove unused color enum exports] ([9daea580](https://github.com/MRX-Systems/MRX-Core/commit/9daea580))
- **🧹:** [Refactor file structure, export, comments] ([f7e58962](https://github.com/MRX-Systems/MRX-Core/commit/f7e58962))
- **🧹:** [rename package and update metadata] ([a4a081ce](https://github.com/MRX-Systems/MRX-Core/commit/a4a081ce))

### 📖 Documentation

- **📖:** [enhance HTTP status code documentation and structure] ([c6e65b86](https://github.com/MRX-Systems/MRX-Core/commit/c6e65b86))
- **📖:** [update WhereClause interface documentation] ([a8a40f58](https://github.com/MRX-Systems/MRX-Core/commit/a8a40f58))
- **📖:** [enhance Transaction type documentation] ([bc19f4c8](https://github.com/MRX-Systems/MRX-Core/commit/bc19f4c8))
- **📖:** [update async iterable interface documentation] ([f42d90b1](https://github.com/MRX-Systems/MRX-Core/commit/f42d90b1))
- **📖:** [improve documentation for QueryOptionsExtendPagination] ([304258f5](https://github.com/MRX-Systems/MRX-Core/commit/304258f5))
- **📖:** [clarify throwIfNoResult and transaction properties] ([3fa97eaa](https://github.com/MRX-Systems/MRX-Core/commit/3fa97eaa))
- **📖:** [update OrderBy type documentation for clarity] ([4b6366e6](https://github.com/MRX-Systems/MRX-Core/commit/4b6366e6))
- **📖:** [add remarks for MssqlEventLog interface clarity] ([84ffca77](https://github.com/MRX-Systems/MRX-Core/commit/84ffca77))
- **📖:** [Add detailed documentation for plugins] ([f2019ea8](https://github.com/MRX-Systems/MRX-Core/commit/f2019ea8))

### 📦 Build

- **📦:** [update @types/bun dependency version] ([94db9e9a](https://github.com/MRX-Systems/MRX-Core/commit/94db9e9a))
- **📦:** [update docs script in package.json] ## Refactoring - Updated the "docs" script in package.json to include the tsconfig file. ([6727b000](https://github.com/MRX-Systems/MRX-Core/commit/6727b000))

### 🌊 Types

- **🌊:** [refine advanced search type definitions and examples] ([f1d9a5fb](https://github.com/MRX-Systems/MRX-Core/commit/f1d9a5fb))

### 🦉 Chore

- **🦉:** V2.3.3-canary-20250514-764de87 ([79956e3c](https://github.com/MRX-Systems/MRX-Core/commit/79956e3c))

### ❤️ Contributors

- Ruby <necrelox@proton.me>
- Github-actions <necrelox@proton.me>

