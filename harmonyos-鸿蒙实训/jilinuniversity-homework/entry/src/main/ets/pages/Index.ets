import router from '@ohos.router';

@Entry
@Component
struct Index {
  @State message: string = '测试应用';

  // 使用@Builder装饰构建函数
  @Builder createSection(title: string) {
    Text(title)
      .fontSize(16)
      .fontWeight(FontWeight.Bold)
      .fontColor('#546E7A')
      .margin({ top: 8, bottom: 8 })
      .textAlign(TextAlign.Start)
      .width('100%')
  }

  @Builder createButton(text: string, url: string) {
    Button(text)
      .width('100%')
      .height(55)
      .fontSize(17)
      .fontColor('#263238')
      .backgroundColor('#FFFFFF')
      .borderRadius(12)
      .shadow({ radius: 3, color: '#DDDDDD', offsetX: 0, offsetY: 2 })
      .onClick(() => {
        router.pushUrl({
          url: url
        })
      })
  }

  build() {
    Column() {
      // 顶部标题栏
      Row() {
        Text(this.message)
          .fontSize(32)
          .fontWeight(FontWeight.Bold)
          .textAlign(TextAlign.Center)
          .fontColor('#36648B')
      }
      .width('100%')
      .height(80)
      .justifyContent(FlexAlign.Center)
      .backgroundColor('#E0F7FA')
      .shadow({ radius: 4, color: '#888', offsetX: 0, offsetY: 2 })
      
      // 滚动内容区域
      Scroll() {
        Column({
          space: 16
        }) {
          // 导航按钮列表 - 分组显示
          this.createSection('布局组件测试')
          this.createButton('弹性布局测试', 'pages/FlexTest')
          this.createButton('列布局测试', 'pages/ColumnTest')
          this.createButton('行布局测试', 'pages/RowTest')
          this.createButton('堆叠布局测试', 'pages/StackTest')
          this.createButton('滚动组件测试', 'pages/ScrollTest')
          
          this.createSection('列表与网格')
          this.createButton('列表组件测试', 'pages/ListTest')
          this.createButton('网格组件测试', 'pages/GridTest')
          this.createButton('轮播图测试', 'pages/SwiperTest')
          
          this.createSection('容器组件')
          this.createButton('标签页组件测试', 'pages/TabsTest')
          
          this.createSection('基础组件')
          this.createButton('边框样式测试', 'pages/BorderTest')
          this.createButton('边距内边距测试', 'pages/MarginPadding')
          this.createButton('通用组件测试', 'pages/CommonTest')
          
          this.createSection('数据与渲染')
          this.createButton('数据传递测试', 'pages/DataTest')
          this.createButton('条件渲染测试', 'pages/IfElseTest')
          this.createButton('循环渲染测试', 'pages/ForEachTest')
          
          this.createSection('高级功能')
          this.createButton('路由测试', 'pages/RouterTest')
          this.createButton('构建器测试', 'pages/BuilderTest')
          this.createButton('方法调用测试', 'pages/Method')
          
          this.createSection('数据存储')
          this.createButton('SQLite测试', 'pages/SQTest')
          this.createButton('首选项存储测试', 'pages/PerferencesTest')
          
          this.createSection('其他测试')
          this.createButton('测试01', 'pages/Test01')
          this.createButton('页面测试', 'pages/PagesTest')
          this.createButton('测试页面', 'pages/TestPages')
        }
        .padding({ top: 20, bottom: 30, left: 20, right: 20 })
      }
      .flexGrow(1)
      .backgroundColor('#F5F5F5')
      .scrollBar(BarState.Auto)
    }
    .height('100%')
    .width('100%')
  }
}