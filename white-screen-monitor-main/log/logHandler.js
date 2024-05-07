

let isWindows = process.platform == 'win32'
let cconsole = require('colorful-console-logger');
let {getStore,updateStore} = require('../server-store.js')
let utils=require('../utils.js')
const fs=require('fs')
const path=require('path')


let oldLog = global.console.log;
let oldError = global.console.error;
let oldWarning = global.console.warn;
let oldCCWarn = cconsole.warn;
let oldCCError = cconsole.error;

function isServerLog(arg0){
  try{
    let res=arg0.split('] [')[1].split(']')[1].startsWith(' home -');
    // oldLog('res--------:',res,arg0)
    return res
  }catch(e){
    return false;
  }
}

function putLog(argArr, type) {
  let store=getStore()
  if (store.memoryLogsLen > 1000 -1) {
    store.memoryLogs.splice(0, 1)
    store.memoryLogsLen -= 1;
  }
  if(typeof(argArr[0])=='string'){
    argArr[0]='['+utils.formatTime()+']'+argArr[0]
  }else{
    
    argArr=['['+utils.formatTime()+']'].concat(argArr);
    if(argArr.length==2){
      argArr=argArr.join('')
    }
  }
  
  store.memoryLogs.push([argArr, type])
  store.memoryLogsLen++
  // updateStore(store)

}
function logHandler() {

 
  // if (false) {
  // if (isWindows) {
  if (!isWindows && !process.argv.includes('--log')) {

    global.console.log = function () {
      if(isServerLog(arguments[0])){ return false; }
      putLog(Array.from(arguments),'info')
      // oldLog.apply(this, arguments)
    }
    global.console.error = function () {
      if(isServerLog(arguments[0])){ return false; }
      putLog(Array.from(arguments),'error')
      // oldError.apply(this, arguments)
    }
    global.console.warn = function () {
      if(isServerLog(arguments[0])){ return false; }
      putLog(Array.from(arguments),'warn')
      // oldWarning.apply(this, arguments)
    }
    cconsole.warn = function () {
      if(isServerLog(arguments[0])){ return false; }
      putLog(Array.from(arguments),'warn')
      // oldCCWarn.apply(this, arguments)
    }
    cconsole.error = function () {
      if(isServerLog(arguments[0])){ return false; }
      putLog(Array.from(arguments),'error')
      // oldCCWarn.apply(this, arguments)
    }

    // cconsole.warn = function () { }
    // global.console.log = () => { }
    // global.console.error = () => { }
    // global.console.warn = () => { }

    // global.console.trace = () => { }
  } else {
    global.console.log = function () {
      putLog(Array.from(arguments),'info')
      if(isServerLog(arguments[0])){ return false; }
      oldLog.apply(this, arguments)
    }
    global.console.error = function () {
      putLog(Array.from(arguments),'error')
      if(isServerLog(arguments[0])){ return false; }
      oldError.apply(this, arguments)
    }
    global.console.warn = function () {
      putLog(Array.from(arguments),'warn')
      if(isServerLog(arguments[0])){ return false; }
      oldWarning.apply(this, arguments)
    }
    cconsole.warn = function () {
      putLog(Array.from(arguments),'warn')
      if(isServerLog(arguments[0])){ return false; }
      oldCCWarn.apply(this, arguments)
    }
    cconsole.error = function () {
      putLog(Array.from(arguments),'error')
      if(isServerLog(arguments[0])){ return false; }
      oldCCError.apply(this, arguments)
    }
  }

  return logHandler;
}
logHandler.fetchLogs = function (ifDropLogAgain=true) {
  let store=getStore()
  // console.log('')
  let count = Math.min(store.memoryLogsLen, 200)

  // console.warn('\n\n\n\ncounttttddddddd--\n\n\n\n\n:',count,store)
  store.memoryLogsLen -= count;
  let arr = store.memoryLogs.splice(0, count)

  
  // updateStore({
  //   memoryLogsLen:store.memoryLogsLen,
  //   memoryLogs:store.memoryLogs
  // })
  if(ifDropLogAgain){
    setTimeout(()=>{
      logHandler.fetchLogs(false)
    })
  }
  return arr;

}


if(!fs.existsSync(path.resolve('./','./x_appLog.json'))){
  fs.writeFileSync(path.resolve('./','./x_appLog.json'),JSON.stringify([],4,4),'utf-8')
  console.log('created file--:x_appLog.json')
}


logHandler.recordLog=function(type,subType){
  let time=utils.formatTime();
  let row={
      "type":type,
      "time":time,
      "subType":subType
  }
  let arr=JSON.parse(fs.readFileSync(path.resolve('./','./x_appLog.json')))
  arr.push(row)
  fs.writeFileSync(path.resolve('./','./x_appLog.json'),JSON.stringify(arr,4,4),'utf-8')
}

module.exports = logHandler
