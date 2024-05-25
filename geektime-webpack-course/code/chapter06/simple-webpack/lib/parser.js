
const fs = require('fs');
const babylon = require('babylon');
const traverse = require('babel-traverse').default;
const { transformFromAst } = require('babel-core');

module.exports = {
    /**
     * 生成ast语法树
     * @param {*} path 
     * @returns 
     */
    getAST: (path) => {
        const content = fs.readFileSync(path, 'utf-8')
    
        return babylon.parse(content, {
            sourceType: 'module',
        });
    },
    /**
     * 分析生成的依赖
     * 示例：类似 [./greeting.js]
     * @param {*} ast 
     * @returns 
     */
    getDependencis: (ast) => {
        const dependencies = []
        traverse(ast, {
          ImportDeclaration: ({ node }) => {
            dependencies.push(node.source.value);
          }
        });
        return dependencies;
    },
    /**
     * 讲ast生成es5代码
     * @param {*} ast 
     * @returns 
     */
    transform: (ast) => {
        const { code } = transformFromAst(ast, null, {
            presets: ['env']
        });
      
        return code;
    }
};