/**
 * tampermonkey demo:
 * 
 * 
 * 
 * 
*            (function() {
            'use strict';
        let script=document.createElement('script');
        script.src=location.protocol+'//dubaixing.qicp.vip/home/debug-patch.js';
        document.body.appendChild(script);
    })();


 * 
 * 
 */


   



// window.parent.synsGlobalVars && window.parent.synsGlobalVars(window);
(async function () {
    'use strict';


    

    await sleep(1000)
    // alert(12)
    let isPCDevServer =location.port==8080 || location.href=='https://platform-test.wshoto.com/login' || location.href=='https://platform.wshoto.com/login'
    // let isPCDevServer = location.hostname == 'local-dev-server-pc.com' || location.hostname == 'localhost' || location.hostname == '127.0.0.1' || location.hostname == '192.168.31.251'
    // let cropId = "ww8e09372aff8d9190"//无锡天普
    // let cropId = "ww8923d8e5cd61963a"//无锡小程序

    
    let cropId = "wpDkH9EAAAds79bR6l2ncww72nXU7-zA"//风痕的测试企业
    let userId = "woDkH9EAAA-6MqXDF1bAh50bKG7ulHyg"//1337384
    
    
    // let userId = "1337384"
    // let userId = "jack.d"
    
    let FETCH_TOKEN_URL = '/platform/oauth/userAndTenantId/login?id=' + userId + '&tenantId=' + cropId;//get方式获取token的url
    console.log('FETCH_TOKEN_URL---:', FETCH_TOKEN_URL,isPCDevServer)
    

    if (isPCDevServer) {
        let d = (await (await window.fetch('/platform/oauth/userAndTenantId/login?id='+userId+'&tenantId='+cropId)).json()).data
        // let d = (await (await window.fetch('/platform/oauth/userAndTenantId/login?id=jack.d&tenantId=ww8e09372aff8d9190')).json()).data
        let data = {
            access_token: d.access_token,
            avatar: "https://wework.qpic.cn/bizmail/CiceYxc61BxevNwNpv7BzCBldD7e3ibeibwBYV4g2jyZZUrbxdvZKU55w/0",
            corpId: d.corpId,
            qrCode: "https://open.work.weixin.qq.com/wwopen/userQRCode?vcode=vc07cb67317c1782ae",
            userId: userId
        }
        console.log('d.access_token--:', d.access_token)
        // setInterval(() => {

            // for (let i = 0; i < localStorage.length; i++) {
            //     var key = localStorage.key(i); 
            //     localStorage.removeItem(key);
            // };
            // for (let i = 0; i < sessionStorage.length; i++) {
            //     var key = sessionStorage.key(i); 
            //     sessionStorage.removeItem(key)
            // };

            // var keys = document.cookie.match(/[^ =;]+(?=\=)/g);
            // if (keys) {
            //     for (var i = keys.length; i--;)
            //         document.cookie = keys[i] + '=0;expires=' + new Date(0).toUTCString()
            // }



            document.cookie = 'token=' + d.access_token;
            if (location.pathname == '/login') {
                if(location.host.includes('dbx')){
                    sessionStorage.setItem('module_version','V20220310')
                }
                // if(location.href!='' && location.href!='/'){
                location.href = '/customer-marketing/customer/qr-code/index'
            }

        // }, 30)
        // handleScriptOnload()
        // localStorage.setItem('userInfo',JSON.stringify(data));
        return false;
    }

    let token = "a3174eef-a9bf-4922-938e-33af34ba71ff"

    localStorage.setItem('userInfo', JSON.stringify({

        access_token: token,
        avatar: "https://wework.qpic.cn/bizmail/CiceYxc61BxevNwNpv7BzCBldD7e3ibeibwBYV4g2jyZZUrbxdvZKU55w/0",
        corpId: cropId,
        qrCode: "https://open.work.weixin.qq.com/wwopen/userQRCode?vcode=vc07cb67317c1782ae",
        userId: userId
    }))
    localStorage.setItem('module_corp_id', cropId)
    document.cookie = 'token=' + token;

    // var script = document.createElement('script');
    // script.src = '/workbench/modules.js';
    // document.body.appendChild(script);


    function abcmoduleLoaderLoadData(data) {
        return data;
    }
    window.abcmoduleLoaderLoadData = abcmoduleLoaderLoadData;
    // JSONP 加载模块, 从modules.js中触发， 不要删掉
    function moduleLoaderLoadData(data) {
        const head = document.getElementsByTagName('head')[0];
        const publicPath = data.publicPath;
        const prefetchArray = data.head || [];
        for (let i = 0; i < prefetchArray.length; i++) {
            const item = prefetchArray[i];
            const hm = document.createElement(item.tagName);
            // console.log('href--:',href)
            hm.setAttribute('href', publicPath + item.attributes.href);
            hm.setAttribute('rel', item.attributes.rel);
            if (item.attributes.as) {
                hm.setAttribute('as', item.attributes.as);
            }
            head.appendChild(hm);
        }
        const body = document.getElementsByTagName('body')[0];
        const initArray = data.body || [];
        for (let i = 0; i < initArray.length; i++) {
            const item = initArray[i];
            const hm = document.createElement(item.tagName);
            hm.src = publicPath + item.attributes.src;
            hm.onload = function () {
                console.log(hm.src + '-----------loaded')
            }
            hm.onerror = function () {
                console.log(hm.src + '-----error,', arguments)
            },
                body.appendChild(hm);
        }
    }
    window.moduleLoaderLoadData = moduleLoaderLoadData;



    let baseDevServerIp = '//192.168.31.52'

    if (isPCDevServer) {
        baseDevServerIp = '//' + location.host
        // baseDevServerIp='//local-dev-server-pc.com'
    }

    let urlBaseHost = baseDevServerIp + ':' + window.parent.location.port
    let hostBase = 'http:' + urlBaseHost
    let wsUrl = ('ws:' + ((isPCDevServer ? '//127.0.0.1:' : '//192.168.31.29:') + 8082) + '/sockjs-node/'
        + (parseInt(Math.random() * 1000000)) + '/' + (parseInt(Math.random() * 1000000)) + 'bsdfdsf2t3orr/websocket');
    // let wsUrl=new WebSocket('ws://192.168.31.251:8082/sockjs-node/3799/2bsdfdsf2t3orr/websocket');
    // let wsHostBase='ws:'+urlBaseHost


    function loadModules() {
        const xhr = new XMLHttpRequest()
        xhr.onload = function onload() {

            if (xhr.status >= 200 && xhr.status < 300) {
                let txt = (xhr.responseText);
                let data = new Function('return abc' + txt)()

                data.publicPath = hostBase + '' + data.publicPath
                // data.publicPath=location.protocol+'//192.168.31.251:8082'+data.publicPath
                console.log('data----------:', data)
                window.MODULE_LOAD_DATA = window.parent.MODULE_LOAD_DATA = data;

                moduleLoaderLoadData(data)
                handleScriptOnload()
            }
        }

        let xhrUrl='/modules.js'
        if((window.parent.parent.IFRAME_WIN||window).location.href.includes('/workbench')){
            // alert(1)
            xhrUrl='/workbench/modules.js'
        }
        // else{
        //     alert(2)
        // }
        // let xhrUrl = hostBase + (Array.from(document.scripts)
        //     .find(s => (s.src && s.src.includes('modules'))).src?.includes('workbench') ? '/workbench/modules.js' : '/modules.js')
        console.log('xhrUrl--:', xhrUrl)

        xhr.open('get', xhrUrl, true)
        // xhr.open('get', location.protocol+'//dubaixing.qicp.vip/workbench/modules.js', true)

        xhr.send(null)
    }
    window.parent.doLoadModules = loadModules;

    loadModules()


    let ws = new WebSocket(wsUrl);
    ws.onmessage = function ({ data }) {
        let d = data;
        // console.log('type of d--:',d,d.length,typeof(d))
        // console.log('d---:',d,d.length<=80,'type hash data'.split(' ').every(s=>d.includes(s)))
        if (d.length <= 80 && 'type hash data'.split(' ').every(s => d.includes(s))) {

            console.log('app updateded')

            // setTimeout(()=>{
            //     loadModules();
            // },1000)
        }

    }


    console.log('wsUrl--:', wsUrl)

    function sleep(timeout = 0) {
        return new Promise((resolve) => {
            setTimeout(resolve, timeout)
        })
    }
    async function handleScriptOnload() {


        // let ws=new WebSocket(wsHostBase+'/sockjs-node/info?t='+Date.now())

        console.log('this--:', this)
        function set_this() {

            if (!window.__VUE_HOT_MAP__) {
                setTimeout(() => {
                    set_this();
                }, 500)
                return false;
            }

            window.parent.sessionStorage.setItem('TEMP_URL', location.href)
            console.log('set this invoked')






            setTimeout(async () => {

                let arr = [];
                let vm = { $children: Object.values(__VUE_HOT_MAP__).map(s => s.instances).filter(s => s.length > 0).flat() };
                function doit(vm) {
                    arr.push(vm);
                    if (vm.$children && vm.$children.length > 0) {

                        vm.$children.forEach(s => {

                            doit(s)
                        })
                    }

                };
                doit(vm);

                let appNode;
                if (isPCDevServer) {
                    await sleep(10000)
                    appNode = Array.from(document.querySelectorAll('#app .el-tabs__content .el-tab-pane')).reverse()[0].nextSiblings
                } else {
                    appNode = document.querySelector('#app .pageContent div');
                }


                console.log('appNode--:', appNode, appNode.classList[0], arr.length)
                window.ALL_VUE_INSTANCE = arr;
                let result = arr.find(s => {
                    console.log('class list--:', s.$el, s.$el?.classList)
                    let res = (s.$el && s.$el?.classList?.contains(appNode.classList[0]))
                    return res;
                });
                console.log('result-0--:', result)
                // let result = arr.find(s => (s.$el && s.$el.classList?.contains('leadsPage')));
                window._this = window.parent._this = result;
                window._thisOptions = window.parent._thisOptions = Object.getPrototypeOf(window._this.$options)
                console.log('find vm is readyyyyyyyyy--:', window._this, window._thisOptions);

                if (!isPCDevServer) {
                }
                window.parent.document.title = window.parent.parent.document.title = window.parent.IFRAME_WIN.document.title || window.parent.document.title;

            // }
                
             }, !isPCDevServer ? 500 : 500)



    }
    setTimeout(set_this, 500)



    let hash = location.hash;
    let pathName = location.pathname;
    setInterval(() => {
        let h = location.hash;
        let p = location.pathname;
        if (h != hash) {
            set_this()
            hash = h;
        }
        if (p != pathName) {
            set_this()
            pathName = p;
        }
    }, 100)

}

    // Your code here...
}) ();