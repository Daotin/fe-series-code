
const css = require('css');
const EOF = Symbol('EOF'); // end of file

let currentToken = null;
let currentAttribute = null;
let currentTextNode = null;

// css parser处理，得到css规则
let rules = [];
function addCSSRules(text) {
    let ast = css.parse(text);
    rules.push(...ast.stylesheet.rules);
}

function match(element, selector) {
    if (!selector || !element.attributes) {
        return false;
    }

    // 只处理了简单选择器
    if (selector.charAt(0) === '#') {
        let attr = element.attributes.filter(attr => attr.name === 'id')[0];
        if (attr && attr.value === selector.replace('#', '')) {
            return true;
        }
    } else if (selector.charAt(0) === '.') {
        let attr = element.attributes.filter(attr => attr.name === 'class')[0];
        if (attr && attr.value === selector.replace('.', '')) {
            return true;
        }
    } else {
        if (element.tagName === selector) {
            return true;
        }
    }

    return false;
}

function specificity(selector) { // body div span
    let p = [0, 0, 0, 0] // 优先级：inline，#id, .class，tag
    selector.split(' ').forEach(ele => {
        if (ele.charAt(0) === '#') {
            p[1] += 1;
        } else if (ele.charAt(0) === '.') {
            p[2] += 1;
        } else {
            p[3] += 1;
        }
    });

    return p;
}

function compare(sp1, sp2) {
    if (sp1[0] !== sp2[0]) return sp1[0] - sp2[0];
    if (sp1[1] !== sp2[1]) return sp1[1] - sp2[1];
    if (sp1[2] !== sp2[2]) return sp1[2] - sp2[2];
    return sp1[3] - sp2[3];
}

/**
 * 应用css规则
 */
function computeCSS(element) {
    console.log('==>', rules);
    let elements = stack.slice().reverse();
    console.log('==>', elements);

    if (!element.computedStyle) {
        element.computedStyle = {};
    }

    for (const rule of rules) {
        // 这里选择器只考虑以空格分隔的简单选择器（比如 body div span）
        let selectorParts = rule.selectors[0].split(' ').reverse(); // ['span', 'div', 'body']

        // 检查当前元素与selectorParts[0]是否匹配
        if (match(element, selectorParts[0])) {
            
            let matched = false;

            // 当前元素匹配成功后，开始匹配父元素，当所有的父元素匹配成功，才能说这个规则匹配成功
            /**
             * 比如 body div span
             * 首先匹配span，匹配元素的attribute/元素的tagName是否是span
             * 匹配到了后匹配div和body，看元素的父元素的attribute/元素的tagName是否是div和body
             * 只有全部匹配了，那么`body div span {}` 这条规则才是有效的规则。
             */
            let j = 1;
            for (let i = 0; i < elements.length; i++) { // elements: [span, p, div, body, html, document]
                if (match(elements[i], selectorParts[j])) { 
                    j++;
                }
            }

            if (j >= selectorParts.length) {
                matched = true;
            }

            if (matched) {
                let computedStyle = element.computedStyle;

                let sp = specificity(rule.selectors[0]);
                

                for (const declaration of rule.declarations) {
                    if (!computedStyle[declaration.property]) {
                        computedStyle[declaration.property] = {};
                    }

                    // 属性的优先级
                    if (!computedStyle[declaration.property].specificity) {
                        computedStyle[declaration.property].value = declaration.value;
                        computedStyle[declaration.property].specificity = sp;
                    } else if (compare(sp, computedStyle[declaration.property].specificity) >= 0) { //  现在的优先级 >= 以前的优先级
                        computedStyle[declaration.property].value = declaration.value;
                        computedStyle[declaration.property].specificity = sp;
                    }
                }
                console.log('==>', computedStyle);
            }
        }

    }
}

// 栈本来是空的，这里给个初始根元素，方便输出观看
let stack = [{ type: 'document', children: [] }];

function emit(token) {
    console.log(token);
    let top = stack[stack.length-1];

    // 开始标签，构建元素属性，然后入栈
    if (token.type === 'startTag') {
        let element = {
            type: 'element',
            tagName: token.tagName,
            attributes: [],
            parent: top,
            children:[]
        }
        // 所有的标签属性
        for (const k in token) {
            if (k !== 'type' && k !== 'tagName') {
                element.attributes.push({
                    name: k,
                    value: token[k]
                });
            }
        }

        // 应用css规则
        computeCSS(element);

        //任何元素的父元素都是其入栈前的栈顶元素
        top.children.push(element);

        // 不是自闭合标签才入栈
        if (!token.isSelfClosing) {
            stack.push(element);
        }

        currentTextNode = null;

    } else if (token.type === 'endTag') { // 匹配到结束标签出栈
        if (top.tagName === token.tagName) {
            
            /*遇到style标签，执行css parser*/
            if (token.tagName === 'style') {
                addCSSRules(top.children[0].content);
            }

            stack.pop();
        } else {
            throw new Error('endTag not match startTag!');
        }

        currentTextNode = null;

    } else if (token.type === 'text') {
        if (currentTextNode) {
            currentTextNode.content += token.content;
        } else {
            currentTextNode = {
                type: 'text',
                content: token.content
            }
            top.children.push(currentTextNode);
        }
    }
}

// 初始状态，因为HTML标准规定中初始状态用的是data
function data(c) {
    if (c === '<') {
        return tagOpen;
    } else if (c == EOF) {
        emit({
            type: 'EOF'
        });
        return;
    } else {
        emit({
            type: 'text',
            content: c
        });
        return data;
    }
}

// 是tag标签状态
function tagOpen(c) {
    if (c === '/') {
        return endTagOpen;
    } else if (c.match(/^[a-zA-Z]$/)) {
        currentToken = {
            type: 'startTag',
            tagName: ''
        };
        return tagName(c);
    } else {
        
    }
}

// 是结束标签
function endTagOpen(c) {
    if (c.match(/^[a-zA-Z]$/)) {
        currentToken = {
            type: 'endTag',
            tagName: ''
        };
        return tagName(c);
    } else if (c === '>') {
        
    } else if (c === EOF) {

    } else {
        
    }
}

// 是标签名称状态
function tagName(c) {
    if (c.match(/^[\t\n\f ]$/)) { // 4种有效空格
        return beforeAttributeName;
    } else if (c.match(/^[a-zA-Z]$/)) {
        currentToken.tagName += c;
        return tagName;
    } else if (c === '/') {
        return selfClosingStartTag;
    } else if (c === '>') { // 匹配到完整的开始标签，进入data，开始匹配下一个标签
        emit(currentToken);
        return data;
    } else {
        
    }
}

// 是属性名状态 <meta charset="UTF-8">
function beforeAttributeName(c) {
    if (c.match(/^[\t\n\f ]$/)) {
        return beforeAttributeName;
    } else if (c === '/' || c === '>') {
        return afterAttributeName(c);
    } else if (c === '=') {
        
    } else {
        currentAttribute = {
            name: '',
            value: ''
        };
        return attributeName(c);
    } 
}

// 是属性结束状态
function afterAttributeName(c) {
    if (c.match(/^[\t\n\f ]$/)) {
        return afterAttributeName;
    } else if (c === '/') {
        return selfClosingStartTag;
    } else if (c === '=') {
        return beforeAttributeValue;
    } else if (c === '>') {
        currentToken[currentAttribute.name] = currentAttribute.value;
        emit(currentToken);
        return data;
    } else {

    }
}

// 是属性状态
function attributeName(c) {
    if (c.match(/^[\t\n\f ]$/) || c === '/' || c === '>') {
        return afterAttributeName;
    } else if (c === '=') {
        return beforeAttributeValue;
    } else if (c === '<' || c === '\"' || c==='\'') {
        
    } else {
        currentAttribute.name += c;
        return attributeName;
    }
}

// 是属性value状态
function beforeAttributeValue(c) {
    if (c.match(/^[\t\n\f ]$/) || c === '/' || c === '>') {
        
    } else if (c === '\"') {
        return doubleQuoteAttributeValue(c);
    } else if (c === '\'') {
        return singleQuoteAttributeValue(c);
    } else if (c === '>') {
        
    } else {
        return unQuoteAttributeValue(c)
    }
}

function doubleQuoteAttributeValue(c) {
    if (c === '\"') {
        currentToken[currentAttribute.name] = currentAttribute.value;
        return afterDoubleQuoteAttributeValue;
    } else {
        currentAttribute.value += c;
        return doubleQuoteAttributeValue;
    }
}

function singleQuoteAttributeValue(c) {
    if (c === '\'') {
        currentToken[currentAttribute.name] = currentAttribute.value;
        return afterSingleQuoteAttributeValue;
    } else {
        currentAttribute.value += c;
        return singleQuoteAttributeValue;
    }
}

// 属性value的第一个引号后；或者第二个引号后
function afterDoubleQuoteAttributeValue(c) {
    if (c.match(/^[\t\n\f ]$/)) {
        return beforeAttributeName;
    } else if (c === '/') {
        return selfClosingStartTag;
    } else if (c === '>') {
        currentToken[currentAttribute.name] = currentAttribute.value;
        emit(currentToken);
        return data;
    } else {
        currentAttribute.value += c;
        return doubleQuoteAttributeValue;
    }
}

function afterSingleQuoteAttributeValue(c) {
    if (c.match(/^[\t\n\f ]$/)) {
        return beforeAttributeName;
    } else if (c === '/') {
        return selfClosingStartTag;
    } else if (c === '>') {
        currentToken[currentAttribute.name] = currentAttribute.value;
        emit(currentToken);
        return data;
    } else {
        currentAttribute.value += c;
        return singleQuoteAttributeValue;
    }
}

function unQuoteAttributeValue(c) {
    if (c.match(/^[\t\n\f ]$/)) {
        currentToken[currentAttribute.name] = currentAttribute.value;
        return beforeAttributeName;
    } else if (c === '/') {
        return selfClosingStartTag;
    } else if (c === '>') {
        currentToken[currentAttribute.name] = currentAttribute.value;
        emit(currentToken);
        return data;
    } else if (c === '\"' || c === "'" || c === '<' || c === '=') {
    
    }
    else {
        currentAttribute.value += c;
        return unQuoteAttributeValue;
    }
}

// 是自闭合标签状态
function selfClosingStartTag(c) {
    if (c === '>') {
        // 是自闭合标签
        currentToken.isSelfClosing = true;
        emit(currentToken);
        return data;
    } else if(c === EOF){
        return;
    } else {
        return;
    }
}

exports.parseHTML = function (html) {
    let state = data;
    for (const c of html) {
        state = state(c);
    }
    // 最后给一个无效的字符，表示html的终结
    state = state(EOF);

    console.log('==>', stack[0]);

    return stack[0];
}








// module.exports.parseHTML = function parseHTML(html) {
//     console.log('-->', html);
// }