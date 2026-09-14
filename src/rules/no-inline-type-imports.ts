import type { Rule } from 'eslint';

const noInlineTypeImportsRule: Rule.RuleModule = {
    meta: {
        docs: {
            description: 'Disallow inline type imports in favor of `import type { X }`.',
        },
        fixable: 'code',
        type: 'suggestion',
        schema: [],
        messages: {
            inlineTypeImport: 'Use `import type { X }` instead of `import { type X }`.',
        },
    },
    create(context) {
        const sourceCode = context.sourceCode;

        return {
            ImportDeclaration(node: any) {
                if (node.importKind === 'type') {
                    return;
                }

                const specifiers: any[] = node.specifiers ?? [];
                const typeSpecifiers = specifiers.filter((specifier) => specifier.importKind === 'type');

                if (typeSpecifiers.length === 0) {
                    return;
                }

                const valueSpecifiers = specifiers.filter((specifier) => specifier.importKind !== 'type');
                const from = sourceCode.getText(node.source);
                const semicolon = sourceCode.getText(node).trimEnd().endsWith(';') ? ';' : '';
                const renderTypeSpecifier = (specifier: any) =>
                    sourceCode.getText(specifier).replace(/^type\s+/, '');
                const renderValueLine = (specifiers: any[]) => {
                    const defaultSpecifiers = specifiers.filter(
                        (specifier) => specifier.type === 'ImportDefaultSpecifier',
                    );
                    const namespaceSpecifiers = specifiers.filter(
                        (specifier) => specifier.type === 'ImportNamespaceSpecifier',
                    );
                    const namedSpecifiers = specifiers.filter((specifier) => specifier.type === 'ImportSpecifier');
                    const parts = [
                        ...defaultSpecifiers.map((specifier) => sourceCode.getText(specifier)),
                        ...namespaceSpecifiers.map((specifier) => sourceCode.getText(specifier)),
                        ...(namedSpecifiers.length > 0
                            ? [`{ ${namedSpecifiers.map((specifier) => sourceCode.getText(specifier)).join(', ')} }`]
                            : []),
                    ];

                    return `import ${parts.join(', ')} from ${from}${semicolon}`;
                };
                const lines: string[] = [];

                if (typeSpecifiers.length > 0) {
                    const body = typeSpecifiers.map(renderTypeSpecifier).join(', ');
                    lines.push(`import type { ${body} } from ${from}${semicolon}`);
                }

                if (valueSpecifiers.length > 0) {
                    lines.push(renderValueLine(valueSpecifiers));
                }

                context.report({
                    node: typeSpecifiers[0],
                    messageId: 'inlineTypeImport',
                    fix: (fixer) => fixer.replaceTextRange(node.range, lines.join('\n')),
                });
            },
        };
    },
};

export default noInlineTypeImportsRule;
