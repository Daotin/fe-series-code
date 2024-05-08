import { scan } from './lexParser.js';
import { Evaluator } from './evaluator.js';

let syntax = {
    Program: [
        ["StatementList", "EOF"]
    ],
    StatementList: [
        ["Statement"],
        ["StatementList", "Statement"]
    ],
    Statement: [
        ["ExpressionStatement"],
        ["IfStatement"],
        ["VariableDeclaration"],
        ["FunctionDeclaration"]
    ],
    IfStatement: [
        ["if", "(", "Expression",")", "Statement"]
    ],
    VariableDeclaration: [
        ["var", "Identifier", ";"],
        ["let", "Identifier", ";"],
        ["const", "Identifier", ";"]
    ],
    FunctionDeclaration: [
        ["function", "Identifier", "(", ")", "{", "StatementList", "}"]
    ],
    ExpressionStatement: [
        ["Expression", ";"]
    ],
    Expression: [
        ["AssignmentExpression"]
    ],
    AssignmentExpression: [
        ["LeftHandSideExpression", "=", "LogicalORExpression"],
        ["LogicalORExpression"]
    ],
    LogicalORExpression: [
        ["LogicalANDExpression"],
        ["LogicalORExpression", "||", "LogicalANDExpression"]
    ],
    LogicalANDExpression: [
        ["AdditiveExpression"],
        ["LogicalANDExpression", "&&", "AdditiveExpression"]
    ],
    AdditiveExpression: [
        ["MultiplicativeExpression"],
        ["AdditiveExpression", "+", "MultiplicativeExpression"],
        ["AdditiveExpression", "-", "MultiplicativeExpression"]
    ],
    MultiplicativeExpression: [
        ["LeftHandSideExpression"],
        ["MultiplicativeExpression", "*", "LeftHandSideExpression"],
        ["MultiplicativeExpression", "/", "LeftHandSideExpression"]
    ],
    LeftHandSideExpression: [
        ["CallExpression"],
        ["NewExpression"]
    ],
    CallExpression: [
        ["MemberExpression", "Arguments"],
        ["CallExpression", "Arguments"]
    ], //new a()
    // Arguments: [
    //     ["(", ")"],
    //     ["(", "ArgumentList", ")"],
    // ],
    // ArgumentList: [
    //     ["AssignmentExpression"],
    //     ["ArgumentList", ",", "AssignmentExpression"],
    // ],
    NewExpression: [
        ["MemberExpression"],
        ["new", "NewExpression"],
    ], // new a;
    MemberExpression: [
        ["PrimaryExpression"],
        ["PrimaryExpression", ".", "Identifier"],
        ["PrimaryExpression", "[", "Expression", "]"],
    ], // new a.b()
    PrimaryExpression: [
        ["(", "Expression", ")"],
        ["Literal"],
        ["Identifier"]
    ],
    Literal: [
        ["StringLiteral"],
        ["NumberLiteral"],
        ["BooleanLiteral"],
        ["NullLiteral"],
        ["RegularExpressionLiteral"],
        ["ObjectLiteral"],
        ["ArrayLiteral"],
    ],
    ObjectLiteral: [
        ["{", "}"],
        ["{", "PropertyList" ,"}"]
    ],
    PropertyList: [
        ["Property"],
        ["PropertyList", ",", "Property"]
    ],
    Property: [
        ["StringLiteral", ":", "AdditiveExpression"],
        ["Identifier", ":", "AdditiveExpression"]
    ],
}

let hash = {}; // 设置hash表，避免死循环

// 求closure,把Program展开，形成状态机
function closure(state) {
    hash[JSON.stringify(state)] = state;

    // 广度优先搜索
    let queue = [];
    for (const key in state) {
        if (key.startsWith('_')) {
            continue;
        }
        queue.push(key);
    }
    // 一个一个取出来，然后根据syntax的规则去展开
    while (queue.length) {
        let symbol = queue.shift();

        if(syntax[symbol]) {
            for (let rule of syntax[symbol]) {// ["var", "Identifier", ";"],
                // 避免死循环
                if(!state[rule[0]]) {
                    queue.push(rule[0]);
                }
                // state[rule[0]] = true;

                // 每个rule生成独立的对象
                let current = state;

                for(let part of rule) {
                    /**
                     * var : {
                     *    Identifier: {
                     *      
                     *    }
                     * }
                     */
                    if(!current[part]) {
                        current[part] = {};
                    }
                    current = current[part];// 状态转移，后面生成的内容在current[part]里面

                }
                // current._isRuleEnd = true;

                // 词法循环到最后就只剩下_reduceType
                current._reduceType = symbol;
                /**
                 * 报错：Converting circular structure to JSON --> starting at object with constructor 'Object'
                    所以改为使用_reduceLength。

                    那么需要使用stack保存走过的state
                 */
                // current._reduceState = state
                current._reduceLength = rule.length // 需要回退几个state
            }
        }
    }

    // 对中间状态进行展开。比如state['if']['c'] 是 statement，也是展开的
    for (let symbol in state) {
        // 排除掉current._reduceState = state;
        if (symbol.startsWith('_')) {
            continue;
        }
        if(hash[JSON.stringify(state[symbol])]) {
            state[symbol] = hash[JSON.stringify(state[symbol])];
        } else {
            closure(state[symbol]);
        }
    }
}


// 结束状态
let end = {
    _isEnd: true
}

// 初始状态，接受一个Program，进入到下一个状态
let start = {
    "Program": end
}

closure(start);

console.log('start==>', start);


// 用生成的语法来分析词法，把源代码变成语法树
function parse(source) {
    let stack = [start];
    let symbolStack = [];

    function reduce() {
        let state = stack[stack.length - 1];
        // let，a，；：需要合成非终结符 reduce non-terminal symbol（let a; 合成变量声明VariableDeclaration
        if (state._reduceType) { // VariableDeclaration
            // 状态从let，迁移到Identifier，再迁移到分号，然后合成变量声明语句，状态迁移到VariableDeclaration
            let children = [];

            for (let i = 0; i < state._reduceLength; i++) {
                stack.pop()
                children.push(symbolStack.pop());
            }

            // 创建一个非终结符，然后shift
            return {
                type: state._reduceType,
                children: children.reverse()
            }
            // shift({
            //     type: state._reduceType,
            //     children: children.reverse()
            // });
        } else {
            throw new Error('不期望的Token')
        }
    }

    function shift(symbol) {
        let state = stack[stack.length - 1];
        /**
         *  {type: "let"}
            {type: "Identifier", value: "a"}
            {type: ";"}
            {type: "EOF"}
            */
        if (symbol.type in state) { // let
            stack.push(state[symbol.type]);
            symbolStack.push(symbol);
            // state = state[symbol.type]; // { let : {Identifier: {...}} }
        } else {
            shift(reduce());
            shift(symbol);
        }
    }

    // symbol 都是终结符
    for (const symbol of scan(source)) {
        // shift symbol
        // console.log('symbol==>', symbol);
        shift(symbol);
    }

    return reduce();
    
}

//////////////////////////////////////////////////////////////

// 需要解析的字符串
let source = `
    new A;
`;

let tree = parse(source);

// console.log('tree==>', tree);

let evaluator = new Evaluator();
console.log('evaluator==>', evaluator);
evaluator.evaluate(tree);