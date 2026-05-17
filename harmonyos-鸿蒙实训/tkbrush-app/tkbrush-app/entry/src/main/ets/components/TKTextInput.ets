import { Font } from '@ohos.arkui.UIContext'

// @Preview
@Component
struct TKTextInput {
  textInputType:TKTextInputType = TKTextInputType.TKTextInputType_normal
  leftIcon:ResourceStr = '' //左侧图标
  textInputPlaceholder:string = '' //输入框提示语
  @Link
  textInputContent:string  //输入框输入的内容
  @Prop
  codeStr:string = '' //验证码base64的字符串
  @State
  showPassword:boolean = false  //密码的时候显示名问还是暗文
  //输入框获取焦点事件
  textInputOnFocus:()=>void = ()=>{}
  build() {
    Row(){
      Image(this.leftIcon)
        .width(10.5)
        .height(12.5)
        .margin({
          left:21
        })
      TextInput({placeholder:this.textInputPlaceholder,text:$$this.textInputContent})
        .layoutWeight(1)
        .backgroundColor($r('app.color.white'))
        .placeholderColor($r('app.color.text_third'))
        .placeholderFont({size:14})
        .showPassword(this.showPassword)
        .showPasswordIcon(false)
        .type(this.textInputType===TKTextInputType.TKTextInputType_password?InputType.Password:InputType.Normal)
        .onFocus(()=>{
          this.textInputOnFocus()
        })
      if (this.textInputType===TKTextInputType.TKTextInputType_code){
        Image(this.codeStr)
          .width(75)
          .height(22.5)
          .margin({
            right:16
          })
      }
      if (this.textInputType === TKTextInputType.TKTextInputType_password){
        Image(this.showPassword?$r('app.media.show_password'):$r('app.media.hidden_password'))
          .width(18)
          .height(12.5)
          .onClick(()=>{
            this.showPassword = !this.showPassword
          })
          .margin({
            right:23
          })
      }
    }
    .borderRadius(23.5)
    .shadow({
      color:$r('app.color.textInput_shadow'),
      offsetX:0,
      offsetY:-2.5,
      radius:23.5
    })
    .width('100%')
    .height(47)
  }
}

export {TKTextInput}

export enum TKTextInputType{
  TKTextInputType_normal, //常规类型
  TKTextInputType_code, //验证码类型
  TKTextInputType_password  //密码类型
}