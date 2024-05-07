const MAIN_NEXT_TICK_CPU_DURATION = 120
const webAppDomContainer='#app'



let timeStampOfClick = Date.now();
let timeStampOfXhr = Date.now()

async function nextTick() {
    return new Promise((resolve) => {
        setTimeout(resolve, MAIN_NEXT_TICK_CPU_DURATION)
    })
}

function resetEleCollection() {
    let $store = window.$store;
    let curPageEles = Array.from(window.$store.utils.$$('*', window.$store.$app));
    $store.eleCollection = {
        // foo:'bar'
        [url2UniqueUrl(location.href)]: {
            $all: curPageEles,
            totalLen: curPageEles.length,
            index: -1,
            $xhrer: {},
            $historyChanger: new WeakMap()
        }
    }
}
main.getCurrentUrlEleMap = (href) => window.$store.eleCollection[url2UniqueUrl(href || location.href)]
async function main() {
    if (!window.xhook) {
        await import('//jpillora.com/xhook/dist/xhook.min.js')
        
        xhook.before((request) => {
            request.xhooked=true;
            timeStampOfXhr = Date.now()
        })
    }
    console.log('main invokeddd')

     setTimeout(main.startTask.bind(null,true))
}

main.startTask = (startTaskOnly = false) => {
    window.$store.$app=$(webAppDomContainer)
    window.$store.$router=$(webAppDomContainer).__vue__.$router;
    var observer = new MutationObserver(function (mutationsList, observer) {
    
        // console.log("mutation args---:",arguments)
    });
    
    //开始观测
    observer.observe(window.$store.$app, { attributes: false, childList: true, subtree: true });
    if (window.$store.isRunning) {
        return false;
    }
    window.$store.isRunning = true;
    resetEleCollection()
    window.$store.curPageDoms = main.getCurrentUrlEleMap()
    // window.$store.curPageDoms=curPageDoms;
    


    if (!startTaskOnly) {
        main.execOneTask()
    }

}
document.body.addEventListener('click',(e)=>{
    // alert(1)
    timeStampOfClick=Date.now()
    window.$store.lastClickEvt=e;
    e.target.style.pointerEvents='none'
    // e.preventDefault();
    // e.stopImmediatePropagation();
    // e.stopPropagation();

})
main.execOneTask = (givenIndex = null) => {
    if(Date.now()-timeStampOfClick<MAIN_NEXT_TICK_CPU_DURATION){
        return false;
    }
    if (!window.$store.isRunning) {
        main.startTask(true)
    }
    if (givenIndex === null) {
        window.$store.curPageDoms.index++;
    } else {
        window.$store.curPageDoms.index = givenIndex
    }

    let ele = window.$store.curPageDoms.$all[window.$store.curPageDoms.index];
    console.log('ele--:', ele)
    window.$store.currentClickingElem=ele;
    timeStampOfClick=Date.now()
    ele.click()
    main.detectRouteChange()
    // main.detectXhr()
}
main.detectXhr = () => {

}
main.detectRouteChange=()=>{

}


function $(selector, context = document.body) {
    if (!(selector instanceof HTMLElement)) {
        selector = context.querySelector(selector)
        return selector;
    }
    return selector;
}
function $$(selector, context = document.body) {
    return $(context).querySelectorAll(selector)
};
function url2UniqueUrl(url) {
    if (window.$store.routeMode === 'history') {
        return url.split('?')[0]
    } else {
        return url.split('?')[0].split("/#")[0]
    }
}



setTimeout(main)


window.$store = {
    ...{
        $router:null,
        lastClickEvt:null,
        curPageDoms:null,
        currentClickingElem: null,
        isRunning: false, //RUNNING STOPED
        hasRegisteredVisibleChangeEvt: false,
        patchInvokedTimes: 0,
        $app: null,
        $foreverExistedDoms: window.$store?.$foreverExistedDoms || [],
        routeMode: 'history',
        eleCollection: window.$store?.eleCollection || {

        },
        utils: {
            $,
            $$
        },
        services: {
            main,
            url2UniqueUrl
        }
    },
    ...(window.$store || {})
}

window.$store.patchInvokedTimes++


// var _wr = function(type) {
//   var orig = history[type];
//   return function() {
//       alert(2)
//     // var rv = orig.apply(this, arguments);
//     // alert('11')
//     console.log('push arg--:',arguments)
//     var e = new Event(type);
//     e.arguments = arguments;
//     window.dispatchEvent(e);
//     return false;
//     // return rv;
//   };
// };
history.pushState = _wr('pushState');
// history.replaceState = _wr('replaceState');
 
// Use it like this:
window.addEventListener('pushState', function(e) {
  console.warn('THEY DID IT AGAIN!');
});


// let oldPushState;
//     ; (function (history) {
//         oldPushState = history.pushState;
//         function hookPushState(state, title, nextUrl){
            
//             console.log(111)
//             let nowTime=Date.now()
//             if(120>=nowTime-timeStampOfClick){
//                 let nowUrl=location.href;
//                 setTimeout(()=>{
//                     console.log('push state args---:',arguments);
//             window.$store.lastClickEvt.preventDefault()
//             window.$store.lastClickEvt.stopImmediatePropagation();
//             window.$store.lastClickEvt.stopPropagation()
//                     // if(location.href!==nowUrl){
//                     //     location.replace(nowUrl)
//                     // }
//                      main.getCurrentUrlEleMap(nowUrl).$historyChanger.set(window.$store.currentClickingElem,nextUrl)
//                 })
                
//             }
            


//             // oldPushState.apply(this,arguments)
//         }

//         history.pushState = function (state, title, nextUrl) {
            
//             hookPushState.apply(history, arguments);
            
            

//         };
    // })(window.history);


if (!window.$store.hasRegisteredVisibleChangeEvt) {
    window.$store.hasRegisteredVisibleChangeEvt = true;
    document.addEventListener('visibilitychange', () => {
        console.clear()
        console.log('visibility changed', window.$store.patchInvokedTimes)
        if (!document.hidden) {
            // location.reload()
            import(window.puppeteer_mode + `?${Math.random()}`)
        }
    })
}







function isPc() {
    return !["Android", "iPhone",
        "SymbianOS", "Windows Phone",
        "iPad", "iPod"].find(s => navigator.userAgent.toUpperCase().includes(s.toUpperCase()))
}



window.main=main;
// setTimeout(()=>{
//     main.startTask(true)
// })