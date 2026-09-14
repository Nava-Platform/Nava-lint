import test from 'node:test';
import assert from 'node:assert/strict';
import { Linter } from 'eslint';
import tseslint from 'typescript-eslint';
import plugin from '../dist/index.js';
import recommended from '../dist/recommended.js';
import reactConfig from '../dist/configs/react.js';

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
    assert.deepEqual(Object.keys(plugin.configs), ['recommended', 'react']);
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