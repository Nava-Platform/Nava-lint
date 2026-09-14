import { RuleTester } from 'eslint';
import tseslint from 'typescript-eslint';

export const createRuleTester = () =>
    new RuleTester({
        languageOptions: {
            parser: tseslint.parser,
            parserOptions: {
                ecmaVersion: 'latest',
                ecmaFeatures: { jsx: true },
                sourceType: 'module',
            },
        },
    });