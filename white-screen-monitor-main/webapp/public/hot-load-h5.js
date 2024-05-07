
(async function () {
    


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



    let baseDevServerIp = '//dubaixing.qicp.vip'
    // let baseDevServerIp = '//192.168.31.29'

   

    let urlBaseHost = baseDevServerIp + ''
    // let urlBaseHost = baseDevServerIp + ':8082'
    // let urlBaseHost = baseDevServerIp + ':' + window.parent.location.port
    let hostBase = 'http:' + urlBaseHost
    


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
            }
        }

        let xhrUrl=hostBase + '/workbench/modules.js'
        // let xhrUrl = hostBase + (Array.from(document.scripts)
        //     .find(s => s.src.includes('modules')).src.includes('workbench') ? '/workbench/modules.js' : '/modules.js')
        console.log('xhrUrl--:', xhrUrl)

        xhr.open('get', xhrUrl, true)
        // xhr.open('get', location.protocol+'//dubaixing.qicp.vip/workbench/modules.js', true)

        xhr.send(null)
    }
    window.parent.doLoadModules = loadModules;

    loadModules()




}) ();