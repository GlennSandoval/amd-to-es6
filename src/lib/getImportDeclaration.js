"use strict";

const getIdentifierName = require("./getIdentifierName");

module.exports = function (element, param, options) {
    var specifiers = [];
    if (param || (options && options.side)) {
        specifiers.push({
            type: "ImportDefaultSpecifier",
            local: {
                type: "Identifier",
                name: getIdentifierName(element, param, options)
            }
        });
    }
    var result;
    if (options.sugar) {
        result = {
            type: "VariableDeclaration",
            declarations: [
                {
                    type: "VariableDeclarator",
                    id: {
                        type: "Identifier",
                        name: getIdentifierName(element, param, options)
                    },
                    init: {
                        type: "CallExpression",
                        callee: {
                            type: "Identifier",
                            name: "require"
                        },
                        arguments: [
                            {
                                type: "Literal",
                                value: element,
                                raw: element
                            }
                        ]
                    }
                }
            ],
            kind: "const"
        };
    } else {
        result = {
            type: "ImportDeclaration",
            specifiers: specifiers,
            source: {
                type: "Literal",
                value: element
            }
        };
    }

    return result;
}
