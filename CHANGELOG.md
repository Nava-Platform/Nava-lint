# Changelog

All notable changes to `@whydrf/eslint-plugin-nava` are documented here.

## [1.0.0]

Stable release. No breaking changes from v0.4.0 — the `createConfig` factory and all
defaults remain identical.

### Highlights since 0.1.0

- `createConfig(options)` factory for full configurability (aliases, files, globals,
  parser options, settings, rules, and all preset toggles).
- `configs.vitest` — vitest flat config with recommended rules.
- `@typescript-eslint/consistent-type-imports` with `separate-type-imports`.
- `react-hooks/rules-of-hooks` + `react-hooks/exhaustive-deps`.
- `perfectionist` v5 type/value groups for import sorting.
- `prettier/prettier` integration.

## [0.4.0]

### Added

- **Full configurability via `createConfig(options)` factory.** Every aspect of nava's
  config is now configurable: aliases, files, globals, parser options, settings, rules,
  and all preset toggles (jsRecommended, tsRecommended, perfectionistRecommended,
  prettier, react, sortImports, consistentTypeImports, noInlineTypeImports,
  multilineTypeLiterals, moduleMemberOrder, noEmpty, commonJs, nodeScript, vitest).
- `NavaConfigOptions`, `NavaConfigs`, `EnvironmentBlockOptions`, `VitestOptions` types
  exported for TypeScript consumers.
- `configs.vitest` is now optional in `NavaConfigs` (set `vitest: false` to disable).

### Changed

- **Backward compatible:** `configs` (recommended, react, vitest) remain the default
  exports with the same behavior as v0.3.0. `createConfig()` with no options produces
  identical results.
- `vitest.ts` re-export now types `configs.vitest` as `Linter.Config | undefined`.

## [0.3.0]

### Added

- `configs.vitest` flat config: registers `@vitest/eslint-plugin`, sets test globals,
  and enables the vitest recommended rules with `@typescript-eslint/no-explicit-any` off.
  Accessible as `@whydrf/eslint-plugin-nava/configs/vitest`.

### Changed

- `configs.react` now includes `@typescript-eslint/consistent-type-imports` with
  `fixStyle: 'separate-type-imports'` (matches the physician-panel setup).
- `configs.react` now registers `eslint-plugin-react` and `eslint-plugin-react-hooks`
  explicitly and sets `react-hooks/rules-of-hooks` + `react-hooks/exhaustive-deps`.
- `configs.react` applies `files: ['**/*.{ts,tsx,js,jsx,mjs,cjs}']` on the main rule
  block, plus commonJS and node script environment overrides for config and scripts
  directories.
- Project alias pattern now includes `constants`.
- `eslint-plugin-perfectionist` bumped to `^5.9.0` (v5 type/value groups used in
  `perfectionist/sort-imports`).
- `eslint-plugin-react-hooks` bumped to `^7.0.1`.

## [0.2.0]

### Fixed

- The `recommended` config no longer enables `@typescript-eslint/consistent-type-imports`,
  which crashed ESLint with "requires type information" unless typed linting
  (`parserOptions.project`) was configured. `nava/no-inline-type-imports` covers the same
  case without type information.
- `nava/no-inline-type-imports` now works from the AST, so it catches inline type imports on
  multiline statements and preserves the original quote style and trailing semicolon. It also
  handles default/namespace imports correctly.
- `nava/multiline-type-literals` no longer drops the trailing `;`/`,` separator of the last
  member when auto-fixing.
- Example configs in `examples/` now import the correct scoped package name and configure the
  TypeScript parser.

### Added

- Automated tests (Node's built-in test runner + `RuleTester`) covering all three rules and
  the exported configs.

## [0.1.0]

### Added

- `nava/no-inline-type-imports` rule
- `nava/multiline-type-literals` rule
- `nava/module-member-order` rule
- `recommended` flat config
- `configs/react` flat config
- CI publishes on GitHub Release.
