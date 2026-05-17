import { TKNavBar } from '../../components/TKNavBar'
import { webview } from '@kit.ArkWeb'
import { router } from '@kit.ArkUI'
import { TKRouterParms } from '../../models/TKRouterParms'

@Entry
@Component
struct TKWebPage {
  //页面标题
  @State
  title:string = ''
  @State
  jumpUrl:string = ''

  aboutToAppear(): void {
    const parms = router.getParams() as TKRouterParms
    this.jumpUrl = parms.url
  }


  controller:WebviewController = new webview.WebviewController()

  build() {
    Column(){
      TKNavBar({title:this.title})
        .margin({
          left:15
        })
      Web({src:this.jumpUrl,controller:this.controller})
      .onTitleReceive((event)=>{
        this.title = event?.title||'网页'
      })
      .width('100%')
      .layoutWeight(1)
    }
    .width('100%')
    .height('100%')
  }
}