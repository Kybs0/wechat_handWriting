Page({
  penHandWrite1(event) {
    wx.navigateTo({
      url: '../handWriting/index',
    })
  },
  penHandWrite2(event) {
    wx.navigateTo({
      url: '../handWriting2/index',
    })
  },
  pngModify(event) {
    wx.navigateTo({
      url: '../pictureModify/index',
    })
  },
  pngComment(event) {
    wx.navigateTo({
      url: '../pictureComment/index',
    })
  }
})