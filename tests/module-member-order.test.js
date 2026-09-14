import moduleMemberOrder from '../dist/rules/module-member-order.js';
import { createRuleTester } from './helpers.mjs';

const ruleTester = createRuleTester();

ruleTester.run('module-member-order', moduleMemberOrder, {
    valid: [
        [
            "import { x } from './a';",
            'import { y } from "./b";',
            '',
            'enum Direction {',
            '    Up,',
            '    Down,',
            '}',
            '',
            'type Id = string;',
            '',
            'interface User_ {',
            '    id: Id;',
            '}',
            '',
            'const DEFAULTS = {};',
        ].join('\n'),
        ['type A = string;', '', 'interface B {}'].join('\n'),
        ['interface A {}', '', 'const b = 1;'].join('\n'),
        'const a = 1;\nconsole.log(a);',
    ],
    invalid: [
        {
            code: [
                "import { x } from './a';",
                'const DEFAULTS = {};',
                'type Id = string;',
                'interface User_ {}',
            ].join('\n'),
            output: [
                "import { x } from './a';",
                'type Id = string;',
                '',
                'interface User_ {}',
                '',
                'const DEFAULTS = {};',
            ].join('\n'),
            errors: [{ message: /must be ordered as imports/ }],
        },
        {
            code: 'interface User_ {}\ntype Id = string;\nconst DEFAULTS = {};',
            output: 'type Id = string;\n\ninterface User_ {}\n\nconst DEFAULTS = {};',
            errors: [{ message: /must be ordered as imports/ }],
        },
        {
            code: 'enum Direction { Up }\nconst DEFAULTS = {};\ntype Id = string;',
            output: 'enum Direction { Up }\n\ntype Id = string;\n\nconst DEFAULTS = {};',
            errors: [{ message: /must be ordered as imports/ }],
        },
    ],
});