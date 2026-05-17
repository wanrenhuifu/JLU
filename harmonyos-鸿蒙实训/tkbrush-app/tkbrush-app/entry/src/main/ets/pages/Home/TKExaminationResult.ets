import { TKCard } from '../../components/TKCard'
import { TKNavBar } from '../../components/TKNavBar'
import { Question, TKAnswerSheet, TKQuestionResult } from '../../models/Paper'
import { router } from '@kit.ArkUI'
import { TKRouterParms } from '../../models/TKRouterParms'
import { getQuestionResultApi, getQuestionsApi } from '../../api/PaperApi'
import { Utils } from '../../utils/Utils'

@Entry
@Component
struct TKExaminationResult {

  //中间项每行显示多少个
  @State
  columns:number = 0
  //试卷id
  paperId:string = ''

  @State
  resultData:TKQuestionResult = {} as TKQuestionResult

  aboutToAppear(): void {
    const parms = router.getParams() as TKRouterParms
    if (parms && parms.id) {
      this.paperId = parms.id
    }
    this.getResult()
  }
  //获取练习报告
  async getResult(){
    this.resultData = await getQuestionResultApi(this.paperId)
  }

  /**
   * 获取选项背景色
   * answerStatus 用户答案状态：0 错误，1 正确，2 未答题
   */
  getOptionColor(answerStatus: number):ResourceColor{
    switch (answerStatus) {
      case 0:
        return $r('app.color.resultOption_errorColor')
        break;
      case 1:
        return $r('app.color.resultOption_selectColor')
        break;
      default:
        return $r('app.color.option_normalColor')
        break;
    }
    
  }

  //顶部card中的项
  @Builder
  getTopItem(leftIcon:ResourceStr,leftTitle:string,rightTitle:string){
    Row(){
      Image(leftIcon)
        .width(12)
        .aspectRatio(1)
      Text(`${leftTitle}：`)
        .fontSize(12)
        .fontColor($r('app.color.text_second'))
      Blank()
      Text(rightTitle)
        .fontSize(12)
        .fontColor($r('app.color.text_second'))
    }
    .height(35)
    .width('100%')
  }

  //中间card的项
  @Builder
  getMiddleItem(title:string,color:ResourceColor) {
    Row({space:2}){
      Text()
        .width(5)
        .aspectRatio(1)
        .borderRadius(2.5)
        .backgroundColor(color)
      Text(title)
        .fontSize(10)
        .fontColor(color)
    }
    .margin({
      left:22
    })
  }

  //底部card的项
  @Builder
  getBottomItem(topTitle:string,bottomTitle:string,color:ResourceColor){
    Column({space:6}){
      Text(topTitle)
        .fontSize(10)
        .fontColor($r('app.color.text_second'))
      Text(bottomTitle)
        .fontSize(13)
        .fontWeight(FontWeight.Medium)
        .fontColor(color)
    }
  }

  build() {
    Stack({alignContent:Alignment.Top}){
      Image($r('app.media.navbar_back'))
        .width('100%')
        .expandSafeArea([SafeAreaType.SYSTEM],[SafeAreaEdge.TOP])

        if (this.resultData.paperName){
          Column(){
            TKNavBar({title:'练习报告',backClick:()=>{
              router.back({
                url:'pages/Index'
              })
            }})
            Scroll(){
              Column(){
                //顶部card
                TKCard({marginLeft:0,marginRight:0,paddingLeft:23,paddingRight:20}){
                  Row(){
                    Text('难度4.8')
                      .width(50)
                      .height(18)
                      .backgroundColor($r('app.color.primary'))
                      .fontColor($r('app.color.white'))
                      .fontSize(10)
                      .textAlign(TextAlign.Center)
                      .borderRadius({
                        topLeft:9,
                        topRight:9,
                        bottomRight:9,
                        bottomLeft:0
                      })
                  }
                  .justifyContent(FlexAlign.End)
                  .width('100%')
                  .margin({
                    top:20
                  })
                  Gauge({ value: this.resultData.correctCount, min: 1, max: this.resultData.answerSheet.length }) {
                    Column({space:3}) {
                      Text('答对')
                        .fontSize(12)
                        .fontColor($r('app.color.text_second'))
                        .margin({
                          top:'20%'
                        })
                      Text(){
                        Span(this.resultData.correctCount.toString())
                          .fontSize(29)
                          .fontColor($r('app.color.text_primary'))
                          .fontWeight(FontWeight.Bold)
                        Span('题')
                          .fontSize(10)
                          .fontColor($r('app.color.text_second'))
                      }

                    }.width('100%').height('100%')
                  }
                  .startAngle(260)
                  .endAngle(100)
                  .colors($r('app.color.resultOption_selectColor'))
                  .width('70%')
                  .aspectRatio(1)
                  .indicator({
                    icon:$r('app.media.progress_point'),
                    space:0
                  })
                  .strokeWidth(15)
                  .trackShadow({ offsetX: 10, offsetY: 10 })
                  .padding(18)
                  .description(null)
                  Text(`共${this.resultData.answerSheet.length}题`)
                    .fontSize(11)
                    .fontColor($r('app.color.text_blue'))
                    .backgroundColor($r('app.color.blue_back'))
                    .textAlign(TextAlign.Center)
                    .borderRadius(10.5)
                    .width(64)
                    .height(21)
                    .margin({
                      top:'-30%'
                    })
                  this.getTopItem($r('app.media.question_type'),'练习试卷',this.resultData.paperName)
                  this.getTopItem($r('app.media.submit_time'),'交卷时间',Utils.getTimeStr(this.resultData.submitTime))

                }
                //中间card
                TKCard({marginLeft:0,marginRight:0,marginTop:10,marginBottom:10}){
                  Row(){
                    Row().width(4.5).height(14).borderRadius(2.5).backgroundColor($r('app.color.text_primary'))
                      .margin({
                        right:6.5
                      })
                    Text('答题卡')
                      .fontSize(15)
                      .fontColor($r('app.color.text_primary'))
                      .fontWeight(FontWeight.Bold)
                    Blank()
                    this.getMiddleItem('未做',$r('app.color.text_second'))
                    this.getMiddleItem('正确',$r('app.color.resultOption_selectColor'))
                    this.getMiddleItem('错误',$r('app.color.resultOption_errorColor'))
                  }
                  .width('100%')
                  .height(52)
                  GridRow({columns:this.columns}){
                    ForEach(this.resultData.answerSheet,(item:TKAnswerSheet,index:number)=>{
                      GridCol(){
                        Text((index+1).toString())
                          .width(30)
                          .aspectRatio(1)
                          .borderRadius(15)
                          .backgroundColor(this.getOptionColor(item.answerStatus))
                          .fontColor(item.answerStatus>1?$r('app.color.text_primary'):$r('app.color.white'))
                          .fontSize(14)
                          .fontWeight(FontWeight.Bold)
                          .textAlign(TextAlign.Center)
                      }
                      .width('100%')
                      .padding({
                        top:9,
                        bottom:9
                      })
                    })
                  }
                  .margin({
                    bottom:24
                  })
                }
                //底部card
                TKCard({marginLeft:0,marginRight:0}){
                  Row(){
                    Row().width(4.5).height(14).borderRadius(2.5).backgroundColor($r('app.color.text_primary'))
                      .margin({
                        right:6.5
                      })
                    Text('考试情况')
                      .fontSize(15)
                      .fontColor($r('app.color.text_primary'))
                      .fontWeight(FontWeight.Bold)
                  }
                  .width('100%')
                  .margin({
                    top:16,
                    bottom:11
                  })

                  Stack(){
                    Row(){}
                    .backgroundColor($r('app.color.resultBottom_backColor'))
                    .width('100%')
                    .height(70)
                    .opacity(0.2)

                    Row(){
                      this.getBottomItem('未做',`${this.resultData.unansweredCount}题`,$r('app.color.text_blue'))
                      this.getBottomItem('答对',`${this.resultData.correctCount}题`,$r('app.color.resultOption_selectColor'))
                      this.getBottomItem('答错',`${this.resultData.incorrectCount}题`,$r('app.color.resultOption_errorColor'))
                      this.getBottomItem('总用时',`${this.resultData.totalTime}秒`,$r('app.color.text_blue'))
                    }
                    .justifyContent(FlexAlign.SpaceAround)
                    .width('100%')
                    .height(70)
                  }
                  .width('100%')
                  .height(70)
                  .margin({
                    bottom:20
                  })

                }
              }
            }
            .scrollBar(BarState.Off)
            .width('100%')
            .layoutWeight(1)
          }
          .onAreaChange((oldValue,newValue)=>{
            const width = newValue.width as number
            this.columns = (width-76)*2/3/30
          })
          .padding({
            left:15,
            right:15
          })
          .width('100%')
        }
      }
      .backgroundColor($r('app.color.back_color'))
      .align(Alignment.Top)
      .width('100%')
      .height('100%')

  }
}