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

export type EnvironmentBlockOptions = {
    files?: string[];
    globals?: Record<string, string>;
    rules?: Linter.RulesRecord;
};

export type VitestOptions = {
    files?: string[];
    globals?: Record<string, string>;
    rules?: Linter.RulesRecord;
    useRecommended?: boolean;
    noExplicitAny?: boolean;
};

export type NavaConfigOptions = {
    files?: string[];
    aliases?: string[];
    globals?: Record<string, string>;
    parserOptions?: Linter.ParserOptions;
    settings?: Record<string, unknown>;
    rules?: Linter.RulesRecord;

    jsRecommended?: boolean;
    tsRecommended?: boolean;
    perfectionistRecommended?: boolean;
    prettier?: boolean;
    react?: boolean;

    sortImports?: false | Record<string, unknown>;
    consistentTypeImports?: false | Record<string, unknown>;
    noInlineTypeImports?: boolean;
    multilineTypeLiterals?: boolean;
    moduleMemberOrder?: boolean;
    noEmpty?: false | Record<string, unknown>;

    commonJs?: false | EnvironmentBlockOptions;
    nodeScript?: false | EnvironmentBlockOptions;
    vitest?: false | VitestOptions;
};

export type NavaConfigs = {
    recommended: Linter.Config;
    react: Linter.Config[];
    vitest?: Linter.Config;
};

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const defaultAliases = [
    '@assets',
    '@shared',
    '@adapters',
    '@features',
    '@infrastructure',
    '@components',
    '@services',
    '@configs',
    '@domain',
    '@utils',
    '@hooks',
    '@constants',
];

const buildAliasPattern = (aliases: string[]) => `^(${aliases.map(escapeRegExp).join('|')})(?:/.*)?$`;

const buildReactConfig = (options: NavaConfigOptions = {}): Linter.Config[] => {
    const {
        files = ['**/*.{ts,tsx,js,jsx,mjs,cjs}'],
        aliases = defaultAliases,
        globals = {},
        parserOptions = {},
        settings = {},
        rules: userRules = {},
        jsRecommended = true,
        tsRecommended = true,
        perfectionistRecommended = true,
        prettier: enablePrettier = true,
        react: enableReact = true,
        sortImports,
        consistentTypeImports,
        noInlineTypeImports: enableNoInlineTypeImports = true,
        multilineTypeLiterals: enableMultilineTypeLiterals = true,
        moduleMemberOrder: enableModuleMemberOrder = true,
        noEmpty,
        commonJs = true,
        nodeScript = true,
    } = options;

    const config: Linter.Config[] = [];

    if (jsRecommended) {
        config.push(js.configs.recommended);
    }

    if (tsRecommended) {
        config.push(...tseslint.configs.recommended);
    }

    const perfectionistRules = perfectionistRecommended
        ? perfectionist.configs['recommended-line-length'].rules
        : {};

    const configRules: Linter.RulesRecord = {
        ...perfectionistRules,
        'perfectionist/sort-modules': 'off',
        '@typescript-eslint/explicit-function-return-type': 'off',
        '@typescript-eslint/no-explicit-any': 'off',
    };

    if (enablePrettier) {
        configRules['prettier/prettier'] = 'error';
    }

    if (enableNoInlineTypeImports) {
        configRules['nava/no-inline-type-imports'] = 'error';
    }

    if (enableMultilineTypeLiterals) {
        configRules['nava/multiline-type-literals'] = 'error';
    }

    if (enableModuleMemberOrder) {
        configRules['nava/module-member-order'] = 'error';
    }

    if (enableReact) {
        configRules['react-hooks/rules-of-hooks'] = 'error';
        configRules['react-hooks/exhaustive-deps'] = 'warn';
        configRules['react/react-in-jsx-scope'] = 'off';
        configRules['react/prop-types'] = 'off';
    }

    if (sortImports !== false) {
        configRules['perfectionist/sort-imports'] = [
            'error',
            {
                groups: [
                    ['type-builtin', 'value-builtin', 'type-external', 'value-external'],
                    ['alias-type', 'alias-value'],
                    ['type-parent', 'type-sibling', 'type-index', 'value-parent', 'value-sibling', 'value-index'],
                    'unknown',
                ],
                customGroups: [
                    { groupName: 'alias-type', selector: 'type', elementNamePattern: buildAliasPattern(aliases) },
                    { groupName: 'alias-value', elementNamePattern: buildAliasPattern(aliases) },
                ],
                fallbackSort: { type: 'alphabetical', order: 'asc' },
                type: 'line-length',
                newlinesBetween: 1,
                newlinesInside: 0,
                order: 'desc',
                ...sortImports,
            },
        ];
    }

    if (consistentTypeImports !== false) {
        configRules['@typescript-eslint/consistent-type-imports'] = [
            'error',
            { fixStyle: 'separate-type-imports', prefer: 'type-imports', ...consistentTypeImports },
        ];
    }

    if (noEmpty !== false) {
        configRules['no-empty'] = ['error', { allowEmptyCatch: true, ...noEmpty }];
    }

    const plugins: Record<string, ESLint.Plugin> = {
        nava: { rules } as ESLint.Plugin,
        perfectionist: perfectionist as unknown as ESLint.Plugin,
        prettier: prettier as unknown as ESLint.Plugin,
    };

    if (enableReact) {
        plugins['react-hooks'] = reactHooks as unknown as ESLint.Plugin;
        plugins.react = reactPlugin as unknown as ESLint.Plugin;
    }

    config.push({
        files,
        plugins,
        rules: {
            ...configRules,
            ...userRules,
        },
        languageOptions: {
            parser: tseslint.parser,
            parserOptions: {
                ecmaFeatures: { jsx: true },
                ecmaVersion: 'latest',
                sourceType: 'module',
                project: false,
                ...parserOptions,
            },
            globals: { ...browserGlobals, ...globals },
        },
        settings: { react: { version: 'detect' }, ...settings },
    });

    if (commonJs !== false) {
        const block: EnvironmentBlockOptions = commonJs === true ? {} : commonJs;
        config.push({
            files: block.files ?? [
                'src/configs/tailwind/**/*.js',
                '**/*.webpack.{js,cjs}',
                '**/*.config.{js,cjs}',
                'tailwind.config.js',
                'postcss.config.js',
            ],
            languageOptions: {
                parserOptions: { ecmaVersion: 'latest', sourceType: 'script' },
                globals: { ...commonJsGlobals, ...block.globals },
            },
            rules: { '@typescript-eslint/no-require-imports': 'off', ...block.rules },
        });
    }

    if (nodeScript !== false) {
        const block: EnvironmentBlockOptions = nodeScript === true ? {} : nodeScript;
        config.push({
            files: block.files ?? ['scripts/**/*.mjs'],
            languageOptions: {
                parserOptions: { ecmaVersion: 'latest', sourceType: 'module' },
                globals: { ...nodeScriptGlobals, ...block.globals },
            },
            rules: { ...block.rules },
        });
    }

    return config;
};

const buildVitestConfig = (options: VitestOptions = {}): Linter.Config => {
    const {
        files = ['**/*.{test,spec}.{ts,tsx,js,jsx}'],
        globals = {},
        rules: userRules = {},
        useRecommended = true,
        noExplicitAny = true,
    } = options;

    return {
        files,
        plugins: {
            vitest: vitestPlugin,
        },
        languageOptions: {
            globals: { ...vitestGlobals, ...globals },
        },
        rules: {
            ...(useRecommended ? vitestPlugin.configs.recommended.rules : {}),
            ...(noExplicitAny ? { '@typescript-eslint/no-explicit-any': 'off' } : {}),
            ...userRules,
        },
    };
};

const buildRecommendedConfig = (options: NavaConfigOptions = {}): Linter.Config => ({
    plugins: {
        nava: { rules } as ESLint.Plugin,
    },
    rules: {
        'nava/no-inline-type-imports': 'error',
        'nava/multiline-type-literals': 'error',
        'nava/module-member-order': 'error',
        ...(options.rules ?? {}),
    },
});

export const createConfig = (options: NavaConfigOptions = {}): NavaConfigs => {
    const result: NavaConfigs = {
        recommended: buildRecommendedConfig(options),
        react: buildReactConfig(options),
    };

    if (options.vitest !== false) {
        result.vitest = buildVitestConfig(options.vitest || {});
    }

    return result;
};

export const configs: NavaConfigs = createConfig();

export default { rules, configs, createConfig };
