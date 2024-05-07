



优化点：
1 _this找到所有自定义的组件
2 移动端实现热更新




依据当前判断测试和生产的方法，域名里测试必须有-test，生产的必须没有test也没有127.0.0.1
不要在这里测试除了本公司之外的其他域名，其他域名一旦有错误，也会播放移动端或者pc端异常音频

检测任务调用间隔时间,不得小于单次播放同一个环境失败时间总和的时间


use node version 14.18.3 ,will not cause problem

//(暂时不使用MP3_FADE_FOLDER_PATH变量了全部直接用mp3/fade文件夹里的)MP3_FADE_FOLDER_PATH配置与service中替换路径中带有/fade的有轻度耦合 改的话要改两处

此监控器仅仅在每一次新的任务即将开始时候才执行关闭一些页面等操作；因此若中途退出，则可能有页面不被关闭


--errortest 出错时终止任务
--log 在非windows下带日志查看
--quiet 出错只有日志不播放声音
--notask 不执行监控任务
--logtest 故意输出垃圾日志以测试
--8001 使用8001作为应用的端口
--headless 表示采用无图形化界面方式运行
--localastesting 使用本地测试替代真实的测试环境进行测试
--keepopening 表示从来不关闭浏览器页签
--runonce 表示只运行一次任务
--devtools 带devtools启动
--wlantesting 表示

日志测试使用
node main.js --quiet --notask --logtest --8001


故意搞出异常，使用
node main.js --8001 --errortest

安静默默的跑任务
node main.js --headless --quiet --8001

本地替代测试跑
node main.js --8001 --localastesting

本地替代测试跑并不关闭页签且只跑一次
node main.js --8001 --localastesting --keepopening --runonce


正常跑并不关闭页签且只跑一次
node main.js --8001 --keepopening --runonce


wlan测试且设定报错多久后可以继续播放时间为3分钟
node main.js --8001 --wlantesting --3min



3001作为debug服务用
node main.js --notask