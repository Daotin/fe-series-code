module.exports={
    methods:{
        send(key){
            window.wsInstance.send('eval_js://'+this[key])
        }
    },
    data(){
        return {
            cookie:`
            
            ;;;let res={
                action:'SYNC_APP_INFO',
                href:location.href,
                cookie:document.cookie,
                local:{},
                session:{}
            };
            for (let i = 0; i < localStorage.length; i++) {
                var key = localStorage.key(i); 
                res.local[key]=localStorage.getItem(key);
            };
            for (let i = 0; i < sessionStorage.length; i++) {
                var key = sessionStorage.key(i); 
                res.session[key]=sessionStorage.getItem(key);
            };
            
            console.log('res---:',res);
            window.tempVarFunResult=res;

            `,
            userInfo:"localStorage.getItem('userInfo')",
        }
    }
}