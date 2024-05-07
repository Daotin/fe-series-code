;(async function(){
  let loadedComponents = [];
let pendingVMFileLoaders = {

}
var VueHacker;

    let _loadJS = (function () {

        let cacheedScriptUrls = []
        return function (url, wrapperInIIFE = false, win, cache = true) {
          return new Promise(async (resolve) => {
    
            if (cacheedScriptUrls.includes(url)) {
              resolve();
              return
            }
    
    
            let doc = win ? win.document : document;
            let targetNode = doc.body;
    
            var scriptTag = doc.createElement("script");
    
            
              scriptTag.src = url;
              scriptTag.type = "text/javascript";
    
              scriptTag.onload = () => {
                cache && cacheedScriptUrls.push(url)
                resolve();
              };
    
              targetNode.appendChild(scriptTag);
            
          });
        };
      })();



      

function setVueHackerOptionForReact(vm, obj) {
  vm.VueHackerOptions = {
    _uid: VueHacker.u.guid(),
    name: Object.getPrototypeOf(vm).constructor.name,
    ...obj
  };
}
function addVM2VMInstance(vm) {
  if (vm.VueHackerOptions.name in VueHacker.s.vmInstances) {
    VueHacker.s.vmInstances[vm.VueHackerOptions.name] = [
      VueHacker.s.vmInstances[vm.VueHackerOptions.name]
    ];
    VueHacker.s.vmInstances[vm.VueHackerOptions.name].push(vm);
  } else {
    VueHacker.s.vmInstances[vm.VueHackerOptions.name] = vm;
  }
}
function createReactComponentFromVMDefine(res) {
  VueHacker.s.tempVar = res;

  return VueHacker.s.babelEval(`<VueHacker.s.tempVar />`);
}
function mountReactInstance2Vue(res, el, vueVM) {
  let $el = vueVM ? vueVM.$refs[el] || vueVM.$el : el;
  res = "$el" in (res || {}) ? res.vm : res;

  if (!res) {
    VueHacker.throwExcepAlert("非法的react挂载对象");
    return false;
  }

  res = VueHacker.s.reacMixinComposer(
    res,
    class {
      componentWillUnmount() {
        VueHacker.s.destroyVMInstance(this);
      }
      componentDidMount() {
        if (vueVM) {
          vueVM.$children.push(this);
          this.$parent = vueVM;
          if (!("rInstance" in vueVM)) {
            vueVM.rInstance = this;
          } else {
            vueVM.rInstance = [].concat(vueVM.rInstance).concat(this);
          }

          if (typeof vueVM.bootstrapFinished == "function") {
            vueVM.bootstrapFinished();
          }
          vueVM.isReactMounted = true;
          vueVM.$emit("ReactMounted");
        }
        setVueHackerOptionForReact(this, {
          $el: $el
        });
        addVM2VMInstance(this);
        VueHacker.renderByScanDom(ReactDOM.findDOMNode(this),this)
      }
    }
  );

  ReactDOM.render(createReactComponentFromVMDefine(res), $el);
}
function findVMInstanceById(id) {
  let result = null;
  for (let i in VueHacker.s.vmInstances) {
    let obj = []
      .concat(VueHacker.s.vmInstances[i])
      .find(item => item.VueHackerOptions._uid == id);
    if (obj) {
      result = obj;
    }
  }
  return result;
}



  let u={
    baseUrl(s) {
      return s.split('/').reverse().slice(1).reverse().join('/') + '/'
    },
    formatTime(date, hmdOnly = false) {
      date = date || new Date();
      let t = date.getTime();
      if (typeof t == "number" && window.isNaN(t)) {
        return "";
      }

      let d = new Date(date);

      var yyyy = d.getFullYear().toString();
      var mm = (d.getMonth() + 1).toString(); 
      var dd = d.getDate().toString();
      var hh = d.getHours().toString();
      var ii = d.getMinutes().toString();
      var ss = d.getSeconds().toString();

      let res =
        yyyy +
        "-" +
        (mm[1] ? mm : "0" + mm[0]) +
        "-" +
        (dd[1] ? dd : "0" + dd[0]);
      if (!hmdOnly) {
        res +=
          " " +
          (hh[1] ? hh : "0" + hh[0]) +
          ":" +
          (ii[1] ? ii : "0" + ii[0]) +
          ":" +
          (ss[1] ? ss : "0" + ss[0]);
      }

      return res;
    }
  }


  

      let _httpGet=function(url, errorCb) {

        let randomStr = "jsx html css less sass scss js json"
          .split(" ")
          .find((s) => url.endsWith("." + s))
          ? u.formatTime(null, true)
          : Math.random();
        errorCb =
          errorCb ||
          function () {
            alert("加载" + url + "错误");
          };
        return new Promise((resolve, reject) => {
          var httpRequest = new XMLHttpRequest(); 
          httpRequest.open(
            "GET",
            url + "?r=" + (randomStr),
            true
          ); 
          httpRequest.send(); 
          /**
           * 获取数据后的处理程序
           */
          httpRequest.onreadystatechange = function () {
            if (httpRequest.status != 200) {
              if (httpRequest.readyState == 4) {
                reject({
                  httpRequest: httpRequest,
                  message: "加载" + url + "错误",
                });
  
                
              }
  
  
            } else {
              if (httpRequest.readyState == 4) {
                resolve(httpRequest.responseText);
              }
            }
          };
        });
      }



    
    function handleEs6Template(strings, restArgs) {
      if(strings.length>1000){
          throw '一个组件的模板里最多只允许使用1000个es6模板字符串定界符'
      }
      let res = ''
      for (let i = 0; i < 1000; i++) {
          res += (strings[i] || '') + (restArgs[i] || '')
          if (!strings[i] && !restArgs[i]) {
              break;
          }
      }
      return res
    }
    
    



  VueHacker={
    throwExcepAlert:(str) => {
      window["aler" + "t"](str);
    },
    engineSettings:{
      jsxDefineSplitStr: "module.exports",
      tplDirPath:'./',
      vmDirPath:'./',
      babelMethodsDefineMatchReg: /VueHacker\(\{([\s\S]*)\}\)\(\)/,
      vueTemplateDefineMatchReg: /vueTemplate: \(([\s\S]*)\),/,
    },
    u:{
      ...u,
      isCustomComp(name) {
        // console.log('name--:',name)
        let browserBuiltInTags = (
          "html,body,base,head,link,meta,style,title," +
          "address,article,aside,footer,header,h1,h2,h3,h4,h5,h6,hgroup,nav,section," +
          "div,dd,dl,dt,figcaption,figure,picture,hr,img,li,main,ol,p,pre,ul," +
          "a,b,abbr,bdi,bdo,br,cite,code,data,dfn,em,i,kbd,mark,q,rp,rt,rtc,ruby," +
          "s,samp,small,span,strong,sub,sup,time,u,var,wbr,area,audio,map,track,video," +
          "embed,object,param,source,canvas,script,noscript,del,ins," +
          "caption,col,colgroup,table,thead,tbody,td,th,tr," +
          "button,datalist,fieldset,form,input,label,legend,meter,optgroup,option," +
          "output,progress,select,textarea," +
          "details,dialog,menu,menuitem,summary," +
          "content,element,shadow,template,blockquote,iframe,tfoot"
        )
          .split(",")
          .concat(
            `svg,animate,circle,clippath,cursor,defs,desc,ellipse,filter,font-face," +
          "foreignObject,g,glyph,image,line,marker,mask,missing-glyph,path,pattern," +
          "polygon,polyline,rect,switch,symbol,text,textpath,tspan,use,view`.split(
              ","
            )
          );
        let vueBuiltInTags = "router-link router-view slot component transition keep-alive transition-group".split(
          " "
        );
        return (
          !browserBuiltInTags.includes(name) &&
          !vueBuiltInTags.includes(name) &&
          !name.startsWith('el-') &&
          !Boolean(
            (name =>
              new RegExp(
                "^[a-zA-Z][\\-\\.0-9_" +
                /a-zA-Z\u00B7\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u037D\u037F-\u1FFF\u200C-\u200D\u203F-\u2040\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD/
                  .source +
                "]*$"
              ).test(name) &&
              !name.includes("--") &&
              Object.keys(
                Object.getPrototypeOf(new Vue().$options.components)
              ).find(key =>
                [key, name]
                  .map(key => key.replace(/-/gi, "").toLowerCase())
                  .every((k, i, a) => a[0] == k)
              ))(name)
          )
        );
      },
  
      dealyExec: (fn = () => { }, dealy = 0, returnPromise = true) => {
        if (returnPromise) {
          return new Promise((resolve) => {
            setTimeout(async () => {
              let res = await fn();
              resolve(res)
            }, dealy)
          })
        }
        return () => {
          setTimeout(fn, dealy)
        }
  
      },
  
      poll(fn, callback, errback, timeout, interval) {
        var endTime = Number(new Date()) + (timeout || 20000);
        interval = interval || 100;
        (function p() {
          if (fn()) {
            callback();
          }
  
          else if (Number(new Date()) < endTime) {
            setTimeout(p, interval);
          }
  
          else {
            errback(new Error("timed out for " + fn + ": " + arguments));
          }
        })();
      },
      copyObj(obj) {
        var cloneObj;
        //当输入数据为简单数据类型时直接复制
        if (obj && typeof obj !== "object") {
          cloneObj = obj;
        }
        //当输入数据为对象或数组时
        else if (obj && typeof obj === "object") {
          //检测输入数据是数组还是对象
          cloneObj = Array.isArray(obj) ? [] : {};
          for (let key in obj) {
            if (obj.hasOwnProperty(key)) {
              if (obj[key] && typeof obj[key] === "object") {
                //若当前元素类型为对象时，递归调用
                cloneObj[key] = VueHacker.u.copyObj(obj[key]);
              }
              //若当前元素类型为基本数据类型
              else {
                cloneObj[key] = obj[key];
              }
            }
          }
        }
        return cloneObj;
      },
  
      appendCssStr(str, baseUrl = null) {
        // console.log('baseUrl---:', baseUrl)
        if (baseUrl) {
          str = str.replaceAll('url(./', 'url(' + baseUrl)
        }
        var style = window.document.createElement("style");
        style.type = "text/css";
        style.innerHTML = str;
        document
          .getElementsByTagName("HEAD")
          .item(0)
          .appendChild(style);
      },
  
      guid() {
        return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (
          c
        ) {
          var r = (Math.random() * 16) | 0,
            v = c == "x" ? r : (r & 0x3) | 0x8;
          return v.toString(16);
        });
      },
  
      setDataByModel: function ($scope, modelStr, val) {
        var arr = modelStr.split("."),
          len = arr.length;
        if (len === 1) {
          $scope[arr[0]] = val;
        } else if (len > 1) {
          var ns = arr,
            obj = $scope;
          for (var i = 0; i < len - 1; i++) {
            var key = ns[i];
            obj = obj[key];
          }
          
  
          obj[ns[len - 1]] = val;
        }
      },
      getDataByModel($scope, modelStr, otherWiseVal) {
        otherWiseVal = otherWiseVal || null;
  
        if (!$scope) {
          return otherWiseVal;
        }
  
        var arr = modelStr.split("."),
          len = arr.length,
          result = $scope;
        if (len === 1) {
          
          return $scope.hasOwnProperty(arr[0]) ? $scope[arr[0]] : otherWiseVal;
        } else if (len > 1) {
          var isError = false;
          for (var i in arr) {
            if (typeof result[arr[i]] === "undefined") {
              isError = true;
              break;
            } else {
              result = result[arr[i]];
            }
          }
          if (isError) {
            return otherWiseVal;
          } else {
            return result;
          }
        } else if (len === 0) {
          return otherWiseVal;
        }
      }
    },
    s:{
      httpGet:_httpGet,
      globalMixins:{

        data() {
          
          return {
            
            isReactMounted: false
          };
        },
        props: {
          vm: {
            type: Object,
            default: null
          }
        },
        methods: {
          
          async callWithLoading(method, loadingKey, args = []) {
            this[loadingKey] = true;
            try {
              await method.apply(this, args);
            } catch (e) {
            } finally {
              this[loadingKey] = false;
            }
          },
          getSelfTpl(tplId) {
            let res = VueHacker.s.tplCache[this.VueHackerOptions.name][tplId];
            if (!res) {
              VueHacker.throwExcepAlert("模板" + tplId + "不存在");
            }
            return res;
          },
          callBabel(funName, ...restArgs) {
            let babelMethods = this.babelMethods;
            if (babelMethods && babelMethods[funName]) {
              return babelMethods[funName].apply(this, [
                this.VueHackerOptions.name,
                ...restArgs
              ]);
            } else {
              console.warn(
                this.VueHackerOptions.name + "的babelMethods的" + funName + "不存在"
              );
              return null;
            }
          }
        },
        created() {
          this.babelMethods = VueHacker.u.getDataByModel(
            VueHacker.vm,
            this.VueHackerOptions.name
          ).babelMethods;
      
          let result = this.VueHackerOptions.vmDefine;
      
          if ("styles" in result) {
            if (typeof result.styles == "function") {
              this.cv = this.cv || {};
              result.styles = result.styles.call(result, this);
            }
            let newStyleObj = VueHacker.s.transformStyles(
              result.styles,
              this.VueHackerOptions.name
            );
      
      
            let cssStr = "";
            for (var i in newStyleObj) {
              cssStr +=
                "." + (i.endsWith("&") ? i.substring(0, i.length - 1) : i) + "{";
      
              for (var j in newStyleObj[i]) {
                cssStr += j + ":" + newStyleObj[i][j] + ";";
              }
      
              cssStr += "}";
            }
      
            VueHacker.u.appendCssStr(cssStr);
          }
        },
        beforeDestroy() {
          VueHacker.s.destroyVMInstance(this);
          //删除自身的vm实例
        },
        async mounted() {
      
          
      
          addVM2VMInstance(this);
      
          if ("bootstrap" in (this.babelMethods || {})) {
            let res;
            if (
              Object.prototype.toString
                .call(this.babelMethods.bootstrap)
                .toLocaleLowerCase()
                .includes("async")
            ) {
              res = await this.callBabel("bootstrap");
            } else {
              res = this.callBabel("bootstrap");
            }
            let vueVM = this;
            if (res != null) {
      
              if(!Array.isArray(res)){
                res=[res]
              }
              res.forEach((row)=>{
                mountReactInstance2Vue(row, row.$el, vueVM);
              })
              
            }
            
          }
          
      
          let targetElClassName = this.VueHackerOptions.name.split(".").join("--");
          
          this.$el.classList.add(targetElClassName);
          
          if (!this.VueHackerOptions.loadedComponents.includes(this.VueHackerOptions.name)) {
            this.VueHackerOptions.loadedComponents.push(this.VueHackerOptions.name);
          }
      
      

          // VueHacker.renderByScanDom(this.$el,this)
      
      
         
      
      
        }
      },
      reacMixinComposer: (ComposedComponent, Mixin) =>
        class extends React.Component {
          constructor(props) {
            super(props);
            Object.getOwnPropertyNames(Mixin.prototype).forEach((func) => {
              if (func != "constructor")
                ComposedComponent.prototype[func] = Mixin.prototype[func];
            });
            VueHacker.s.tempVar = ComposedComponent;
            this.composed = VueHacker.s.babelEval(
              `<VueHacker.s.tempVar {...VueHacker.s.tempVar.props} {...VueHacker.s.tempVar.state} />`
            );
          }
          render() {
            return this.composed;
          }
        },
        hasModifierInTagName(name, modifier) {
          return (
            name.endsWith(".." + modifier) || name.includes(".." + modifier + "..")
          );
        },
        isReactVM(vm) {
          return "_reactInternalFiber" in vm;
        },
        isVueVM(vm) {
          return vm["_isVue"] == true;
        },
        vmTypesJudgeArr: "isReactVM isVueVM".split(" "),
        calculateVMTypeJudgeMethodName: (vm) =>
          VueHacker.s.vmTypesJudgeArr.find((key) => VueHacker.s[key](vm)),
        destroyVMInstance(vm) {
          delete vm.rInstance;
          let shouldDestroyedVMName = vm.VueHackerOptions.name;
          VueHacker.s.vmTypesJudgeArr
            .filter((m) => m != VueHacker.s.calculateVMTypeJudgeMethodName(vm))
            .forEach((methodName) => {
              (vm.$children || [])
                .filter((node) => VueHacker.s[methodName](node))
                .forEach((node) => {
                  if (VueHacker.s.isReactVM(node)) {
                    ReactDOM.unmountComponentAtNode(node.VueHackerOptions.$el);
                  }
                  VueHacker.s.destroyVMInstance(node);
                });
            });
      
          if (!Array.isArray(VueHacker.s.vmInstances[shouldDestroyedVMName])) {
            delete VueHacker.s.vmInstances[shouldDestroyedVMName];
          } else {
            VueHacker.s.vmInstances[shouldDestroyedVMName].forEach((vm) => {
              let uid = vm.VueHackerOptions._uid,
                index = VueHacker.s.vmInstances[shouldDestroyedVMName].findIndex(
                  (item) => item.VueHackerOptions._uid == uid
                );
              if (index > -1) {
                VueHacker.s.vmInstances[shouldDestroyedVMName].splice(index, 1);
              }
            });
            if (VueHacker.s.vmInstances[shouldDestroyedVMName].length == 0) {
              delete VueHacker.s.vmInstances[shouldDestroyedVMName];
            }
          }
        },
        collectCompByTpl(tpl, tplName) {

          let collectCompKeysResult = [];
          let div = document.createElement("div");
          div.innerHTML = tpl;
          div.querySelectorAll("*").forEach((node) => {
            let nodeName = node.tagName.toLowerCase();
            if (VueHacker.u.isCustomComp(nodeName)) {
              collectCompKeysResult.push({
                node: node,
                nodeName,
              });
            }
            if (nodeName == 'template') {
              collectCompKeysResult = collectCompKeysResult.concat(VueHacker.s.collectCompByTpl(node.innerHTML))
            }
          });
          collectCompKeysResult = [...new Set(collectCompKeysResult)];
          return collectCompKeysResult;
        },
        babelEval(jsxStr, useBabel = true) {
          jsxStr = `(VueHacker.s.tempVar=${jsxStr})`;
      
          if (useBabel) {
            var scri = document.createElement("script");
            scri.type = "text/babel";
            scri.innerHTML = jsxStr;
            var div = document.createElement("div");
            div.appendChild(scri);
            window.babelTransform(div.querySelectorAll("script"));
          } else {
            window.eval(jsxStr);
          }
      
          return VueHacker.s.tempVar;
        },
        vm(tplName, returnInstance = true) {
          let tplNameArr = tplName.split('/'), path = null;
          if (tplNameArr.length > 1) {
            tplName = tplNameArr[tplNameArr.length - 1]
            path = tplNameArr.slice(0, tplNameArr.length - 1).join('/') + '/'
          }
          let result = new Promise(async (resolve, reject) => {
            let loadTplFun = VueHacker.s.loadTpl(tplName, path),
              loadTplPromises = [loadTplFun],
              loadVmPromises = [VueHacker.s.loadVM(tplName, false, path)],
              comps = {},
              arr = tplName.split("."),
              collectedMixins = [],
              [vmConfig] = await Promise.all(loadVmPromises);
      
            await loadTplFun.then((res) => {
              vmConfig.components = VueHacker.s
                .collectCompByTpl(res, tplName)
                .map((item) => item.nodeName);
              return res;
            });
      
            if (
              Array.isArray(vmConfig.components) &&
              vmConfig.components.length > 0
            ) {
              loadTplPromises = loadTplPromises.concat(
                vmConfig.components.map((key) => VueHacker.s.loadTpl(key))
              );
      
              loadVmPromises = loadVmPromises.concat(
                vmConfig.components.map((key) => VueHacker.s.loadVM(key, false))
              );
            }
            loadTplPromises.slice(1).forEach((prom) => {
              prom.then((tplRes) => {
                return tplRes;
              });
            });
      
            let loadTplPromisesRes = await Promise.all(loadTplPromises);
            let [tpl, ...restTplReqs] = loadTplPromisesRes;
            loadVmPromises.forEach((prom, index) => {
              prom.then(async (vmConfigRes) => {
                let _uid = VueHacker.u.guid();
                vmConfigRes.mixins = vmConfigRes.mixins || [];
                vmConfigRes.VueHackerOptions = {
                  ...(vmConfigRes.VueHackerOptions || {}),
                  loadVmPromises: loadVmPromises,
                  loadedComponents: loadedComponents,
                  _uid: _uid,
                  vmDefine: VueHacker.u.copyObj(vmConfigRes),
                  name: vmConfigRes.name,
                  defaultTpl: loadTplPromisesRes[index],
                  components: VueHacker.s
                    .collectCompByTpl(loadTplPromisesRes[index])
                    .map((item) => item.nodeName),
                };
                vmConfigRes.mixins = [
                  VueHacker.s.globalMixins,
                  {
                    data() {
                      return {
                        VueHackerOptions: vmConfigRes.VueHackerOptions,
                      };
                    },
                  },
                ].concat(vmConfigRes.mixins);
                return vmConfigRes;
              });
            });
            let restVMReqs = (await Promise.all(loadVmPromises)).slice(1);
      
            if (Array.isArray(vmConfig.components)) {
              vmConfig.components.forEach((compName, idx) => {
                comps[compName] = {
                  template: restTplReqs[idx] || '<div></div>',
                  ...restVMReqs[idx],
                };
              });
            }
      
            
            let obj = {
              
              ...vmConfig,
              template: vmConfig.template || tpl || '<div></div>',
              components: comps,
            };
      
            
            if (window.$store) {
              obj.store = window.$store;
            }
      
      
            let resolveRes=returnInstance ? new (Vue.extend(obj))() : obj;
            for (let k in obj.components) {
              let compDefine=(await VueHacker.s.vm(k, false))

              obj.components[k].components =
              compDefine.components || {};

              // if(returnInstance){
              //   let 
              //   obj.components[k].components
              // }
              
            }
      
            resolve(resolveRes);
          });
          result.$$mount = function (targetNode,$parent) {

            
            return new Promise(async (resolve) => {
              let instance = await this;
      
              let fun = VueHacker.s.mountVMInstance2DomNode;
      
              fun(targetNode, instance,$parent);
              fun.instance=instance;
              resolve(fun);
            });
          };
          return result;
        },
        mountVMInstance2DomNode(targetNode, instance,$parent) {
          if (!(targetNode instanceof HTMLElement)) {
            
            try {
              targetNode = document.querySelector(targetNode);
            } catch { }
          }
          
          instance.$mount(targetNode);
          if($parent){
            instance.$parent=$parent
          }
        },
        tplCache: {},
        vmCache: {},
        vmInstances: {},
        tempVar: null,
        async useCompData(compName, ...filteredKeys) {
          await VueHacker.s.vm(compName, false)
          let res = VueHacker.vm[compName.split('..')[0]].data.call(window)
          if (filteredKeys.length === 0) {
            return res;
          } else {
            let result = {},
              arr = [].concat(filteredKeys).flat();
            arr.forEach((key) => {
              if (!(key instanceof RegExp)) {
                result[key] = VueHacker.u.copyObj(res[key])
              }
      
            })
            arr.filter((s) => s instanceof RegExp).forEach((reg) => {
              for (let i in res) {
                if (reg.test(i)) {
                  result[i] = VueHacker.u.copyObj(res[i])
                }
              }
            })
            return result;
          }
        },
        loadVMJsFile(fileName, vmName, useSingleFileVM = false, vmFilePath) {
          let tempVMName = vmName;
          let isCommon = fileName != vmName;
          vmName = vmName.split(".").reverse()[0];
          return new Promise(async (resolve, reject) => {
      
            let res = VueHacker.s.vmCache[fileName] || null;
      
      
            if (!res) {
              let path = (vmFilePath || VueHacker.engineSettings.vmDirPath) + fileName + ".js";
      
      
              if (!(path in pendingVMFileLoaders)) {
                pendingVMFileLoaders[path] = VueHacker.s.httpGet(path)
              } else {
      
                setTimeout(() => {
                  delete pendingVMFileLoaders[path]
                })
      
              }
      
              res = await pendingVMFileLoaders[path];
      
            }
            let reg = new RegExp(`${VueHacker.engineSettings.jsxDefineSplitStr}`, "gi");
      
            let resArr = res.split(VueHacker.engineSettings.jsxDefineSplitStr);
            if (resArr.length == 1) {
              VueHacker.throwExcepAlert(fileName + "未对外导出东西，请检查代码");
            }
            let evalStr =
              `let s` +
              resArr.slice(1).join(VueHacker.engineSettings.jsxDefineSplitStr) +
              ";VueHacker.vm['" +
              fileName +
              `']=s;`;
      
            try {
              eval(evalStr);
            } catch (e) {
              console.error("eval error--:", e, evalStr);
              console.trace();
            }
      
            let jsxStr =
              (resArr[0].match(VueHacker.engineSettings.babelMethodsDefineMatchReg) ||
                [])[1] || null;
      
            if (jsxStr) {
              let tplInSingleFileVM =
                (jsxStr.match(VueHacker.engineSettings.vueTemplateDefineMatchReg) ||
                  [])[1] || null;
              if (tplInSingleFileVM) {
                jsxStr = jsxStr.replace(
                  VueHacker.engineSettings.vueTemplateDefineMatchReg,
                  ""
                );
              }
      
              let tempVar = VueHacker.s.babelEval("{" + jsxStr + "}");
              let isMultipleVMJsxDefine = Object.keys(tempVar).every(
                (key) => "object" == typeof VueHacker.s.tempVar[key]
              ),
                injectJsxMethodsForVm = (obj, vmK) => {
                  vmK = vmK || vmName;
      
                  if (isCommon) {
                    console.warn("isCommon--:", tempVMName.split(".")[0] + "." + vmK);
                  }
                  let vmKey = isCommon
                    ? tempVMName.split(".")[0] + "." + vmK
                    : vmName;
                  VueHacker.u.setDataByModel(
                    VueHacker.vm,
                    vmKey + ".babelMethods",
                    VueHacker.u.getDataByModel(VueHacker.vm, vmKey + ".babelMethods") || {}
                  );
                  for (var i in obj) {
                    let newFun = VueHacker.s.babelEval(obj[i]);
      
                    VueHacker.u.setDataByModel(
                      VueHacker.vm,
                      vmKey + ".babelMethods." + i,
                      newFun
                    );
      
                    
                  }
                };
      
              setTimeout(() => {
                //不是app.开头的且在文件头部使用defineVueTemplate的
                if (!isCommon && tplInSingleFileVM && useSingleFileVM) {
                  VueHacker.u.setDataByModel(
                    VueHacker.vm,
                    vmName + ".template",
                    tplInSingleFileVM
                      .replace(/\$\$\$/gi, "@")
                      .replace(/\$\$/gi, ":")
                      .replace(/\{\/\*/gi, "<!--")
                      .replace(/\*\/\}/gi, "-->")
                  );
                }
                if (isMultipleVMJsxDefine) {
                  for (var i in tempVar) {
                    injectJsxMethodsForVm(tempVar[i], i);
                  }
                } else {
                  injectJsxMethodsForVm(tempVar);
                }
              });
            }
      
            VueHacker.s.vmCache[fileName] = res;
      
      
      
            setTimeout(() => {
              resolve(res);
            });
          });
        },
        handleRootElWithVIf(node) {
          let nodeName = node.nodeName.toLowerCase(),
            nodeInnerStr = node.innerHTML,
            firstEl = node;
          if (nodeName == "script") {
            var firstTagHalfStr =
              node.innerText
                .replace(/<!--[\w\W\r\n]*?-->/gim, "")
                .replace(/(\n+)|(\r+)/g, "")
                .trim()
                .split(">")[0] + "/>";
            var div = document.createElement("div");
            div.innerHTML = firstTagHalfStr;
            firstEl = div.querySelector("*");
          }
          if (firstEl.getAttribute("v-if") != null) {
            nodeInnerStr =
              "<" +
              firstEl.nodeName +
              ">" +
              nodeInnerStr +
              "</" +
              firstEl.nodeName +
              ">";
          }
          return nodeInnerStr;
        },
        getTplByCache(tplFileName, isEndsWithDotJsx, tplFilePath = null) {
          return new Promise(async (resolve, reject) => {
      
            let res = VueHacker.s.tplCache[tplFileName] || null;
      
            //类似VueHacker.async这样的组件，app这个key本身就存在于cache里，app.html却没有加载
            if (
              !res
            ) {
              let path = (tplFilePath || VueHacker.engineSettings.tplDirPath) + tplFileName + ".html";
      
              if (isEndsWithDotJsx) {
                let vmRes = await VueHacker.s.loadVM(tplFileName + '..jsx', false,tplFilePath || VueHacker.engineSettings.tplDirPath)
               
                resolve({
                  [tplFileName]: vmRes.template || '<div></div>'
                });
              } else {
                try {
                  res = await VueHacker.s.httpGet(path);
                  
      
                  let div = document.createElement("div");
                  div.innerHTML = res;
                  let tplMap = {},
                    allScrs = div.querySelectorAll("script");
                  
      
                  if (allScrs.length == 0) {
                    tplMap[tplFileName] = VueHacker.s.handleRootElWithVIf(div);
                  } else {
                    allScrs.forEach((item) => {
                      if ((item.type = "text/template")) {
                        tplMap[item.id] = VueHacker.s.handleRootElWithVIf(item);
                      }
                    });
                  }
                  VueHacker.s.tplCache[tplFileName] = window.lodash.mergeWith(
                    {},
                    VueHacker.s.tplCache[tplFileName] || {},
                    tplMap
                  );
                  resolve(VueHacker.s.tplCache[tplFileName]);
                } catch (e) {
                  console.warn("e--:", e);
                  VueHacker.throwExcepAlert("加载" + path + "失败!");
                }
              }
      
              
            } else {
              resolve(res);
            }
          });
        },
        loadTpl(tplName, path = null) {
          let isEndsWithDotJsx = VueHacker.s.hasModifierInTagName(
            tplName.toLowerCase(),
            "jsx"
          );
          tplName = tplName.split("..")[0];
      
          return new Promise(async (resolve, reject) => {
            let fileName = VueHacker.s.getFileNameByExpr(tplName);
            let resolveTpl =
              (VueHacker.u.getDataByModel(VueHacker.s.tplCache, fileName) || {})[
              tplName.split(".").reverse()[0]
              ] || null;
            if (resolveTpl) {
              resolve(resolveTpl);
            } else {
      
              let map = await VueHacker.s.getTplByCache(fileName, isEndsWithDotJsx, path),
                n = tplName.split(".").slice(-1);
      
              try {
                resolveTpl = map[n];
              } catch (e) {
                VueHacker.throwExcepAlert("加载组件" + n + "失败");
      
                resolveTpl = null;
              }
              resolve(resolveTpl);
      
            }
          });
        },
        getFileNameByExpr(expr) {
          let fileName = expr.split(".").slice(0, -1).join(".");
          if (expr.split(".").filter((str) => str.trim() != "").length < 2) {
            fileName = expr;
          }
          return fileName;
        },
        loadVM(vmName, isMixin = false, path = null) {
          // alert(vmName)
          let isEndsWithDotJsx = VueHacker.s.hasModifierInTagName(
            vmName.toLowerCase(),
            "jsx"
          );
      
      
          let outerKeyInVmName = vmName.split(".")[0];
      
          if (
            outerKeyInVmName in VueHacker.vm &&
            VueHacker.s.hasModifierInTagName(vmName, "tpl-only")
          ) {
            return new Promise((resolve) => {
              let res = {
                name: vmName.split("..")[0],
      
                props: ["vm"],
              };
              if (!isMixin) {
                VueHacker.vm[outerKeyInVmName][
                  vmName.split("..")[0].split(".").slice(1).join(".")
                ] = res;
              }
      
              resolve(res);
            });
          }
      
          vmName = vmName.split("..")[0];
      
          return new Promise(async (resolve, reject) => {
            let result = window.lodash.cloneDeep(
              VueHacker.u.getDataByModel(VueHacker.vm, vmName)
            );
            if (result) {
            } else {
              let fileName = VueHacker.s.getFileNameByExpr(vmName);
      
              
              await VueHacker.s.loadVMJsFile(fileName, vmName, isEndsWithDotJsx, path);
      
              let vmConfig = window.lodash.cloneDeep(
                VueHacker.u.getDataByModel(VueHacker.vm, vmName)
              );
      
              result = vmConfig;
              
            }
      
            if (!result) {
              VueHacker.throwExcepAlert(
                "加载" +
                vmName +
                "失败，请检查文件名或者html文件中对应的模板id是否正确"
              );
              return false;
            }
            result.name = vmName;
      
            let mixins = []
              .concat(result.mixins)
              .flat()
              .filter((s) => typeof s == "string");
            if (mixins.length > 0) {
              result.mixins = await Promise.all(
                mixins.map((s) => VueHacker.s.loadVM(s, true))
              );
            }
      
            resolve(result);
          });
        },
    }
  }

  // VueHacker=VueHacker;
  VueHacker.vm=VueHacker.s.vm;
  


  'html'.split(' ').forEach((k)=>{
      VueHacker[k]=(strings, ...restArgs) =>handleEs6Template(strings, restArgs)
  });



    let framePath=(document.currentScript.src).split('?')[0].split('/').slice(0,-1).join('/')


    await Promise.all([
      _loadJS(`http://jpillora.com/xhook/dist/xhook.min.js`),
      _loadJS(`vue2.js`),
      // _loadJS(framePath+'/deps/vue.min.js'),
      _loadJS('lodash.min.js'),
      _loadJS('element/element.js'),
      // _loadJS('https://unpkg.com/element-ui/lib/index.js'),
      // _loadJS(framePath+'/deps/react.development.js'),
      // _loadJS(framePath+'/deps/babel.min.js'),
      // _loadJS('https://cdn.jsdelivr.net/npm/lodash@4.17.21/lodash.min.js'),
      // _loadJS(framePath+'/deps/lodash.min.js'),
      // _loadJS(framePath+'/deps/react-dom.development.js')
    ])


    window.lodash=window._;


    


    VueHacker.renderByScanDom=(target=window.document,$parent)=>{
      let targetNodes=target.querySelectorAll('[data-vue-app]');
      targetNodes.forEach(async (node)=>{
        let path=node.getAttribute('data-vue-app');
        let tmp=await VueHacker.s.vm(path).$$mount(node,$parent)
        // let tmp=await VueHacker.s.vm(path+'..jsx').$$mount(node,$parent)
        if($parent){
          if(!$parent.$children){
            $parent.$children=[]
          }
          $parent.$children.push(tmp.instance)
          
        }
        
        
      })
    }

    
    window.addEventListener('load',()=>{
      setTimeout(()=>{
        VueHacker.renderByScanDom()
      })
      
    })
    



  if(location.hostname=='localhost'){
    window.VueHacker=VueHacker;
  }
    

    
})();