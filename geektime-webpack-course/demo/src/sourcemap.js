const { SourceMapConsumer } = require('source-map');
const fs = require('fs');

// 读取 source map 文件
const rawSourceMap = JSON.parse(fs.readFileSync('./bundle.js.map', 'utf8'));

// 创建 SourceMapConsumer
SourceMapConsumer.with(rawSourceMap, null, consumer => {
  const originalPosition = consumer.originalPositionFor({
    line: 1,  // 错误发生的压缩代码行号
    column: 1005  // 错误发生的压缩代码列号
  });

  console.log('Original position:', originalPosition);
});