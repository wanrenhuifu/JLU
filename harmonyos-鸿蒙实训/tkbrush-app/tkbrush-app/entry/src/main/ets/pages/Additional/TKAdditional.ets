import { StudyStats, FeatureCard, getMockStudyStats, getFeatureCards } from '../../models/StudyData'
import { promptAction } from '@kit.ArkUI'

/**
 * 错题本与数据中心模块
 * 功能：展示用户学习进度、错题统计、收藏、周报、排名
 */
@Component
export struct TKAdditional {
  // 学习统计数据
  @State studyStats: StudyStats = getMockStudyStats()
  @State featureCards: FeatureCard[] = []

  aboutToAppear(): void {
    // 初始化功能卡片数据
    this.featureCards = getFeatureCards(this.studyStats)
  }

  /**
   * 顶部用户统计卡片
   */
  @Builder
  UserStatsCard() {
    Column() {
      // 用户信息行
      Row() {
        // 头像
        Image(this.studyStats.avatar)
          .width(60)
          .height(60)
          .borderRadius(30)
          .margin({ right: 16 })

        // 用户名和学习天数
        Column({ space: 8 }) {
          Text(this.studyStats.userName)
            .fontSize(20)
            .fontWeight(FontWeight.Bold)
            .fontColor(Color.White)

          Text(`坚持学习 ${this.studyStats.studyDays} 天`)
            .fontSize(14)
            .fontColor('#E0F7FA')
        }
        .alignItems(HorizontalAlign.Start)
        .layoutWeight(1)

        // 总刷题数
        Column({ space: 4 }) {
          Text(`${this.studyStats.totalQuestions}`)
            .fontSize(24)
            .fontWeight(FontWeight.Bold)
            .fontColor(Color.White)

          Text('总题数')
            .fontSize(12)
            .fontColor('#E0F7FA')
        }
        .margin({ left: 16 })
      }
      .width('100%')
      .padding(20)
    }
    .width('100%')
    .linearGradient({
      angle: 135,
      colors: [
        ['#4FC3F7', 0.0],  // 清新蓝色
        ['#26C6DA', 0.5],  // 青色
        ['#00ACC1', 1.0]   // 深青色
      ]
    })
    .borderRadius(16)
    .shadow({
      radius: 12,
      color: 'rgba(38, 198, 218, 0.3)',
      offsetX: 0,
      offsetY: 4
    })
  }

  /**
   * 功能宫格卡片
   */
  @Builder
  FeatureGridCard(card: FeatureCard) {
    Column({ space: 12 }) {
      // 图标
      Image(card.icon)
        .width(48)
        .height(48)
        .objectFit(ImageFit.Contain)

      // 标题
      Text(card.title)
        .fontSize(15)
        .fontWeight(FontWeight.Medium)
        .fontColor($r('app.color.text_primary'))

      // 数值
      Text(card.value.toString())
        .fontSize(18)
        .fontWeight(FontWeight.Bold)
        .fontColor('#00ACC1')
    }
    .width('100%')
    .height(140)
    .backgroundColor(Color.White)
    .borderRadius(12)
    .justifyContent(FlexAlign.Center)
    .shadow({
      radius: 8,
      color: 'rgba(0, 0, 0, 0.08)',
      offsetX: 0,
      offsetY: 2
    })
    .onClick(() => {
      promptAction.showToast({
        message: `进入${card.title}页面`,
        duration: 2000
      })
    })
  }

  /**
   * 本周学习数据图表（简化版柱状图）
   */
  @Builder
  WeeklyChartCard() {
    Column({ space: 16 }) {
      // 标题
      Row() {
        Text('本周学习数据')
          .fontSize(18)
          .fontWeight(FontWeight.Bold)
          .fontColor($r('app.color.text_primary'))
          .layoutWeight(1)

        Text('单位：题')
          .fontSize(12)
          .fontColor($r('app.color.text_second'))
      }
      .width('100%')

      // 柱状图
      Row({ space: 8 }) {
        ForEach(['一', '二', '三', '四', '五', '六', '日'], (day: string, index: number) => {
          Column({ space: 4 }) {
            // 柱子容器
            Column() {
              // 空白区域（用于对齐）
              Column()
                .layoutWeight(100 - this.studyStats.weeklyData[index])

              // 实际柱子
              Column()
                .layoutWeight(this.studyStats.weeklyData[index])
                .backgroundColor(index === 6 ? '#FF6E40' : '#4FC3F7') // 周日用橙色高亮
                .borderRadius({ topLeft: 4, topRight: 4 })

              // 数值显示
              Text(`${this.studyStats.weeklyData[index]}`)
                .fontSize(11)
                .fontColor($r('app.color.text_second'))
                .margin({ top: 4 })
            }
            .height(140)
            .width('100%')
            .justifyContent(FlexAlign.End)

            // 星期标签
            Text(day)
              .fontSize(12)
              .fontColor($r('app.color.text_second'))
          }
          .layoutWeight(1)
        })
      }
      .width('100%')
      .height(180)
    }
    .width('100%')
    .padding(20)
    .backgroundColor(Color.White)
    .borderRadius(12)
    .shadow({
      radius: 8,
      color: 'rgba(0, 0, 0, 0.08)',
      offsetX: 0,
      offsetY: 2
    })
  }

  build() {
    Column() {
      // 顶部导航栏
      Row() {
        Text('学习中心')
          .fontSize(18)
          .fontWeight(FontWeight.Bold)
          .fontColor($r('app.color.text_primary'))
      }
      .width('100%')
      .height(56)
      .padding({ left: 16, right: 16 })
      .justifyContent(FlexAlign.Start)
      .backgroundColor(Color.White)

      // 分割线
      Divider()
        .color('#E5E5E5')
        .strokeWidth(0.5)

      // 滚动容器
      Scroll() {
        Column({ space: 16 }) {
          // 顶部用户统计卡片
          this.UserStatsCard()

          // 功能宫格（2x2布局）
          Grid() {
            ForEach(this.featureCards, (card: FeatureCard) => {
              GridItem() {
                this.FeatureGridCard(card)
              }
            })
          }
          .columnsTemplate('1fr 1fr')
          .rowsTemplate('1fr 1fr')
          .columnsGap(12)
          .rowsGap(12)
          .width('100%')
          .height(300)

          // 本周学习数据图表
          this.WeeklyChartCard()

          // 底部留白
          Column()
            .height(20)
        }
        .width('100%')
        .padding(16)
      }
      .layoutWeight(1)
      .backgroundColor('#F5F5F5')
      .scrollBar(BarState.Off)
    }
    .width('100%')
    .height('100%')
    .backgroundColor('#F5F5F5')
  }
}
