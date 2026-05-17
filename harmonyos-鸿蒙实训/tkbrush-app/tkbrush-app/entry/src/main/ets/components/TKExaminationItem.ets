import { Option, Question, TKUserAnswer } from '../models/Paper'

@Preview
@Component
struct TKExaminationItem {
  item:Question = {} as Question
  //试卷试题总数
  total:number = 0
  //当前题的索引
  index:number = 0
  //试卷标题
  paperTitle:string = ''

  //考试中心显示的题的索引
  @Link
  currentIndex:number

  //用户答案集合
  @Consume
  userAnswers:TKUserAnswer[]

  //唤起答题卡
  questionCardClick:()=>void = ()=>{}

  //判断当前这道题有没有答题
  ISHasAnswer(){
    let question = this.userAnswers.find(obj=>obj.questionId===this.item.id)
    if (question && question.userAnswer.length > 0) {
      return true
    }else{
      return false
    }
  }

  //选择选项
  selectOption(option:Option){
    let question = this.userAnswers.find(obj=>obj.questionId===this.item.id)
    const questionIndex = this.userAnswers.findIndex(obj=>obj.questionId===this.item.id)
    //题目类型：1 单选，2  多选，3 判断
    if (this.item.type===1||this.item.type===3) { //单选或者判断
      if (question) {
        question.userAnswer = [option.identify]
        this.userAnswers.splice(questionIndex,1,question)
      }else{
        const qa:TKUserAnswer = {
          questionId:this.item.id,
          userAnswer:[option.identify]
        }
        this.userAnswers.push(qa)
      }
      this.currentIndex = this.index+1
    }else{ //多选
      if (question) {
        if (question.userAnswer.indexOf(option.identify) >= 0) {//答题记录包含
          const index = question.userAnswer.findIndex(obj=>obj===option.identify)
          question.userAnswer.splice(index,1)
        }else{
          question.userAnswer.push(option.identify)
        }
        this.userAnswers.splice(questionIndex,1,question)
      }else{
        const qa:TKUserAnswer = {
          questionId:this.item.id,
          userAnswer:[option.identify]
        }
        this.userAnswers.push(qa)
      }
    }
  }

  //判断选项是否被选中
  getISSelected(option:Option){
    let question = this.userAnswers.find(obj=>obj.questionId===this.item.id)
    if (question) { //答题记录中有这道题
      if (question.userAnswer.indexOf(option.identify) >= 0) {
        return true
      }else{
        return false
      }
    }else{
      return false
    }
  }

  /**
   * type题目类型：1 单选，2  多选，3 判断
   */
  getQuestionType(type:number){
    switch (type) {
      case 1:
        return '单选题'
        break;
      case 2:
        return '多选题'
        break;
      default:
        return '判断题'
        break;
    }
  }

  //获取试题选项
  @Builder
  getOption(option:Option){
    Row({space:7.5}){
      Text(option.identify)
        .width(30)
        .aspectRatio(1)
        .borderRadius(15)
        .backgroundColor(this.getISSelected(option)?$r('app.color.option_selectColor'):$r('app.color.option_normalColor'))
        .fontColor(this.getISSelected(option)?$r('app.color.white'):$r('app.color.text_primary'))
        .fontSize(14)
        .fontWeight(FontWeight.Bold)
        .textAlign(TextAlign.Center)
      Text(option.desc)
        .fontSize(14)
        .fontColor($r('app.color.text_primary'))
        .layoutWeight(1)
    }
    .padding({
      top:18,
      bottom:14
    })
    .width('100%')
    .onClick(()=>{
      this.selectOption(option)
    })
  }

  build() {
    Column(){
      Row(){
        Image($r('app.media.examination_edit'))
          .width(12)
          .height(14)
          .onClick(()=>{
            this.questionCardClick()
          })
      }
      .justifyContent(FlexAlign.End)
      .width('100%')
      Text(this.paperTitle)
        .fontSize(15)
        .fontColor($r('app.color.text_primary'))
        .fontWeight(FontWeight.Bold)
        .width('100%')
        .textAlign(TextAlign.Center)
      Progress({value:this.index+1,total:this.total})
        .width('100%')
        .color($r('app.color.primary'))
        .margin({
          top:17,
          bottom:7
        })
      Row(){
        Text(){
          Span((this.index+1).toString())
            .fontColor($r('app.color.primary'))
          Span(`/${this.total}`)
            .fontColor($r('app.color.text_third'))
        }
        .fontSize(10)
      }
      .width('100%')
      .justifyContent(FlexAlign.End)

      Text(this.getQuestionType(this.item.type))
        .fontColor($r('app.color.text_blue'))
        .fontSize(11)
        .backgroundColor($r('app.color.blue_back'))
        .padding({
          left:10,
          right:10
        })
        .height(21)
        .borderRadius(10.5)
        .margin({
          top:8,
          bottom:9
        })

      Text(this.item.questionText)
        .fontSize(14)
        .fontColor($r('app.color.text_primary'))
        .fontWeight(FontWeight.Medium)
        .width('100%')

      List(){
        ForEach(this.item.options,(option:Option,index:number)=>{
          ListItem(){
            this.getOption(option)
          }
        })
      }
      if (this.item.type===2&&this.ISHasAnswer()){
        Row(){
          Button(){
            Stack(){
              Image($r('app.media.button_back'))
                .width('100%')
                .height('100%')
                .borderRadius(15)
              Text('下一题')
                .fontSize(15)
                .fontColor($r('app.color.white'))
                .fontWeight(FontWeight.Bold)
            }
          }
          .borderRadius(15)
          .width(98)
          .height(30)
          .onClick(()=>{
            this.currentIndex = this.index+1
          })
        }
        .justifyContent(FlexAlign.Center)
        .width('100%')
        .margin({
          top:53,
          bottom:88
        })
      }

    }
    .alignItems(HorizontalAlign.Start)
    .width('100%')
  }
}

export {TKExaminationItem}