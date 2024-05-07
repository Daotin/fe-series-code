(function () {
    window.vueRouter=document.querySelector('#app').__vue__.$router;
    window['SLOW_PAGE_LOG_URL']='https://localhost/api/slow-page/add'
    const DANGEROUS_ROUTES = ['/mine', '/ws-selector', '/select-label'];
    const DANGEROUS_BUTTON_WORDS = ['保存', '删除', '确定', '上移','下移'];
    const DANGEROUS_CLASSES = ['ws-pagination', 'ws-filter-group', 'ws-table__header', 'van-switch', 'el-switch', 'ws-button--primary', 'tag-list-content'];
    const MAX_REQUEST_TIME = 1 * 1000;
    const SLOW_PAGE_LOG_URL = window['SLOW_PAGE_LOG_URL'] || 'https://codebyai.com/api/slow-page/add'
    const currentDate = new Date();
    let TASK_NAME = window.location.href.includes('workbench') ? '移动端' : 'PC端';
    TASK_NAME += currentDate.toLocaleDateString() + ' ' + currentDate.toLocaleTimeString();
    class RequestTimer {
        constructor(waitTime) {
            this.obsevers = [];
            this.timer = null;
            this.waitTime = waitTime;
            this.requestTotalCount = 0;
            this.startTime = 0;
            this.endTime = 0;
        }

        sendEvent() {
            if (this.requestTotalCount === 0) {
                this.obsevers.forEach((observer) => {
                    observer(this.endTime - this.startTime);
                });
                this.obsevers = [];
            } else {
                console.error('发送事件时出现异常, requestTotalCount为:' + this.requestTotalCount + '，期望:0');
            }
        }

        clearTimer() {
            if (this.timer) {
                clearTimeout(this.timer);
                this.timer = null;
            }
        }

        startTimerIfEmpty() {
            if (this.requestTotalCount === 0) {
                this.endTime = +(new Date());
                this.timer = setTimeout(this.sendEvent.bind(this), this.waitTime);
            }
        }

        addObserver(observer) {
            if (this.obsevers.length === 0) {
                this.startTime = +(new Date());
            }
            this.obsevers.push(observer);
            this.clearTimer();
            this.startTimerIfEmpty();
        }

        requestBegin() {
            this.clearTimer();
            this.requestTotalCount++;
        }

        requestEnd() {
            this.requestTotalCount--;
            this.startTimerIfEmpty();
        }
    }

    const requestTimer = new RequestTimer(MAX_REQUEST_TIME);

    let isStopped = true;
    // 初始化 拦截XMLHttpRequest
    function initXMLHttpRequest() {
        let open = XMLHttpRequest.prototype.open;
        let send = XMLHttpRequest.prototype.send;
        XMLHttpRequest.prototype.open = function (...args) {
            let _this = this
            let url = args[1] || '';
            if (!/\/portal$/.test(url)) {
                const startTime = +(new Date());
                let params = '';
                this.send = function (...data) {
                    requestTimer.requestBegin();
                    return send.apply(_this, data)
                }
                this.addEventListener('readystatechange', function () {
                    if (this.readyState === 4) {
                        let detail = '';
                        if (this.status === 200) {
                            const contentType = this.getResponseHeader("Content-Type") || this.getResponseHeader('content-type') || '';//将此连接的Content-Type响应头项赋值到contentType。
                            if (contentType.includes('application/json')) {
                                let responseJson;
                                try {
                                    responseJson = JSON.parse(this.responseText);
                                    const code = responseJson.code;
                                    const success = responseJson.success;
                                    if (!(code === '00000' || (success && code * 1 === 200))) {
                                        const traceId = this.getResponseHeader("x-traceid-header") || '';
                                        detail = JSON.stringify({
                                            response: responseJson,
                                            traceId
                                        });
                                        console.error('网络请求异常:', url, responseJson, traceId);
                                    }
                                } catch (ex) {
                                    console.error(url + '解析结果失败');
                                    return;
                                }
                            }
                        }
                        const useTime = (+new Date()) - startTime;
                        logEventTime('network_load_time', useTime, detail, url, params);
                        requestTimer.requestEnd();
                    }
                }, false);
            }
            return open.apply(this, args);
        }
    }

    function postData(eventName, data = {}) {
        data.route = window.vueRouter.currentRoute.path;
        data.routeUrl = window.location.href;
        data.title = ((window.vueRouter.currentRoute.meta && window.vueRouter.currentRoute.meta.title) || '').replace(/\s/g,'');
        data.type = eventName;
        data.createTime = +(new Date());
        data.taskName = TASK_NAME;
        console.log('postData:', data);
        fetch(SLOW_PAGE_LOG_URL, {
            method: 'POST', // or 'PUT'
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        })
        .then(response => response.json())
        .then(data => {
            // console.log('Success:', data);
        })
        .catch((error) => {
            console.error('Error:', error);
        });
    }

    //event包括page_load_time, click_load_time, network_load_time
    function logEventTime(eventName, useTime,detail = '', url = '', params = '') {
        if (useTime > MAX_REQUEST_TIME) {
            console.warn('请求超时, 事件:' + eventName + ', 用时' + useTime + 'ms, 路由:' + window.vueRouter.currentRoute.path);
        } else if(useTime>=0) {
            console.log('事件:' + eventName + ', 用时' + useTime + 'ms, 路由:' + window.vueRouter.currentRoute.path);
        } else {
            console.error('事件:' + eventName + ', 用时' + useTime + 'ms, 路由:' + window.vueRouter.currentRoute.path);
        }
        if (useTime > MAX_REQUEST_TIME / 2 || (eventName === 'network_load_time' && detail)) {
            postData(eventName, {
                url,
                params,
                detail,
                useTime: useTime
            });
        }
    }

    const pageState = {}
    let interceptGo = false;
    window.history.go = function (target) {
        console.log('调用go:', target);
    }
    window.open = function (url) {
        console.log('忽略跳转:', url);
    }

    function visitVNode(vnode) {
        if (!vnode) return;
        if (vnode.data?.on?.click && vnode.elm) {
            vnode.elm.clickable = true;
        }
        visitVueComponent(vnode.child);
        (vnode.children || []).forEach(visitVNode);
    }

    function visitVueComponent(component) {
        if (!component) return;
        visitVNode(component._vnode);
    }

    function clickItem(ele) {
        if (ele.clickable && !ele.visited) {
            ele.visited = true;
            return new Promise((resolve) => {
                requestTimer.addObserver(resolve);
                //记录慢请求
                ele.dispatchEvent(new Event('click'));
            });
        } else {
            return Promise.resolve();
        }
    }

    function getClickable(ele) {
        if (DANGEROUS_CLASSES.find(className => typeof ele.className === 'string' && ele.className.indexOf(className) >= 0)) {
            return undefined;
        }
        if (ele.nodeName === 'BUTTON' && (DANGEROUS_BUTTON_WORDS.find(text => ele.innerText.includes(text)))) {
            return undefined;
        }
        //设置
        if (ele.nodeName === 'BUTTON' && typeof ele.className === 'string' && ele.className.indexOf('el-button--small') >= 0 && ele.className.indexOf('el-button--text') < 0) {
            return undefined;
        }
        const originChildren = ele.children || [];
        const children = [...originChildren];
        //按zIndex排序，优先点最上层的
        children.sort((a, b) => {
            let bIndex = window.getComputedStyle(b).zIndex;
            if (!bIndex || bIndex === 'auto') {
                bIndex = 0;
            }
            let aIndex = window.getComputedStyle(a).zIndex;
            if (!aIndex || aIndex === 'auto') {
                aIndex = 0;
            }
            return Number(bIndex) - Number(aIndex);
        });
        for (let i = 0; i < children.length; i++) {
            const next = getClickable(children[i]);
            if (next) {
                return next;
            }
        }
        if (ele.clickable && !ele.visited && ele.getBoundingClientRect().width > 0 && ele.getBoundingClientRect().height > 0) {
            //PC端筛选器上的展开v 不能点击，动态组件
            return ele;
        }
        return undefined;
    }

    async function clickPageElements() {
        await new Promise(resolve => {
            setTimeout(resolve, 3000);
        })
        interceptGo = true;
        // let nextTarget;
        const body = document.querySelector('body');
        // eslint-disable-next-line no-constant-condition
        while (!isStopped) {
            const children = [...document.body.children];
            for (let i = 0; i < children.length; i++) {
                visitVueComponent(children[i].__vue__);
            }
            const nextTarget = getClickable(body);
            if (!nextTarget) break;
            const useTime = await clickItem(nextTarget);
            let targetName = (nextTarget.innerText || '');
            if (targetName.length > 10) {
                targetName = targetName.substring(0, 10);
            }
            targetName = targetName.replace(/\s/g,'')
            logEventTime('click_load_time', useTime, targetName);
        }
        interceptGo = false;
    }

    async function processPage(to) {
        console.log('打开页面:', to.path);
        //移除组件内beforeRouteLeave事件
        interceptBeforeRouteLeave();
        const useTime = await new Promise((resolve) => {
            requestTimer.addObserver(resolve);
            window.vueRouter.replace(to);
        });
        logEventTime('page_load_time', useTime);
        interceptBeforeRouteLeave();
        await clickPageElements();
        if (pageState[to.path]) {
            pageState[to.path].visited = true;
        }
    }

    function addNewRoute(to) {
        const url = to.path;
        //客户详情页使用的路由
        if (pageState[url] || DANGEROUS_ROUTES.includes(url) || /\/[a-zA-Z0-9_-]{32}$/.test(url)) {
            return;
        }
        pageState[url] = {visited: false, to}
        console.log('添加一条新路由:', url);
    }

    function interceptRoute() {
        //拦截请求
        window.vueRouter.beforeHooks = [
            (to, from, next) => {
                if (interceptGo) {
                    addNewRoute(to);
                    next(false);
                } else {
                    next();
                }
            },
            ...window.vueRouter?.beforeHooks||[]
        ];
    }

    function interceptWX() {
        if (window.wx && window.wx.invoke) {
            window.wx.invoke = function (methodName, params) {
                console.log('忽略wx.invoke', methodName, params);
            }
        }
    }

    function interceptBeforeRouteLeave() {
        const matched = window.vueRouter.currentRoute.matched;
        if(matched && matched.length>1) {
            const lastMatch = matched[matched.length-1];
            if(lastMatch && lastMatch.components && lastMatch.components.default && lastMatch.components.default.options
                && lastMatch.components.default.options.beforeRouteLeave
                && !lastMatch.components.default.options.beforeRouteLeave.marked){
                console.log('移除了beforeRouteLeave拦截器')
                lastMatch.components.default.options.beforeRouteLeave.marked = true;
                lastMatch.components.default.options.beforeRouteLeave = function (to, from, next) {
                    next();
                }
            }
        }
    }

    async function beginSlowCheck() {
        isStopped = false;
        console.log('启动...');
        await new Promise(resolve => setTimeout(resolve, 3000));
        console.log('拦截http请求...');
        interceptWX();
        initXMLHttpRequest();
        console.log('拦截路由跳转...');
        interceptGo = false;
        interceptRoute();
        interceptBeforeRouteLeave();
        await clickPageElements();
        // eslint-disable-next-line no-constant-condition
        while (!isStopped) {
            const url = Object.keys(pageState).find(page => !pageState[page].visited);
            if (!url) break;
            await processPage(pageState[url].to);
        }
        console.log('所有页面处理完毕');
    }

    window.beginSlowCheck = beginSlowCheck
    beginSlowCheck().then(console.error);
    window.stopSlowCheck = function () {
        console.log('用户主动停止执行。。。');
        isStopped = true;
    }
})();
