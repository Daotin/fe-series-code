const express = require('express');
const app = express();
const serverlog = require('serverlog-node');
const path = require('path')
var expressWs = require('express-ws');
var { getStore } = require('../server-store.js')
var { getStoreToBrowser, updateWsController } = require('../service.js')
let wsInstance = expressWs(app);
const os = require('os');





async function sendSystemInfo(ws) {



    ws.send(JSON.stringify({
        type: 'OS_INFO',
        memoryUsage: (process.memoryUsage().rss / 1024 / 1024).toFixed(2) + 'MB',
        totalMemory: (os.totalmem() / 1024 / 1024 / 1024).toFixed(2) + 'GB',
        freeMemory: (os.freemem() / 1024 / 1024 / 1024).toFixed(2) + 'GB',
    }))

    ws.send(JSON.stringify({
        type: "SERVER_STORE",
        ...getStoreToBrowser()
    }))
}


app.ws('/info', function (ws, req) {

    updateWsController(ws);

    sendSystemInfo(ws)
    setInterval(() => {
        sendSystemInfo(ws)
    }, 1000)
})
let wsArr=[]
app.ws('/eval_js', (wsC, req) => {
    wsArr.push(wsC)
    console.log('connected')
    wsC.on('message', function (msg) {
        // console.log('msg--:',msg)
        
        for (let i=0;i<wsArr.length;i++) {
            let ws=wsArr[i]
            // console.log('shit wws--:',ws)
            if (msg.startsWith('eval_js://')) {
                ws.send(JSON.stringify({
                    type: 'EVAL_JS',
                    expr: msg.split('eval_js://')[1]
                }))
            }
            console.log('msg-:', msg.startsWith('eval_js_result://'))
            // console.log("clients--:",wsInstance.getWss().clients,wsInstance.send)



            // console.log(i,i.send)


            if (msg.startsWith('eval_js_result://')) {
                ws.send(JSON.stringify({
                    type: 'EVAL_JS_RESULT',
                    result: msg.split('eval_js_result://')[1]
                }))
            }
        }
    });



})

module.exports = function () {
    serverlog.config({
        console: {
            colors: true,
            depth: 8,
            appendUrl: false,
            forceSingleLine: false
        },
        extension: {
            enable: true,
            key: 'tangsan',
            maxLength: 200
        }
    })
    app.use(serverlog.middleware());
    const logger = serverlog.getLogger();



    app.get('/',(req,res)=>{
        // res.redirect('/home/remote-debug-loader.js')
        res.redirect('/home')
    })
    app.use('/home', express.static(path.resolve(__dirname, './public')))//
    app.use('/app', require('./routes/route-main.js'));

    app.listen(process.argv.includes('--9001') ? 9001 : (process.argv.includes('--8001') ? 8001 : 3001), () => {
        // logger.info('Example server is running! URL: http://localhost:3001');
    });

}