"use strict";

const AbstractSyntaxTree = require("@buxlabs/ast");
const getDependencies = require("../lib/getDependencies");
const getModuleCode = require("../lib/getModuleCode");
const generateImports = require("../lib/generateImports");
const generateCode = require("../lib/generateCode");
const isDefineWithObjectExpression = require("../lib/isDefineWithObjectExpression");

class Module extends AbstractSyntaxTree {

    convert (options) {
        var define = this.first('CallExpression[callee.name=define]');
        if (isDefineWithObjectExpression(define)) {
            this.ast.body = [{
                type: "ExportDefaultDeclaration",
                declaration: define.arguments[0]
            }];
        } else {
            var dependencies = getDependencies(define);
            var nodes = getModuleCode(this.ast);
            var imports = generateImports(dependencies, options);
            var code = generateCode(this.ast, nodes, options);

            var body = imports.concat(code);

            if(options.sugar) {
                body = [
                    {
                        type: "ExpressionStatement",
                        expression: {
                            type: "CallExpression",
                            callee: {
                                type: "Identifier",
                                name: "define"
                            },
                            arguments: [
                                {
                                    type: "ArrowFunctionExpression",
                                    id: null,
                                    params: [
                                        {
                                            type: "Identifier",
                                            name: "require"
                                        }
                                    ],
                                    body: {
                                        type: "BlockStatement",
                                        body: body
                                    },
                                    generator: false,
                                    expression: false,
                                    async: false
                                }
                            ]
                        }
                    }
                ]
            }

            this.ast.body = body;

            if(!options.sugar) {
                this.removeUseStrict();
            }
        }

    }

    removeUseStrict () {
        this.remove({
            type: "ExpressionStatement",
            expression: {
                type: "Literal",
                value: "use strict"
            }
        });
    }

}

module.exports = Module;
