import { Paper } from '../models/Paper'
import { TKCard } from './TKCard'
import { router } from '@kit.ArkUI'

@Preview
@Component
struct TKPaperItem {
  item:Paper = {} as Paper

  //提交试卷状态：0  未提交（未答题） 开始答题 ，1 已提交 重新答题，2 保存未提交 继续答题
  getButtonTitle(status:number){
    switch (status) {
      case 0:
          return '开始答题'
        break;
      case 1:
        return '重新答题'
        break;
      default:
        return '继续答题'
        break;
    }
  }

  build() {
    TKCard({paddingTop:24,paddingBottom:18.5,paddingLeft:24}){
      Text(this.item.title)
        .fontSize(15)
        .fontWeight(FontWeight.Bold)
        .fontColor($r('app.color.text_primary'))
        .width('100%')
        .margin({
          bottom:13
        })
      Row({space:3}){
        Text(`共${this.item.questionCount}题`)
          .fontSize(11)
          .fontColor($r('app.color.text_second'))
        Text(`已做${this.item.answerCount}题`)
          .width(64)
          .height(21)
          .borderRadius(10.5)
          .backgroundColor($r('app.color.blue_back'))
          .fontColor($r('app.color.text_blue'))
          .fontSize(11)
          .textAlign(TextAlign.Center)
        Blank()
        Button(){
          Stack(){
            Image($r('app.media.button_back'))
              .width(98)
              .height(30)
              .borderRadius(15)
            Text(this.getButtonTitle(this.item.userSubmitStatus))
              .fontSize(14)
              .fontColor($r('app.color.white'))
              .fontWeight(FontWeight.Medium)
          }
        }
        .backgroundColor(Color.Transparent)
        .borderRadius(15)
        .width(98)
        .height(30)
        .onClick(()=>{
          router.pushUrl({
            url:'pages/Home/TKExamination',
            params:{id:this.item.paperId,name:this.item.title,type:this.item.userSubmitStatus}
          })
        })
      }
      .width('100%')
    }
  }
}

export {TKPaperItem}