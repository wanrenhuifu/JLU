import { TKNavBar } from '../../components/TKNavBar'
import { TKTextInput, TKTextInputType } from '../../components/TKTextInput'
import axios from '@ohos/axios'
import { getImgCodeApi, registerApi } from '../../api/UserApi'
import { GetCodeParms, RegisterParms } from '../../models/User'
import { promptAction, router } from '@kit.ArkUI'
import userStore from '../../utils/UserStore'

@Entry
@Component
struct TKRegister {

  //用户名
  @State
  userName:string = '18537158269'
  //验证啊
  @State
  code:string = ''
  //验证码唯一标识
  captchaId:string = ''
  //base64的图片
  @State
  codeStr:string = ''
  //密码
  @State
  password:string = ''

  //确认密码
  @State
  newPassword:string = ''

  /**
   * 获取验证码
   */
  async getImgCode(){
    if (this.userName.length>=11) {
      const parms:GetCodeParms = {
        identify:this.userName
      }
      const data = await getImgCodeApi(parms)
      this.codeStr= 'data:image/png;base64,' + data.imageBase64
      this.captchaId = data.captchaId
    }
  }

  /**
   * 用户注册
   */
  async register(){
    if (this.userName.length < 11) {
      promptAction.showToast({
        message:'请输入正确的手机号'
      })
      return
    }
    if (this.code.length <= 0) {
      promptAction.showToast({
        message:'请输入验证码'
      })
      return
    }
    if (this.password.length < 6 || this.newPassword.length < 6 || this.password != this.newPassword) {
      promptAction.showToast({
        message:'请输入正确的密码'
      })
      return
    }

    const parms:RegisterParms = {
      username:this.userName,
      verifycode:this.code,
      captchaId:this.captchaId,
      password:this.password
    }
    const data = await registerApi(parms)
    //存储token
    userStore.setUserToken(data)
    promptAction.showToast({
      message:'注册成功'
    })
    router.replaceUrl({
      url:'pages/Index'
    })
  }

  build() {
    Stack({alignContent:Alignment.Top}){
      Image($r('app.media.login_top'))
        .width('100%')
        .expandSafeArea([SafeAreaType.SYSTEM],[SafeAreaEdge.TOP])
      Column(){
        TKNavBar({title:''})
        Image($r('app.media.register_title'))
          .width(139)
          .height(60)
          .margin({
            top:24,
            bottom:32
          })
        Column(){
          Text('用户注册')
            .fontSize(16)
            .fontColor($r('app.color.text_primary'))
            .fontWeight(FontWeight.Medium)
            .margin({
              top:38
            })
          Text('User registration')
            .fontSize(16)
            .fontColor($r('app.color.text_third'))
            .fontWeight(FontWeight.Medium)

          TKTextInput({leftIcon:$r('app.media.username_icon'),textInputPlaceholder:'请输入手机号',textInputContent:this.userName})
            .margin({
              top:31,
              bottom:26
            })
          TKTextInput({leftIcon:$r('app.media.code_icon'),textInputPlaceholder:'请输入验证码',textInputContent:this.code,textInputType:TKTextInputType.TKTextInputType_code,codeStr:this.codeStr,textInputOnFocus:()=>{
            this.getImgCode()
          }})
          TKTextInput({leftIcon:$r('app.media.password_icon'),textInputPlaceholder:'设置密码(6-20位字母数字组合)',textInputContent:this.password,textInputType:TKTextInputType.TKTextInputType_password})
            .margin({
              top:26,
              bottom:26
            })
          TKTextInput({leftIcon:$r('app.media.password_icon'),textInputPlaceholder:'请再次输入密码',textInputContent:this.newPassword,textInputType:TKTextInputType.TKTextInputType_password})
          Button(){
            Stack(){
              Image($r('app.media.button_back'))
                .width('100%')
              Text('立即注册')
                .fontSize(15)
                .fontColor($r('app.color.white'))
                .fontWeight(FontWeight.Bold)
            }
          }
          .margin({
            top:28,
            bottom:83
          })
          .onClick(()=>{
            this.register()
          })
          Text(){
            Span('已有账号，')
              .fontColor($r('app.color.text_second'))
            Span('立即登录>')
              .fontColor($r('app.color.primary'))
              .decoration({color:$r('app.color.primary'),type:TextDecorationType.Underline,style:TextDecorationStyle.SOLID})
              .onClick(()=>{
                router.back({
                  url:'pages/Login/TKLogin'
                })
              })
          }
          .fontSize(13)
          .margin({
            bottom:29
          })
        }
        .padding({
          left:24,
          right:24
        })
        .backgroundColor($r('app.color.white'))
        .borderRadius(11)
        .width('100%')
      }
      .alignItems(HorizontalAlign.Start)
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