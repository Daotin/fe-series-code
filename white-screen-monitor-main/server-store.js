let cconsole = require('colorful-console-logger');
var storeManager={
    store:{
        appUpdtedTime:'0212-08',
        canPlayControllerRemainTimeMap:{},
        slow3g:false,
        memoryLogs:[],
        tasks:require('./taskList.js')(null,null,null,null).map(fn=>fn.args[0]),
        appLaunchTime:'',
        taskRunnedLoopCount:0,
        canPlayControllerFlagMap:{},
        
        isTaskRunning:false,
        runningSubTaskIndex:0,
        memoryLogsLen:0
    }
}



exports.getStore=function(){
    return storeManager.store;
};
// exports.updateStore=function(newStore){
//     console.warn('newStore---:',newStore)
//     storeManager.store=newStore;
// }
// exports.routerTest=function(router){
//     router.get('/logstore',(req,res)=>{
//         console.warn('store---------------------:',storeManager.store)
//         storeManager.store.memoryLogs.forEach(([p])=>{
//             console.warn('p---:',p)
//         })
//         res.send('hello:'+Math.random())
//     })
// }