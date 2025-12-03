
## v2.12.0-1-and-288-20251203

[compare changes](https://github.com/MRX-Systems/MRX-Core/compare/v2.11.0...v2.12.0-1-and-288-20251203)

### 🚀 Enhancements

- **🚀:** [Add isDateFromElysiaTypeBox utility function] ([804b67cb](https://github.com/MRX-Systems/MRX-Core/commit/804b67cb))
- **🚀:** [Add flatten utility function for TypeBox schemas] ([02c0ff84](https://github.com/MRX-Systems/MRX-Core/commit/02c0ff84))
- **🚀:** [Add buildAdaptiveWhereClauseSchema function] ([cffc8eae](https://github.com/MRX-Systems/MRX-Core/commit/cffc8eae))
- **🚀:** [Add buildGlobalSearchSchema function] ([f6d9b5ea](https://github.com/MRX-Systems/MRX-Core/commit/f6d9b5ea))
- **🚀:** [Add cleanSchema function for schema filtering] ([7ea4c10c](https://github.com/MRX-Systems/MRX-Core/commit/7ea4c10c))
- **🚀:** [Add buildSelectedFieldsSchema function] ([ac8663b8](https://github.com/MRX-Systems/MRX-Core/commit/ac8663b8))
- **🚀:** [Add buildFilterSchema function for schema filtering] ([7f5a69d6](https://github.com/MRX-Systems/MRX-Core/commit/7f5a69d6))
- **🚀:** [Add buildOrderBySchema function for schema creation] ([dd13d33a](https://github.com/MRX-Systems/MRX-Core/commit/dd13d33a))
- **🚀:** [Add buildCountSchema function for count capabilities] ([32d04e12](https://github.com/MRX-Systems/MRX-Core/commit/32d04e12))
- **🚀:** [Add createDeleteSchema function for delete capabilities] ([d59dae5c](https://github.com/MRX-Systems/MRX-Core/commit/d59dae5c))
- **🚀:** [Add buildFindSchema function for search capabilities] ([0ca3d349](https://github.com/MRX-Systems/MRX-Core/commit/0ca3d349))
- **🚀:** [Add buildInsertSchema function for insert capabilities] ([e5edbcc4](https://github.com/MRX-Systems/MRX-Core/commit/e5edbcc4))
- **🚀:** [Add buildUpdateOneSchema function for update capabilities] ([c08f8c73](https://github.com/MRX-Systems/MRX-Core/commit/c08f8c73))
- **🚀:** [Add buildUpdateSchema function for update capabilities] ([1ecc9453](https://github.com/MRX-Systems/MRX-Core/commit/1ecc9453))
- **🚀:** [Add schema exports for adaptive queries and filtering] ([0db9bbef](https://github.com/MRX-Systems/MRX-Core/commit/0db9bbef))

### 🧹 Refactors

- **🧹:** [Remove CRUD, Type Definitions and Utility Functions...] This commit removes several TypeScript type definitions and utility functions related to CRUD operations. The following files were deleted: ([a65bd490](https://github.com/MRX-Systems/MRX-Core/commit/a65bd490))
- **🧹:** [Remove unused flatten type and utility functions] ## Refactoring - Deleted `TFlatten` type definition from `index.ts`. - Removed `flatten` utility function from `flatten.ts`. ## Description This commit cleans up the codebase by removing the `TFlatten` type and its associated utility function, which were not being utilized in the project. This helps in reducing clutter and improving maintainability. ([7c018ab9](https://github.com/MRX-Systems/MRX-Core/commit/7c018ab9))

### 📦 Build

- **📦:** [Update elysia and typescript-eslint dependencies] ([dcc0b5b7](https://github.com/MRX-Systems/MRX-Core/commit/dcc0b5b7))
- **📦:** [update build entrypoints] ([eb0ad2cd](https://github.com/MRX-Systems/MRX-Core/commit/eb0ad2cd))

### 🌊 Types

- **🌊:** [Add GlobalSearch type definition] ([fc6eef7b](https://github.com/MRX-Systems/MRX-Core/commit/fc6eef7b))
- **🌊:** [Add OrderBy type definition for query ordering] ([368e173f](https://github.com/MRX-Systems/MRX-Core/commit/368e173f))
- **🌊:** [Update Filter type to use GlobalSearch for querying] ## Type Changes - Changed the `$q` property in the `Filter` type to use `GlobalSearch<TModel>` instead of a string or object with selected fields. ## Description This update enhances the filtering capabilities by integrating the `GlobalSearch` type, allowing for more dynamic and flexible querying options within the filter model. ([b27a70ec](https://github.com/MRX-Systems/MRX-Core/commit/b27a70ec))
- **🌊:** [Update OrderBy type definition in QueryOptions interface] ([aa185ea7](https://github.com/MRX-Systems/MRX-Core/commit/aa185ea7))
- **🌊:** [Update OrderBy type definition and add GlobalSearch type] ## Type Changes - Updated the export of `OrderByItem` to `OrderBy` from './order-by'. - Added export for `GlobalSearch` from './global-search'. ## Description This commit refines the type definitions by correcting the export for `OrderBy` and introducing `GlobalSearch`, enhancing the type structure for better clarity and usage in the repository. ([060a0757](https://github.com/MRX-Systems/MRX-Core/commit/060a0757))
- **🌊:** [Refactor query options and add global search types] ([f1b943bb](https://github.com/MRX-Systems/MRX-Core/commit/f1b943bb))
- **🌊:** [Add TFlatten type for flattening TypeBox schemas] ([3ebd4c0b](https://github.com/MRX-Systems/MRX-Core/commit/3ebd4c0b))
- **🌊:** [Add CountSchema type for flexible counting options] ## Types - Introduced `CountSchema` type for defining counting options in schemas. ([67fbf789](https://github.com/MRX-Systems/MRX-Core/commit/67fbf789))
- **🌊:** [Add DeleteSchema type for delete operations] ([8721c1a2](https://github.com/MRX-Systems/MRX-Core/commit/8721c1a2))
- **🌊:** [Add FilterSchema type for enhanced filtering options] ([dae93120](https://github.com/MRX-Systems/MRX-Core/commit/dae93120))
- **🌊:** [Add FindSchema type for query options and pagination] ([ac2e0165](https://github.com/MRX-Systems/MRX-Core/commit/ac2e0165))
- **🌊:** [Add GlobalSearchSchema type for flexible global search] ([dab3af35](https://github.com/MRX-Systems/MRX-Core/commit/dab3af35))
- **🌊:** [Add InsertSchema type for data insertion operations] ([29cf67ee](https://github.com/MRX-Systems/MRX-Core/commit/29cf67ee))
- **🌊:** [Add OrderBySchema type for sorting operations] ([35ecdabe](https://github.com/MRX-Systems/MRX-Core/commit/35ecdabe))
- **🌊:** [Add SelectedFieldsSchema type for field selection] ([98cefd43](https://github.com/MRX-Systems/MRX-Core/commit/98cefd43))
- **🌊:** [Add UpdateOneSchema type for updating a single record] ([07b806f7](https://github.com/MRX-Systems/MRX-Core/commit/07b806f7))
- **🌊:** [Add UpdateSchema type for updating records] ([dea190dc](https://github.com/MRX-Systems/MRX-Core/commit/dea190dc))
- **🌊:** [Add type definitions for schema builder] ([cdd49c38](https://github.com/MRX-Systems/MRX-Core/commit/cdd49c38))

### 🧪 Tests

- **🧪:** [Update filter test descriptions for clarity] ([12d9be0d](https://github.com/MRX-Systems/MRX-Core/commit/12d9be0d))
- **🧪:** [Update import path for flatten utility] ([e6197631](https://github.com/MRX-Systems/MRX-Core/commit/e6197631))
- **🧪:** [Remove old tests] ([035b79ee](https://github.com/MRX-Systems/MRX-Core/commit/035b79ee))
- **🧪:** [Add new tests] ([5819e1c7](https://github.com/MRX-Systems/MRX-Core/commit/5819e1c7))

### ❤️ Contributors

- Ruby <necrelox@proton.me>

