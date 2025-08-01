This is a modular, strongly-typed TypeScript library for the Bun runtime, focused on API construction (notably with Elysia JS) and Developer Experience (DX).

## Core Modules & Key Directories

### Modules (`source/modules/`)
- **data**: Data transformers, filtering utilities.
- **database**: MSSQL + Knex.js integration, schema introspection, repository generation.
- **elysia**: Plugins for CRUD, JWT, rate limiting, error handling, microservices.
- **logger**: Strategy pattern logger, typed event emitter.
- **mailer**: Email sending (SMTP via Nodemailer).
- **repository**: DB abstraction, advanced filtering, pagination, streaming.
- **singletonManager**: Type-safe singleton management.
- **typedEventEmitter**: Strictly-typed event emitter.

### Supporting Directories
- **errors**: Custom error hierarchy (`BaseError`, `HttpError`), UUIDs, timestamps, type-safe handling.
- **utils**: General-purpose helpers and utilities.
- **test**: Unit and integration tests, mirrors `source/` structure.

## Development Workflow
- **Build:** `bun run build`
- **Test:** `bun run test`, `bun run test:unit`, `bun run test:integration`
- **Lint:** `bun run lint` (auto-fix: `bun run fix-lint`)
- **Docs:** `bun run docs`

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

## Contribution Principles
1. **Follow TypeScript best practices and idiomatic patterns**
2. **Maintain existing code structure and modular organization**
3. **Keep the developer experience (DX) in mind**
4. **Keep pull requests focused and well-documented with TsDoc (with comments if asked)**

## Commit Message Convention (Conventional Commits + Emoji)

Format:  
`<type>(<emoji>): [summary up to 72 chars]`  
(blank line, then context or description in markdown)

| Type     | Emoji | Use for                            |
|----------|-------|------------------------------------|
| feat     | 🚀    | New features                       |
| fix      | 🔧    | Bug fixes                          |
| perf     | ⚡    | Performance improvements           |
| refactor | 🧹    | Refactoring code                   |
| build    | 📦    | Build tools / dependency changes   |
| types    | 🌊    | Type definitions                   |
| chore    | 🦉    | Maintenance, non-code/test changes |
| examples | 🏀    | Example updates                    |
| docs     | 📖    | Documentation changes              |
| test     | 🧪    | Test code updates                  |
| style    | 🎨    | Style/formatting only              |
| ci       | 🤖    | CI/CD configuration                |

**Example:**
```markdown
feat(🚀): [add advanced repository filtering operators]

## Features
- Added `$eq`, `$like`, `$between` filtering operators to repository

## Description
Allows advanced querying and filtering of database records using the repository pattern.
