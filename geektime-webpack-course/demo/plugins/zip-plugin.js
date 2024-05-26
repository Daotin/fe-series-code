const JSZip = require("jszip");
const { RawSource } = require("webpack-sources");
const zip = new JSZip();

module.exports = class ZipPlugin {
  constructor(options) {
    this.options = options;
  }

  apply(compiler) {
    console.log("zip plugin执行");

    compiler.hooks.emit.tapAsync("myZipPlugin", (compilation, callback) => {
      // console.log(compilation.options.output.path); // dist绝对路径

      // 创建一个目录
      const zip = new JSZip();
      const folder = zip.folder(this.options.filename || "filename");

      // 目录写入文件
      for (let filename in compilation.assets) {
        const source = compilation.assets[filename].source(); // 打包后的文件内容
        folder.file(filename, source);
      }

      // 生成压缩文件
      zip.generateAsync({ type: "nodebuffer" }).then((content) => {
        // console.log(new RawSource(content));
        const filename = this.options.filename + ".zip";
        compilation.assets[filename] = new RawSource(content); // 通过RawSource包裹一层

        callback();
      });
    });
  }
};
