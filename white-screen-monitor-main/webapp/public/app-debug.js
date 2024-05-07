module.exports={
    props:{
        store:Object,
    },
    computed:{
        storeStr(){
            return JSON.stringify(this.store,4,4)
        }
    }
    
}