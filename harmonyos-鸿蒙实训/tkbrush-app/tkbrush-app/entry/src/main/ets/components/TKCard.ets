
@Preview
@Component
struct TKCard {
  @Prop
  paddingLeft:number = 15
  @Prop
  paddingRight:number = 15
  @Prop
  paddingTop:number = 0
  @Prop
  paddingBottom:number = 0

  @Prop
  marginLeft:number = 15
  @Prop
  marginRight:number = 15
  @Prop
  marginTop:number = 0
  @Prop
  marginBottom:number = 0

  @BuilderParam
  child:()=>void

  build() {
    Column(){
      if (this.child){
        this.child()
      }
    }
    .backgroundColor($r('app.color.white'))
    .borderRadius(11)
    .margin({
      left:this.marginLeft,
      right:this.marginRight,
      top:this.marginTop,
      bottom:this.marginBottom
    })
    .padding({
      left:this.paddingLeft,
      right:this.paddingRight,
      top:this.paddingTop,
      bottom:this.paddingBottom
    })
  }
}

export {TKCard}