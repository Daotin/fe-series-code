let cconsole = require("colorful-console-logger");
let config = require("./businessConfig.js");
var schedule = require("node-schedule");
var taskList = require("./taskList.js");
let { getStore } = require("./server-store.js");
let {
  getMp3Duration,
  sleep,
  execEndlessAsyncTask,
  formatTime,
} = require("./utils.js");

getStore().appLaunchTime = formatTime();

let logHandler = require("./log/logHandler.js")();
console.log("app launched");
require("./webapp/webapp.js")();

if (process.argv.includes("--logtest")) {
  console.log("日志测试");
  console.log("日志测试2");
  console.log("日志测试3");
  console.log("日志测试4");
  let count = 10;
  setInterval(() => {
    count++;
    console.log("log test " + count);
  }, 1000);
}

logHandler.recordLog("APP_RUNNING", "APP_LAUNCH");

const {
  PROD_WEBSITE_HOST,
  TESTING_WEBSITE_HOST,
  SUB_TASK_EXEC_DURATION,
  DOM_ELEM_WAITING_TIMEOUT_AFTER_CONTENT_LOAD,
  WELCOME_AUDIO_PLAY_SCHEDULE,
  PAGE_WAITING_TIMEOUT,
  PC_URL_POSTFIX,
  NEED_CHECK_NETWORK_AVAILABLE,
  AUDIO_PATH_MAP,
  MOBILE_URL_POSTFIX,
  TASK_EXEC_INTERVAL,
} = config;

let {
  pingBaidu,
  continueMainTask,
  closeNotBlankPages,
  closeAlmostAllBlankPages,
} = require("./service.js");

// let =require('./pageRunner.js')
let { launchBrowser, openPage } = require("./pageRunner.js");
var player = require("play-sound")((opts = {}));

if (process.argv.includes("--quiet")) {
  player.play = (path, cb) => {
    console.log("will play but quiet mode no sound,path is " + path);
    cb && cb();
  };
}

let isWindows = process.platform == "win32";

// let taskFn = (async () => {
if (!continueMainTask.continue) {
  return false;
}

//console.log('rag process--:',process.argv)
// let consoleLog = process.argv.includes('--log')

// //if(false){
// if (!isWindows && !consoleLog) {
//   cconsole.warn = function () { }
//   global.console.log = () => { }
//   global.console.error = () => { }
//   global.console.warn = () => { }
//   global.console.trace = () => { }
// }

async function doTestPCWithoutToken(url) {
  let res = await openPage(true, url, false, false);
  if (res && res.fistTimeFailed === true) {
    return false;
  }
  // await sleep(PAGE_WAITING_TIMEOUT + 500)
  await openPage(false, url, false, false);
}
async function doTestPCWithToken(url) {
  let res = await openPage(true, url, false, true);
  if (res && res.fistTimeFailed === true) {
    return false;
  }
  // await sleep(PAGE_WAITING_TIMEOUT + 500)
  await openPage(false, url, false, true);
}

async function doTestMobileWithToken(url) {
  let res = await openPage(true, url, true, true);
  console.log("res of first time result--:", res);
  // fistTimeFailed:true
  if (res && res.fistTimeFailed === true) {
    return false;
  }
  // await sleep(PAGE_WAITING_TIMEOUT + 500)
  console.log("res---:", res);
  await openPage(false, url, true, true);
}

let subTaskCount = 0;

let taskRunnedCount = 0;

// });

NEED_CHECK_NETWORK_AVAILABLE &&
  setInterval(pingBaidu, config.NETWORK_ERROR_CHECK_INTERVAL);

// console.log('begin to set schedule', schedule)
WELCOME_AUDIO_PLAY_SCHEDULE.forEach((time) => {
  schedule.scheduleJob(time, function () {
    console.log("will play welcome");
    player.play(AUDIO_PATH_MAP.WELCOME_AUDIO_PATH);
  });
});

setTimeout(
  async () => {
    if (process.argv.includes("--notask")) {
      return false;
    }

    // if (!isWindows) {
    player.play(AUDIO_PATH_MAP.WELCOME_AUDIO_PATH);
    // audioWarning(AUDIO_PATH_MAP.WELCOME_AUDIO_PATH, 1, false)
    // }

    console.log("will invoke taskFn");
    let browser = await launchBrowser();
    let taskListArrFn = () => {
      return taskList(
        doTestMobileWithToken,
        doTestPCWithToken,
        doTestPCWithoutToken
      );
    };
    execEndlessAsyncTask(
      taskListArrFn,
      Math.max(
        TASK_EXEC_INTERVAL,
        PAGE_WAITING_TIMEOUT,
        SUB_TASK_EXEC_DURATION
      ),
      DOM_ELEM_WAITING_TIMEOUT_AFTER_CONTENT_LOAD + 2000,
      function cconsoleSubTaskProcess() {
        getStore().runningSubTaskIndex = subTaskCount;
        subTaskCount++;
        getStore().isTaskRunning = true;
        cconsole.warn(
          `\n\n\ncurrent is execing sub task--${subTaskCount},total is ${
            taskListArrFn().length
          }\n\n\n`
        );
      },
      () => {
        cconsole.warn("sub task " + subTaskCount + " exec end");
      },
      async () => {
        getStore().isTaskRunning = false;
        getStore().taskRunnedLoopCount++;
        subTaskCount = 0;
        console.log(
          "恭喜，本次检测任务执行完毕，" +
            TASK_EXEC_INTERVAL / 1000 +
            "秒后启动下一轮"
        );
        // if (true) {

        let isNetworkError = (await pingBaidu(false)).isNetworkError;

        if (isNetworkError) {
          cconsole.warn("由于网络异常，暂时不执行新一轮任务");
          return true;
        } else if (!continueMainTask.ifContinue()) {
          console.log("将阻止任务继续运行;现在关闭所有页面");

          return false;
        } else {
          // if (!isWindows) {
          console.log("\n\n\n//////////////////////\n\n\n");
          console.log("开启新一轮任务执行");
          console.log("\n\n\n//////////////////////\n\n\n");
          taskRunnedCount++;
          cconsole.warn("\n\n\n一共运行了" + taskRunnedCount + "轮任务\n\n\n");
        }
        // }
      },

      async () => {
        //onMiddleBreakTask,
        console.log("on middle break task invoked");
        await closeNotBlankPages(browser);
        await closeAlmostAllBlankPages(browser);
      },
      async () => {
        //onBeforeEveryNewLoopTaskStart,
        getStore().isTaskRunning = true;
        console.log("on before every new loop task start invoked");
        await closeNotBlankPages(browser);
        await closeAlmostAllBlankPages(browser);
      },
      !process.argv.includes("--runonce")
      // ,!(isWindows && formatTime(null,true)=='2022-02-11')
    );

    // console.log('----------:',formatTime(null,true)=='2022-02-01',formatTime(null,true))
    //这里有一些业务逻辑耦合，不要在这里测试除了本公司之外的其他域名，其他域名一旦有错误，也会播放移动端或者pc端异常音频
  },
  isWindows ? 0 : getMp3Duration(AUDIO_PATH_MAP.WELCOME_AUDIO_PATH)
);
