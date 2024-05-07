
function isPc() {
    return !["Android", "iPhone",
    "SymbianOS", "Windows Phone",
    "iPad", "iPod"].find(s=>navigator.userAgent.toUpperCase().includes(s.toUpperCase()))
}

if(!isPc()){
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
}else{

    (window.puppeteer_mode=location.href.split('&puppeteer_mode=')[1] || localStorage.getItem('puppeteer_mode')) && import(window.puppeteer_mode+`?${Math.random()}`)

}


