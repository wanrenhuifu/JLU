@Component
struct TKList {
  @State
  isRefreshing:boolean = false
  @State
  isFinished:boolean = false

  isLoading:boolean = false

  @Prop
  dataList:object[] = []

  @Prop
  total:number = 0

  //列表项
  @BuilderParam
  listItem:(item:object)=>void

  downLoad:()=>void = ()=>{}
  loadMore:()=>void = ()=>{}


  @Builder
  getRefreshHeader() {
    Row({ space: 8 }) {
      LoadingProgress().width(30).aspectRatio(1).color($r('app.color.primary'))
      Text('拼命加载中...')
        .fontSize(13)
        .fontColor($r('app.color.text_third'))
    }
    .constraintSize({ minHeight: 32 }) // 设置最小高度约束保证自定义组件高度随刷新区域高度变化时自定义组件高度不会低于minHeight
  }

  build() {
    Refresh({ refreshing: $$this.isRefreshing, builder: this.getRefreshHeader() }) {
      List({ space: 11 }) {
        ForEach(this.dataList, (item: object) => {
          ListItem() {
            this.listItem(item)
          }
        })
        ListItem() {
          if (!this.isFinished){
            Text('加载更多数据...')
              .fontSize(13)
              .fontColor($r('app.color.text_third'))
              .width('100%')
              .textAlign(TextAlign.Center)
              .margin({
                left: 15,
                right: 15
              })
              .height(50)
          }else{
            Text('没有更多数据了')
              .fontSize(13)
              .fontColor($r('app.color.text_third'))
              .width('100%')
              .textAlign(TextAlign.Center)
              .margin({
                left: 15,
                right: 15
              })
              .height(50)
          }
        }
      }
      .width('100%')
      .height('100%')
      .onReachEnd(async () => { //上拉加载更多
        if (!this.isLoading&&this.dataList.length>0&&!this.isFinished) {
          this.isLoading = true
          await this.loadMore()
          this.isFinished = this.dataList.length>=this.total
          this.isLoading = false
        }
      })
    }
    .onStateChange(async (state: RefreshStatus) => {//下拉刷新
      if (state === RefreshStatus.Refresh) {
        this.isFinished = false
        this.isLoading = true
        await this.downLoad()
        this.isLoading = false
        this.isRefreshing = false
      }
    })
    .width('100%')
    .layoutWeight(1)
  }
}

export {TKList}