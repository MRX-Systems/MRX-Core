This is a TypeScript library built for the Bun runtime environment, providing modules and utilities for API construction—particularly with Elysia JS.  
It is designed to be modular, strongly typed, and highly focused on Developer Experience (DX).

## Repository Structure
- `source/`
  - `errors/`: Error classes, hierarchy, and types
  - `modules/`:
    - `data/`: Data-related modules/utilities
    - `database/`: Database integration (e.g., MSSQL/Knex)
    - `elysia/`: Elysia plugins/extensions
    - `logger/`: Logger implementations and strategies
    - `mailer/`: Mail handling modules
    - `repository/`: Repository abstraction and patterns
    - `singletonManager/`: Singleton management logic
    - `typedEventEmitter/`: Strongly-typed event emitter implementation
  - `utils/`: Generic helper functions and utilities
- `test/`: Test suites (unit and integration, matching source paths)
- `docs/`: Documentation
- `.github/`: GitHub workflows and configuration
- `.vscode/`: Editor/workspace settings
- `sandbox/`: Sandboxed/playground code and experiments
- `builder.ts`: Custom build script
- `bunfig.toml`, `bun.lock`: Bun configuration and lockfile
- `eslint.config.js`: Linter configuration
- `tsconfig.json`, `tsconfig.build.json`: TypeScript configurations
- `.env*`: Environment files and samples
- `package.json`: NPM package config
- `LICENSE`, `README.md`, `CHANGELOG.md`: Project metadata

> **Test organization:**  
> Place tests in the `test/` directory, following the same folder and file structure as in `source/` for clarity and maintainability.

## Development Workflow

- **Build:** `bun run build`  
  Runs the custom builder script (`builder.ts`) with TypeScript compilation and tsc-alias.
- **Test:**  
  - All: `bun run test`
  - Unit only: `bun run test:unit`
  - Integration only: `bun run test:integration`
- **Lint:** `bun run lint` or `bun run fix-lint`  
  Strict ESLint config: TypeScript + stylistic rules + tab indentation.
- **Docs:** `bun run docs`  
  Generates TypeDoc documentation.

## Code Standards & Guidelines

### Required Before Each Commit

- Run `bun run lint` and fix all errors and warnings.
- Run unit `bun run test:unit` or integration `bun run test:integration` tests related to the changes made.
- Ensure documentation is updated if public APIs or complex logic change.

### TypeScript & Project Conventions

1. **Use underscore prefix for private or non-exported elements**  
   (fields, methods, functions, variables):  
   e.g., `_privateMethod`, `_privateVariable`
2. **Always specify visibility modifiers**  
   (`private`, `protected`, `public`) for class methods and properties.  
   Include `readonly`, `override`, and other relevant modifiers when applicable.
3. **Naming conventions:**  
   - `camelCase` for variables, functions, and methods  
   - `PascalCase` for classes, interfaces, and types  
   - `SCREAMING_CASE` for primitive constants
4. **Explicit typing:**  
   - Always specify types for variables, function parameters, and return types  
   - Never use `any` – prefer `unknown` if type cannot be determined  
   - Use type assertions **only when absolutely necessary**  
   - Prefer `interface` over `type` alias for extendable object types
5. **Documentation:**  
   - Document all functions, methods, and code blocks thoroughly with comments  
   - For TypeScript, use **TSDoc** style comments  
   - Always explain purpose, parameters, return values, and behavior  
   - **Only document code when specifically requested**; otherwise, avoid redundant comments  
   - For TSdoc `@throws`, use the format:  
     `@throws ({@link Type}) – {description}`  
   - When documenting an object or interface, **do not** use `@param`; instead, write a comment above each property
6. **Control structures:**  
   - For `if`, `for`, etc., with only a single statement in the body, omit curly braces
7. **Path Aliases:**  
   - Use `#/` for internal imports (e.g., `#/errors/baseError`, `#/modules/database`)
8. **Export Pattern:**  
   - Each directory should have an `index.ts` that re-exports public items  
   - Types are exported in a separate `types/index.ts`
9. **Testing:**  
   - Write unit tests for all new features  
   - Place tests in the corresponding path under `test/`, matching the structure of `source/`  
   - Use Bun's test runner, with `describe` and `test` blocks  
   - For database/external integrations, use the integration tests directory  
   - Prefer table-driven tests when possible (parameterized cases)
10. **Architecture:**  
    - Maintain existing modular structure and directory organization  
    - Use dependency injection patterns where appropriate  
    - Document all public APIs and any complex or non-trivial logic

## Key Module Categories (Overview)

- **Errors:** Custom error hierarchy (`BaseError`, `HttpError`) with UUID tracking, timestamps, and type-safe handling.
- **Database:** MSSQL integration with Knex.js; Repository pattern with advanced operators (`$eq`, `$like`, `$between`, etc.).
- **Elysia Plugins:** Plugins for CRUD, JWT, rate limiting, error handling, and microservices.
- **Logger:** Strategy pattern (console/file) and type-safe event emitter.
- **Repository:** Database abstraction, advanced filtering, pagination, and streaming.
- **SingletonManager:** Type-safe singleton management for application-wide state.
- **TypedEventEmitter:** Event emitter with strict typing for events/listeners.
- **Utils:** General helper functions: data transformation, type guards, streams.

## Contribution Principles

1. **Follow TypeScript best practices and idiomatic patterns**
2. **Maintain existing code structure and modular organization**
3. **Keep the developer experience (DX) in mind**
4. **Keep pull requests focused and well-documented with TsDoc (with comments if asked)**

## Commit Message Convention

This project uses a strict [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) format, enhanced with emojis for clarity and rapid visual parsing.

### Format

<type>(<emoji>): [<summary up to 72 chars>]
<optional blank line>
<optional detailed description in markdown>


- **Type:** One of `feat`, `fix`, `perf`, `refactor`, `build`, `types`, `chore`, `examples`, `docs`, `test`, `style`, `ci`
- **Emoji:** Corresponding emoji for each type (see table below)
- **Summary:** Short summary (max 72 characters), enclosed in square brackets `[ ]`
- **Description:** (Optional, but recommended) Detailed explanation in markdown, using headings (`## Features`, `## Bug Fixes`, etc.), lists, and code blocks if needed.

### Commit Types & Emojis

| Type      | Emoji | Use for                                             |
|-----------|-------|-----------------------------------------------------|
| feat      | 🚀    | New features                                        |
| fix       | 🔧    | Bug fixes                                           |
| perf      | ⚡    | Performance improvements                            |
| refactor  | 🧹    | Refactoring code                                    |
| build     | 📦    | Build tools / dependency changes                    |
| types     | 🌊    | Type definitions                                    |
| chore     | 🦉    | Maintenance, non-code/test changes                  |
| examples  | 🏀    | Example updates                                     |
| docs      | 📖    | Documentation changes                               |
| test      | 🧪    | Test code updates                                   |
| style     | 🎨    | Style/formatting only                               |
| ci        | 🤖    | CI/CD configuration                                |

### Guidelines

- Use the format:  
  `<type>(<emoji>): [<summary>]`  
  (summary in **square brackets**)
- Summary: **max 72 characters**
- Description: Use markdown for clarity. Include sections:
  - For new features: `## Features`, `## Description`
  - For bug fixes: `## Bug Fixes`, `## Description`
  - For others: adapt (see below)
- For every commit, provide a clear, complete description explaining the changes.
- Examples:

   ```markdown
   feat(🚀): [add advanced repository filtering operators]

   ## Features
   - Added `$eq`, `$like`, `$between` filtering operators to repository

   ## Description
   These new operators allow advanced querying and filtering of database records using the repository pattern.
   For example:
   ```
