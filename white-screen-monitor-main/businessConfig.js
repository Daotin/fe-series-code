let isWindows;
try{
    isWindows=process.platform == 'win32'
}catch(e){
    isWindows=navigator.platform=='Win32'
}


//无锡小程序
// let corpId = 'ww8923d8e5cd61963a'
// let USER_ID='yg'


//天普网络
let corpId = 'ww8e09372aff8d9190'
let USER_ID='jack.d'


/**
 * 依据当前判断测试和生产的方法，域名里测试必须有-test，生产的必须没有test也没有127.0.0.1
 */

const isTestingEnvByUrl = (url) => (url.split('.com')[0].includes('test') || url.split('.com')[0].includes('uat'))
const isProdEnvByUrl = (url) => !isTestingEnvByUrl(url)

const MP3_FOLDER_PATH = './mp3/fade'//mp3文件夹位置

let COULD_PLAY_AUDIO_INTERVAL=((isWindows ? 3 : 10) * 60 * 1000);//播放音频后多久后再次允许继续播放

if((((typeof(global)=='undefined'?window:global).process||{}).argv||'').includes('--3min')){
    console.log('以3分钟为出错后允许继续播放的时间设定运行程序');
    COULD_PLAY_AUDIO_INTERVAL=3*60*1000
}
// --3min
module.exports = {
    GET_ENV_BY_URL: (url) => (url.includes('127.0.0.1') ? 'LOCAL' : (isTestingEnvByUrl(url) ? 'TESTING' : (isProdEnvByUrl(url) ? 'PROD' : 'UNKNOWN'))),
    COULD_PLAY_AUDIO_INTERVAL: COULD_PLAY_AUDIO_INTERVAL,
    NETWORK_ERROR_CHECK_INTERVAL: 0.1 * 60 * 1000,//ping百度这个网站以测试网络连通性的时间间隔
    TASK_EXEC_INTERVAL: 25 * 1000, //检测任务调用间隔时间,不得小于单次播放同一个环境失败时间总和的时间--此值不能小于无缓存时页面载入等待超时时间

    PAGE_WAITING_TIMEOUT: (isWindows ?  10: 21) * 1000,//无缓存情况下页面载入等待超时
    DOM_ELEM_WAITING_TIMEOUT_AFTER_CONTENT_LOAD:15000,//dom load之后等待找到dom的最大时间
    AUDIO_LOOP_COUNT: isWindows ? 1 : 3,//音频播放重复次数，除了欢迎语音1次外，其他都是4次
    AUDIO_LOOP_TIME_LENGTH:(isWindows?10:60)*1000,
    HOW_MANY_ERROR_IS_ERROR:1,
    MOBILE_URL_POSTFIX: '/workbench/home?cid=' + corpId,
    SUB_TASK_EXEC_DURATION:2200,
    WELCOME_AUDIO_PLAY_SCHEDULE:[
        '01 30 09 * * *'
    ],
    // MP3_FADE_FOLDER_PATH:'./mp3/fade',
    NEED_CHECK_NETWORK_AVAILABLE: true,//是否检测网络超时情况
    AUDIO_PATH_MAP: {
        PC_TESTING_EXCEPTION_AUDIO_PATH: MP3_FOLDER_PATH + '/pc_testing.mp3',
        PC_PROD_EXCEPTION_AUDIO_PATH: MP3_FOLDER_PATH + '/pc_prod.mp3',
        PC_TESTING_TIMEOUT_AUDIO_PATH: MP3_FOLDER_PATH + '/pc_testing_timeout.mp3',
        PC_PROD_TIMEOUT_AUDIO_PATH: MP3_FOLDER_PATH + '/pc_prod_timeout.mp3',


        MOBILE_TESTING_EXCEPTION_AUDIO_PATH: MP3_FOLDER_PATH + '/mobile_testing.mp3',
        MOBILE_PROD_EXCEPTION_AUDIO_PATH: MP3_FOLDER_PATH + '/mobile_prod.mp3',
        MOBILE_TESTING_TIMEOUT_AUDIO_PATH: MP3_FOLDER_PATH + '/mobile_testing_timeout.mp3',
        MOBILE_PROD_TIMEOUT_AUDIO_PATH: MP3_FOLDER_PATH + '/mobile_prod_timeout.mp3',



        NETWORK_ERROR_AUDIO_PATH: MP3_FOLDER_PATH + '/network_error.mp3',
        WELCOME_AUDIO_PATH: MP3_FOLDER_PATH + '/welcome.mp3',

        TESTING_TOKEN_FAILED_PATH: MP3_FOLDER_PATH + '/testing_token_error.mp3',
        PROD_TOKEN_FAILED_PATH: MP3_FOLDER_PATH + '/prod_token_error.mp3',



        LOCAL_TOKEN_FAILED_PATH: MP3_FOLDER_PATH + '/local/local_token_error.mp3',
        MOBILE_LOCAL_EXCEPTION_AUDIO_PATH: MP3_FOLDER_PATH + '/local/mobile_local.mp3',
        PC_LOCAL_EXCEPTION_AUDIO_PATH: MP3_FOLDER_PATH + '/local/pc_local.mp3'
    },
    LOCAL_DEV_SERVER_PC_HOST: 'http://127.0.0.1:8080',
    LOCAL_DEV_SERVER_MOBILE_HOST: 'http://127.0.0.1:8081',
    //TESTING_WEBSITE_HOST: 'http://platform-local-test.wshoto.com:8080',
    TESTING_WEBSITE_HOST: 'https://platform-test.wshoto.com',


    LOCAL_AS_TESTING_HOST_PC:'http://local-as-testing.com',
    LOCAL_AS_TESTING_HOST_MOBILE:'http://192.168.2.16:8080',
    // LOCAL_AS_TESTING_HOST_MOBILE:'http://local-as-testing.com:8080',

    WLAN_AS_TESTING_HOST_PC:'http://192.168.0.243',
    WLAN_AS_TESTING_HOST_MOBILE:'http://192.168.0.243:8081',

    PROD_WEBSITE_HOST: 'https://platform.wshoto.com',
    //PROD_WEBSITE_HOST: 'http://platform-prod.wshoto.com:8080',
    
    UAT_WEBSITE_HOST: 'https://platform-uat.wshoto.com',

    PC_URL_POSTFIX: '/index/dashboard',
    FETCH_TOKEN_URL:
        '/platform/oauth/userAndTenantId/login?id='+USER_ID+'&tenantId=ww8923d8e5cd61963a',//get方式获取token的url
    PASSED_TOKEN_INFO_AT_URL_WHEN_OPEN_PAGE: (token) => {
        return {
            token: token,
            mocked_userinfo: {
                "access_token": token,
                "corpId": corpId,
                "qrCode": "https://open.work.weixin.qq.com/wwopen/userQRCode?vcode=vc07cb67317c1782ae",
                "avatar": "https://wework.qpic.cn/bizmail/CiceYxc61BxevNwNpv7BzCBldD7e3ibeibwBYV4g2jyZZUrbxdvZKU55w/0",
                "userId": USER_ID
            }
        }
    },//当网页打开时，将该对象所有的属性拼接到url中
    SET_AUTO_LOGIN_TO_PAGE() {

        document.cookie = `token=${location.search.split('&token=')[1].split('&')[0]}`
        localStorage.setItem('userInfo', decodeURIComponent(location.search.split('&mocked_userinfo=')[1].split('&')[0]))
    },//设置自动登录相关信息
    PC_EXPECTED_SUCCESS_FN_WITHOUT_TOKEN: () => {
        console.log('puppeteer:invoked pc expected success fn')
        let env = ( location.host.includes('test') || location.host.includes('uat') ) ? 'TESTING' : 'PROD'
        if (location.host.includes('127.0.0.1')) { env = 'LOCAL' }
        

        let tS=Date.now()
        //mac mini 里梅100次左右就会触发一次错误，不晓得是不是waituntil已经触发但是dom元素没有出现的原因
        setTimeout(function fn(){
            let res = [
                location.pathname.startsWith('/login'),
                document.querySelector('img[alt=企业微信登录]')
            ].every((s) => !!s)

            console.log('puppeteer:exec res of pc:', res)

            // res=false;



            let flag = 'puppeteer:LOAD_ERROR:PC:' + env

            if (!res) {//失败
                if(Date.now()-tS<15000){
                    setTimeout(fn,2000)
                    return false;
                }
                console.log(flag)
            } else {
                console.log(`puppeteer:恭喜PC:${env}的页面加载完全正常`)
            }
            console.log('puppeteer:CLOSE_PAGE:'+(res?0:1))
            if(res){ console.log('puppeteer:RESET_ERROR_COUNTER:PC:'+env) }
        },2000)

    },
    PC_EXPECTED_SUCCESS_FN_WITH_TOKEN: () => {
        console.log('puppeteer:invoked pc expected success fn with token')
        let env = ( location.host.includes('test') || location.host.includes('uat') ) ? 'TESTING' : 'PROD'
        if (location.host.includes('127.0.0.1')) { env = 'LOCAL' }
        
        let tS=Date.now()
        //mac mini 里梅100次左右就会触发一次错误，不晓得是不是waituntil已经触发但是dom元素没有出现的原因
        setTimeout(function fn()  {
            let res = [
                location.pathname.startsWith('/index/dashboard'),
                document.querySelectorAll('header .el-menu-item').length>1
            ].every((s) => !!s)

            console.log('puppeteer:exec res of pc in with token mode:', res)

            // res=false;



            let flag = 'puppeteer:LOAD_ERROR:PC:' + env

            if (!res) {//失败
                if(Date.now()-tS<15000){
                    setTimeout(fn,2000)
                    return false;
                }
                console.log(flag)
            } else {
                console.log(`puppeteer:恭喜PC:${env}的页面加载完全正常`)
            }
            console.log('puppeteer:CLOSE_PAGE:'+(res?0:1))
            if(res){ console.log('puppeteer:RESET_ERROR_COUNTER:PC:'+env) }
        },2000)

    },
    MOBILE_EXPECTED_SUCCESS_FN_WITH_TOKEN: () => {
        console.log('puppeteer:invoked mobile expected success fn')
        let env = ( location.host.includes('test') || location.host.includes('uat') ) ? 'TESTING' : 'PROD'
        if (location.host.includes('127.0.0.1')) { env = 'LOCAL' }
        let tS=Date.now()
        console.log('puppeteer:test 1')

        // if(location.href.includes('puppeteer_opened_count=2') && location.hostname=='local-as-testing.com'){
        //     alert('yes')
        //     let script=document.createElement('script');
        //     script.src='/workbench/modules.js '
        //     document.body.appendChild(script)
        // }
        


        setTimeout(function fn() {
            console.log('puppeteer:test 2 ')
            let res = [
                location.pathname.startsWith('/workbench/home'),
                document.querySelector('.main-content')
            ].every((s) => !!s)
            console.log('puppeteer:exec res of mobile:', res)
            let flag = 'puppeteer:LOAD_ERROR:MOBILE:' + env



            // res=false;



            console.log('puppeteer:res in mobile--:', res)
            if (!res) {//失败
                if(Date.now()-tS<15000){
                    setTimeout(fn,2000)
                    return false;
                }
                console.log(flag)
            } else {
                console.log(`puppeteer:恭喜MOBILE:${env}的页面加载完全正常`)
            }
            console.log('puppeteer:CLOSE_PAGE:'+(res?0:1))
            if(res){ console.log('puppeteer:RESET_ERROR_COUNTER:MOBILE:'+env) }
        }, 2000);//因为class=main-contentzh这个玩意儿是页面载入后发起请求动态渲染的，所以设置一个超时;


    },
    GET_TOKEN_VALUE_FROM_HTTP_METHOD: new Function('AXIOS_RES',
        'return AXIOS_RES.data.data.access_token')//使用axios调用接口返回信息后的得到token字符串的方式
}