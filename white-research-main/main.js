const puppeteer = require('puppeteer');
const fs = require('fs')
const axios = require('axios');


let config=require('./businessConfig.js')

const {
  GET_TOKEN_VALUE_FROM_HTTP_METHOD,
  PASSED_TOKEN_INFO_AT_URL_WHEN_OPEN_PAGE,
  SET_AUTO_LOGIN_TO_PAGE,
  LOCAL_DEV_SERVER_PC_HOST,
  PROD_WEBSITE_HOST,
  GET_ENV_BY_URL,
  TESTING_WEBSITE_HOST,
  PAGE_WAITING_TIMEOUT,
  AUDIO_PATH_MAP,
  MOBILE_URL_POSTFIX,
  TASK_INTERVAL_TIMEOUT,
  PC_URL_POSTFIX,
  FETCH_TOKEN_URL
}=config;





let { cookieHandler,sleep, formatTime, baseUrl,checkNetworkAvailable,obj2UrlSearch } = require('./utils.js')
let {audioWarning}=require('./service.js')
//移动端生产
//pc端生产
//pc端test

const CHECK_NETWORK_AVAILABLE=false;




const PC_EXPECTED_SUCCESS_FN = () => {
  console.log('puppeteer:invoked pc expected success fn')
  let env = location.host.includes('test') ? 'TESTING' : 'PROD'
  if (location.host.includes('127.0.0.1')) { env = 'LOCAL' }
  let res = [
    location.pathname.startsWith('/login'),
    document.querySelector('img[alt=企业微信登录]')
  ].every((s) => !!s)
  let flag = 'puppeteer:LOAD_ERROR:PC:' + env

  if (!res) {//失败
    console.log(flag)
  } else {
    console.log(`puppeteer:恭喜PC:${env}的页面加载完全正常`)
  }
}
const MOBILE_EXPECTED_SUCCESS_FN = () => {
  console.log('puppeteer:invoked mobile expected success fn')
  let env = location.host.includes('test') ? 'TESTING' : 'PROD'
  if (location.host.includes('127.0.0.1')) { env = 'LOCAL' }
  let res = [
    location.pathname.startsWith('/workbench/home'),
    document.querySelector('.main-content')
  ].every((s) => !!s)
  console.log('puppeteer:exec res of mobile:',res)
  let flag = 'puppeteer:LOAD_ERROR:MOBILE:' + env

  console.log('puppeteer:res in mobile--:', res)
  if (!res) {//失败
    console.log(flag)
  } else {
    console.log(`puppeteer:恭喜MOBILE:${env}的页面加载完全正常`)
  }
}





function playNetworkError(){
  audioWarning(AUDIO_PATH_MAP.NETWORK_ERROR_AUDIO_PATH)
}


function browserBridgeLogHandler(log) {
  //log格式为  LOAD_ERROR:PC:TESTING
  console.log('PAGE LOG:', log)
  if (log.startsWith('LOAD_ERROR:')) {
    let platform, env;
    env = log.split('LOAD_ERROR:')[1];

    if (env.startsWith('PC:')) {
      platform = 'PC'
    } else {
      platform = 'MOBILE'
    }
    env = env.split(platform + ':')[1]
    let flag = platform + '_' + env + '_EXCEPTION_AUDIO_PATH'
    let audioPath = AUDIO_PATH_MAP[flag];
    console.log(`${platform}:${env}加载异常`)
    audioWarning(audioPath)
    return {
      action: ['SCREENSHOT', 'AUDIO'],
      flag: flag
    }
  }
}
let taskFn = (async () => {
  const browser = await puppeteer.launch({
    headless: false,
    // headless: process.platform != 'win32' && process.platform!='darwin',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  })

  async function openPage(isFirstIntoPage = false, url, isMobile = false, token = false) {
    let env = GET_ENV_BY_URL(url);
    let hasTimeoutErrorOccerred = false, timeoutClock = null;

    let platformEnvFlag = (isMobile ? 'MOBILE' : 'PC') + ":" + env;
    console.log(`开始进行${url}页面的测试`)
    let pcPageExceptionChecker = (page) => page.evaluate(PC_EXPECTED_SUCCESS_FN);
    let mobilePageExceptionChecker = (page) => page.evaluate(MOBILE_EXPECTED_SUCCESS_FN);

    let tStart = Date.now()
    const page = await browser.newPage();
    console.log('is mobile--:',isMobile)
    if (isMobile) {
      await page.emulate(puppeteer.devices['iPhone 6']);
      // await page.setUserAgent(`Mozilla/5.0 (Linux; Android 11; M2102J2SC Build/RKQ1.200826.002; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/86.0.4240.99 XWEB/3185 MMWEBSDK/20211202 Mobile Safari/537.36 MMWEBID/1273 MicroMessenger/8.0.18.2060(0x2800123D) Process/toolsmp WeChat/arm64 Weixin NetType/WIFI Language/zh_CN ABI/arm64`)
      await page.setUserAgent(`Mozilla/5.0 (Linux; Android 11; M2102J2SC Build/RKQ1.200826.002; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/77.0.3865.120 MQQBrowser/6.2 TBS/045737 Mobile Safari/537.36 wxwork/3.1.20 ColorScheme/Light MicroMessenger/7.0.1 NetType/WIFI Language/zh Lang/zh`)

    }

    if (!isFirstIntoPage) {
      timeoutClock = setTimeout(async () => {
        hasTimeoutErrorOccerred = true;
        // console.log('')

        if(CHECK_NETWORK_AVAILABLE){
          checkNetworkAvailable(()=>{
            browserBridgeLogHandler('LOAD_ERROR:' + platformEnvFlag)
          },()=>{
            console.log('触发了页面超时，原因是由于网络连接断开')
          })
        }else{
          browserBridgeLogHandler('LOAD_ERROR:' + platformEnvFlag)
        }

        


        
      // }, 5000)
      }, PAGE_WAITING_TIMEOUT)
      await page.setDefaultTimeout(PAGE_WAITING_TIMEOUT)
    }


    //第一次载入允许缓存，第二次不允许
    await page.setCacheEnabled(isFirstIntoPage ? true : false)
    // if (token) {
    //   page.setCookie('token', token)
    // }

    let waitUntil;
    if (isFirstIntoPage) {
      waitUntil = 'domcontentloaded'
    } else {
      // waitUntil = 'load'
      waitUntil = 'networkidle2'
    }

    if (!url.includes('?')) {
      url += '?'
    }
    console.log('==>', isFirstIntoPage , isMobile, token)
    if (isFirstIntoPage && isMobile && token) {
      let base_url = baseUrl(url)
      console.log('base_url', base_url)
      let res;
      await (!CHECK_NETWORK_AVAILABLE?sleep():checkNetworkAvailable(new Function(),()=>{
        console.warn('网络连接失败，因此无法获取到移动端的token');
      }))
      try{
        res = await axios.get(url.split('://')[0] + '://' + base_url + FETCH_TOKEN_URL)
      }catch(e){
        console.warn('调用token接口失败,请检查是否对不可访问的服务进行了检测，例如本地开发服务器')
      }
      
      
      // console.log('res----:', res)
      let token=GET_TOKEN_VALUE_FROM_HTTP_METHOD.call(null,res)
      console.log('get token--:',token)
      url+=obj2UrlSearch(PASSED_TOKEN_INFO_AT_URL_WHEN_OPEN_PAGE(token))
     }

    console.log('url---:', url)
    await page.goto(url, {
      waitUntil: waitUntil
      // waitUntil: 'domcontentloaded'
      // waitUntil: isFirstIntoPage?'load':'networkidle2',
    });
    if (isMobile) {






    }

    page.on('console', async (msg) => {

      if (!msg.text().trim().startsWith('puppeteer')) {
        return;
      }


      let res = browserBridgeLogHandler(msg.text().split('puppeteer:').slice(1).join(':'));
      if (res && res.action) {
        let actions = [].concat(res.action).flat()
        let { flag } = res;
        if (actions.includes('SCREENSHOT')) {
          if (!fs.existsSync('screenshots')) {
            fs.mkdirSync('screenshots')
          }

          let fileName = `screenshots/screenshoot-${res.flag}-${formatTime(null, false, '_____', "_")}.png`
          await page.screenshot({ path: fileName });
          console.log(flag + '的截图已经保存到' + fileName + `,,本次测试耗时${(Date.now() - tStart) / 1000}s`)
        }
      }
    });
    // await page.evaluate(() => console.log(`body content is ${document.body.innerText.trim()}`));



    if (isFirstIntoPage) {
      if (isMobile && token) {
        console.log('set cookie for mobile')





        await page.evaluate(SET_AUTO_LOGIN_TO_PAGE)
      } else {
        await page.evaluate(cookieHandler);
      }
      await page.close()

    } else {

      if (hasTimeoutErrorOccerred) {
        console.log(platformEnvFlag + '执行超时')
      } else {

        clearTimeout(timeoutClock)
        console.log('恭喜，页面没有超时，开始执行下一步操作')
        if (!isMobile) {
          console.log('will check pc page exception')
          await pcPageExceptionChecker(page)
        } else {
          console.log('will check mobile page exception')
          // await sleep(2000)
          await mobilePageExceptionChecker(page)
        }
      }






    }
  }


  async function doTestPC(url, audioPath) {
    await openPage(true, url, false, false)
    await openPage(false, url, false, false)
  }

  async function doTestMobile(url) {

    // let url = 'https://platform-test.wshoto.com/workbench'
    // let url = 'http://127.0.0.1:8080/workbench'

    await openPage(true, url, true, true)
    // await openPage(true,url,true,'74913547-9368-422c-9961-8969fe7cc028')
    await openPage(false, url, true, false)
    // await openPage(true,'http://127.0.0.1:8080/workbench',true,'74913547-9368-422c-9961-8969fe7cc028')
    // await openPage(true,'http://127.0.0.1:8080/workbench/#/home',true,'74913547-9368-422c-9961-8969fe7cc028')
  }


  // await doTestMobile(TESTING_WEBSITE_HOST+MOBILE_URL_POSTFIX)

  await Promise.all([
    // doTestMobile(PROD_WEBSITE_HOST+MOBILE_URL_POSTFIX),
    // doTestMobile(TESTING_WEBSITE_HOST+MOBILE_URL_POSTFIX),
    doTestPC(TESTING_WEBSITE_HOST+PC_URL_POSTFIX),
    // doTestMobile(LOCAL_DEV_SERVER_PC_HOST + PC_URL_POSTFIX),
  ])

  // audioWarning(AUDIO_PATH_MAP.WELCOME_AUDIO_PATH,1)
  // setTimeout(()=>{
  //   audioWarning('./mp3/mobile_testing.mp3',1)
  // },10000)
  // audioWarning('./mp3/mobile_testing.mp3')



  // audioWarning()
  // await Promise.all([
  //   doTestPC(TESTING_WEBSITE_HOST+PC_URL_POSTFIX),
  //   // doTestPC(PROD_WEBSITE_HOST+PC_URL_POSTFIX),
  // ])


  // https://platform-test.wshoto.com
  // https://platform-test.wshoto.com/workbench


  // await browser.close();


});


// setInterval(taskFn,TASK_INTERVAL_TIMEOUT)
taskFn()


let pingBaidu=async function(){
  let res=await axios.get('http://www.baidu.com/');
  if(typeof(res.data)=='string' && res.data.length>1000 && res.data.includes('的中文搜索引擎')){
    console.log('ping baidu ok ')
  }else{
    playNetworkError()
  }
}


setInterval(pingBaidu,config.NETWORK_ERROR_CHECK_INTERVAL)