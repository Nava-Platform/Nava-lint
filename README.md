# @whydrf/eslint-plugin-nava

An opinionated ESLint plugin for TypeScript projects that enforces clean-code conventions,
import organization, type-safety patterns, and a consistent module structure.

> The original name `eslint-plugin-nava` was rejected by npm for being too similar to the
> existing `eslint-plugin-ava`, so the package is published under the `@whydrf` scope.

---

## Why this plugin?

Three of the bundled rules do things that standard ESLint + TypeScript setups can't easily do:

- **`no-inline-type-imports`** — The standard `@typescript-eslint/consistent-type-imports` rule
  with `prefer: 'type-imports'` does **not** report `import { type X }`, because the TypeScript
  parser normalizes it to `import type { X }`. This rule works at the text level, so it still
  catches inline type imports, and even splits `import { type X, Y }` into separate type/value
  imports with auto-fix.
- **`multiline-type-literals`** — Enforces that inline object type literals
  (`type T = { a: string }`) and interface bodies are always multiline (better git diffs).
- **`module-member-order`** — Keeps top-level declarations in a consistent order:
  `imports → enum → type → interface → const`.

---

## Installation

```bash
# npm
npm install --save-dev @whydrf/eslint-plugin-nava

# pnpm
pnpm add -D @whydrf/eslint-plugin-nava

# yarn
yarn add -D @whydrf/eslint-plugin-nava
```

This package has peer dependencies. Install them if they aren't already in your project:

```bash
pnpm add -D eslint typescript typescript-eslint @eslint/js
```

| Peer dependency            | Version  | Required? |
| -------------------------- | -------- | --------- |
| `eslint`                   | `^9.0.0` | yes       |
| `typescript-eslint`        | `^8.0.0` | yes       |
| `@eslint/js`               | `^9.0.0` | yes       |
| `@typescript-eslint/utils` | `^8.0.0` | optional  |

> Requires ESLint 9 (flat config).

---

## Quick start

### Option 1 — Rules only (Recommended)

If you just want the three rules enabled and keep the rest of your config under your control:

```js
// eslint.config.js
import nava from '@whydrf/eslint-plugin-nava/recommended';

export default [
    nava,
    {
        files: ['**/*.{ts,tsx}'],
        languageOptions: {
            parser: (await import('typescript-eslint')).parser,
        },
    },
];
```

> The `recommended` config includes the three rules. `TypeScript` (parser) is a peer
> dependency; the parser must be configured for `.ts/.tsx` files, as above. No typed-linting
> setup (`parserOptions.project`) is required.

### Option 2 — Full config with `createConfig`

Fully configurable via `createConfig(options)`:

```js
// eslint.config.js
import { createConfig } from '@whydrf/eslint-plugin-nava';

const { react, vitest } = createConfig({
    aliases: ['@components', '@domain', '@ui'],
    prettier: true,
    vitest: true,
    rules: {
        'no-console': 'warn',
    },
});

export default [
    { ignores: ['node_modules/**', 'dist/**'] },
    ...react,
    vitest,
];
```

### Option 3 — Full React config (subpath import)

```js
// eslint.config.js
import navaReact from '@whydrf/eslint-plugin-nava/configs/react';

export default [
    ...navaReact,
];
```

### Option 4 — A single rule

```js
// eslint.config.js
import nava from '@whydrf/eslint-plugin-nava';

export default [
    {
        plugins: { nava },
        rules: {
            'nava/no-inline-type-imports': 'error',
            'nava/multiline-type-literals': 'error',
            'nava/module-member-order': 'error',
        },
    },
];
```

---

## `createConfig(options?)` — Full API Reference

The `createConfig` factory returns `{ recommended, react, vitest? }` and accepts an
optional `NavaConfigOptions` object. Every option has a sensible default, so you only
need to specify what you want to change.

```ts
import { createConfig } from '@whydrf/eslint-plugin-nava';

const config = createConfig({ /* options */ });
// config.recommended → Linter.Config
// config.react       → Linter.Config[]
// config.vitest      → Linter.Config | undefined
```

### Options

#### `aliases`

Project import aliases used to group alias imports after externals in `sort-imports`.

- **Type:** `string[]`
- **Default:** `['@assets', '@shared', '@adapters', '@features', '@infrastructure', '@components', '@services', '@configs', '@domain', '@utils', '@hooks', '@constants']`

```js
createConfig({
    aliases: ['@components', '@domain', '@ui', '@mylib'],
});
```

#### `files`

File patterns the main config block applies to.

- **Type:** `string[]`
- **Default:** `['**/*.{ts,tsx,js,jsx,mjs,cjs}']`

```js
createConfig({
    files: ['src/**/*.{ts,tsx}'],
});
```

#### `globals`

Additional browser globals merged with the defaults.

- **Type:** `Record<string, string>`
- **Default:** `{}`

```js
createConfig({
    globals: { myGlobal: 'readonly' },
});
```

#### `parserOptions`

TypeScript parser options merged with defaults (`ecmaVersion: 'latest'`, `sourceType: 'module'`, `project: false`).

- **Type:** `Linter.ParserOptions`
- **Default:** `{}`

```js
createConfig({
    parserOptions: {
        ecmaVersion: 2022,
        project: './tsconfig.json',
    },
});
```

#### `settings`

ESLint settings merged with `{ react: { version: 'detect' } }`.

- **Type:** `Record<string, unknown>`
- **Default:** `{}`

```js
createConfig({
    settings: {
        react: { version: '18.0' },
    },
});
```

#### `rules`

Rule overrides merged on top of the default rules. Use this to change severity or enable/disable rules.

- **Type:** `Linter.RulesRecord`
- **Default:** `{}`

```js
createConfig({
    rules: {
        'no-console': 'warn',
        'no-unused-vars': 'off',
    },
});
```

#### `jsRecommended`

Include `@eslint/js` recommended rules.

- **Type:** `boolean`
- **Default:** `true`

```js
createConfig({ jsRecommended: false });
```

#### `tsRecommended`

Include `typescript-eslint` recommended rules.

- **Type:** `boolean`
- **Default:** `true`

```js
createConfig({ tsRecommended: false });
```

#### `perfectionistRecommended`

Include `eslint-plugin-perfectionist` recommended-line-length rules.

- **Type:** `boolean`
- **Default:** `true`

```js
createConfig({ perfectionistRecommended: false });
```

#### `prettier`

Enable `prettier/prettier` rule.

- **Type:** `boolean`
- **Default:** `true`

```js
createConfig({ prettier: false });
```

#### `react`

Enable `react-hooks` and `react` rules + plugins.

- **Type:** `boolean`
- **Default:** `true`

```js
createConfig({ react: false });
```

#### `sortImports`

Customize or disable `perfectionist/sort-imports`. Pass `false` to disable, or an object
to override the default sort-imports options (merged over defaults).

- **Type:** `false | Record<string, unknown>`
- **Default:** `undefined` (uses built-in defaults)

```js
// Disable sort-imports
createConfig({ sortImports: false });

// Customize sort-imports options
createConfig({
    sortImports: {
        type: 'alphabetical',
        order: 'asc',
        newlinesBetween: 2,
    },
});
```

#### `consistentTypeImports`

Customize or disable `@typescript-eslint/consistent-type-imports`. Pass `false` to
disable, or an object to override the rule options.

- **Type:** `false | Record<string, unknown>`
- **Default:** `undefined` (uses `{ fixStyle: 'separate-type-imports', prefer: 'type-imports' }`)

```js
// Disable consistent-type-imports
createConfig({ consistentTypeImports: false });

// Customize options
createConfig({
    consistentTypeImports: { prefer: 'type-imports' },
});
```

#### `noInlineTypeImports`

Enable `nava/no-inline-type-imports` rule.

- **Type:** `boolean`
- **Default:** `true`

```js
createConfig({ noInlineTypeImports: false });
```

#### `multilineTypeLiterals`

Enable `nava/multiline-type-literals` rule.

- **Type:** `boolean`
- **Default:** `true`

```js
createConfig({ multilineTypeLiterals: false });
```

#### `moduleMemberOrder`

Enable `nava/module-member-order` rule.

- **Type:** `boolean`
- **Default:** `true`

```js
createConfig({ moduleMemberOrder: false });
```

#### `noEmpty`

Customize or disable `no-empty` rule. Pass `false` to disable, or an object to
override the rule options.

- **Type:** `false | Record<string, unknown>`
- **Default:** `undefined` (uses `{ allowEmptyCatch: true }`)

```js
// Disable no-empty
createConfig({ noEmpty: false });
```

#### `commonJs`

Configure the CommonJS environment block (for `.config.js`, `tailwind.config.js`, etc.).
Pass `false` to disable the block entirely.

- **Type:** `false | { files?: string[]; globals?: Record<string, string>; rules?: Linter.RulesRecord }`
- **Default:** `true` (uses built-in file patterns and globals)

```js
// Disable CommonJS block
createConfig({ commonJs: false });

// Customize CommonJS block
createConfig({
    commonJs: {
        files: ['**/*.config.js'],
        globals: { __dirname: 'readonly' },
        rules: { '@typescript-eslint/no-require-imports': 'off' },
    },
});
```

#### `nodeScript`

Configure the Node script environment block (for `scripts/**/*.mjs`).
Pass `false` to disable the block entirely.

- **Type:** `false | { files?: string[]; globals?: Record<string, string>; rules?: Linter.RulesRecord }`
- **Default:** `true` (uses built-in file patterns and globals)

```js
// Disable Node script block
createConfig({ nodeScript: false });

// Customize Node script block
createConfig({
    nodeScript: {
        files: ['scripts/**/*.js'],
        globals: { process: 'readonly' },
    },
});
```

#### `vitest`

Configure the vitest test environment block. Pass `false` to disable entirely,
or an object to customize.

- **Type:** `false | { files?: string[]; globals?: Record<string, string>; rules?: Linter.RulesRecord; useRecommended?: boolean; noExplicitAny?: boolean }`
- **Default:** `undefined` (vitest config is included)

```js
// Disable vitest config
createConfig({ vitest: false });

// Customize vitest config
createConfig({
    vitest: {
        files: ['**/*.test.{ts,tsx}'],
        globals: { myTestHelper: 'readonly' },
        useRecommended: true,
        noExplicitAny: true,
        rules: {
            'vitest/no-focused-tests': 'error',
        },
    },
});
```

---

## Full examples

### React + TypeScript + Prettier + Vitest

```js
// eslint.config.js
import { createConfig } from '@whydrf/eslint-plugin-nava';

const { react, vitest } = createConfig({
    aliases: ['@components', '@domain', '@ui', '@utils'],
    rules: {
        'no-console': 'warn',
    },
});

export default [
    { ignores: ['node_modules/**', 'dist/**', 'build/**'] },
    ...react,
    vitest,
];
```

### Minimal — only nava rules

```js
// eslint.config.js
import { createConfig } from '@whydrf/eslint-plugin-nava';

const { recommended } = createConfig();

export default [recommended];
```

### Non-React project (Node.js CLI)

```js
// eslint.config.js
import { createConfig } from '@whydrf/eslint-plugin-nava';

const { react } = createConfig({
    react: false,
    prettier: false,
    vitest: false,
    aliases: ['@lib', '@commands'],
});

export default [
    { ignores: ['node_modules/**', 'dist/**'] },
    ...react,
];
```

### Custom import sorting

```js
// eslint.config.js
import { createConfig } from '@whydrf/eslint-plugin-nava';

const { react } = createConfig({
    sortImports: {
        type: 'alphabetical',
        order: 'asc',
        groups: [
            ['builtin', 'external'],
            ['alias'],
            ['parent', 'sibling', 'index'],
            'unknown',
        ],
        customGroups: [
            { elementNamePattern: '^@modules/', groupName: 'alias' },
        ],
    },
});

export default [...react];
```

### Disable all custom nava rules, keep perfectionist + prettier

```js
// eslint.config.js
import { createConfig } from '@whydrf/eslint-plugin-nava';

const { react } = createConfig({
    noInlineTypeImports: false,
    multilineTypeLiterals: false,
    moduleMemberOrder: false,
});

export default [...react];
```

### Override a specific rule severity

```js
// eslint.config.js
import { createConfig } from '@whydrf/eslint-plugin-nava';

const { react, vitest } = createConfig({
    rules: {
        'no-console': 'error',
        '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
        'prettier/prettier': 'warn',
    },
});

export default [...react, vitest];
```

---

## Rules

### `nava/no-inline-type-imports` ⚠️ auto-fix

Disallows `import { type X }` and enforces `import type { X }`.

```ts
// ❌ wrong
import { type Foo, bar } from './mod';

// ✅ correct (auto-fix produces this)
import type { Foo } from './mod';
import { bar } from './mod';
```

If the import only holds types, it is converted directly:

```ts
// ❌
import { type Foo } from './mod';

// ✅
import type { Foo } from './mod';
```

> Note: this rule works at the text level, so it still detects and fixes inline type imports
> even after the TypeScript parser has normalized them.

### `nava/multiline-type-literals` ⚠️ auto-fix

Enforces that inline object type literals span multiple lines.

```ts
// ❌ wrong
type User = { id: string; name: string };

// ✅ correct
type User = {
    id: string;
    name: string;
};
```

The same applies to `interface` bodies:

```ts
// ❌
interface User { id: string; name: string }

// ✅
interface User {
    id: string;
    name: string;
}
```

### `nava/module-member-order` ⚠️ auto-fix

Enforces the order of top-level declarations (after the import block):

```
imports → enum → type → interface → const
```

```ts
// ❌ wrong (mixed up)
const DEFAULTS = {};
type Id = string;
interface User {}

// ✅ correct (auto-fix produces this)
type Id = string;
interface User {}
const DEFAULTS = {};
```

> The rule only checks the leading block of declarations (up to the first statement that is not
> one of these four kinds). If there are comments between them, auto-fix is skipped to avoid
> dropping comments — only a report is emitted.

---

## Provided configs

| Export                                       | Description                                                          |
| -------------------------------------------- | -------------------------------------------------------------------- |
| `createConfig(options?)`                     | Factory function returning `{ recommended, react, vitest? }`.       |
| `@whydrf/eslint-plugin-nava/recommended`     | A `Linter.Config` with the three rules enabled (ESLint 9 flat config).|
| `@whydrf/eslint-plugin-nava/configs/react`   | An array of configs for React/TS projects (perfectionist + prettier).|
| `@whydrf/eslint-plugin-nava/configs/vitest`  | A flat config for vitest test files.                                 |

---

## Running and auto-fixing

```bash
# lint only
pnpm eslint .

# lint + auto-fix
pnpm eslint . --fix
```

### VS Code on-save auto-fix

`.vscode/settings.json`:

```json
{
    "eslint.experimental.useFlatConfig": true,
    "eslint.packageManager": "pnpm",
    "editor.codeActionsOnSave": {
        "source.fixAll.eslint": "explicit"
    },
    "eslint.workingDirectories": [{ "mode": "auto" }]
}
```

With this setup, errors are shown live in the editor and fixed automatically on every save
(`Ctrl/Cmd+S`).

---

## FAQ

**Does it conflict with Prettier?**
The `react` config includes `prettier/prettier`, so Prettier runs as an ESLint rule with no
conflict. In the `recommended` config you set up Prettier separately.

**Why is the name scoped?**
`eslint-plugin-nava` was rejected by npm for being too similar to `eslint-plugin-ava`, so the
package is published as `@whydrf/eslint-plugin-nava`.

**Can individual rules be turned off?**
Yes. Pass `false` to the corresponding option in `createConfig`, or override with `"off"` in `rules`.

**How do I use custom aliases?**
Pass your alias prefixes in the `aliases` option:

```js
createConfig({
    aliases: ['@components', '@domain', '@ui', '@mylib'],
});
```

**How do I disable vitest?**
Pass `vitest: false`:

```js
createConfig({ vitest: false });
```

**How do I customize sort-imports?**
Pass a `sortImports` object with perfectionist options:

```js
createConfig({
    sortImports: {
        type: 'alphabetical',
        order: 'asc',
        newlinesBetween: 2,
    },
});
```

---

## Further reading

- [Migration guide](./docs/migration.md)
- [Usage tips](./docs/tips.md)
- [Contributing](./CONTRIBUTING.md)
- [Security](./SECURITY.md)
- [Changelog](./CHANGELOG.md)

## License

[MIT](./LICENSE)
