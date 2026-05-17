import { TKNavBar } from '../../components/TKNavBar'
import { TKTextInput, TKTextInputType } from '../../components/TKTextInput'
import { promptAction, router } from '@kit.ArkUI'
import { loginApi } from '../../api/UserApi'
import { LoginParms } from '../../models/User'
import userStore from '../../utils/UserStore'

@Entry
@Component
struct TKLogin {

  //用户名
  @State
  userName:string = '18537158269'

  //密码
  @State
  password:string = '123456'

  isChecked:boolean = false

  async login(){
    if (this.userName.length < 11) {
      AlertDialog.show({
        message:'手机号输入错误'
      })
      return
    }
    if (this.password.length < 6) {
      AlertDialog.show({
        message:'密码输入错误'
      })
      return
    }
    if (!this.isChecked) {
      AlertDialog.show({
        message:'请先阅读并同意用户协议和隐私政策'
      })
      return
    }

    const parms:LoginParms = {
      username:this.userName,
      password:this.password
    }

    const userData = await loginApi(parms)
    userStore.setUserToken(userData)
    promptAction.showToast({
      message:'登录成功'
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
        Image($r('app.media.login_title'))
          .width(138)
          .height(60)
          .margin({
            bottom:32
          })
        Column(){
          Text('账号登录')
            .fontSize(16)
            .fontColor($r('app.color.text_primary'))
            .fontWeight(FontWeight.Medium)
            .margin({
              top:38
            })
          Text('Account login')
            .fontSize(16)
            .fontColor($r('app.color.text_third'))
            .fontWeight(FontWeight.Medium)
          TKTextInput({leftIcon:$r('app.media.username_icon'),textInputPlaceholder:'请输入手机号',textInputContent:this.userName})
            .margin({
              top:26,
              bottom:16
            })
          TKTextInput({leftIcon:$r('app.media.password_icon'),textInputPlaceholder:'请输入密码',textInputContent:this.password,textInputType:TKTextInputType.TKTextInputType_password})
          Row(){
            Checkbox()
              .width(13)
              .aspectRatio(1)
              .selectedColor($r('app.color.primary'))
            Text('记住密码')
              .fontSize(13)
              .fontColor($r('app.color.text_primary'))
            Blank()
            Text('忘记密码?')
              .fontSize(13)
              .fontColor($r('app.color.text_primary'))
              .decoration({color:$r('app.color.text_primary'),type:TextDecorationType.Underline,style:TextDecorationStyle.SOLID})
              .onClick(()=>{
                router.pushUrl({
                  url:'pages/Login/TKForgotPassword'
                })
              })
          }
          .width('100%')
          .margin({
            top:15,
            bottom:43
          })
          Button(){
            Stack(){
              Image($r('app.media.button_back'))
                .width('100%')
              Text('立即登录')
                .fontSize(15)
                .fontColor($r('app.color.white'))
                .fontWeight(FontWeight.Bold)
            }
          }
          .margin({
            top:28
          })
          .onClick(()=>{
            this.login()
          })

          Text(){
            Span('没有账号?')
              .fontColor($r('app.color.text_second'))
            Span('立即注册')
              .fontColor($r('app.color.primary'))
              .decoration({color:$r('app.color.primary'),type:TextDecorationType.Underline,style:TextDecorationStyle.SOLID})
              .onClick(()=>{
                router.pushUrl({
                  url:'pages/Login/TKRegister'
                })
              })
          }
          .fontSize(13)
          .margin({
            top:12
          })

          Row(){
            Checkbox()
              .width(12)
              .aspectRatio(1)
              .shape(CheckBoxShape.ROUNDED_SQUARE)
              .select($$this.isChecked)
              .selectedColor($r('app.color.primary'))

            Text(){
              Span('我已阅读并同意')
                .fontColor($r('app.color.text_second'))
              Span('《用户协议》')
                .fontColor($r('app.color.text_blue'))
                .onClick(()=>{
                  AlertDialog.show({
                    message:'跳转到用户协议页面'
                  })
                })
              Span('和')
                .fontColor($r('app.color.text_second'))
              Span('《隐私政策》')
                .fontColor($r('app.color.text_blue'))
                .onClick(()=>{
                  AlertDialog.show({
                    message:'跳转到隐私政策页面'
                  })
                })
            }
            .fontSize(11)
          }
          .margin({
            top:143,
            bottom:39
          })

        }
        .padding({
          left:16,
          right:16
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