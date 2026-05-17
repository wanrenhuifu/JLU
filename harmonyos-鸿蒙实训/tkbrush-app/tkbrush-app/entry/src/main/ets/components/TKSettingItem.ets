import { SettingItem } from '../models/Mine'

@Component
struct TKSettingItem {
  item:SettingItem = {} as SettingItem
  build() {
    Row(){
      Text(this.item.leftTitle)
        .fontSize(14)
        .fontColor($r('app.color.text_second'))
      Blank()
      if (this.item.rightTitle){
        Text(this.item.rightTitle)
          .fontSize(14)
          .fontColor($r('app.color.text_primary'))
          .margin({
            right:8.5
          })
      }
      Image($r('app.media.right_arrow'))
        .width(7)
        .height(13)
    }
    .height(57)
    .width('100%')
    .onClick(()=>{
      this.item.itemClick&&this.item.itemClick()
    })
  }
}

export {TKSettingItem}