var images = require("images");

function render(viewport, element) {
    if (element.style) {
        // 创建一个指定宽高的透明图像
        let img = images(element.style.width, element.style.height);

        // 这里只处理元素的background-color
        if (element.style['background-color']) {
            let color = element.style['background-color'] || 'rgb(0,0,0)';
            color.match(/rgb\((\d+),(\d+),(\d+)\)/);
            img.fill(Number(RegExp.$1), Number(RegExp.$2), Number(RegExp.$3));
            viewport.draw(img, element.style.left || 0, element.style.top||0);
        }
    }
    if (element.children) {
        for (const child of element.children) {
            render(viewport, child);
        }
    }
}

module.exports = render;