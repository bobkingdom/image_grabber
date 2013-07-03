Canvas Image Grabber
=============

用HTML5 Canvas实现的类似Photoshop钢笔和魔棒工具。

操作说明：

1. 拖拽图片到浏览器窗口
2. 使用+和-进行缩放
3. 魔棒工具点击图片，使用Delete/Backspace键可以删除所选的像素
4. 钢笔工具绘制一个路径，按选项面板的Mask按钮可以只显示路径内的图像
5. 使用钢笔工具时可以配合Option/Alt键来操作节点和控制杆
6. 点击Save按钮会将当前画布状态输出成图片

实现说明：

* 魔棒工具的算法使用的是[Flood Fill](http://en.wikipedia.org/wiki/Flood_fill)，用了[Web Workers](https://developer.mozilla.org/en-US/docs/Web/Guide/Performance/Using_web_workers)来做计算，尽可能保证界面的响应
* 蚁线参考[Code Pen](http://codepen.io/)的[这个示例](codepen.io/sstephenson/pen/LrJIG)。当图像缩放到尺寸较大时有渲染性能问题
* 钢笔工具为了方便判断，直线去曲线都是用bezierCurveTo方法来绘制，借鉴了Photoshop的交互，简化了组合键和选择交互
* Mask遮罩选项使用[Canvas Global Composite Operation](http://www.html5canvastutorials.com/advanced/html5-canvas-global-composite-operations-tutorial/)提供的destination-in方式来绘制
