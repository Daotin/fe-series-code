var player = require("play-sound")((opts = {}));
var fs = require("fs");
const { getBaseUrl } = require("get-base-url");
// var isOnline = require('is-online');
let isWindows = process.platform == "win32";
const load = require("audio-loader");

exports.getMp3Duration = async function (path) {
  let res = await load(path);

  return res.duration;
};

exports.cookieHandler = function () {
  function delCookie() {
    //   document.cookie=`s${parseInt(Math.random()*10000)}=1;`
    //   console.log('cookie before--:',document.cookie)

    var cookies = document.cookie.split(";");

    for (var i = 0; i < cookies.length; i++) {
      var cookie = cookies[i];
      var eqPos = cookie.indexOf("=");
      var name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
      document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT";
    }
    //   console.log('cookie after--:',document.cookie)
  }
  delCookie();
  // console.log('cookie清理成功,开始使用没有用户登录态的页面进行测试')
};

exports.formatTime = function formatTime(
  date,
  ymdOnly = false,
  middleSpliter = " ",
  hmsSpliter = ":"
) {
  date = date || new Date();
  let t = date.getTime();
  if (typeof t == "number" && isNaN(t)) {
    return "";
  }

  let d = new Date(date);

  var yyyy = d.getFullYear().toString();
  var mm = (d.getMonth() + 1).toString(); // getMonth() is zero-based
  var dd = d.getDate().toString();
  var hh = d.getHours().toString();
  var ii = d.getMinutes().toString();
  var ss = d.getSeconds().toString();

  let res =
    yyyy + "-" + (mm[1] ? mm : "0" + mm[0]) + "-" + (dd[1] ? dd : "0" + dd[0]);
  if (!ymdOnly) {
    res +=
      middleSpliter +
      (hh[1] ? hh : "0" + hh[0]) +
      hmsSpliter +
      (ii[1] ? ii : "0" + ii[0]) +
      hmsSpliter +
      (ss[1] ? ss : "0" + ss[0]);
  }

  return res;
  // return yyyy+'/' + (mm[1]?mm:"0"+mm[0])+'/' + (dd[1]?dd:"0"+dd[0])+' '+ (hh[1]?hh:"0"+hh[0])+':'+ (ii[1]?ii:"0"+ii[0])+':'+ (ss[1]?ss:"0"+ss[0])

  // return yyyy+'-' + (mm[1]?mm:"0"+mm[0])+'-' + (dd[1]?dd:"0"+dd[0]);
};

let sleep = function (timeout) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, timeout || 0);
  });
};
exports.sleep = sleep;

exports.checkNetworkAvailable = function (onSuccess, onError) {
  console.log("开始检查网络连接是否可用");
  // let couldLineInternet = false;

  // if(!onError){
  //     onError=()=>{
  //         console.log('无法链接网络')
  //     }
  // }
  // setTimeout(()=>{
  //     if(!couldLineInternet){
  //         onError()
  //     }
  //   },5000)
  return new Promise((resolve) => {
    onSuccess && onSuccess();
    resolve();

    // isOnline({
    //     timeout: isWindows?2000:3000,
    //     version: "v4" // v4 or v6
    //   })
    //     .then(online => {
    //       if (online) {
    //         couldLineInternet = true;
    //         console.log("恭喜，网络连接可用");
    //         //页面超时
    //         onSuccess && onSuccess()
    //         resolve()

    //       }
    //     })
  });
};

exports.obj2UrlSearch = function (obj) {
  let res = "";
  for (let i in obj) {
    let v = obj[i];
    if (typeof v == "object") {
      v = encodeURIComponent(JSON.stringify(v));
    } else {
      v = encodeURIComponent(v);
    }
    res += "&" + i + "=" + v;
  }
  return res;
};

exports.baseUrl = function (url) {
  let res = getBaseUrl(url);

  return res;
};

exports.execEndlessAsyncTask = (function () {
  let index = 0;

  return function (
    taskArr,
    timeout,
    subTaskDuration = 0,
    onBeforeEvery,
    onAfterEvery,
    onBeforeSingleLoopedEnd,

    onMiddleBreakTask,
    onBeforeEveryNewLoopTaskStart,
    continueIfSingleLoopedEnd = true
  ) {
    if (typeof taskArr == "function") {
      taskArr = taskArr();
    }
    let len = taskArr.length;
    async function doEvery(reallyDo = true) {
      let fn = taskArr[index];
      if (index == 0) {
        await onBeforeEveryNewLoopTaskStart();
      }

      await onBeforeEvery(fn);
      await (reallyDo ? fn : sleep)();
      await onAfterEvery(fn);

      index++;

      console.log("index and len--:", index, len);
      if (index === len) {
        await sleep(subTaskDuration);
        let res = await onBeforeSingleLoopedEnd();
        console.log("res of onBeforeSingleLoopedEnd----:", res);
        index = 0;
        //false表示终止任务执行
        if (false === res) {
          console.log("将阻止任务继续运行;现在调用中途退出的函数");
          onMiddleBreakTask();
          return false;
        }
        //true表示网络异常等原因，暂时不执行
        else if (true === res) {
          setTimeout(() => {
            doEvery(false);
          }, timeout);
        } else {
          if (continueIfSingleLoopedEnd) {
            setTimeout(doEvery, timeout);
          } else {
            console.log("由于设定了任务只执行一次，因此任务终止");
            onMiddleBreakTask();
          }
        }
      } else {
        await sleep(subTaskDuration);
        doEvery();
      }
    }
    doEvery();
  };
})();
