import { router } from '@kit.ArkUI'

@Preview
@Component
struct TKNavBar {
  //导航标题
  @Prop
  title:string = '标题'
  //是否显示返回图标
  ISShowBack:boolean = true

  //点击返回图标
  backClick:()=>void = ()=>{
    router.back()
  }

  build() {
    Stack({alignContent:Alignment.Start}){
      Text(this.title)
        .maxLines(1)
        .textOverflow({overflow:TextOverflow.Ellipsis})
        .width('100%')
        .textAlign(TextAlign.Center)
        .fontWeight(FontWeight.Bold)
        .fontSize(19)
        .padding({
          left:50,
          right:50
        })
      if (this.ISShowBack){
        Image($r('app.media.left_arrow'))
          .width(8.5)
          .height(15)
          .onClick(()=>{
            this.backClick()
          })
      }
    }
    .height(50)
    .width('100%')
  }
}

export {TKNavBar}