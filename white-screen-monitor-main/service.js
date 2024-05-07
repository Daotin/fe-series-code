var player = require('play-sound')(opts = {})
var fs = require('fs');
let config = require('./businessConfig.js');
const { sleep, getMp3Duration, formatTime } = require('./utils.js');
let isWindows = process.platform == 'win32'
let cconsole = require('colorful-console-logger');
let DEBUG_MODE = false;
let {recordLog}=require('./log/logHandler.js')
const axios = require('axios');
let {getStore}=require('./server-store.js')
function playNetworkError() {
    if (process.argv.includes('--notask')){
        return false;
      }
    // player.play(AUDIO_PATH_MAP.NETWORK_ERROR_AUDIO_PATH)
    audioWarning(AUDIO_PATH_MAP.NETWORK_ERROR_AUDIO_PATH)
}

exports.getStoreToBrowser=function(){
    let store=getStore()
    let obj={

    }
    for(let i in store){
        if(!'memoryLogs'.split(' ').includes(i)){
            obj[i]=store[i]
        }
    }
    return obj;
}

if (process.argv.includes('--quiet')) {
    player.play = (path, cb) => {
        console.log('will play but quiet mode no sound,path is '+path)
        cb && cb()
    }
}


let { AUDIO_PATH_MAP, HOW_MANY_ERROR_IS_ERROR } = config;

// let canPlayControllerFlagMap = {
//     // 'e.g.':true
// }

let canPlayControllerFlagMap=getStore().canPlayControllerFlagMap;
let canPlayControllerRemainTimeMap=getStore().canPlayControllerRemainTimeMap;

async function closeNotBlankPages(browser) {
    let targets = await browser.targets()
    // console.log('targets---:',targets)
    let notBlankPages = targets.filter(s => s._targetInfo.url != 'about:blank')
    let notBlankPagesLen = notBlankPages.length;
    // console.log('notBlankPagesLen--:',notBlankPagesLen)
    for (let i = 0; i < notBlankPagesLen; i++) {
        // console.log('notBlankPages i===:',notBlankPages[i].page())
        let p=await notBlankPages[i].page();
        // console.log('p--:',p,p.close,typeof(p.close))
        if(p){
            setTimeout(async ()=>{
                if(!process.argv.includes('--keepopening')){
                    await p.close()
                }
                
            },Math.max(config.TASK_EXEC_INTERVAL,config.PAGE_WAITING_TIMEOUT,config.SUB_TASK_EXEC_DURATION))
            
        }
        console.log('关闭了一个非空白页面')
    }


    //   targets.filter(
    //     (target) => target.type() === 'background_page'
    //   ).forEach((target)=>{

    //     console.log('close background target---:',target)
    //     target.close();
    //   })
}
async function closeAlmostAllBlankPages(browser) {
    let targets = await browser.targets()
    // console.log('targets---:',targets)
    let notBlankPages = targets.filter(s => s._targetInfo.url== 'about:blank')
    let notBlankPagesLen = notBlankPages.length;
    // console.log('notBlankPagesLen--:',notBlankPagesLen)
    for (let i = 0; i < notBlankPagesLen-1; i++) {
        // console.log('notBlankPages i===:',notBlankPages[i].page())
        let p=await notBlankPages[i].page();
        // console.log('p--:',p,p.close,typeof(p.close))
        if(p){
            setTimeout(async ()=>{
                if(!process.argv.includes('--keepopening')){
                    await p.close()
                }
            },Math.max(config.TASK_EXEC_INTERVAL,config.PAGE_WAITING_TIMEOUT,config.SUB_TASK_EXEC_DURATION))
            // await p.close()
        }
        console.log('关闭了一个空白页面')
    }


    //   targets.filter(
    //     (target) => target.type() === 'background_page'
    //   ).forEach((target)=>{

    //     console.log('close background target---:',target)
    //     target.close();
    //   })
}
exports.closeNotBlankPages=closeNotBlankPages;
exports.closeAlmostAllBlankPages=closeAlmostAllBlankPages;

let dealyClosePage = async (page,browser) => {
    
    await sleep(3000)
    // await sleep(20000)
    try {
        await closeNotBlankPages(browser)
        // await page.close()
    } catch (e) { }
}
exports.dealyClosePage = dealyClosePage;

let continueMainTask = {
    continue: true,
    ifContinue() {
        return continueMainTask.continue == true
    }
}

exports.continueMainTask = continueMainTask


let isInPlayingProcess = false;

let audioWarning = async function (path) {
    let duration = await getMp3Duration(path)

    if (true) {
    // if (!isWindows) {
        // console.log(`duration of ${path} is----:`, duration)

        console.log('\n\n\n---------------------------------------\n\n\n')
        cconsole.error('begin to play ' + path)
        console.log('\n\n\n---------------------------------------\n\n\n')
    }



    //if('./mp3/pc_prod.mp3'==path && DEBUG_MODE){
    // if (false) {
    //     //if(true){
    //     continueMainTask.continue = false;
    //     console.log('debug mode模式：终止主任务')
    //     cconsole.warn('\n\n\n高能预警\n\n\n');
    //     console.trace();

    // }
    // if(hasError && 'LOAD_ERROR:PC:TESTING'==log && DEBUG_MODE){
    //     continueMainTask.continue=false;
    //     console.log('debug mode模式：终止主任务')
    // }


    if (isInPlayingProcess) {
        // if (!isWindows) {
            console.log('音频播放进程占用中，等待播放结束')
        // }

        return false;
    }

    console.log("canPlayControllerFlagMap--:",canPlayControllerFlagMap,path,(path in canPlayControllerFlagMap))
    if (!(path in canPlayControllerFlagMap)) {
        canPlayControllerFlagMap[path] = true;

    }

    if (canPlayControllerFlagMap[path] === false) {
    // if (canPlayControllerFlagMap[path.replace('/fade','')] === false) {
        if (true) {
        // if (!isWindows) {
            console.log(`因为${path}的时间控制器未到时间，所以音频暂时不能播放`)
        }

        return false;
    }

    


    var audio;
    let count = 0;

    let tStart = Date.now()
    
    let intervalFn = () => {
        isInPlayingProcess = true;
        let tempAudio;

        try {


            // console.log('will play path--:',path)
            // if(count==0){
            //     path=config.MP3_FADE_FOLDER_PATH+'/'+path.split('/').slice(-1)
            // }


            audio = player.play(path, function (err) {
                if (err) {
                    console.log('err in playing--:', err)
                }

                // console.log('err-----',err)
            })

            setTimeout(() => {
                count++;
                console.log('audio play count:', count)


                if (Date.now() - tStart >= config.AUDIO_LOOP_TIME_LENGTH) {
                    recordLog('AUDIO_WARNING',path.split('/').slice(-1)[0].split('.')[0].toUpperCase())
                    // if (count >= config.AUDIO_LOOP_COUNT) {
                    isInPlayingProcess = false;
                    console.log(`将阻止音频${path}在${(config.COULD_PLAY_AUDIO_INTERVAL-config.AUDIO_LOOP_TIME_LENGTH) / 1000 / 60}分钟内继续播放`)
                    // console.log(`将阻止音频${path}在${config.COULD_PLAY_AUDIO_INTERVAL / 1000 / 60}分钟内继续播放`)
                    
                    let tempPath=path;
                    // let tempPath=path.replace('/fade','');
                    
                    
                    canPlayControllerFlagMap[tempPath] = false;
                    canPlayControllerRemainTimeMap[path]=config.COULD_PLAY_AUDIO_INTERVAL-config.AUDIO_LOOP_TIME_LENGTH
                    let intervalClock=setInterval(()=>{
                        canPlayControllerRemainTimeMap[path]-=1000
                    },1000)
                    setTimeout(() => {
                        // previousPlayProcessPromiseResolver()
                        console.log(`音频控制器${path}重置为允许播放状态`)
                        canPlayControllerFlagMap[path] = true;
                        //canPlayControllerRemainTimeMap[path]=0
                        clearInterval(intervalClock)
                    }, config.COULD_PLAY_AUDIO_INTERVAL-config.AUDIO_LOOP_TIME_LENGTH)
                    count = 0




                    console.log('本次播放完毕');



                } else {
                    intervalFn()
                }


            }, duration * 1000)

        } catch (e) {
            console.log('e---:', e)

        }

        tempAudio = audio;

    }

    // let clock = setInterval(intervalFn, 18000)
    intervalFn()



}
exports.playNetworkError = playNetworkError;

exports.audioWarning = audioWarning;
// let isNetworkError = false;
// exports.getIsNetWorkError = function () {
//     return isNetworkError
// }

exports.pingBaidu = async function (playAudio = true) {
    let isNetworkError;
    try {
        let res = await axios.get('http://www.baidu.com/');
        if (typeof (res.data) == 'string' && res.data.length > 1000 && res.data.includes('的中文搜索引擎')) {
            isNetworkError = false;
            // continueMainTask.continue && console.log('ping baidu ok ')
        } else {
            isNetworkError = true;
            playAudio && playNetworkError()
        }
    } catch (e) {
        isNetworkError = true;
        playAudio && playNetworkError()
    }

    return {
        isNetworkError: isNetworkError
    };
}


let errorCountByEnvFlag = {}


exports.browserBridgeLogHandler = async function (log, page,browser) {
    let fn = async () => {

        // let hasError=log.startsWith('LOAD_ERROR:')
        // if ('LOAD_ERROR:PC:TESTING' == log) {
        //     cconsole.warn('\n\n\n高能预警\n\n\n');
        //     // console.log('\n\n\n高能预警\n\n\n')
        // }

        //log格式为  LOAD_ERROR:PC:TESTING
        cconsole.warn('PAGE LOG:', log)
        if (log.startsWith('CLOSE_PAGE')) {
            if (log == 'CLOSE_PAGE:0') {
                console.log('将要关闭页面,因为没有报错')
                await dealyClosePage(page,browser)
                // await page.close()
            }

            return false;
        }
        else if (log.startsWith('FETCH_TOKEN_ERROR:')) {
            let env = log.split('FETCH_TOKEN_ERROR:')[1]
            audioWarning(AUDIO_PATH_MAP[env + '_TOKEN_FAILED_PATH'])
            await dealyClosePage(page,browser)
        }
        else if (log.startsWith('LOAD_ERROR:') || log.startsWith('RESET_ERROR_COUNTER:') || log.startsWith('LOAD_TIMEOUT:')) {
            let platform, env;
            env = log.split(log.startsWith('LOAD_ERROR:') ?
                'LOAD_ERROR:' : (log.startsWith('RESET_ERROR_COUNTER:')
                    ? 'RESET_ERROR_COUNTER:' : 'LOAD_TIMEOUT:'))[1];

            if (env.startsWith('PC:')) {
                platform = 'PC'
            } else {
                platform = 'MOBILE'
            }
            env = env.split(platform + ':')[1]
            let errorCounterKey = platform + '_' + env
            if (log.startsWith('RESET_ERROR_COUNTER:')) {
                cconsole.warn('重置计错器成功:' + errorCounterKey)
                errorCountByEnvFlag[errorCounterKey] = 0;
            }
            if (log.startsWith('LOAD_ERROR:') || log.startsWith('LOAD_TIMEOUT:')) {
                let audioPathKey = platform + '_' +
                    env + (log.startsWith('LOAD_ERROR:') ? '_EXCEPTION' : '_TIMEOUT') + '_AUDIO_PATH'


                let audioPath = AUDIO_PATH_MAP[audioPathKey];
                console.log(`${platform}:${env}加载异常`)
                // audioWarning(audioPath)
                return {
                    action: ['SCREENSHOT', 'AUDIO'],
                    errorCounterKey: errorCounterKey,
                    // flag: flag,
                    audioPath: audioPath
                }
            }
        }

    }


    let res = await fn();

    if (res && res.action) {
        let actions = [].concat(res.action).flat()
        let { errorCounterKey } = res;
        if (actions.includes('AUDIO')) {


            if (!errorCountByEnvFlag[res.errorCounterKey]) {
                errorCountByEnvFlag[res.errorCounterKey] = 0;
            }
            errorCountByEnvFlag[res.errorCounterKey]++
            if (errorCountByEnvFlag[res.errorCounterKey] == HOW_MANY_ERROR_IS_ERROR) {
                console.log('has log--:', process.argv.includes('--log'))
                if (!process.argv.includes('--errortest')) {
                    try {
                        await dealyClosePage(page,browser)
                    } catch (e) { }

                } else {

                    continueMainTask.continue = false;
                }

                errorCountByEnvFlag[res.errorCounterKey] = 0
                // console.log("will invoke play audio")
                audioWarning(res.audioPath)
            } else {
                console.log('error,but not invoke audio,so  close  page ')
                try {
                    await dealyClosePage(page,browser)
                } catch (e) { }
            }



        }
        if (actions.includes('SCREENSHOT')) {
            if (!fs.existsSync('screenshots')) {
                fs.mkdirSync('screenshots')
            }

            let fileName = `screenshots/screenshoot-${res.errorCounterKey}-${formatTime(null, false, '_____', "_")}.png`
            console.log('准备截屏并保存为:' + fileName)
            try{
                await page.screenshot({ path: fileName });
                            console.log(errorCounterKey + '的截图已经保存到' + fileName)
                            recordLog('ERROR_SCREENSHOT_OK',fileName)
            }catch(e){
                // console.log(errorCounterKey + '的截图保存失败:' + fileName)
                // recordLog('ERROR_SCREENSHOT_FAILED',fileName)
            }
            // await Promise.all([
            // // await Promise.race([
            //     async function () {
            //         let raceRes=await Promise.race([
            //             async function(){
            //                 await page.screenshot({ path: fileName });
            //                 console.log(errorCounterKey + '的截图已经保存到' + fileName)
            //                 recordLog('ERROR_SCREENSHOT_OK',fileName)
            //             },
            //             async function(){
            //                 await sleep(1000);
            //                 return {
            //                     FAILED:true
            //                 }
            //             }
            //         ])
            //         if(raceRes && raceRes.FAILED===true){
                        // console.log(errorCounterKey + '的截图保存失败:' + fileName)
                        // recordLog('ERROR_SCREENSHOT_FAILED',fileName)
            //         }
                    
            //     }(),
            //     sleep(0)

            // ])


        }


    } else {

    }
    // let hasError=res && ([].concat(res.action).flat().includes('AUDIO'))

    // if(hasError && 'LOAD_ERROR:PC:TESTING'==log && DEBUG_MODE){
    //     continueMainTask.continue=false;
    //     console.log('debug mode模式：终止主任务')
    // }

    //await sleep(hasError?20000:5000)

    // await sleep(5600)
    // try{
    //     await page.close()
    //     if(continueMainTask.continue){
    //         if(!hasError){
    //         if(isWindows){
    //             await sleep(3000)
    //         }
    //     await page.close();
    //    }else{
    //        if(!DEBUG_MODE){
    //         if(isWindows){
    //             await sleep(3000)
    //         }
    //         await page.close();
    //        }
    //    }
    //     }


    // }catch(e){
    //     console.log('exec close page error--:',e)
    // }


}

let ws=null;;
exports.updateWsController=(wsController)=>{
ws=wsController;
}
exports.getWsController=()=>{
    return ws;
}