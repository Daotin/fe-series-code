

module.exports={
    methods:{
        handleReverseClockerChange(){
            if(!this.reverseSecondClocker.allowRunClock){
                return false;
            }
            if(this.reverseSecondClocker.remainModal<0.1){
                this.$message.error('小于0.1s,不计时')
                this.reverseSecondClocker.remainModal=2.5
                return false;
            }
            console.log('开始计时')
            clearInterval(this.reverseSecondClocker.clock);
            this.reverseSecondClocker.clock=setInterval(()=>{
                this.reverseSecondClocker.remainModal-=(1/60)
                if(this.reverseSecondClocker.remainModal<=0){
                    this.reverseSecondClocker.allowRunClock=false;
                    setTimeout(()=>{
                        this.reverseSecondClocker.allowRunClock=true;
                    })
                    clearInterval(this.reverseSecondClocker.clock);
                    if(window.Notification && Notification.permission !== "denied") {
                        Notification.requestPermission(function(status) {
                            var n = new Notification('时间到', { body: '时间到！' }); 
                        });
                    }
                    this.reverseSecondClocker.remainModal=2.5;
                }
            },1000)
        },
        restartApp(){
            this.$confirm('are you sure?')
            
            .then(()=>{

                fetch('/app/relaunch_app')
                this.$message.success('ok,will reload this page after one seconds')
                setTimeout(()=>{
                    location.reload()
                })
            })
        },
        async fetchAppRunningLogs(logSuccess=false){
            let logRes=await (await fetch('/app/app_log')).json()
            let oldLen=this.logTableData.length;
            if(logRes.status=='success'){
                let d=logRes.data
                this.logTableData=d.reverse();

                // if(oldLen===d.length){}

                logSuccess &&  this.$message.success('refresh success'+(oldLen!==d.length?'':' ,data not changed'))
            }
        },
        async fetchBusinessConfig(){
            let str=await (await fetch('/app/business_config')).text()
            let res=new Function(`let module={};${str};return module.exports;`)()
            let obj={

            }
            for(let i in res){
                if(typeof(res[i])!='function' && 
                !( 'AUDIO_PATH_MAP'.split(' ').includes(i) )
                // !( 'AUDIO_PATH_MAP MP3_FADE_FOLDER_PATH'.split(' ').includes(i) )
                ){
                    obj[i]=res[i]
                }
            }

            this.businessConfig=obj;
        },
        resetSencondClocker(){
            this.pauseSencondClocker()
            this.senondClocker.status='STOPPED'
            this.senondClocker.runningTime=0
        },
        playSencondClocker(){
            this.senondClocker.status='PLAYING'
            this.senondClocker.clocker=setInterval(()=>{
                this.senondClocker.runningTime+=100
            },100)
        },
        pauseSencondClocker(){
            this.senondClocker.status='PAUSED'
            clearInterval(this.senondClocker.clocker)
            this.senondClocker.clocker=null
        },
        playWelcome(){
            fetch('/app/play_welcome')
            this.$message.success('request has been sent')
        },
        cancelSlow3G(){
            this.slow3gRemainTime=5*60*1000
            fetch('/app/slow_3g_end')
            this.isInSlow3G=false
        },  
        useSlow3G(){
            this.slow3gRemainTime=5*60*1000
            let fn=()=>{
                setTimeout(()=>{
                    if(this.slow3gRemainTime>=500){
                        fn()
                    }else{
                        this.slow3gRemainTime=5*60*1000
                    }
                },500)
                this.slow3gRemainTime-=500
            }
            fn()
            // setTimeout(fn,1000)
            fetch('/app/slow_3g')
            this.isInSlow3G=true;
            setTimeout(()=>{
                this.isInSlow3G=false
            },5*60*1000)
        },
        toggleViewLog(){
            this.isWatchingLog=!this.isWatchingLog

            fetch('/app/log')
            if(this.isWatchingLog){
                this.clock=setInterval(()=>{
                    fetch('/app/log')
                },3000)
                this.$message.success('please look at the f12 tool console tab')
            }else{
                clearInterval(this.clock)
                this.clock=null;
            }
        }
    },
    watch:{
        sidebarTabModel(nv){
            sessionStorage.setItem('sidebarTabModel',nv)
        }
    },
    data(){
        return {
            win:window,
            businessConfigDialogVisible:false,
            businessConfig:null,
            logTableData:[],
            slow3gRemainTime:0,
            isInSlow3G:false,
            sidebarTabModel:'remote-debug',
            isWatchingLog:false,
            osInfo:[],
            taskList:[],
            serverStore:null,

            senondClocker:{
                runningTime:0,
                clocker:null,
                status:'STOPPED'//PAUSED PLAYING
            },
            reverseSecondClocker:{
                remainModal:2.5,
                clocker:null,
                allowRunClock:true
            }
        }
    },
    beforeCreate(){
        
    },
    async created(){
        
    },
    async mounted(){
        import('/home/remote-debug.js');
        this.sidebarTabModel=sessionStorage.getItem('sidebarTabModel')||'welcome'

        return false;
//         [].map.call(document.scripts,s=>s.outerHTML.split('src=')[1]?.split('">')[0])
// .filter(s=>s)
// .map(s=>s.replace('\"',''))
    



        let ws=new WebSocket('ws://'+location.origin.split('://')[1]+'/info')
        ws.onmessage=({data})=>{

            data=JSON.parse(data)

            if(data.type=='OS_INFO'){
                this.osInfo=[{
                    ...data,
                    appLaunchTime:this.osInfo[0]?.appLaunchTime,
                    taskRunnedLoopCount:this.osInfo[0]?.taskRunnedLoopCount,
                    expectedDownSpeed:window?.navigator?.connection?.downlink+'MB/s'
                }]
            }
            if(data.type=='SERVER_STORE'){
                if( this.osInfo[0]){

                    this.taskList=data.tasks
                    this.serverStore=data;

                    this.osInfo[0].appLaunchTime=data.appLaunchTime
                    this.osInfo[0].taskRunnedLoopCount=data.taskRunnedLoopCount
                }
            }

            
        }
        
        this.clock=null;
        console.log('mounteddddddddddd')
        let store=await (await fetch('/app/store')).json()
        console.log('store--:',store)
        if(store.slow3g){
            this.useSlow3G()
        }

        this.fetchAppRunningLogs()

        this.fetchBusinessConfig()

        if(location.hostname=='localhost'){
            window.APP=this;
        }

    }
}