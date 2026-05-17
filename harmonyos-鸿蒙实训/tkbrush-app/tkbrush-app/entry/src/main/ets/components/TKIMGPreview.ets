import { Utils } from '../utils/Utils'

@Preview
@CustomDialog
@Component
struct TKIMGPreview {
  //数据源
  list:string[] = []
  //当前显示的是哪一张
  currentIndex:number = 0

  controller:CustomDialogController
  build() {
    Column(){
      Swiper(){
        ForEach(this.list,(imgUrl:string)=>{
          Image(Utils.getImgUrl(imgUrl))
            .width('100%')
        })
      }
      .index($$this.currentIndex)
      .loop(false)
      .indicator(false)
      .width('100%')
    }
    .onClick(()=>{
      this.controller.close()
    })
    .justifyContent(FlexAlign.Center)
    .backgroundColor($r('app.color.black'))
    .width('100%')
    .height('100%')
  }
}

export {TKIMGPreview}