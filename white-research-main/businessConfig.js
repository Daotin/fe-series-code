let isWindows= process.platform == 'win32'

let corpId='ww8923d8e5cd61963a'


const isTestingEnvByUrl = (url) => url.split('.com')[0].includes('test')
const isProdEnvByUrl = (url) => !isTestingEnvByUrl(url)

const MP3_FOLDER_PATH = './mp3'//mp3文件夹位置

module.exports={
    GET_ENV_BY_URL : (url) => (url.includes('127.0.0.1') ? 'LOCAL' : (isTestingEnvByUrl(url) ? 'TESTING' : (isProdEnvByUrl(url) ? 'PROD' : 'UNKNOWN'))),
    COULD_PLAY_AUDIO_INTERVAL:isWindows?20000:(10*60*1000),//播放音频后多久后再次允许继续播放
    NETWORK_ERROR_CHECK_INTERVAL:10*60*1000,//ping百度这个网站以测试网络连通性的时间间隔
    PAGE_WAITING_TIMEOUT:60 * 1000,//无缓存情况下页面载入等待超时
    // AUDIO_LOOP_COUNT
    MOBILE_URL_POSTFIX:'/workbench?cid=' + corpId,
    AUDIO_PATH_MAP : {
        PC_TESTING_EXCEPTION_AUDIO_PATH: MP3_FOLDER_PATH + '/pc_testing.mp3',
        PC_PROD_EXCEPTION_AUDIO_PATH: MP3_FOLDER_PATH + '/pc_prod.mp3',
        MOBILE_TESTING_EXCEPTION_AUDIO_PATH: MP3_FOLDER_PATH + '/mobile_testing.mp3',
        MOBILE_PROD_EXCEPTION_AUDIO_PATH: MP3_FOLDER_PATH + '/mobile_prod.mp3',
        NETWORK_ERROR_AUDIO_PATH:MP3_FOLDER_PATH+'/network_error.mp3',
        WELCOME_AUDIO_PATH:MP3_FOLDER_PATH+'/welcome.mp3',
        MOBILE_LOCAL_EXCEPTION_AUDIO_PATH: MP3_FOLDER_PATH + '/mobile_local.mp3'
      },
    LOCAL_DEV_SERVER_PC_HOST:'http://127.0.0.1:8080',
    TESTING_WEBSITE_HOST:'https://platform-test.wshoto.com',
    TASK_INTERVAL_TIMEOUT: 60 * 1000,//不得小于60s //检测任务调用间隔时间
    PROD_WEBSITE_HOST:'https://platform.wshoto.com',
    PC_URL_POSTFIX:'/index/dashboard',
    FETCH_TOKEN_URL : 
        '/platform/oauth/userAndTenantId/login?id=yg&tenantId=ww8923d8e5cd61963a',//get方式获取token的url
    PASSED_TOKEN_INFO_AT_URL_WHEN_OPEN_PAGE:(token)=>{
        return {
            token:token,
            mocked_userinfo:{
                "access_token": token,
                "corpId": corpId,
                "qrCode": "https://open.work.weixin.qq.com/wwopen/userQRCode?vcode=vc07cb67317c1782ae",
                "avatar": "https://wework.qpic.cn/bizmail/CiceYxc61BxevNwNpv7BzCBldD7e3ibeibwBYV4g2jyZZUrbxdvZKU55w/0",
                "userId": "yg"
            }
        }
    },//当网页打开时，将该对象所有的属性拼接到url中
    SET_AUTO_LOGIN_TO_PAGE(){
        
        document.cookie = `token=${location.search.split('&token=')[1].split('&')[0]}`
        localStorage.setItem('userInfo', decodeURIComponent(location.search.split('&mocked_userinfo=')[1].split('&')[0]))
    },//设置自动登录相关信息
    GET_TOKEN_VALUE_FROM_HTTP_METHOD:new Function('AXIOS_RES',
        'return AXIOS_RES.data.data.access_token')//使用axios调用接口返回信息后的得到token字符串的方式
}