import multilineTypeLiterals from '../dist/rules/multiline-type-literals.js';
import { createRuleTester } from './helpers.mjs';

const ruleTester = createRuleTester();

ruleTester.run('multiline-type-literals', multilineTypeLiterals, {
    valid: [
        [
            'type User = {',
            '    id: string;',
            '    name: string;',
            '};',
        ].join('\n'),
        'type Empty = {};',
        [
            'interface User {',
            '    id: string;',
            '    name: string;',
            '}',
        ].join('\n'),
        'interface Empty {}',
    ],
    invalid: [
        {
            code: 'type User = { id: string; name: string };',
            output: [
                'type User = {',
                '    id: string;',
                '    name: string;',
                '};',
            ].join('\n'),
            errors: [{ messageId: 'multilineRequired' }],
        },
        {
            code: 'interface User { id: string; name: string }',
            output: [
                'interface User {',
                '    id: string;',
                '    name: string;',
                '}',
            ].join('\n'),
            errors: [{ messageId: 'multilineRequired' }],
        },
        {
            code: 'type Callback = (value: { id: string }) => void;',
            output: [
                'type Callback = (value: {',
                '    id: string;',
                '}) => void;',
            ].join('\n'),
            errors: [{ messageId: 'multilineRequired' }],
        },
        {
            code: 'type Foo = { nested: { ok: boolean } };',
            output: [
                'type Foo = {',
                '    nested: { ok: boolean };',
                '};',
            ].join('\n'),
            errors: [{ messageId: 'multilineRequired' }, { messageId: 'multilineRequired' }],
        },
    ],
});