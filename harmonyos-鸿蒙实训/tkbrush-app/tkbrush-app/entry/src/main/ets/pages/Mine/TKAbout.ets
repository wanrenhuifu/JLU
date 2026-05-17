import { TKCard } from '../../components/TKCard'
import { TKNavBar } from '../../components/TKNavBar'

@Entry
@Component
struct TKAbout {

  version:string = 'V1.0.1'

  @Builder
  getItem(leftTitle:string,rightTitle:string,ISHiddenLine?:boolean){
    Column(){
      Row(){
        Text(leftTitle)
          .fontSize(14)
          .fontColor($r('app.color.text_primary'))
        Blank()
        Text(rightTitle)
          .fontSize(14)
          .fontColor($r('app.color.text_primary'))
      }
      .width('100%')
      .height(56)
      Divider().strokeWidth(0.5).width('100%').color($r('app.color.line_color'))
        .visibility(ISHiddenLine?Visibility.Hidden:Visibility.Visible)
    }
    .width('100%')
    .height(57)
  }

  build() {
    Stack({ alignContent: Alignment.Top }) {
      Image($r('app.media.second_navbar_back'))
        .width('100%')
        .height(81)
        .expandSafeArea([SafeAreaType.SYSTEM], [SafeAreaEdge.TOP])
      Column() {
        TKNavBar({ title: '关于我们' })
        Image($r('app.media.ti_icon'))
          .width(70)
          .aspectRatio(1)
          .margin({
            top:22,
            bottom:11
          })
        Text('泰克刷题')
          .fontSize(16)
          .fontColor($r('app.color.text_primary'))
          .fontWeight(FontWeight.Medium)
        Text(this.version)
          .fontSize(14)
          .fontColor($r('app.color.text_primary'))
          .margin({
            top:5,
            bottom:12
          })
        TKCard({marginLeft:0,marginRight:0,paddingLeft:20,paddingRight:37}){
          this.getItem('微信公众号','泰克教育')
          this.getItem('官方网址','www.tklab.cn')
          this.getItem('检查更新',this.version)
          this.getItem('服务热线','010-88881111',true)
        }
      }
      .padding({
        left:15,
        right:15
      })
      .width('100%')
      .height('100%')
    }
    .width('100%')
    .height('100%')
    .backgroundColor($r('app.color.back_color'))
  }
}