class XRegExp {
    constructor(source, flag, root) {
        this.table = new Map();

        let regTxt = this.combineReg(source, root, 0).source;
        this.reg = new RegExp(regTxt, flag);

        // console.log('this.reg==>', this.reg);
        // console.log('this.table==>', this.table);
    }
    combineReg(source, name, start) {
        let length = 0;

        let reg = source[name].source.replace(/<([^>]+)>/g, (str, $1) => {
            this.table.set(start + length, $1);
            // this.table.set($1, start + length);
            
            ++length;

            let r = this.combineReg(source, $1, start + length);
            
            length = length + r.length;

            // console.log('length==>',length);

            return "(" + r.source + ")";
        });

        return {
            source: reg,
            length: length
        }
    }
    exec(str) {
        let r = this.reg.exec(str);

        for (let i = 0; i < r.length; i++) {
            if(r[i] !== undefined) {
                r[this.table.get(i-1)] = r[i];
                r['type'] = this.table.get(i-1);
            }
        }

        // console.log(JSON.stringify(r[0]), '--------',r.type);
        return r;
    }
    get lastIndex() {
        return this.reg.lastIndex;
    }
    set lastIndex(v) {
        return this.reg.lastIndex = v;
    }
}

let xreg = {
    InputElement: /<Whitespace>|<LineTerminator>|<Comments>|<Token>/, // |<Token>
    Whitespace: / /,
    LineTerminator: /\n/,
    Comments: /\/\*(?:[^*]|\*[^\/])*\*\/|\/\/[^\n]*/,
    Token: /<Literal>|<Keywords>|<Identifier>|<Punctuator>/, // Keywords需要写在Identifier之前，因为所有的Keywords都是Identifier，写在后面就会被识别成Identifier
        Literal:/<NumberLiteral>|<StringLiteral>|<BooleanLiteral>|<NullLiteral>/,
            NumberLiteral: /(?:[1-9][0-9]*|0)(?:\.[0-9]*)?|\.[0-9]+/,
            BooleanLiteral: /true|false/,
            StringLiteral: /\"(?:[^"\n]|\\[\s\S])*\"|\'(?:[^'\n]|\\[\s\S])*\'/,// 双引号和单引号
            NullLiteral: /null/,
        Keywords: /(?:let|var|if|else|for|switch|while)/,
        Identifier:/[a-zA-Z_$][a-zA-Z0-9_$]*/,
        Punctuator: /\>|\<|\+|\+\+|\-|\*|\/|=|==|\(|\)|\.|\[|\]|}|{|;/,

}

export function* scan(str) {
    
    let reg = new XRegExp(xreg, 'g', 'InputElement');

    // console.log('reg==>', reg);


    while(reg.lastIndex < str.length) {
        let r = reg.exec(str);

        if (r.Whitespace) {
            
        } else if (r.LineTerminator) {
            
        } else if (r.Comments) {

        } else if (r.NumberLiteral) {
            yield {
                type: 'NumberLiteral',
                value: r[0]
            }
        } else if (r.BooleanLiteral) {
            yield {
                type: 'BooleanLiteral',
                value: r[0]
            }
        }else if (r.StringLiteral) {
            yield {
                type: 'StringLiteral',
                value: r[0]
            }
        } else if (r.NullLiteral) {
            yield {
                type: 'NullLiteral',
                value: null
            }
        } else if (r.Identifier) {
            yield {
                type: 'Identifier',
                value: r[0]
            }
        } else if (r.Keywords) {
            yield {
                type: r[0]
            }
        } else if (r.Punctuator) {
            yield {
                type: r[0]
            }
        } else {
            throw new Error('unexpected token');
        }
    }

    yield {
        type: 'EOF'
    }
}

let source = `
function match(str, pat) {
let strLen = str.length;
let patLen = pat.length;

// pat的初始状态为0
let j = 0;

for (let i = 0; i < strLen; i++) {
    
    /* 当前状态为j，遇到字符str[i]，pat应该转移到哪个状态？*/
    j = dp[j][str.charCodeAt(i)];

    if (j == patLen) {
        return i - patLen + 1;
    }
}

return -1;
}
`;

for (const element of scan(source)) {
    // console.log('==>', element);
}

