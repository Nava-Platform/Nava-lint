import noInlineTypeImports from '../dist/rules/no-inline-type-imports.js';
import { createRuleTester } from './helpers.mjs';

const ruleTester = createRuleTester();

ruleTester.run('no-inline-type-imports', noInlineTypeImports, {
    valid: [
        "import type { Foo } from './mod';",
        "import type { Foo, Bar } from './mod';",
        "import { Foo } from './mod';",
        "import React, { useState } from 'react';",
    ],
    invalid: [
        {
            code: "import { type Foo } from './mod';",
            output: "import type { Foo } from './mod';",
            errors: [{ messageId: 'inlineTypeImport' }],
        },
        {
            code: "import { type Foo, bar } from './mod';",
            output: "import type { Foo } from './mod';\nimport { bar } from './mod';",
            errors: [{ messageId: 'inlineTypeImport' }],
        },
        {
            code: "import { bar, type Foo } from './mod';",
            output: "import type { Foo } from './mod';\nimport { bar } from './mod';",
            errors: [{ messageId: 'inlineTypeImport' }],
        },
        {
            code: 'import { type Foo } from "./mod";',
            output: 'import type { Foo } from "./mod";',
            errors: [{ messageId: 'inlineTypeImport' }],
        },
        {
            code: [
                'import {',
                '    type Foo,',
                '    bar,',
                "} from './mod';",
            ].join('\n'),
            output: "import type { Foo } from './mod';\nimport { bar } from './mod';",
            errors: [{ messageId: 'inlineTypeImport' }],
        },
        {
            code: "import { type Foo } from './mod'",
            output: "import type { Foo } from './mod'",
            errors: [{ messageId: 'inlineTypeImport' }],
        },
        {
            code: "import Foo, { type Bar } from './mod';",
            output: "import type { Bar } from './mod';\nimport Foo from './mod';",
            errors: [{ messageId: 'inlineTypeImport' }],
        },
    ],
});