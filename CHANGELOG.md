
## v2.13.0

[compare changes](https://github.com/MRX-Systems/MRX-Core/compare/v2.13.0-3-and-293-20260129...v2.13.0)

### 🚀 Enhancements

- **elysia:** Add Plugin suffix to all plugin exports ([2978c802](https://github.com/MRX-Systems/MRX-Core/commit/2978c802))

### 🩹 Fixes

- **🔧:** [fix HOTP cache key collision and LRU eviction] ([239e5ef9](https://github.com/MRX-Systems/MRX-Core/commit/239e5ef9))
- **🔧:** [improve TOTP security hardening] ([8dffae84](https://github.com/MRX-Systems/MRX-Core/commit/8dffae84))
- **🔧:** [remove partial to data type in repo inert method] ([3075e054](https://github.com/MRX-Systems/MRX-Core/commit/3075e054))
- **🔧:** [support bigint primary key type in MSSQL class] ## Bug Fixes - Updated the primary key type handling in the MSSQL class. ([20c43d54](https://github.com/MRX-Systems/MRX-Core/commit/20c43d54))
- **repository:** Return empty array on insert/update with empty data ([85d0edda](https://github.com/MRX-Systems/MRX-Core/commit/85d0edda))
- **repository:** Restrict empty-data guard to plain objects and arrays ([580b7fd7](https://github.com/MRX-Systems/MRX-Core/commit/580b7fd7))

### 💅 Refactors

- **🧹:** [restructure kv-store adapters and extract shared utilities] ([21a91dc2](https://github.com/MRX-Systems/MRX-Core/commit/21a91dc2))
- **kv-store:** Reorganize kv-store module structure ([c4866331](https://github.com/MRX-Systems/MRX-Core/commit/c4866331))
- **kv-store:** Remove ioredis adapter ([9776da8f](https://github.com/MRX-Systems/MRX-Core/commit/9776da8f))
- **deps:** Remove ioredis dependency ([ff12005d](https://github.com/MRX-Systems/MRX-Core/commit/ff12005d))

### 📖 Documentation

- Update commit message convention for clarity ([3ea45273](https://github.com/MRX-Systems/MRX-Core/commit/3ea45273))

### 📦 Build

- **📦:** [update dependencies] ([d3ca4803](https://github.com/MRX-Systems/MRX-Core/commit/d3ca4803))
- **deps:** Bump elysia to 1.4.27 and globals to 17.4.0 ([d2926862](https://github.com/MRX-Systems/MRX-Core/commit/d2926862))

### 🏡 Chore

- **🦉:** V2.13.0-1-and-295-20260130 ([977fecdd](https://github.com/MRX-Systems/MRX-Core/commit/977fecdd))
- **🦉:** V2.13.0-1-and-297-20260130 ([4b65f818](https://github.com/MRX-Systems/MRX-Core/commit/4b65f818))
- Update .npmignore and clear changelog ([d3797bff](https://github.com/MRX-Systems/MRX-Core/commit/d3797bff))
- **elysia:** Remove deprecated microservice plugin files ([dc655831](https://github.com/MRX-Systems/MRX-Core/commit/dc655831))
- **elysia:** Remove microservice plugin references ([fefcdfc8](https://github.com/MRX-Systems/MRX-Core/commit/fefcdfc8))
- **package:** Remove changelog configuration ([9576683e](https://github.com/MRX-Systems/MRX-Core/commit/9576683e))

### ✅ Tests

- **repository:** Make id optional and fix formatting ([b6bbf3e1](https://github.com/MRX-Systems/MRX-Core/commit/b6bbf3e1))
- **elysia:** Update tests for renamed plugin exports ([10bc8ba0](https://github.com/MRX-Systems/MRX-Core/commit/10bc8ba0))

### 🎨 Styles

- **🎨:** [format worker-logger and dynamic-truncation] ([447c4628](https://github.com/MRX-Systems/MRX-Core/commit/447c4628))
- **eslint:** Improve formatting and consistency in eslint config ([80b7f473](https://github.com/MRX-Systems/MRX-Core/commit/80b7f473))

### ❤️ Contributors

- Ruby <necrelox@proton.me>
- Github-actions <maxime.meriaux@mrxsys.com>

