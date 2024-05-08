import {
    Realm,
    EnvironmentRecord,
    ExecutionContext,
    Reference
} from "./runtime.js";

// 每次函数调用，会有栈去管理ExecutionContext

export class Evaluator {
    constructor() {
        this.realm = new Realm();
        this.globolObject = {};
        this.ecs = [new ExecutionContext(this.realm, this.globolObject)];
    }

    evaluate(node) {
        if (this[node.type]) {
            let res = this[node.type](node);
            // console.log('res==>', res);
            return res;
        }
    }

    Program(node) {
        return this.evaluate(node.children[0]);
    }
    StatementList(node) {
        if (node.children.length) {
            return this.evaluate(node.children[0]);
        } else {
            this.evaluate(node.children[0]);
            return this.evaluate(node.children[1]);
        }
    }
    Statement(node) {
        return this.evaluate(node.children[0]);
    }
    IfStatement(node) {
        let condition = this.evaluate(node.children[2]);
        if (condition instanceof Reference) {
            condition = condition.get();
        }
        if (condition) {
            return this.evaluate(node.children[4]);
        }
    }
    VariableDeclaration(node) {
        console.log('==>', node); // {type: "VariableDeclaration", children: Array(3)}
        // node.children: let a;
        // 执行具体声明的动作
        let runningEC = this.ecs[this.ecs.length - 1];

        return runningEC.variableEnvironemnt[node.value];

    }
    ExpressionStatement(node) {
        return this.evaluate(node.children[0]);
    }
    Expression(node) {
        return this.evaluate(node.children[0]);
    }
    AdditiveExpression(node) {
        if (node.children.length == 1) {
            return this.evaluate(node.children[0]);
        } else {
            let left = this.evaluate(node.children[0]);
            let right = this.evaluate(node.children[2]);

            if (left instanceof Reference) {
                left = left.get();
            }
            if (right instanceof Reference) {
                right = right.get();
            }

            if (node.children[1] === '+') {
                return left + right;
            }
            if (node.children[1] === '-') {
                return left - right;
            }
        }
    }
    MultiplicativeExpression(node) {
        if (node.children.length == 1) {
            return this.evaluate(node.children[0]);
        } else {
            //TODO
        }
    }
    PrimaryExpression(node) {
        if (node.children.length == 1) {
            return this.evaluate(node.children[0]);
        } else {
            //TODO
        }
    }
    Literal(node) {
        return this.evaluate(node.children[0]);
    }
    NumberLiteral(node) { // {type: "NumberLiteral", value: "20"}
        // 用js处理十进制整数
        console.log('==>', node);

        let valueStr = node.value;
        let len = valueStr.length;
        let value = 0;
        let base = 10; // 进制

        // 判断二进制数字
        if (valueStr.startsWith('0b')) {
            base = 2;
            len = len - 2;
        } else if (valueStr.startsWith('0o')) { // 判断八进制数字
            base = 8;
            len = len - 2;
        } else if (valueStr.startsWith('0x')) { // 判断十六进制数字
            base = 16;
            len = len - 2;
        }

        while (len--) {
            // 先算高位，再算低位
            let c = valueStr.charCodeAt(valueStr.length - len - 1);
            if (c >= 'a'.charCodeAt('0')) {
                c = c - 'a'.charCodeAt('0') + 10;
            } else if (c >= 'a'.charCodeAt('0')) {
                c = c - 'A'.charCodeAt('0') + 10;
            } else {
                c = c - '0'.charCodeAt('0');
            }
            value = value * base + c;
        }

        return value;
    }
    StringLiteral(node) {
        
        let str = node.value;
        let value = [];

        for (let i = 1; i < str.length - 1; i++) {
            // 判断转义字符
            if (str[i] === '\\') { // '\'开头，判断下一个字符
                i++;
                let c = str[i];
                let map = {
                    "\"": "\"",
                    "\'": "\'",
                    "\\": "\\",
                    "0": String.fromCharCode(0x0000), // \u0000
                    "b": String.fromCharCode(0x0008),
                    "t": String.fromCharCode(0x0009),
                    "n": String.fromCharCode(0x000A),
                    "v": String.fromCharCode(0x000B),
                    "f": String.fromCharCode(0x000C),
                    "r": String.fromCharCode(0x000D),
                }

                if (map[c]) {
                    value.push(map[c]); 
                } else if (c === 'u'){ // "\u0061" == 'a'  61是十六进制的，十进制就是97
                    let s = '';
                    for (let j = i+1; j < i+5; j++) {
                        s += str[j];
                    }
                    i += 4;
                    
                    s = ('0x'+s).toString(10);
                    console.log('s==>', s);
                    console.log('fromCharCode==>', );

                    value.push(String.fromCharCode(s));
                } else {
                    value.push(c);
                }
            } else {
                value.push(str[i]);
            }
        }

        return value;
    }
    ObjectLiteral(node) {
        // 空对象
        if (node.children.length === 2) {
            return {};

        } else if (node.children.length === 3) {
            // 对象的组成：property和prototype

            // 1、property：kv键值对
            let obj = new Map();
            this.PropertyList(node.children[1], obj);

            // 2、prototype


            console.log('obj==>', obj);
            return obj;
        }
    }
    PropertyList(node, obj) {
        // 只有一个键值对
        if (node.children.length === 1) {
            this.Property(node.children[0], obj);
        } else if (node.children.length === 3) {
            this.PropertyList(node.children[0], obj);
            this.Property(node.children[2], obj);
        }
    }
    Property(node, obj) {
        obj.set(this.evaluate(node.children[0]), {
            value: this.evaluate(node.children[2]),
            writeable: true,
            emumerable: true,
            configurable: true
        });
    }
    AssignmentExpression(node) {
        console.log('=AssignmentExpression=>', node);
        // debugger
        if (node.children.length === 1) {
            return this.evaluate(node.children[0]);
        }

        let left = this.evaluate(node.children[0]);
        let right = this.evaluate(node.children[2]);
        left.set(right);

        return left;
    }

    LogicalORExpression(node) {
        // debugger
        if (node.children.length === 1) {
            return this.evaluate(node.children[0]);
        }

        let result = this.evaluate(node.children[0]);

        if (result) {
            return result;
        } else {
            return this.evaluate(node.children[2]);
        }
    }

    LogicalANDExpression(node) {
        // debugger
        if (node.children.length === 1) {
            return this.evaluate(node.children[0]);
        }

        let result = this.evaluate(node.children[0]);

        if (!result) {
            return result;
        } else {
            return this.evaluate(node.children[2]);
        }
    }

    LeftHandSideExpression(node) {
        return this.evaluate(node.children[0]);
    }

    NewExpression(node) {
        if (node.children.length === 1) {
            return this.evaluate(node.children[0]);
        } else if (node.children.length === 2) {
            let cls = this.evaluate(node.children[1]);
            // return cls.construct();
        }
    }
    MemberExpression(node) {
        if (node.children.length === 1) {
            return this.evaluate(node.children[0]);
        } else if (node.children.length === 3) {
            let obj = this.evaluate(node.children[0]).get();
            let prop = obj.get(node.children[2],value)
            
            if ('value' in prop) {
                return prop.value;
            }
            if ('get' in prop) {
                return prop.get.call(obj);
            }
        }
    }
    CallExpression(node) {
        if (node.children.length === 1) {
            return this.evaluate(node.children[0]);
        } else if (node.children.length === 2) {
            let func = this.evaluate(node.children[0]);
            let args = this.evaluate(node.children[1]);
            return func.call(args);
        }
    }

    Identifier(node) {
        // debugger
        let runningEC = this.ecs[this.ecs.length - 1];
        return new Reference(runningEC.lexicalEnvironemnt, node.value);
    }
}