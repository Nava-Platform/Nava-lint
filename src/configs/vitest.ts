import type { Linter } from 'eslint';
import { configs } from '../index.js';

const vitest: Linter.Config | undefined = configs.vitest;

export default vitest;
