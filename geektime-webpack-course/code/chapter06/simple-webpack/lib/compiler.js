
const fs = require('fs');
const path = require('path');
const { getAST, getDependencis, transform } = require('./parser');


module.exports = class Compiler {
    constructor(options) {
        const { entry, output } = options;
        this.entry = entry;
        this.output = output;
        this.modules = []; // 存放依赖列表
    }

    run() {
        const entryModule = this.buildModule(this.entry, true);
        // 构建好的模块添加到modules
        this.modules.push(entryModule);
        // 如果有依赖，则循环依赖进行构建，然后也添加到modules
        this.modules.map((_module) => {
            _module.dependencies.map((dependency) => {
                this.modules.push(this.buildModule(dependency));
            });
        });
        this.emitFiles();
    }
    /**
     * 构建单个模块
     * @param {*} filename 
     * @param {*} isEntry 
     * @returns 
     */
    buildModule(filename, isEntry) {
        let ast;
        if (isEntry) {
            ast = getAST(filename);
        } else {
            let absolutePath = path.join(process.cwd(), './src', filename);
            ast = getAST(absolutePath);
        }

        return {
          filename,
          dependencies: getDependencis(ast),
          transformCode: transform(ast)
        };
    }
    /**
     * 输出代码到dist
     */
    emitFiles() { 
        const outputPath = path.join(this.output.path, this.output.filename);
        let modules = '';
        this.modules.map((_module) => {
            modules += `'${ _module.filename }': function (require, module, exports) { ${ _module.transformCode } },`
        });
        /**
         * 构建类似webpack 的模块结构
         */
        const bundle = `
            (function(modules) {
                function require(fileName) {
                    const fn = modules[fileName];
        
                    const module = { exports : {} };
        
                    fn(require, module, module.exports);
        
                    return module.exports;
                }

                require('${this.entry}');
            })({${modules}})
        `;
        // 写入到simplepack.config.js中指定的dist/main.js中
        fs.writeFileSync(outputPath, bundle, 'utf-8');
    }
};
