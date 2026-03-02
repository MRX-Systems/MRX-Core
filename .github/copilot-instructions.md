---
name: Development_Workflow_and_Code_Standards
description: Universal guidelines for development workflow, code standards, and AI assistance across all project types
applyTo: '**'
---

## General Principles
- Clean, readable, maintainable code; DRY; composition over inheritance
- Small focused functions (single responsibility); meaningful names; no magic numbers
- Handle errors gracefully; never hardcode secrets; validate all inputs
- Consider complexity; profile before optimizing

## TypeScript and Project Conventions
1. Use underscore prefix for private or non-exported elements (e.g., _privateMethod)
2. Always specify visibility modifiers (private, protected, public), plus readonly, override, etc. when applicable
3. Naming conventions: camelCase for variables/functions/methods/parameters/properties; PascalCase for classes/interfaces/types/enums; SCREAMING_CASE for constants
4. Explicit typing: Always specify types for variables, parameters, and return values; never use any; prefer unknown if type cannot be determined; prefer interface over type alias for extendable objects
5. Documentation: Use TSDoc style; explain purpose, parameters, return values, and behavior; only document code when requested; for @throws, use format "@throws ({@link Type}) – description"; for object/interface properties, write comment above each property instead of @param
6. Control structures: Omit curly braces for single-statement bodies
7. Path Aliases: Use #/ for internal imports; do not import barrel files except as entry points
8. Export Pattern: Each directory has index.ts re-exporting public items; types exported in types/index.ts
9. Function style: Class methods use standard method syntax; helpers/callbacks/HOFs prefer arrow functions unless function syntax is required

## Zig Conventions
1. Naming: camelCase for functions/variables, PascalCase for types, SCREAMING_CASE for constants
2. Explicit allocators; errdefer for cleanup; error unions !T
3. Prefer comptime; import only needed std modules; /// docs

## C Conventions
1. Naming: snake_case for functions/variables, SCREAMING_CASE for macros
2. Always check return values; const everywhere; #define/enum for constants
3. Free all memory; size_t for sizes; header guards or #pragma once

## C++ Conventions
1. Naming: camelCase or snake_case (consistent), PascalCase for types
2. RAII + smart pointers; const/constexpr/noexcept; std:: containers
3. References when null invalid; -Wall -Wextra -Werror; Doxygen docs

## Contribution Principles
1. Follow language-specific best practices and idiomatic patterns
2. Maintain existing code structure and modular organization
3. Keep developer experience in mind
4. Keep pull requests focused and well-documented (with TsDoc if asked)
5. Commit different types of changes separately; avoid mixing tests and features in one commit

## Commit Message Convention (Conventional Commits)
Format: `type(scope): summary` (max 72 chars)

- `type` is lowercase; `scope` is optional, describes the module/area affected
- Body (optional): blank line after summary, then context or reasoning

Types:
- feat – New features
- fix – Bug fixes
- perf – Performance improvements
- refactor – Refactoring
- build – Build tools / dependency changes
- types – Type definitions
- chore – Maintenance, non-code/test changes
- docs – Documentation changes
- test – Test code updates
- style – Style/formatting only
- ci – CI/CD configuration

Examples:
- `feat(auth): add OAuth2 login flow`
- `fix(api): handle timeout on webhook delivery`
- `refactor(db): extract connection pooling logic`
- `chore(deps): bump express to 4.19`

## AI Guidelines
- Match existing patterns/style; include error handling; consider edge cases
- Explain "why" not "what"; suggest improvements when relevant