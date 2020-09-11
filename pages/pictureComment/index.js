// pages/draw.js
Page({
    /**
     * 页面的初始数据
     */
    data: {
        canvasId: 'myCanvas',
        penColor: 'red',
        lineWidth: 5,
        isInEdit: false,
        originalImages: ['./images/image1.png', './images/image2.png', './images/image3.png', './images/image4.png', './images/image5.png'],
        editImages: ['./images/image1.png', './images/image2.png', './images/image3.png', './images/image4.png', './images/image5.png'],
        imageIndex: 0,
        adjustedImageHeight: 0,
        adjustedImageWidth: 0
    },
    onLoad: async function (options) {
        await this.updateImageScaleInfo(0);
    },
    updateImageScaleInfo: function (imageIndex) {
        const query = wx.createSelectorQuery()
        query.select('.body').boundingClientRect()
        query.selectViewport().scrollOffset()
        query.exec(async (res) => {
            var containerWidth = res[0].width;
            var containerHeight = res[0].height;
            var imageSize = await this.getImageScaleSize(this.data.editImages[imageIndex], containerWidth, containerHeight);
            this.setData({
                imageIndex: imageIndex,
                adjustedImageWidth: imageSize.width,
                adjustedImageHeight: imageSize.height
            })
        })
    },
    getImageScaleSize: async function (imagePath, containerWidth, containerHeight) {
        var imageSizeInfo = { width: 0, height: 0 };
        //原始宽高
        var imageInfo = await wx.getImageInfo({
            src: imagePath
        });
        var originalWidth = imageInfo.width;
        var originalHeight = imageInfo.height;
        var originalScale = originalHeight / originalWidth;
        console.log('originalWidth: ' + originalWidth + '，originalHeight: ' + originalHeight + '，originalScale: ' + originalScale);

        var windowscale = containerHeight / containerWidth;
        console.log('containerWidth: ' + containerWidth + 'containerHeight: ' + containerHeight + '，windowscale: ' + windowscale);

        if (originalScale < windowscale) {
            //图片高宽比小于屏幕高宽比
            //图片缩放后的宽为屏幕宽
            imageSizeInfo.width = containerWidth;
            imageSizeInfo.height = (containerWidth * originalHeight) / originalWidth;
        } else {
            //图片高宽比大于屏幕高宽比
            //图片缩放后的高为屏幕高
            imageSizeInfo.height = containerHeight;
            imageSizeInfo.width = (containerHeight * originalWidth) / originalHeight;
        }
        console.log('缩放后的宽: ' + imageSizeInfo.width + '缩放后的高: ' + imageSizeInfo.height + '，windowscale: ' + windowscale);
        return imageSizeInfo;
    },
    onImageChange: async function (params) {
        console.log('onImageChange', params)
        var curretnImageIndex = params.detail.current;
        await this.updateImageScaleInfo(curretnImageIndex);
    },
    startEdit: function (params) {
        this.startNewCanvasContext(this.data.editImages[this.data.imageIndex]);
        this.setData({
            isInEdit: true,
        });
    },
    // 保存修改
    exportPng: function (params) {
        // 保存图片至相册
        wx.saveImageToPhotosAlbum({
            filePath: this.data.editImages[this.data.imageIndex],
            success(res2) {
                wx.showToast({ title: '已保存至本地' })
            },
            fail() {
                wx.showToast({ title: '保存失败，稍后再试', icon: 'none' })
            }
        })
    },
    endEdit: function (params) {
        this.setData({
            isInEdit: false,
        });
    },
    startNewCanvasContext: function (imagePath) {
        //每次编辑，新建一个context
        this.context = wx.createCanvasContext(this.data.canvasId)
        this.context.drawImage(imagePath, 0, 0, this.data.adjustedImageWidth, this.data.adjustedImageHeight);
        this.context.draw();
    },
    /**
     * 画笔选择
     */
    penSelect: function (options) {
        var lineWidth = options.currentTarget.dataset.param;
        console.log("lineWidth:" + lineWidth);
        this.setData({
            lineWidth: lineWidth,
        });
    },
    /**
     * 颜色选择
     */
    colorSelect: function (options) {
        var penColor = options.currentTarget.dataset.param;
        console.log("penColor:" + penColor);
        this.setData({
            penColor: penColor,
        });
    },
    // 撤销
    revertWriting: function (options) {
        this.startNewCanvasContext(this.data.editImages[this.data.imageIndex]);
    },
    resetWriting: function (options) {
        var image = this.data.originalImages[this.data.imageIndex];
        this.data.editImages[this.data.imageIndex] = image;
        this.startNewCanvasContext(image);
    },
    // 保存修改
    saveWriting: function (params) {
        var that = this;
        wx.canvasToTempFilePath({
            x: 0,
            y: 0,
            width: that.data.adjustedImageWidth,// 画布的宽
            height: that.data.adjustedImageHeight,// 画布的高
            destWidth: that.data.djustedImageWidth,
            destHeight: that.data.adjustedImageHeight,
            canvasId: this.data.canvasId,
            success(res) {
                console.log('saveWriting-success:', res.tempFilePath);
                // 1-保存至缓存并退出编辑状态
                that.data.editImages[that.data.imageIndex] = res.tempFilePath;
                that.setData({
                    isInEdit: false,
                    editImages: that.data.editImages
                })
            },
            fail() {
                wx.showToast({ title: '保存失败，稍后再试', icon: 'none' })
            }
        })
    },

    /**
     * 触摸开始
     */
    touchStart: function (e) {
        // 双指缩放开始，不做任何处理
        if (e.changedTouches.length >= 2) return;
        //得到触摸点的坐标
        this.startX = e.changedTouches[0].x
        this.startY = e.changedTouches[0].y

        console.log('setStrokeStyle', this.data.penColor)
        // 设置画笔颜色
        this.context.strokeStyle = this.data.penColor;
        // 设置线条宽度
        this.context.setLineWidth(this.data.lineWidth);
        this.context.setLineCap('round') // 让线条圆润
        this.context.beginPath()
    },

    /**
     * 手指触摸后移动
     */
    touchMove: function (e) {
        // 双指缩放开始，不做任何处理
        if (e.changedTouches.length >= 2) return;
        var startX1 = e.changedTouches[0].x
        var startY1 = e.changedTouches[0].y

        this.context.moveTo(this.startX, this.startY)
        this.context.lineTo(startX1, startY1)
        this.context.stroke()

        this.startX = startX1;
        this.startY = startY1;
        //只是一个记录方法调用的容器，用于生成记录绘制行为的actions数组。context跟<canvas/>不存在对应关系，一个context生成画布的绘制动作数组可以应用于多个<canvas/>
        wx.drawCanvas({
            canvasId: this.data.canvasId,
            reserve: true,
            actions: this.context.getActions() // 获取绘图动作数组
        })
    },

    /**
     * 触摸结束
     */
    touchEnd: function (e) {
        this.touchMove(e);
    },
})