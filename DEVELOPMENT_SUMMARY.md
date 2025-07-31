# MRX-Core Development Guidelines Summary

## 🚀 Project Overview
**TypeScript library** for **Bun runtime** focused on **API construction** with Elysia JS
- **Philosophy**: Modular, strongly typed, high Developer Experience (DX)

## 📁 Key Repository Structure
```
source/
├── errors/           # Error classes & hierarchy
├── modules/
│   ├── data/         # Data utilities
│   ├── database/     # MSSQL/Knex integration
│   ├── elysia/       # Elysia plugins
│   ├── logger/       # Logging strategies
│   ├── mailer/       # Mail handling
│   ├── repository/   # Repository patterns
│   ├── singletonManager/  # Singleton management
│   └── typedEventEmitter/ # Typed event emitter
└── utils/            # Generic helpers
test/                 # Tests (mirrors source structure)
```

## ⚡ Quick Commands
- **Build**: `bun run build`
- **Test All**: `bun run test`
- **Test Unit**: `bun run test:unit`
- **Test Integration**: `bun run test:integration`
- **Lint**: `bun run lint` / `bun run fix-lint`
- **Docs**: `bun run docs`

## 📝 Code Standards (Essential)

### Before Each Commit ✅
- Run `bun run lint` and fix all issues
- Run relevant tests (`test:unit` or `test:integration`)
- Update documentation for API changes

### TypeScript Rules 🎯
- **Private elements**: Use `_` prefix (`_privateMethod`)
- **Visibility**: Always specify `private`/`protected`/`public`
- **Naming**: `camelCase` (vars/functions), `PascalCase` (classes/types), `SCREAMING_CASE` (constants)
- **Types**: Explicit typing always, never `any` (use `unknown`), prefer `interface` over `type`
- **Imports**: Use `#/` for internal paths (`#/errors/baseError`)

### Documentation 📚
- **TSDoc** style comments for all functions/methods
- Explain purpose, parameters, returns, behavior
- `@throws ({@link Type}) – {description}` format
- Comment above each property (not `@param` for objects)

### Testing 🧪
- Tests in `test/` matching `source/` structure
- Use Bun test runner with `describe`/`test` blocks
- Table-driven tests when possible
- Integration tests for external dependencies

## 🏗️ Key Modules
- **Errors**: `BaseError`, `HttpError` with UUID tracking
- **Database**: MSSQL + Knex with advanced operators (`$eq`, `$like`, `$between`)
- **Elysia**: CRUD, JWT, rate limiting, error handling plugins
- **Repository**: Database abstraction with filtering/pagination
- **SingletonManager**: Type-safe singleton management
- **TypedEventEmitter**: Strongly-typed event system

## 🎯 Core Principles
1. **TypeScript best practices** and idiomatic patterns
2. **Maintain modular structure** and organization
3. **Focus on Developer Experience (DX)**
4. **Well-documented, focused PRs** with TSDoc when requested