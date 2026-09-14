# Changelog

All notable changes to `@whydrf/eslint-plugin-nava` are documented here.

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
