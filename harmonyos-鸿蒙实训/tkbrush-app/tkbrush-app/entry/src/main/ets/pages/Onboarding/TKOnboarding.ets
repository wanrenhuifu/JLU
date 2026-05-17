import { router } from '@kit.ArkUI'

/**
 * 引导页数据模型
 */
interface OnboardingPage {
  icon: string | Resource
  title: string
  subtitle: string
}

/**
 * APP引导页 - 首次启动时显示
 * 功能：3页轮播引导，介绍APP核心功能
 */
@Entry
@Component
struct TKOnboarding {
  // 引导页数据
  private onboardingPages: OnboardingPage[] = [
    {
      icon: $r('app.media.app_icon'),
      title: '海量题库，精准覆盖',
      subtitle: '收录历年真题与名师预测，助你一战成名。'
    },
    {
      icon: $r('app.media.home_select'),
      title: '智能分析，查漏补缺',
      subtitle: 'AI算法生成专属学习报告，薄弱知识点一网打尽。'
    },
    {
      icon: $r('app.media.community_select'),
      title: '高效提分，即刻开始',
      subtitle: '科学规划学习路径，让每一次练习都有价值。'
    }
  ]

  // 当前页面索引
  @State currentIndex: number = 0
  // Swiper控制器
  private swiperController: SwiperController = new SwiperController()

  /**
   * 单个引导页内容
   */
  @Builder
  OnboardingPageContent(page: OnboardingPage, index: number) {
    Column({ space: 40 }) {
      // 顶部留白
      Column().layoutWeight(1)

      // 图标/图片
      Image(page.icon)
        .width(240)
        .height(240)
        .objectFit(ImageFit.Contain)
        .animation({
          duration: 600,
          curve: Curve.EaseInOut,
          playMode: PlayMode.Normal
        })

      // 文字内容区域
      Column({ space: 16 }) {
        // 主标题
        Text(page.title)
          .fontSize(24)
          .fontWeight(FontWeight.Bold)
          .fontColor('#333333')
          .textAlign(TextAlign.Center)
          .width('80%')

        // 副标题
        Text(page.subtitle)
          .fontSize(15)
          .fontColor('#666666')
          .textAlign(TextAlign.Center)
          .width('85%')
          .lineHeight(24)
      }
      .width('100%')
      .alignItems(HorizontalAlign.Center)

      // 底部留白
      Column().layoutWeight(1)

      // 指示器和按钮区域
      Column({ space: 32 }) {
        // 页面指示器
        Row({ space: 8 }) {
          ForEach([0, 1, 2], (i: number) => {
            Column()
              .width(this.currentIndex === i ? 24 : 8)
              .height(8)
              .backgroundColor(this.currentIndex === i ? '#00ACC1' : '#E0E0E0')
              .borderRadius(4)
              .animation({
                duration: 300,
                curve: Curve.EaseInOut
              })
          })
        }
        .justifyContent(FlexAlign.Center)

        // 底部按钮
        if (index === 2) {
          // 最后一页显示"开启学习之旅"按钮
          Button('开启学习之旅')
            .width('80%')
            .height(50)
            .fontSize(16)
            .fontWeight(FontWeight.Medium)
            .backgroundColor('#00ACC1')
            .fontColor(Color.White)
            .borderRadius(25)
            .onClick(() => {
              this.finishOnboarding()
            })
        } else {
          // 前两页显示"跳过"按钮
          Row() {
            Blank()
            Text('跳过')
              .fontSize(15)
              .fontColor('#999999')
              .padding(10)
              .onClick(() => {
                this.finishOnboarding()
              })
          }
          .width('80%')
        }
      }
      .width('100%')
      .padding({ bottom: 40 })
    }
    .width('100%')
    .height('100%')
  }

  /**
   * 完成引导，跳转到主页面
   * 简化版：不保存状态，直接跳转
   */
  finishOnboarding(): void {
    // 直接跳转到主页面（显示Tab导航）
    router.replaceUrl({
      url: 'pages/Index'
    })
  }

  build() {
    Column() {
      // 轮播容器
      Swiper(this.swiperController) {
        ForEach(this.onboardingPages, (page: OnboardingPage, index: number) => {
          this.OnboardingPageContent(page, index)
        })
      }
      .index($$this.currentIndex)
      .indicator(false) // 使用自定义指示器
      .loop(false)
      .duration(400)
      .curve(Curve.EaseInOut)
      .onChange((index: number) => {
        this.currentIndex = index
      })
    }
    .width('100%')
    .height('100%')
    .backgroundColor(Color.White)
  }
}
