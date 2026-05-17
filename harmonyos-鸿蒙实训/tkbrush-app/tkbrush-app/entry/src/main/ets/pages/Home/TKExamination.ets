import { TKCard } from '../../components/TKCard'
import { TKExaminationItem } from '../../components/TKExaminationItem'
import { TKNavBar } from '../../components/TKNavBar'
import { promptAction, router } from '@kit.ArkUI'
import { TKRouterParms } from '../../models/TKRouterParms'
import { getQuestionsApi, startQuestionApi, submitPaperApi } from '../../api/PaperApi'
import { ListParms, Question, StartQuestionParms, SubmitPaperParms, TKUserAnswer } from '../../models/Paper'
import { TKQuestionCard } from '../../components/TKQuestionCard'
import { TKSubmitCard } from '../../components/TKSubmitCard'

@Entry
@Component
struct TKExamination {

  //倒计时控制器
  textTimerController:TextTimerController = new TextTimerController()

  //试卷id
  paperId:string = ''
  //试卷标题
  paperTitle:string = ''
  //所有试题
  @State
  questionList:Question[] = []

  //用户的答案集合
  @Provide
  userAnswers:TKUserAnswer[] = []
  //当前试题的索引
  @State
  currentIndex:number = 0

  //试题总数
  @State
  total:number = 0
  //当前试卷的交卷状态 0 未提交（未答题） 开始答题 ，1 已提交 重新答题，2 保存未提交 继续答题
  userSubmitStatus:number = 0

  //答题卡弹窗
  cardController:CustomDialogController = new CustomDialogController({
    builder:TKQuestionCard({
      questionList:this.questionList,
      currentIndex:this.currentIndex,
      submitPaper:()=>{
        this.submitPaper()
      }
    }),
    customStyle:true
  })

  //交卷
  async submitPaper(){
    if (this.userAnswers.length <= 0) {
      AlertDialog.show({
        message:'答题记录不能为空'
      })
      return
    }
    const parms:SubmitPaperParms = {
      submitStatus:1,
      answers:this.userAnswers
    }
    await submitPaperApi(parms,this.paperId)
    promptAction.showToast({
      message:'交卷成功'
    })
    getContext().eventHub.emit('paperListChange')
    router.pushUrl({
      url:'pages/Home/TKExaminationResult',
      params:{id:this.paperId}
    })
  }

  aboutToAppear(): void {
    const parms = router.getParams() as TKRouterParms
    if (parms && parms.id) {
      this.paperId = parms.id
      this.paperTitle = parms.name
      this.userSubmitStatus=parms.type
    }

    setTimeout(()=>{
      this.textTimerController.start()
    },1000)

    //获取试题
    this.getQuestions()
  }

  //获取所有试题
  async getQuestions(){
    const parms:ListParms = {
      page:1,
      pageSize:9999
    }
    const questionData = await getQuestionsApi(parms,this.paperId)
    this.questionList = questionData.questions
    this.total= questionData.total
    //开始答题
    this.startQuestion()
  }

  //开始答题
  async startQuestion(){
    // status 1：开始答题 2：继续答题 3：重新答题
    const parms:StartQuestionParms = {
      status:this.getQuestionStatus()
    }
    await startQuestionApi(parms,this.paperId)
    promptAction.showToast({
      message:'试题初始化完成，请开始答题'
    })
  }

  //获取开始答题的状态
  getQuestionStatus(){
    switch (this.userSubmitStatus) {
      case 0:
        return 1
        break;
      case 1:
        return 3
        break;
      default:
        return 2
        break;
    }
  }

  build() {
    Stack({alignContent:Alignment.Top}){
      Image($r('app.media.navbar_back'))
        .width('100%')
        .expandSafeArea([SafeAreaType.SYSTEM],[SafeAreaEdge.TOP])
      Column() {
        TKNavBar({title:'考试中心'})
        Row({space:7.5}){
          Image($r('app.media.examination_time'))
            .width(24)
            .height(22)
          TextTimer({ isCountDown: true, count: 30000, controller: this.textTimerController })
            .format('HH:mm:ss')
            .fontColor($r('app.color.text_primary'))
            .fontSize(19)
            .fontWeight(FontWeight.Bold)
            .onTimer((utc: number, elapsedTime: number) => {
              if (elapsedTime === 30) {
                AlertDialog.show({
                  message:'倒计时结束，做点儿什么吧'
                })
              }
              console.info('textTimer notCountDown utc is：' + utc + ', elapsedTime: ' + elapsedTime)
            })
        }
        .margin({
          top:17,
          bottom:18
        })

        TKCard({marginLeft:0,marginRight:0,paddingTop:10,paddingBottom:50}){
          Swiper(){
            ForEach(this.questionList,(item:Question,index:number)=>{
              TKExaminationItem({item:item,index:index,total:this.total,paperTitle:this.paperTitle,currentIndex:this.currentIndex,questionCardClick:()=>{
                this.cardController.open()
              }})
            })
            TKSubmitCard({questionList:this.questionList,total:this.total,paperTitle:this.paperTitle,currentIndex:this.currentIndex,submitPaper:()=>{
              this.submitPaper()
            }})
          }
          .index($$this.currentIndex)
          .indicator(false)
          .loop(false)
          .width('100%')
        }
      }
      .padding({
        left:15,
        right:15
      })
      .width('100%')
      .height('100%')
    }
    .backgroundColor($r('app.color.back_color'))
    .width('100%')
    .height('100%')
  }
}