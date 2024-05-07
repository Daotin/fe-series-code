const puppeteer = require('puppeteer');
const fs = require('fs')
const axios = require('axios');

let cconsole = require('colorful-console-logger');
let {getStore}=require('./server-store.js')
let config = require('./businessConfig.js')
let {updateWsController}=require('./service.js')
const {
  GET_TOKEN_VALUE_FROM_HTTP_METHOD,
  PASSED_TOKEN_INFO_AT_URL_WHEN_OPEN_PAGE,
  SET_AUTO_LOGIN_TO_PAGE,

  GET_ENV_BY_URL,

  PAGE_WAITING_TIMEOUT,
  NEED_CHECK_NETWORK_AVAILABLE,
  AUDIO_PATH_MAP,

  PC_EXPECTED_SUCCESS_FN_WITHOUT_TOKEN,
  PC_EXPECTED_SUCCESS_FN_WITH_TOKEN,
  MOBILE_EXPECTED_SUCCESS_FN_WITH_TOKEN,
  FETCH_TOKEN_URL
} = config;

let browser = null;

let isWindows = process.platform == 'win32'
let checkedCount = 0;
let { cookieHandler, sleep, baseUrl, checkNetworkAvailable, obj2UrlSearch } = require('./utils.js')
let { audioWarning, browserBridgeLogHandler,playNetworkError,dealyClosePage,pingBaidu } = require('./service.js')






async function getPage(isMobile) {
  // if (!browser) {
  //   console.log('no browser')
  //   browsers=1;
    
  // }
  const page = await browser.newPage();
  if (isMobile) {
    await page.emulate(puppeteer.devices['iPhone 6']);
    await page.setUserAgent(`Mozilla/5.0 (Linux; Android 11; M2102J2SC Build/RKQ1.200826.002; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/77.0.3865.120 MQQBrowser/6.2 TBS/045737 Mobile Safari/537.36 wxwork/3.1.20 ColorScheme/Light MicroMessenger/7.0.1 NetType/WIFI Language/zh Lang/zh`)

  }
  console.log('is mobile--:', isMobile)
  
  return page;
}

let pcPageExceptionCheckerWithoutToken = (page) => page.evaluate(PC_EXPECTED_SUCCESS_FN_WITHOUT_TOKEN);
let pcPageExceptionCheckerWithToken = (page) => page.evaluate(PC_EXPECTED_SUCCESS_FN_WITH_TOKEN);
let mobilePageExceptionCheckerWithToken = (page) => page.evaluate(MOBILE_EXPECTED_SUCCESS_FN_WITH_TOKEN);
const slow3G = puppeteer.networkConditions['Slow 3G'];
async function openPage(
  isFirstIntoPage = false, 
  url, 
  isMobile = false, 
  token = false) {
  let page = await getPage(isMobile)
  let throwAudioError = async (isTimeout=false,isTokenFailed=false) => {
    // closeBlankPages()
    let  isNetworkError=( await pingBaidu(false)).isNetworkError
    console.log('isNetworkError--:',isNetworkError)
    // let url=await page.url()
    let env = GET_ENV_BY_URL(url);
    // console.log('env in throw audio error---:',env)
    // const isTestingEnvByUrl = (url) => url.split('.com')[0].includes('test')
    // console.log('isTestingEnvByUrl---:',isTestingEnvByUrl(url),url.split('.com')[0])
    // console.log('url in throw audio error--:',url)
    if(isNetworkError){ 
      playNetworkError()   
      console.log('网络错误，即将关闭页面，因此不播放'+(`LOAD_ERROR:${isMobile ? 'MOBILE' : 'PC'}:${env}`)) 
      await dealyClosePage(page,browser);
      console.log('page close success')
      return false;
    }

    if(isTokenFailed){
      browserBridgeLogHandler(`FETCH_TOKEN_ERROR:${env}`, page,browser)
      return false;
    }
    
    console.log('throwAudioError invokded')
    
    browserBridgeLogHandler((isTimeout?'LOAD_TIMEOUT':'LOAD_ERROR')+`:${isMobile ? 'MOBILE' : 'PC'}:${env}`, page,browser)
  }

  page.on('console', async (msg) => {
    // console.log('msg from console---:',msg.text())

    if (!msg.text().trim().startsWith('puppeteer')) {
      return;
    }
    // console.log('msg in page console on--:',msg.text())
    // throwAudioError()/

    browserBridgeLogHandler(msg.text().split('puppeteer:').slice(1).join(':'), page,browser);

  });



  // await getPage()
  let env = GET_ENV_BY_URL(url);
  let hasTimeoutErrorOccerred = false, timeoutClock = null;


  
  // closeBlankPages();
  // return false
  let platformEnvFlag = (isMobile ? 'MOBILE' : 'PC') + ":" + env;
  console.log(`开始进行${url}页面的测试`)

  let tStart = Date.now()




  try {
    await page.setDefaultTimeout(PAGE_WAITING_TIMEOUT)


    timeoutClock = setTimeout(async () => {
      hasTimeoutErrorOccerred = true;
      throwAudioError(true)
      // browserBridgeLogHandler('LOAD_ERROR:' + platformEnvFlag, page,browser)

      cconsole.warn('\n\n\n高能预警---page timeout!!!!!!!!!! \n\n\n');
      await dealyClosePage(page,browser)





      // }, 5000)
    }, PAGE_WAITING_TIMEOUT)

    


    //第一次载入允许缓存，第二次不允许
    await page.setCacheEnabled(isFirstIntoPage ? true : false)


    let waitUntil;
    if (isFirstIntoPage) {
      waitUntil = 'domcontentloaded'
    } else {
      waitUntil = 'load'
      // waitUntil = 'networkidle2'
    }

    url += (url.includes('?') ? '&' : '?') + 'puppeteer_opened_count=' + (isFirstIntoPage ? 1 : 2)
    let canGotToken = true;
    if (isFirstIntoPage && token) {
      let base_url = baseUrl(url)
      console.log('base_url', base_url)
      let res;
      await (!NEED_CHECK_NETWORK_AVAILABLE ? sleep() : checkNetworkAvailable(new Function(), () => {
        console.warn('网络连接失败，因此无法获取到移动端的token');
        if (isFirstIntoPage) {
          playNetworkError()

        }
      }))
      try {
        let tokenUrl=url.split('://')[0] + '://' + base_url + FETCH_TOKEN_URL;
        console.log('tokenUrl  is---:',tokenUrl)
        res = await axios.get(tokenUrl)
      } catch (e) {
        console.warn('调用token接口失败,请检查是否对不可访问的服务进行了检测，例如本地开发服务器')
      }
      let token;

      try {
        token = GET_TOKEN_VALUE_FROM_HTTP_METHOD.call(null, res)
      } catch (e) {
        canGotToken = false;
        token = '0'
      }


      console.log('get token--:', token)
      url += obj2UrlSearch(PASSED_TOKEN_INFO_AT_URL_WHEN_OPEN_PAGE(token))


      if (!canGotToken) {

        //log格式为  LOAD_ERROR:PC:TESTING

        throwAudioError(false,true)

        return {
          fistTimeFailed: true
        };
      }
    }



    console.log('url---:', url)
    cconsole.warn('即将进入页面' + url)
    console.log('value of waitUntil is--:',waitUntil)

    console.log('------------begin wait until')
    let tS = Date.now()


    if(getStore().slow3g===true){
      await page.emulateNetworkConditions(slow3G);
    }
    

    await page.goto(url, {
      waitUntil: waitUntil
    });
    console.log('------------end wait until', Date.now() - tS)


    if (!hasTimeoutErrorOccerred){
      clearTimeout(timeoutClock)
    }

    if (isFirstIntoPage) {
      console.log('page url of first time--:',await page.url())

      // if (hasTimeoutErrorOccerred) {
      //   console.log(platformEnvFlag + '执行超时')
      // } 
      // if (!hasTimeoutErrorOccerred) {
      //   clearTimeout(timeoutClock)
        if (token) {
          // if (isMobile && token) {
          console.log('set cookie for ' + (isMobile ? 'mobile' : 'pc'))

          await page.evaluate(SET_AUTO_LOGIN_TO_PAGE)
        } else {
          await page.evaluate(cookieHandler);
        }
        console.log('will close page of first time')
        // closeBlankPages()
        try {
          await dealyClosePage(page,browser)
        } catch (e) {
          console.warn('close first page error---:', e)
        }
      // }




    } else {

      // if (hasTimeoutErrorOccerred) {
      //   console.log(platformEnvFlag + '执行超时')
      // } 
      // if (!hasTimeoutErrorOccerred) {

      //   clearTimeout(timeoutClock)
        console.log('恭喜，页面没有超时，开始执行下一步操作')
        if (!isMobile) {
          console.log('will check pc page exception ' + (token ? 'with ' : 'without ') + 'token')
          let tS = Date.now()
          await Promise.all([
            !token ? pcPageExceptionCheckerWithoutToken(page) : pcPageExceptionCheckerWithToken(page),
            sleep(4000 )//不sleep执行太快了 容易卡
          ])
          cconsole.warn('执行pc耗时' + (Date.now() - tS))
        } else {
          console.log('will check mobile page exception ' + (token ? 'with ' : 'without ') + 'token')
          let tS = Date.now()
          await Promise.all([
            mobilePageExceptionCheckerWithToken(page),
            sleep(4000)//不sleep执行太快了 容易卡
          ])
          cconsole.warn('执行mobile耗时' + (Date.now() - tS))
        }
      // }






    }
  } catch (e) {
    if ('net::ERR'
    // if ('net::ERR_CONNECTION_REFUSED net::ERR_INTERNET_DISCONNECTED  net::ERR_HTTP_RESPONSE_CODE_FAILURE'
      .split(' ').find(s=>e.toString().trim().includes(s))) {
    // if (e.toString().includes('net::ERR_CONNECTION_REFUSED')) {
      console.log('catch one e connection refused or internet disconnected',e.toString())
      // if(!isFirstIntoPage){
      clearTimeout(timeoutClock)
      throwAudioError();
      await dealyClosePage(page,browser);
      if (isFirstIntoPage) {
        return {
          fistTimeFailed: true
        }
      }
      // }

    }else{
      console.log('cat one e ----:',e)
    }
  }
}

exports.openPage=openPage

exports.launchBrowser=async function (){

 

  browser=await puppeteer.launch({
    devtools:process.argv.includes('--devtools'),
    headless:process.argv.includes('--headless')?true:false,
    // headless: isWindows ? false : (!process.argv.includes('--head') && !process.argv.includes('--log')),
    // headless: process.platform != 'win32',
    // headless: process.platform != 'win32' && process.platform!='darwin',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  })
  return browser;
  
}