Page({
    /**
     * 页面的初始数据
     */
    data: {
        isInEdit: false,
        originalImagePath: './images/backgroundImage.png',
        imagePath: './images/backgroundImage.png',
        // 单指触摸-用于移动图片
        singleTouch: {
            top: 0,
            left: 0,
        },
        // 多指触摸-用于缩放图片
        mutiTouch: {
            distance: 0,
            scale: 1,
            baseWidth: null,
            baseHeight: null,
            scaleWidth: null,
            scaleHeight: null,
        }
    },
    isImageTouchActive: false,
    touchX: 0,
    touchY: 0,
    newTouchX: 0,
    newTouchY: 0,
    onLoad: async function (options) {
        const query = wx.createSelectorQuery()
        query.select('.body').boundingClientRect()
        query.selectViewport().scrollOffset()
        query.exec(async (res) => {
            var containerWidth = res[0].width;
            var containerHeight = res[0].height;
            var imageSize = await this.getImageScaleSize(this.data.imagePath, containerWidth, containerHeight);
            this.setData({
                'singleTouch.top': (containerHeight - imageSize.height) / 2,
                'singleTouch.left': (containerWidth - imageSize.width) / 2,
                'mutiTouch.baseWidth': imageSize.width,
                'mutiTouch.baseHeight': imageSize.height,
                'mutiTouch.scaleWidth': imageSize.width,
                'mutiTouch.scaleHeight': imageSize.height
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
    touchstart: function (e) {
        // 单手指缩放开始，也不做任何处理 
        if (e.touches.length == 1) {
            return
        }
        console.log('双手指触发开始')
        // 注意touchstartCallback 真正代码的开始
        // 一开始我并没有这个回调函数，会出现缩小的时候有瞬间被放大过程的bug
        // 当两根手指放上去的时候，就将distance 初始化。
        let xMove = e.touches[1].clientX - e.touches[0].clientX;
        let yMove = e.touches[1].clientY - e.touches[0].clientY;
        let distance = Math.sqrt(xMove * xMove + yMove * yMove);
        this.setData({
            'mutiTouch.distance': distance,
        })
    },
    touchmove: function (e) {
        // 单手指缩放我们不做任何操作 
        if (e.touches.length == 1) {
            return;
        }
        let mutiTouch = this.data.mutiTouch
        let xMove = e.touches[1].clientX - e.touches[0].clientX;
        let yMove = e.touches[1].clientY - e.touches[0].clientY;
        // 新的 ditance 
        let distance = Math.sqrt(xMove * xMove + yMove * yMove);
        let distanceDiff = distance - mutiTouch.distance;
        let newScale = mutiTouch.scale + 0.005 * distanceDiff
        // 为了防止缩放得太大，所以scale需要限制，同理最小值也是 
        if (newScale >= 2) {
            newScale = 2
        }
        if (newScale <= 0.2) {
            newScale = 0.2
        }
        if (newScale / mutiTouch.scale >= 0.5 || mutiTouch.scale / newScale >= 0.5) {
            let scaleWidth = newScale * mutiTouch.baseWidth
            let scaleHeight = newScale * mutiTouch.baseHeight
            // 赋值 新的 => 旧的 
            this.setData({
                'mutiTouch.distance': distance,
                'mutiTouch.scale': newScale,
                'mutiTouch.scaleWidth': scaleWidth,
                'mutiTouch.scaleHeight': scaleHeight,
                'mutiTouch.diff': distanceDiff
            })
        }
    },
    imageTouchtart: function (e) {
        // 单手指缩放开始，也不做任何处理 
        if (e.touches.length == 1) {
            console.log('单指触发开始')
            let touchX = e.touches[0].clientX;
            let touchY = e.touches[0].clientY;
            this.isImageTouchActive = true;
            this.touchX = touchX;
            this.touchY = touchY;
        }
    },
    imageTouchMove: function (e) {
        if (e.touches.length == 1) {
            console.log('imageTouchMove', e.touches[0]);
            this.newTouchX = e.touches[0].clientX;
            this.newTouchY = e.touches[0].clientY;
        }
    },
    imageTouchEnd: function (e) {
        if (this.isImageTouchActive) {
            this.isImageTouchActive = false;
            let movedY = this.newTouchY - this.touchY;
            let movedX = this.newTouchX - this.touchX;
            this.setData({
                'singleTouch.top': this.data.singleTouch.top + movedY,
                'singleTouch.left': this.data.singleTouch.left + movedX,
            })
        }
    }
})