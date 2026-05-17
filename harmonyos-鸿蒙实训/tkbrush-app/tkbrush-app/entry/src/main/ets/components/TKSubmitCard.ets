import { Question, TKUserAnswer } from '../models/Paper'

@Component
struct TKSubmitCard {

  //试卷名称
  paperTitle:string = ''

  //试题数
  @Prop
  total:number = 0

  @Prop
  questionList:Question[] = []
  //答题记录
  @Consume
  userAnswers:TKUserAnswer[]

  //考试中线显示的那道题的索引，修改它可以切换题
  @Link
  currentIndex:number
  //交卷
  submitPaper:()=>void = ()=>{}

  //一行有显示几道题
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
    Column() {
      Text(this.paperTitle)
        .fontSize(15)
        .fontColor($r('app.color.text_primary'))
        .fontWeight(FontWeight.Bold)
        .width('100%')
        .textAlign(TextAlign.Center)
      Progress({ value: this.total, total: this.total })
        .width('100%')
        .color($r('app.color.primary'))
        .margin({
          top: 17,
          bottom: 7
        })
      Row() {
        Text() {
          Span(this.total.toString())
            .fontColor($r('app.color.primary'))
          Span(`/${this.total}`)
            .fontColor($r('app.color.text_third'))
        }
        .fontSize(10)
      }
      .width('100%')
      .justifyContent(FlexAlign.End)

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
      })
    }
    .width('100%')
    .onAreaChange((oldValue,newValue)=>{
      const width = newValue.width as number
      this.columns = (width-100)*2/3/30
    })
  }
}

export {TKSubmitCard}