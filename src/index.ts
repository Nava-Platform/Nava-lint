import type { Rule, ESLint, Linter } from 'eslint';
import perfectionist from 'eslint-plugin-perfectionist';
import prettier from 'eslint-plugin-prettier';
import reactHooks from 'eslint-plugin-react-hooks';
import reactPlugin from 'eslint-plugin-react';
import vitestPlugin from '@vitest/eslint-plugin';
import js from '@eslint/js';
import tseslint from 'typescript-eslint';

import noInlineTypeImports from './rules/no-inline-type-imports.js';
import multilineTypeLiterals from './rules/multiline-type-literals.js';
import moduleMemberOrder from './rules/module-member-order.js';

export const rules: Record<string, Rule.RuleModule> = {
    'no-inline-type-imports': noInlineTypeImports,
    'multiline-type-literals': multilineTypeLiterals,
    'module-member-order': moduleMemberOrder,
};

const browserGlobals = {
    AbortController: 'readonly',
    URLSearchParams: 'readonly',
    sessionStorage: 'readonly',
    clearInterval: 'readonly',
    clearTimeout: 'readonly',
    localStorage: 'readonly',
    setInterval: 'readonly',
    setTimeout: 'readonly',
    navigator: 'readonly',
    document: 'readonly',
    console: 'readonly',
    window: 'readonly',
    fetch: 'readonly',
    URL: 'readonly',
};

const commonJsGlobals = { __dirname: 'readonly', process: 'readonly', require: 'readonly', module: 'readonly' };
const nodeScriptGlobals = { console: 'readonly', process: 'readonly' };

const vitestGlobals = {
    beforeEach: 'readonly',
    afterEach: 'readonly',
    beforeAll: 'readonly',
    afterAll: 'readonly',
    describe: 'readonly',
    expect: 'readonly',
    test: 'readonly',
    it: 'readonly',
    vi: 'readonly',
};

const projectAliasPattern =
    '^@(assets(?:/illustrations)?|shared|adapters|features|infrastructure|components|services|configs|domain|utils|hooks|constants)(?:/.*)?$';

const perfectionistRecommendedLineLengthRules = perfectionist.configs['recommended-line-length'].rules;

export const configs: {
    recommended: Linter.Config;
    react: Linter.Config[];
    vitest: Linter.Config;
} = {
    recommended: {
        plugins: {
            nava: { rules },
        },
        rules: {
            'nava/no-inline-type-imports': 'error',
            'nava/multiline-type-literals': 'error',
            'nava/module-member-order': 'error',
        },
    },

    react: [
        js.configs.recommended,
        ...tseslint.configs.recommended,

        {
            files: ['**/*.{ts,tsx,js,jsx,mjs,cjs}'],
            plugins: {
                nava: { rules },
                perfectionist,
                prettier,
                'react-hooks': reactHooks as unknown as ESLint.Plugin,
                react: reactPlugin,
            },
            rules: {
                ...perfectionistRecommendedLineLengthRules,
                'prettier/prettier': 'error',
                'perfectionist/sort-modules': 'off',
                'nava/module-member-order': 'error',
                'nava/multiline-type-literals': 'error',
                'nava/no-inline-type-imports': 'error',
                'perfectionist/sort-imports': [
                    'error',
                    {
                        groups: [
                            ['type-builtin', 'value-builtin', 'type-external', 'value-external'],
                            ['alias-type', 'alias-value'],
                            [
                                'type-parent',
                                'type-sibling',
                                'type-index',
                                'value-parent',
                                'value-sibling',
                                'value-index',
                            ],
                            'unknown',
                        ],
                        customGroups: [
                            { groupName: 'alias-type', selector: 'type', elementNamePattern: projectAliasPattern },
                            { groupName: 'alias-value', elementNamePattern: projectAliasPattern },
                        ],
                        fallbackSort: { type: 'alphabetical', order: 'asc' },
                        type: 'line-length',
                        newlinesBetween: 1,
                        newlinesInside: 0,
                        order: 'desc',
                    },
                ],
                '@typescript-eslint/consistent-type-imports': [
                    'error',
                    { fixStyle: 'separate-type-imports', prefer: 'type-imports' },
                ],
                '@typescript-eslint/explicit-function-return-type': 'off',
                'no-empty': ['error', { allowEmptyCatch: true }],
                'react-hooks/rules-of-hooks': 'error',
                'react-hooks/exhaustive-deps': 'warn',
                'react/react-in-jsx-scope': 'off',
                'react/prop-types': 'off',
            },
            languageOptions: {
                parser: tseslint.parser,
                parserOptions: {
                    ecmaFeatures: { jsx: true },
                    ecmaVersion: 'latest',
                    sourceType: 'module',
                    project: false,
                },
                globals: browserGlobals,
            },
            settings: { react: { version: 'detect' } },
        },

        {
            files: [
                'src/configs/tailwind/**/*.js',
                '**/*.webpack.{js,cjs}',
                '**/*.config.{js,cjs}',
                'tailwind.config.js',
                'postcss.config.js',
            ],
            languageOptions: {
                parserOptions: { ecmaVersion: 'latest', sourceType: 'script' },
                globals: commonJsGlobals,
            },
            rules: { '@typescript-eslint/no-require-imports': 'off' },
        },

        {
            files: ['scripts/**/*.mjs'],
            languageOptions: {
                parserOptions: { ecmaVersion: 'latest', sourceType: 'module' },
                globals: nodeScriptGlobals,
            },
        },
    ],

    vitest: {
        files: ['**/*.{test,spec}.{ts,tsx,js,jsx}'],
        plugins: {
            vitest: vitestPlugin,
        },
        languageOptions: {
            globals: vitestGlobals,
        },
        rules: {
            ...vitestPlugin.configs.recommended.rules,
            '@typescript-eslint/no-explicit-any': 'off',
        },
    },
};

export default { rules, configs };

// generated by build