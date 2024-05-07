var player = require('play-sound')(opts = {})
var fs = require('fs')
let config=require('./businessConfig.js')

let couldPlay=true;
exports.audioWarning = function (path) {
    return false;
    if(!couldPlay){
        return false;
    }
    setTimeout(()=>{
        couldPlay=true;
    },config.COULD_PLAY_AUDIO_INTERVAL)
    couldPlay=false;
    console.log('begin to play '+path)

    // try {
    //     fs.copyFileSync('./audio_backup/foo.mp3', './foo.mp3')
    // } catch (e) { }


    var audio;
    let count = 0;

    let intervalFn=() => {
        let tempAudio;
        // // $ mplayer foo.mp3 
        try{

            var runtimeVars=JSON.parse(fs.readFileSync('./runtime_vars.json','utf-8'))
            console.log('runtimeVars--:',runtimeVars)
            // if(Date.now()-runtimeVars.lastPlayEndTime<18*000){
            //     return false;
            // }

                
            audio = player.play(path, function (err) {
                if(err){
                    console.log('err in playing--:',err)
                }
                setTimeout(() => {
                    count++;
                    console.log('audio play count:', count)
    
                    // if (count >= 4) {
                        // try {
                        //     fs.unlinkSync('./foo.mp3')
                        // } catch (e) {
    
                        // }
    
                        // fs.copyFileSync('./foo.mp3','.')
                        // clearInterval(clock)
                        
                        // try{
                            //process.exit();
                            // audio.kill()
                        // }catch(e){

                        // }
                        
                    // }
                    // runtimeVars.lastPlayEndTime=Date.now();
                    // fs.writeFileSync('./runtime_vars.json',JSON.stringify(runtimeVars,4,4),'utf-8')

                    if(count>=4){

                        console.log('本次播放完毕');
                        tempAudio.kill()
                    }else{
                        intervalFn()
                    }

                    
                },16*1000)
                // console.log('err-----',err)
            })
        }catch(e){
            console.log('e---:',e)

        }
        
        tempAudio = audio;

    }

    // let clock = setInterval(intervalFn, 18000)
    intervalFn()

    // setTimeout(()=>{
    //     // console.log('player---:',player)
    //     // player.pause()
    //     clearTimeout(clock)
    //     audio.kill()
    // },10*1000)



}