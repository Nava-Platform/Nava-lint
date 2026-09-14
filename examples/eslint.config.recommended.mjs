import nava from '@whydrf/eslint-plugin-nava/recommended';
import tseslint from 'typescript-eslint';

export default [
    nava,
    {
        files: ['**/*.{ts,tsx}'],
        languageOptions: {
            parser: tseslint.parser,
        },
    },
];
