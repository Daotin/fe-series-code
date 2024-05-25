const Compiler = require('./compiler');


const options = require('../simplepack.config');
/**
 * 通过compiler.run来执行构建
 */
new Compiler(options).run();