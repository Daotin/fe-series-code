
/**
 * 构建dp 二维数组
 * @param {*} pat 模式字符串
 */
function kmp(pat) {
    let patLen = pat.length;

    // 初始化dp为[patLen][256]二维数组
    let dp = new Array(patLen).fill(0).map(() => new Array(256).fill(0));

    // dp[状态][字符] = 下个状态
    // 初始值：当前状态为0，遇到字符pat[0]，转移到下个状态1
    dp[0][pat.charCodeAt(0)] = 1;

    // 影子状态X，初始值为0
    let X = 0;

    // j 从1 开始
    for (let j = 1; j < patLen; j++) {
        for (let c = 0; c < 256; c++) {
            let s = String.fromCharCode(c); //ASCII转字符
            if (pat[j] == s) {
                // 状态推进
                dp[j][c] = j + 1;
            } else {
                // 状态重启（交由影子处理，影子X永远比当前状态 j 落后一个状态，所以它知道当前怎么处理，因为j已经趟过了）
                dp[j][c] = dp[X][c];
            }
        }
        // 更新影子状态（把当前j的状态给影子，然后j继续往前走，相当于打了个tag）
        // 当前是状态 X，遇到字符 pat[j]，
        // X 应该转移到哪个状态？
        X = dp[X][pat.charCodeAt(j)];
    }

    return dp;
}

/**
 * 查找函数
 * @param {*} str 文本字符串
 * @param {*} pat 模式字符串
 * @returns 返回找到pat在str的索引（若为 -1，没找到）
 */
function match(str, pat) {
    let strLen = str.length;
    let patLen = pat.length;

    // pat的初始状态为0
    let j = 0;

    for (let i = 0; i < strLen; i++) {
        
        //当前状态为j，遇到字符str[i]，pat应该转移到哪个状态？
        j = dp[j][str.charCodeAt(i)];

        if (j == patLen) {
            return i - patLen + 1;
        }
    }

    return -1;
}

let str = 'aababababx';
let pat = 'ababx';

let dp = kmp(pat);
let index = match(str, pat);

if (index !== -1) {
    console.log('匹配成功，索引为：',index);
} else {
    console.log('匹配失败');
}

// 参考文档：https://zhuanlan.zhihu.com/p/83334559

