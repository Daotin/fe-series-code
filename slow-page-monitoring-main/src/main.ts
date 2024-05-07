import Koa from 'koa';
import Router from 'koa-router';
import KoaLogger from 'koa-logger'; // 导入日志
import bodyParser from 'koa-bodyparser';
import Cors from 'koa2-cors';
import path from 'path';
import fs from 'fs';
import * as https from "https";
import sslify from "./middleware/sslify";
const app = new Koa();
const router = new Router();

const routerIndex = require('./routes/index');
// router.get('/', async (ctx) => {
//     ctx.body = 'Hello World!';
// });
app.use(
    Cors({
        origin: function(ctx) { //设置允许来自指定域名请求
        //     if (ctx.url === '/test') {
        //         return '*'; // 允许来自所有域名请求
        //     }
        //     return 'http://localhost:8080'; //只允许http://localhost:8080这个域名的请求
            return '*';
        },
        maxAge: 5, //指定本次预检请求的有效期，单位为秒。
        credentials: true, //是否允许发送Cookie
        allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], //设置所允许的HTTP请求方法
        allowHeaders: ['Content-Type', 'Authorization', 'Accept'], //设置服务器支持的所有头信息字段
        exposeHeaders: ['WWW-Authenticate', 'Server-Authorization'] //设置获取其他自定义字段
    })
);

app.use(sslify());
app.use(bodyParser());
app.use(router.routes());
app.use(routerIndex.routes());

const logger = KoaLogger();
app.use(logger);
const staticPath = path.join(__dirname, '../fe-slow-page/dist'); // 静态地址
app.use(require('koa-static')(staticPath));
app.listen(80);

const options = {
    // key: fs.readFileSync(path.resolve('./other/3993047_service.codebyai.com.key')),  //ssl文件路径
    // cert: fs.readFileSync(path.resolve('./other/3993047_service.codebyai.com.pem'))  //ssl文件路径
    key: fs.readFileSync(path.resolve('./other/codebyai.com.key')),  //ssl文件路径
    cert: fs.readFileSync(path.resolve('./other/codebyai.com.pem'))  //ssl文件路径
};
// 创建https 服务
var httpsServer = https.createServer(options, app.callback());
httpsServer.listen(443);   // 默认监听443
console.log("https ready : 443");