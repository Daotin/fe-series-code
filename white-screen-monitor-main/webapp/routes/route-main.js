const express = require('express');
const router = express.Router();

const fs=require('fs')
const path=require('path')
let {fetchLogs,recordLog}=require('../../log/logHandler.js')
let {getStore}=require('../../server-store.js')
// let {getStore,routerTest,updateStore}=require('../../server-store.js')
let {getStoreToBrowser}=require('../../service.js')
require('./route-log.js')(router)

let config=require('../../businessConfig.js')
var player = require('play-sound')(opts = {})
const {
    AUDIO_PATH_MAP
  
  
  } = config;

router.get('/play_welcome',(req,res)=>{
    player.play(AUDIO_PATH_MAP.WELCOME_AUDIO_PATH)
    res.send('ok')
})
router.get('/business_config',(req,res)=>{
    let data=fs.readFileSync(path.resolve('./','./businessConfig.js'),'utf-8')
    res.send(data)
})
router.get('/relaunch_app',(req,res)=>{
    // if(!fs.existsSync(path.resolve('./','../x_killed_app.txt'))){
    //     fs.writeFileSync(path.resolve('./','../x_killed_app.txt'),'')
    //     console.log('created file--:x_killed_app.txt')
    //   }
    recordLog('APP_RUNNING','RELAUNCH_APP')
    process.exit();
    // res.send('ok')
})
router.get('/store',(req,res)=>{
    
    res.send(getStoreToBrowser())
})
let slow3gClocker=null;
router.get('/slow_3g',(req,res)=>{
    getStore().slow3g=true;
    recordLog('APP_RUNNING','SLOW_3G_START')
    slow3gClocker=setTimeout(()=>{
        getStore().slow3g=false;
        recordLog('APP_RUNNING','SLOW_3G_END')
    },5*60*1000)
    res.send('ok')
})
router.get('/slow_3g_end',(req,res)=>{
    getStore().slow3g=false;
    recordLog('APP_RUNNING','SLOW_3G_END')
    clearTimeout(slow3gClocker);
    slow3gClocker=null;

})

router.get('/store',(req,res)=>{
    res.send({
        len:getStore().memoryLogsLen
    })
})

// routerTest(router)

module.exports = router;
