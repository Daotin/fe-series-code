const { runLoaders } = require("loader-runner");
const path = require("path");
const fs = require("fs");

console.log('==>',path.join(__dirname, "./demo.txt"))

runLoaders(
  {
    resource: path.join(__dirname, "./demo.txt"), 
    // 字符串：资源的绝对路径（可以选择包含查询字符串）
    loaders: [
      path.join(__dirname, "./raw-loader.js")
    ],
    // String[]：加载器的绝对路径（可选地包括查询字符串）
    // {loader, options}[]: 带有选项对象的加载器的绝对路径
    context: { minimize: true },
    // 用作基本上下文的附加加载器上下文
    readResource: fs.readFile.bind(fs),
    // 可选：读取资源的函数
    // 仅当未提供 'processResource' 时使用
    // 必须有签名 function(path, function(err, buffer))
    // 默认使用 fs.readFile
  },
  function (err, result) {
    if (err) {
      console.log(err);
    } else {
      console.log(result);
    }
  }
);
