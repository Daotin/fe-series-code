const {

    PROD_WEBSITE_HOST,
    TESTING_WEBSITE_HOST,
    PC_URL_POSTFIX,
    
    MOBILE_URL_POSTFIX,
    WLAN_AS_TESTING_HOST_PC,
    WLAN_AS_TESTING_HOST_MOBILE,

    UAT_WEBSITE_HOST,


    LOCAL_AS_TESTING_HOST_PC,
    LOCAL_AS_TESTING_HOST_MOBILE


} = require('./businessConfig.js');


let isLocalastesting=process.argv.includes('--localastesting')

function f(fn,params){
    let newFn=()=>fn.apply(null,params);
    newFn.args=params;
    return newFn;
}

module.exports = function (doTestMobileWithToken, doTestPCWithToken, doTestPCWithoutToken) {


    let testingEnvTaskGroup=[
        f(doTestMobileWithToken,[(isLocalastesting?LOCAL_AS_TESTING_HOST_MOBILE:TESTING_WEBSITE_HOST) + MOBILE_URL_POSTFIX]),//移动端测试带token
        // f(doTestPCWithoutToken,[(isLocalastesting?LOCAL_AS_TESTING_HOST_PC:TESTING_WEBSITE_HOST) + PC_URL_POSTFIX]),//pc端测试不带token
        
    ]
    let uatEnvTaskGroup=[
        f(doTestMobileWithToken,[(isLocalastesting?LOCAL_AS_TESTING_HOST_MOBILE:UAT_WEBSITE_HOST) + MOBILE_URL_POSTFIX]),//移动端测试带token
        f(doTestPCWithoutToken,[(isLocalastesting?LOCAL_AS_TESTING_HOST_PC:UAT_WEBSITE_HOST) + PC_URL_POSTFIX]),//pc端测试不带token
        
    ]

    if(process.argv.includes('--wlantesting')){
        console.log('通过调用局域网某ip作为测试环境的服务模拟挂的过程,ip为:'
            +WLAN_AS_TESTING_HOST_MOBILE+'以及'+WLAN_AS_TESTING_HOST_PC)
        testingEnvTaskGroup=[
            f(doTestMobileWithToken,[(true?WLAN_AS_TESTING_HOST_MOBILE:TESTING_WEBSITE_HOST) + MOBILE_URL_POSTFIX]),//移动端测试带token
            f(doTestPCWithoutToken,[(true?WLAN_AS_TESTING_HOST_PC:TESTING_WEBSITE_HOST) + PC_URL_POSTFIX]),//pc端测试不带token
            
        ]
    }


    let prodTaskGropup=[
        f(doTestMobileWithToken,[PROD_WEBSITE_HOST + MOBILE_URL_POSTFIX]),//移动端生产带token
        f(doTestPCWithoutToken,[PROD_WEBSITE_HOST + PC_URL_POSTFIX]),//pc端生产不带token
    
    ]


    return [
        // ...prodTaskGropup,
        ...(process.argv.includes('--wlantesting')?testingEnvTaskGroup:

        // uatEnvTaskGroup //先写死监控uat的
        testingEnvTaskGroup //先写死监控测试的
        // prodTaskGropup
        
        ),
         
        //  ()=>doTestMobileWithToken(TESTING_WEBSITE_HOST + MOBILE_URL_POSTFIX),//移动端测试带token
        //()=>doTestPCWithToken(TESTING_WEBSITE_HOST + PC_URL_POSTFIX),//pc端测试带token
        // ()=>doTestPCWithoutToken(TESTING_WEBSITE_HOST + PC_URL_POSTFIX),//pc端测试不带token
        //()=>doTestPCWithToken(PROD_WEBSITE_HOST + PC_URL_POSTFIX),,//pc端生产带token
         

        





    ]
}