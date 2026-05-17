@Entry
@Component
struct TestPages{
  @State str :string = 'qwer'
  @State age :number = 20

  submitFun(){
    if(true){
      this.age=30
    }
  }

  build(){
    Column() {
      Text('TestPages Page')
        .fontSize(24)
        .fontWeight(FontWeight.Bold)
        .margin({ top: 50 })
      
      Text(`String: ${this.str}`)
        .fontSize(18)
        .margin({ top: 20 })
      
      Text(`Age: ${this.age}`)
        .fontSize(18)
        .margin({ top: 10 })
      
      Button('Change Age')
        .width(150)
        .height(40)
        .margin({ top: 30 })
        .onClick(() => {
          this.submitFun()
        })
    }
    .height('100%')
    .width('100%')
    .justifyContent(FlexAlign.Center)
  }
}
