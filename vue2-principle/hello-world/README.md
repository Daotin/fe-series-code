# hello-world

## Project setup

```
npm install
```

### Compiles and hot-reloads for development

```
npm run serve
```

### Compiles and minifies for production

```
npm run build
```

### Lints and fixes files

```
npm run lint
```

### Customize configuration

See [Configuration Reference](https://cli.vuejs.org/config/).

## 搭建 vue 源码调试工程

```bash
# 安装vue-cli
npm install -g @vue/cli
# 验证
vue --version

# 查看package.json使用的vue版本，下载vue源码
# 使用 --depth 1 参数进行浅克隆，并结合 --no-single-branch 参数来克隆所有分支
git clone --depth 1 --no-single-branch https://github.com/vuejs/vue.git vue
```
