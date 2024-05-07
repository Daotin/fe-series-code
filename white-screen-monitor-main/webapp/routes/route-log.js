const fs=require('fs')
const path=require('path')
const serverlog = require('serverlog-node');
const logger = serverlog.getLogger('-');
let {fetchLogs,recordLog}=require('../../log/logHandler.js')
module.exports=function(router){
    router.get('/app_log',(req,res)=>{
        let data=fs.readFileSync(path.resolve('./','./x_appLog.json'))
        res.send({
            status:'success',
            data:JSON.parse(data)
        })
    })
    router.get('/log', (req, res) => {
        // console.warn('get store in http before-:',getStore())
        let logs=fetchLogs()
        // console.warn('get store in http-:',getStore())
        let len=logs.length;
        for(let i=0;i<len;i++){
            let item=logs[i]
            let [arr,type]=item;
            logger[type](arr[0],arr)
            // console.warn('item-----:',item)
        }
        // let v=getStore();
        // v={
        //     memoryLogs:v.memoryLogs.slice(0,0-len),
        //     memoryLogsLen:v.memoryLogsLen-len
        // }
        // updateStore(v)
        // logs.forEach(([arr,type])=>{
        //     // console.warn('arr---:',arr)
        //     logger[type].apply(logger,arr)
        // })
    
        res.send('ok:'+Math.random())
    });
}