import { createConfig } from '@whydrf/eslint-plugin-nava';

const { react, vitest } = createConfig();

export default [
    { ignores: ['node_modules/**', 'dist/**'] },
    ...react,
    vitest,
];
