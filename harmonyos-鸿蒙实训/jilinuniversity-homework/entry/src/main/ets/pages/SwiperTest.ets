@Entry
@Component
struct SwiperTest {
  build(){
    //轮播
    Swiper(){
      Text('1')
        .width('100%')
        .height('100%')
        .backgroundColor(Color.Green)
      Text('2')
        .width('100%')
        .height('100%')
        .backgroundColor(Color.Red)
      Text('3')
        .width('100%')
        .height('100%')
        .backgroundColor(Color.Orange)

    }
    .height('20%')
    .loop(true)
    .autoPlay(true)
  }
}