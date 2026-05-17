import { it } from '@ohos/hypium'
import { Question, TKUserAnswer } from '../models/Paper'
import { TKCard } from './TKCard'

@Preview
@CustomDialog
@Component
struct TKQuestionCard {
  controller:CustomDialogController

  questionList:Question[] = []
  //答题记录
  @Consume
  userAnswers:TKUserAnswer[]

  //考试中线显示的那道题的索引，修改它可以切换题
  @Link
  currentIndex:number
  //交卷
  submitPaper:()=>void = ()=>{}

  @State
  columns:number = 0

  //当前题是否已做
  getISSelected(item:Question){
    const question = this.userAnswers.find(obj=>obj.questionId===item.id)
    if (question && question.userAnswer.length > 0) {
      return true
    }else{
      return false
    }
  }

  build() {
    Column(){
      Scroll(){
        TKCard({marginBottom:-8}){
          Stack({alignContent:Alignment.End}){
            Text('答题卡')
              .fontSize(15)
              .fontColor($r('app.color.text_primary'))
              .fontWeight(FontWeight.Bold)
              .width('100%')
              .textAlign(TextAlign.Center)
            Image($r('app.media.cancel'))
              .width(12)
              .aspectRatio(1)
              .margin({
                right:41
              })
              .onClick(()=>{
                this.controller.close()
              })
          }
          .height(54)
          .width('100%')

          GridRow({columns:this.columns}){
            ForEach(this.questionList,(item:Question,index:number)=>{
              GridCol(){
                Text((index+1).toString())
                  .width(30)
                  .aspectRatio(1)
                  .borderRadius(15)
                  .backgroundColor(this.getISSelected(item)?$r('app.color.option_selectColor'):$r('app.color.option_normalColor'))
                  .fontColor(this.getISSelected(item)?$r('app.color.white'):$r('app.color.text_primary'))
                  .fontSize(14)
                  .fontWeight(FontWeight.Bold)
                  .textAlign(TextAlign.Center)
                  .onClick(()=>{
                    this.currentIndex = index
                    this.controller.close()
                  })
              }
              .width('100%')
              .padding({
                top:9,
                bottom:9
              })
            })
          }
          Button(){
            Stack(){
              Image($r('app.media.button_back'))
                .width('100%')
                .height('100%')
                .borderRadius(15)
              Text('交卷')
                .fontSize(15)
                .fontColor($r('app.color.white'))
                .fontWeight(FontWeight.Bold)
            }
          }
          .borderRadius(15)
          .width(98)
          .height(30)
          .margin({
            top:9,
            bottom:29
          })
          .onClick(()=>{
            this.submitPaper()
            this.controller.close()
          })
        }
      }
      .align(Alignment.Bottom)
      .width('100%')
      .height('80%')
    }
    .onAreaChange((oldValue,newValue)=>{
      const width = newValue.width as number
      this.columns = (width-130)*2/3/30
    })
    .justifyContent(FlexAlign.End)
    .backgroundColor('rgba(64, 62, 62, 0.51)')
    .width('100%')
    .height('100%')
  }
}
export {TKQuestionCard}