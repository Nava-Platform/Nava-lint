import test from 'node:test';
import assert from 'node:assert/strict';
import { Linter } from 'eslint';
import tseslint from 'typescript-eslint';
import plugin from '../dist/index.js';
import recommended from '../dist/recommended.js';
import reactConfig from '../dist/configs/react.js';
import vitestConfig from '../dist/configs/vitest.js';

const verifyWithParser = (linter, code, configs) =>
    linter.verify(
        code,
        [
            ...configs,
            {
                files: ['**/*.{ts,tsx}'],
                languageOptions: {
                    parser: tseslint.parser,
                    parserOptions: { ecmaVersion: 'latest', sourceType: 'module', ecmaFeatures: { jsx: true } },
                },
            },
        ],
        { filename: 'test.ts' },
    );

test('plugin exposes rules and configs', () => {
    assert.ok(plugin.rules['no-inline-type-imports']);
    assert.ok(plugin.rules['multiline-type-literals']);
    assert.ok(plugin.rules['module-member-order']);
    assert.deepEqual(Object.keys(plugin.configs), ['recommended', 'react', 'vitest']);
});

test('recommended config works without typed linting and reports nava rules', () => {
    const linter = new Linter({ configType: 'flat' });
    const messages = verifyWithParser(
        linter,
        [
            "import { type Foo } from './mod';",
            'type User = { id: string };',
        ].join('\n'),
        [recommended],
    );

    assert.ok(
        messages.some((m) => m.ruleId === 'nava/no-inline-type-imports'),
        `expected nava/no-inline-type-imports, got ${JSON.stringify(messages)}`,
    );
    assert.ok(
        messages.some((m) => m.ruleId === 'nava/multiline-type-literals'),
        'expected nava/multiline-type-literals to be reported',
    );
});

test('react config is an array and enables prettier + perfectionist + nava rules', () => {
    assert.ok(Array.isArray(reactConfig));

    const linter = new Linter({ configType: 'flat' });
    const messages = verifyWithParser(
        linter,
        [
            "import { type Foo } from './mod';",
            'type User = { id: string };',
        ].join('\n'),
        reactConfig,
    );

    assert.ok(messages.some((m) => m.ruleId === 'nava/no-inline-type-imports'));
    assert.ok(messages.some((m) => m.ruleId === 'nava/multiline-type-literals'));
    assert.ok(messages.some((m) => m.ruleId === 'prettier/prettier'));
});

test('react config sorts alias imports after externals using project alias groups', () => {
    const linter = new Linter({ configType: 'flat' });
    const messages = verifyWithParser(
        linter,
        [
            "import { helper } from '@shared/utils';",
            "import { reactStuff } from 'react';",
            "import type { User } from '@domain/user';",
        ].join('\n'),
        reactConfig,
    );

    assert.ok(
        messages.some((m) => m.ruleId === 'perfectionist/sort-imports'),
        `expected perfectionist/sort-imports, got ${JSON.stringify(messages)}`,
    );
});

test('vitest config is a flat config object for test files', () => {
    assert.ok(vitestConfig);
    assert.deepEqual(vitestConfig.files, ['**/*.{test,spec}.{ts,tsx,js,jsx}']);
    assert.ok(vitestConfig.languageOptions.globals.describe);
    assert.ok(vitestConfig.languageOptions.globals.expect);
    assert.equal(vitestConfig.rules['@typescript-eslint/no-explicit-any'], 'off');

    const linter = new Linter({ configType: 'flat' });
    const messages = linter.verify('test.skip("x", () => {});\ndescribe.only("y", () => {});', [vitestConfig], {
        filename: 'foo.test.ts',
    });

    assert.ok(
        messages.some((m) => m.ruleId === 'vitest/no-disabled-tests'),
        `expected a vitest rule to fire, got ${JSON.stringify(messages)}`,
    );
});

test('createConfig with custom aliases uses them in sort-imports', () => {
    const { createConfig } = plugin;
    const custom = createConfig({ aliases: ['@mylib', '@ui'] });
    assert.ok(Array.isArray(custom.react));
    assert.ok(custom.vitest);

    const linter = new Linter({ configType: 'flat' });
    const messages = verifyWithParser(
        linter,
        [
            "import { Button } from '@ui/Button';",
            "import { reactStuff } from 'react';",
        ].join('\n'),
        custom.react,
    );

    assert.ok(
        messages.some((m) => m.ruleId === 'perfectionist/sort-imports'),
        `expected perfectionist/sort-imports, got ${JSON.stringify(messages)}`,
    );
});

test('createConfig can disable prettier and vitest', () => {
    const { createConfig } = plugin;
    const config = createConfig({ prettier: false, vitest: false });
    assert.ok(Array.isArray(config.react));
    assert.strictEqual(config.vitest, undefined);

    const mainBlock = config.react.find((c) => c.rules && c.rules['prettier/prettier']);
    assert.strictEqual(mainBlock, undefined, 'prettier/prettier should be absent');
});

test('createConfig can disable js/ts recommended', () => {
    const { createConfig } = plugin;
    const config = createConfig({ jsRecommended: false, tsRecommended: false });
    assert.ok(Array.isArray(config.react));
    assert.ok(config.react.length > 0, 'should still have config blocks');
});