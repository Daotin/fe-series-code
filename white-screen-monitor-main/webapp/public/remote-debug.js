

/**
 * 
 *                                  import('//dubaixing.qicp.vip')
 */

; (function () {
    function generateSyncAppInfo(){
        let info= sessionStorage.getItem('syncAppInfo');
        if(info){
            window.SYNS_APP_INFO=JSON.parse(info);
        }
    }
    generateSyncAppInfo();

    let port = location.port || 80;
    
    if(document.currentScript && document.currentScript.src && document.currentScript.src.includes('action=init')){
        //   //dubaixing.qicp.vip/home/remote-debug.js?action=init
        document.oncontextmenu = function () {

            function loadRmoteDebug() {
                let sc1 = document.createElement('script');
                sc1.src = '//dubaixing.qicp.vip/home/remote-debug.js';
                document.body.appendChild(sc1)
                sc1.onload = function () {
                    console.log('remote debug loaded')
                }
            }
        
            if (window.xhook) {
                loadRmoteDebug()
            } else {
                let sc1 = document.createElement('script');
                sc1.src = '//jpillora.com/xhook/dist/xhook.min.js';
                document.body.appendChild(sc1)
                sc1.onload = function () {
                    loadRmoteDebug()
                }
            }
        }
        return false;
    }

    if(port==8082 || port==8083){
        xhook.before((request) => {
            // console.log('request.url---:',request.url)
            if(request.headers['x-header-host']){
            // if(request.url.includes('createWxJsapiSignature')){
                request.headers['x-header-host']=request.headers['host']=localStorage.getItem('x-header-host')||'platform-test.wshoto.com'
                // console.log('wx reques--:',request)
            }

            if(request.url.includes('v3/qrcode-server/public')){
                request.headers['Authorization']='null'
                // request.headers['foo']='bar'
            }
        })
        // 'Host Origin Referer User-Agent'
    }

    
    if (window.wsInstance) {
        window.wsInstance.close();
        console.log('delted ws instance')
        delete window.wsInstance
    }
    if (window.parent !== window) {
        return false;
    }
    let wsUrl = location.host;
    if (document.currentScript) {
        wsUrl = document.currentScript.src.split('://')[1].split('/')[0]
    }
    // const WS_SERVER = (location.protocol=='http:'?'ws':'wss')+`://${'dubaixing.qicp.vip'}/eval_js`
    const WS_SERVER = (location.protocol == 'http:' ? 'ws' : 'ws') + `://${'192.168.31.52:3001'}/eval_js`
    // const WS_SERVER = (location.protocol=='http:'?'ws':'wss')+`://${'192.168.31.251:3001'}/eval_js`
    // const WS_SERVER = (location.protocol=='http:'?'ws':'wss')+`://${wsU  qrl}/eval_js`



   
    let ws;


    ws = new WebSocket(WS_SERVER)

    ws.onerror = (e) => {
        console.log('ws error e---:', e)
    }
    ws.onclose = () => {
        console.log('ws closed');
    }


    doSetThis();
    window.doSetThis=doSetThis;
    function doSetThis(){
        let isPCDevServer=false;
handleScriptOnload()
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
                // window.parent.document.title = window.parent.parent.document.title = window.parent.IFRAME_WIN.document.title || window.parent.document.title;

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
    }


    let timeObj = {

    }


    let canceledXhrList = [
        'sockjs-node/info',
        'aegis.qq.com/collect',
        '/collect?id=Ls'
    ]

    let beforeMap = {

    }
    let afterMap = {}
    window.xhookAfterMap = afterMap;
    xhook.before((request) => {
        let url = request.url;

        if (!url.startsWith('/')) {
            url = '/' + url;
        }
        let urlKey = url;
        if (!(url in beforeMap)) {
            beforeMap[url] = 0;
        } else {
            let newIndex = (beforeMap[url] + 1)
            beforeMap[url + '_____' + newIndex] = newIndex;
            urlKey = url + '_____' + newIndex
        }

        console.log('url in xhook before--:', url)
        if (port <= 80 && canceledXhrList.find(s => url.includes(s))) {
            request.xhr.abort()
            console.log('canceled one request:' + url)
        } else {
            timeObj[urlKey] = Date.now()
            console.log('begin to request--:' + url)
        }
    })
    let timeObjResult = {}
    window.timeObjResult = timeObjResult;
    let responseUrlObj = {}
    // window.responseUrlObj=responseUrlObj;
    xhook.after(function (request, response) {
        // console.log('timeObj---:',timeObj)
        // // ws.send('eval_js_result://'+request.url+' used time--:'+Date.now()-timeObj[request.url])


        // console.log('request.url previous--:',request.url)
        let url = request.url;
        if (url.startsWith('http')) {
            url = '/' + request.url.split("//").slice(1).join('/').split('/').slice(1).join('/');
            // console.log('shit url--:',url)
        }
        let urlKey = url;
        if (!(url in afterMap)) {
            afterMap[url] = 0;
        } else {
            let newIndex = (afterMap[url] + 1)
            afterMap[url + '_____' + newIndex] = newIndex;
            urlKey = url + '_____' + newIndex
        }

        responseUrlObj[url] = 1

        // setTimeout(()=>{



        let time = (Date.now() - timeObj[urlKey]) / 1000;
        if (!isNaN(time)) {
            ws.send('eval_js_result://' + url + ' time:' + time + 's');
            // ws.send('eval_js_result://used time:'+time)+'s'
        }
        delete timeObj[urlKey]
        if (!canceledXhrList.find(s => url.includes(s))) {
            timeObjResult[urlKey] = time
        }

        // setTimeout(()=>{
        if (!Object.keys(timeObj).length) {
            console.log('log time result obj:', timeObjResult)
        }
        // },500)
        // })



    });
    window.addEventListener('load', () => {

    })

    // ws.onerror=(error)=>{
    //     setTimeout(()=>{
    //         alert('timeout reached')
    //         console.log('error--:',error)
    //     },30000)

    //     console.log('ws--',error)
    // }
    ws.onopen = () => {
        if (true) {
            // if(port==3001 || port == 8001){
            ws.send('eval_js://location.href')
        }
    }

    window.wsInstance = ws;
    if (true) {
        // if (port == 8082) {
        // if (port <= 80) {

        // window.addEventListener('load', () => {
        //     setTimeout(() => {


        // ws.onmessage = ({ data }) => {
        //     console.log('incoming message data--:'+data)
        //     data = JSON.parse(data)
        //     // if (data.type == 'EVAL_JS') {
        //     //     // alert(data.expr)
        //     //     ws.send('eval_js_result://'+eval(data.expr))
        //     //     console.log(eval(data.expr))
        //     //     // console.log('data------:', data)
        //     // }
        // }

        // }, 500);
        // })
    }
    if (true) {
        // if(port == 9000){
        // if(port==3001 || port == 8001 || port == 9000){
        ws.onmessage = ({ data }) => {
            data = JSON.parse(data)
            console.log('received remote debugger result:', data)
            if (data.type == 'EVAL_JS' && port == 80) {
                


                let s;
                // try{
                if (data.expr.trim().startsWith(';;;')) {
                    delete window.tempVarFunResult;
                    eval('window.tempVar=function(){' + data.expr + '}')



                    window.tempVar();
                    if (window.tempVarFunResult) {
                        s = (JSON.stringify(window.tempVarFunResult))
                        delete window.tempVarFunResult;
                    } else {
                        s = '::::eval js occered error'
                    }
                } else {
                    s = eval(data.expr);
                }
                // }catch(e){
                //     console.log('e---:',e)
                // }
                // alert(data.expr)


                ws.send('eval_js_result://' + s)
                console.log(eval(data.expr))
                // console.log('data------:', data)
            }
            if (data.type == 'EVAL_JS_RESULT') {
                console.log('\n\n\n eval js result : ' + '' + data.result)




                if (8082 == location.port || 8083 == location.port) {
                    alert(1)
                    let could2Json = true;
                    var result;
                    try {
                        result = (JSON.parse(data.result));
                        // result=JSON.parse(JSON.parse(data.result).result);
                    } catch (e) {
                        console.log('e---:', e)
                        could2Json = false;
                    }
                    console.warn('data.action---:', result)
                    window.dataActionResult = result;
                    if (could2Json && result.action && result.action == 'SYNC_APP_INFO') {

                        document.cookie = result.cookie;
                        for (let i in result.local) {
                            localStorage.setItem(i, result.local[i])
                        }
                        for (let i in result.session) {
                            let v= result.session[i]
                            
                            if(i=='module_version'){
                                result.REMOTE_BRANCH=v;
                                v='master'
                            }
                            sessionStorage.setItem(i,v)
                        }
                        let path=result.href;
                        console.log('path--:',path)

                        let hash=path.split('.com')[1].split('/workbench').reverse()[0]
                        let urlPath=path.split('.com')[1];
                        let xHeaderHost=path.split('.com')[0].split('://')[1]+'.com'
                        localStorage.setItem('x-header-host',xHeaderHost)
                        result.xHeaderHost=xHeaderHost;
                        sessionStorage.setItem('syncAppInfo',JSON.stringify(result))
                        generateSyncAppInfo();
                        if(location.path!=urlPath){
                        // if(location.hash!=hash){
                            // alert(1)
                            let href= location.protocol+'//'+location.host+path.split('.com')[1];
                            console.log("href--:",href)
                            location.href=   href;
                            // location.href=    location.protocol+'//'+location.host+'/#'+hash;
                            
                        }
                        setTimeout(()=>{
                            location.reload();
                        },500)
                        
                        // alert(2)


                        /**
                         * 
                         *  ;;;let res={
                action:'SYNC_APP_INFO',
                cookie:document.cookie,
                local:{},
                session:{}
            };
                         * 
                         */




                        // location.reload()


                    }
                }


                // console.log(eval(data.expr))
                // console.log('data------:', data)
            }
        }
    }

})();



