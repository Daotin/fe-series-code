
function getStyle(element) {
    if (!element.style) {
        element.style = {};
    }
    /**
        // 一个 computedStyle 对象格式
        {
        color: {
            value: "green",
            specificity: [ 0, 1, 0, 1],
        },
        width: {
            value: "20px",
            specificity: [ 0, 1, 0, 1],
        },
        }
     */
    for (const prop in element.computedStyle) {
        let propValue = element.computedStyle[prop].value // width: 20px
        element.style[prop] = propValue;
        
        // 把属性值中带px的去掉，转换成Number，比如 width: 20px
        // 把字符串形式的数字转换成Number类型
        if (propValue.toString().match(/px$/) || propValue.toString().match(/^[0-9]+$/)) {
            element.style[prop] = parseInt(element.style[prop]);
        }        
    }

    return element.style;
}

function layout(element) {
    if (!element.computedStyle) {
        return;
    }

    // {
    //     color: "green",
    //     width: 20,
    //     display: "flex",
    //  }
    let style = getStyle(element);

    // 只处理存在display：flex的属性
    if (style.display !== 'flex') {
        return;
    }

    // 过滤掉文本标签后的子元素
    let items = element.children.filter(item => item.type == 'element');

    // flex布局中，子元素属性order 属性 是用来控制flex容器中flex子元素的排列顺序。
    // 默认情况下flex子元素在flex容器的顺序是按flex子元素出现的顺序排列的。
    // 属性值为数值，数值越小，排列越靠前，默认为0。

    // a<b，a排在b之前，下面代表从小到大排序
    items.sort(function (a, b) {
        return (a.order || 0) - (b.order || 0);
    });

    ['width', 'height'].forEach(size => {
        if (style[size] === 'auto' || style[size] === '') {
            style[size] = null;
        }
    });

    if (!style.flexDirection || style.flexDirection === 'auto') {
        style.flexDirection = 'row';
    }
    if (!style.justifyContent || style.justifyContent === 'auto') {
        style.justifyContent = 'flex-start';
    }
    if (!style.alignItems || style.alignItems === 'auto') {
        style.alignItems = 'stretch';
    }
    if (!style.flexWrap || style.flexWrap === 'auto') {
        style.flexWrap = 'nowrap';
    }
    if (!style.flexContent || style.flexContent === 'auto') {
        style.flexContent = 'start';
    }

    let mainSize,
        mainStart,
        mainEnd,
        mainSign, // 反向标志： +1正向 -1反向
        mainBase, // 开始位置基准：默认0
        crossSize,
        crossStart,
        crossEnd,
        crossSign,
        crossBase;

    if (style.flexDirection === 'row') {
        mainSize = 'width';
        mainStart = 'left';
        mainEnd = 'right';
        mainSign = +1;
        mainBase = 0;

        crossSize = 'height';
        crossStart = 'top';
        crossEnd = 'bottom';
    }
    if (style.flexDirection === 'row-reverse') {
        mainSize = 'width';
        mainStart = 'right';
        mainEnd = 'left';
        mainSign = -1;
        mainBase = style.width;

        crossSize = 'height';
        crossStart = 'top';
        crossEnd = 'bottom';
    }
    if (style.flexDirection === 'column') {
        mainSize = 'height';
        mainStart = 'top';
        mainEnd = 'bottom';
        mainSign = +1;
        mainBase = 0;

        crossSize = 'width';
        crossStart = 'left';
        crossEnd = 'right';
    }
    if (style.flexDirection === 'column-reverse') {
        mainSize = 'height';
        mainStart = 'bottom';
        mainEnd = 'top';
        mainSign = -1;
        mainBase = style.height;

        crossSize = 'width';
        crossStart = 'left';
        crossEnd = 'right';
    }
    // 如果flex-content:start, 那么warp与warp-reverse的区别是：
    // warp从左上角开始往右排，然后往下换行排；
    // warp-reverse的是从左下角开始往右排，然后往上换行排。
    // 所以主轴是未改变的，只是交换了交叉轴的方向。
    if (style.flexWrap === 'warp-reverse') {
        let tmp = crossStart;
        crossStart = crossEnd;
        crossEnd = crossStart;

        crossSign = -1;
        crossBase = 0;
    } else {
        crossSign = +1;
        crossBase = 0;
    }

    // 如果父元素宽度未指定，则不存在超出换行的情况，父元素的宽度为所有子元素宽度之和
    let isAutoMainSize = false;
    if (!style[mainSize]) {
        style[mainSize] = 0;

        for (let i = 0; i < items.length; i++) {
            let item = items[i];
            let itemStyle = getStyle(item);
            if (itemStyle[mainSize]) {
                style[mainSize] += itemStyle[mainSize];
            }
        }
        isAutoMainSize = true;
    }

    /**
     * 元素进行
     */
    let flexLines = []; // 所有flex行
    let flexLine = []; // 当前flex行

    flexLines[0] = flexLine; // 第一行为当前行

    var mainSpace = style[mainSize]; // 当前行剩余空间
    var crossSpace = 0; // 当前行高

    for (let i = 0; i < items.length; i++) {
        let item = items[i];
        let itemStyle = getStyle(item);

        if (!itemStyle[mainSize]) {
            itemStyle[mainSize] = 0;
        }

        // 判断子元素属性
        // 如果子元素有flex属性，则一定可以排进行
        if (itemStyle.flex) {
            flexLine.push(item);
        }
        // 父元素指定不换行，且没有宽度
        else if (style.flexWrap === 'nowrap' && isAutoMainSize) {
            mainSpace -= itemStyle[mainSize];
            if (itemStyle[crossSize]) {
                crossSpace = Math.max(crossSpace, itemStyle[crossSize]);
            }
            flexLine.push(item);
        }
        // 换行处理
        else {
            // 如果子元素宽度比父元素宽度还大，则压缩到父元素宽度
            if (itemStyle[mainSize] > style[mainSize]) {
                itemStyle[mainSize] = style[mainSize];
            }
            // 如果父元素剩余空间不足以放入子元素，则需要另起一行
            if (mainSpace < itemStyle[mainSize]) {
                // 数组也是对象，也可以赋值，比如arr.length中，length就是数组的属性
                flexLine.mainSpace = mainSpace;
                flexLine.crossSpace = crossSpace;

                flexLines.push(flexLine);
                
                //创建新行
                flexLine = [];
                flexLine.push(item);

                // 初始化新行的剩余空间
                mainSpace = style[mainSize];
                crossSpace = 0;
            } else {
                flexLine.push(item);
            }

            // 换行处理任何情况，都需要计算剩余宽度和行高
            mainSpace -= itemStyle[mainSize];
            if (itemStyle[crossSize]) {
                crossSpace = Math.max(crossSpace, itemStyle[crossSize]);
            }
        }
        console.log('flexLine:', flexLine);
    }

    // 最后一行的剩余空间mainSpace
    // 如果是nowrap的情况，mainSpace为负
    // crossSpace为父元素行高，否则为0
    flexLine.mainSpace = mainSpace;

    if (style.flexWrap === 'nowrap' && isAutoMainSize) {
        flexLine.crossSpace = style[crossSize] ? style[crossSize] : crossSpace;
    } else {
        flexLine.crossSpace = crossSpace;
    }

    // flexLines.push(flexLine);

    console.log('flexLines:', flexLines);
    
    // 如果mainSpace为负（nowrap且子元素宽度之和大于父元素宽度时）
    // 子元素需要等比缩放
    if (mainSpace < 0) {
        let scale = style[mainSize] / (style[mainSize] - mainSpace);
        let currentMain = mainBase;

        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            let itemStyle = getStyle(item);

            // 如果父元素nowrap且宽度不够的话，子元素有flex属性的，子元素宽度为0
            if (itemStyle.flex) {
                itemStyle[mainSize] = 0;
            }

            // 子元素item宽度根据尺寸缩小
            itemStyle[mainSize] *= scale;
            // 设置子元素的起始位置
            itemStyle[mainStart] = currentMain;
            itemStyle[mainEnd] = currentMain + itemStyle[mainSize] * mainSign;
            currentMain = itemStyle[mainEnd];
        }
    } else {
        flexLines.forEach(lineItems => {

            let mainSpace = lineItems.mainSpace;
            let flexTotal = 0;
            
            for (let i = 0; i < lineItems.length; i++) {
                const item = lineItems[i];
                let itemStyle = getStyle(item);

                if (itemStyle.flex) {
                    flexTotal += itemStyle.flex;
                }

            }
            
            // 如果子元素存在flex，则把父元素主轴的剩余空间mainSpace分配给带有flex属性的子元素
            // 比如如果有两个子元素flex属性分别是1，2的话，分配的剩余空间占比是1/3和2/3
            if (flexTotal) {
                let currentMain = mainBase;
                
                for (let i = 0; i < lineItems.length; i++) {
                    const item = lineItems[i];
                    let itemStyle = getStyle(item);
    
                    if (itemStyle.flex) {
                        itemStyle[mainSize] = mainSpace * itemStyle.flex / flexTotal;
                    }
                    
                    itemStyle[mainStart] = currentMain;
                    itemStyle[mainEnd] = currentMain + itemStyle[mainSize] * mainSign;
                    currentMain = itemStyle[mainEnd];
                }
            } else {
                let currentMain = mainBase; //子元素起始位置
                let step = 0; // 子元素间距

                // 不存在有flex的子元素，意味着justify-content属性生效
                if (style[justifyContent] === 'flex-start') {
                    currentMain = mainBase;
                    step = 0;
                }
                if (style[justifyContent] === 'flex-end') {
                    currentMain = mainSpace * mainSign + mainBase;
                    step = 0;
                }
                if (style[justifyContent] === 'center') {
                    currentMain = mainSpace / 2 * mainSign + mainBase;
                    step = 0;
                }
                if (style[justifyContent] === 'space-between') {
                    currentMain = mainBase;
                    step = mainSpace / (lineItems.length - 1) * mainSign;
                }
                if (style[justifyContent] === 'space-around') {
                    step = mainSpace / (lineItems.length) * mainSign;;
                    currentMain = step / 2 + mainBase;
                }
                
                // 计算items子元素的位置
                for (let i = 0; i < items.length; i++) {
                    const item = items[i];
                    let itemStyle = getStyle(item);

                    itemStyle[mainStart] = currentMain;
                    itemStyle[mainEnd] = currentMain + itemStyle[mainSize] * mainSign;
                    currentMain = itemStyle[mainEnd] + step;
                }
            }
        });
    }

    /**
     * 计算交叉轴位置
     */
    var crossSpace; //交叉轴剩余空间

    // 如果父元素没有高度，那么父元素的高度由每一个行高度撑开
    if (!style[crossSize]) {
        crossSpace = 0;
        style[crossSize] = 0;
        flexLines.forEach(lineItems => {
            style[crossSize] += lineItems.crossSpace;
        });
    } else {
        crossSpace = style[crossSize];
        flexLines.forEach(lineItems => {
            crossSpace -= lineItems.crossSpace;
        });
    }

    // 如果是wrap-reverse，则crossBase需要从底部计算
    if (style.flexWrap === 'wrap-reverse') {
        crossBase = style[crossSize];
    } else {
        crossBase = 0;
    }

    if (!style.alignContent) {
        style.alignContent = 'stretch';
    }

    let step;
    if (style.alignContent === 'flex-start') {
        crossBase += 0;
        step = 0;
    }
    if (style.alignContent === 'flex-end') {
        crossBase += crossSign * crossSpace;
        step = 0;
    }
    if (style.alignContent === 'center') {
        crossBase += crossSign * crossSpace / 2;
        step = 0;
    }
    if (style.alignContent === 'space-between') {
        crossBase += 0;
        step = crossSpace / (flexLines.length - 1);
    }
    if (style.alignContent === 'space-around') {
        step = crossSpace / (flexLines.length);
        crossBase += crossSign * step / 2;
    }
    if (style.alignContent === 'stretch') {
        crossBase += 0;
        step = 0;
    }

    flexLines.forEach(lineItems => {
        // 如果父元素alignContent为stretch，则每一行的高度为自身高度+剩余空间/行数，达到占满父元素高度
        let lineCrossSize = style.alignContent === 'stretch'
            ? lineItems.crossSpace + crossSpace / flexLines.length
            : lineItems.crossSpace;
        
        for (let i = 0; i < lineItems.length; i++) {
            const item = lineItems[i];
            let itemStyle = getStyle(item);

            // 子元素在交叉轴排布首先受到align-self影响，然后是父元素的align-items
            let align = itemStyle.alignSelf || style.alignItems; 

            // 如果子元素没有高度
            if (!itemStyle[crossSize]) {
                itemStyle[crossSize] = align === 'stretch' ? lineCrossSize : 0;
            }

            if (align === 'flex-start') {
                itemStyle[crossStart] = crossBase;
                itemStyle[crossEnd] = itemStyle[crossStart] + itemStyle[crossSize] * crossSign;
            }
            if (align === 'flex-end') {
                itemStyle[crossEnd] = crossBase + lineCrossSize * crossSign;
                itemStyle[crossStart] = itemStyle[crossEnd] - itemStyle[crossSize] * crossSign;
            }
            if (align === 'center') {
                itemStyle[crossStart] = crossBase + crossSign * (lineCrossSize - itemStyle[crossSize])/2;
                itemStyle[crossEnd] = itemStyle[crossStart] + itemStyle[crossSize] * crossSign;
            }
            if (align === 'stretch') {
                itemStyle[crossStart] = crossBase;
                itemStyle[crossEnd] = crossSign * (itemStyle[crossSize] ? itemStyle[crossSize] : lineCrossSize);

                itemStyle[crossSize] = crossSign * (itemStyle[crossEnd] - itemStyle[crossStart]);
            }
        }
        // 到下一行后，更新crossBase
        crossBase += crossSign * (lineCrossSize + step);

    });

}

module.exports = layout;
