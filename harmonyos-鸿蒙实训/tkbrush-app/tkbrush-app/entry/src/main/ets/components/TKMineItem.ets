import { MineItem } from '../models/Mine'

@Preview
@Component
struct TKMineItem {
  item:MineItem = {} as MineItem
  build() {
    Row(){
      Image(this.item.icon)
        .width(18)
        .aspectRatio(1)
        .margin({
          right:9
        })
      Text(this.item.title)
        .fontSize(14)
        .fontColor($r('app.color.text_primary'))
      Blank()
      Image($r('app.media.right_arrow'))
        .width(7.5)
        .height(13)
    }
    .width('100%')
    .height('57')
    .onClick(()=>{
      this.item.itemClick&&this.item.itemClick()
    })
  }
}

export {TKMineItem}