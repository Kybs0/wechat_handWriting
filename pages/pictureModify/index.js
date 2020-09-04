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
    },
    bindload: function (e) {
        // bindload 这个api是<image>组件的api类似<img>的onload属性 
        this.setData({
            'singleTouch.top': 0,
            'singleTouch.left': 0,
            'mutiTouch.baseWidth': e.detail.width,
            'mutiTouch.baseHeight': e.detail.height,
            'mutiTouch.scaleWidth': e.detail.width,
            'mutiTouch.scaleHeight': e.detail.height
        })
    }
})