import { TKCard } from '../../components/TKCard'
import { TKNavBar } from '../../components/TKNavBar'
import { TKTextInput, TKTextInputType } from '../../components/TKTextInput'
import { promptAction, router } from '@kit.ArkUI'
import { getImgCodeApi, updatePasswordApi } from '../../api/UserApi'
import { GetCodeParms, RegisterParms } from '../../models/User'

@Entry
@Component
struct TKUpdatePassword {
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
   * 修改密码
   */
  async updatePassword() {
    if (this.userName.length < 11) {
      promptAction.showToast({
        message: '请输入正确的手机号'
      })
      return
    }
    if (this.code.length <= 0) {
      promptAction.showToast({
        message: '请输入验证码'
      })
      return
    }
    if (this.password.length < 6 || this.newPassword.length < 6 || this.password != this.newPassword) {
      promptAction.showToast({
        message: '请输入正确的密码'
      })
      return
    }

    const parms: RegisterParms = {
      verifycode: this.code,
      captchaId: this.captchaId,
      password: this.password
    }
    await updatePasswordApi(parms)
    promptAction.showToast({
      message:'密码修改成功'
    })
    router.clear()
    router.replaceUrl({
      url:'pages/Login/TKLogin'
    })
  }
  build() {
    Stack({ alignContent: Alignment.Top }) {
      Image($r('app.media.second_navbar_back'))
        .width('100%')
        .height(81)
        .expandSafeArea([SafeAreaType.SYSTEM], [SafeAreaEdge.TOP])
      Column() {
        TKNavBar({ title: '修改密码' })
        TKCard({marginTop:33,paddingLeft:24,paddingRight:24,marginLeft:0,marginRight:0}){
          Text('修改密码')
            .fontSize(16)
            .fontColor($r('app.color.text_primary'))
            .fontWeight(FontWeight.Medium)
            .margin({
              top:38
            })
          Text('Change password')
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
              Text('修改密码')
                .fontSize(15)
                .fontColor($r('app.color.white'))
                .fontWeight(FontWeight.Bold)
            }
          }
          .margin({
            top:28,
            bottom:131
          })
          .onClick(()=>{
            this.updatePassword()
          })
        }

      }.padding({
        left:15,
        right:15
      })
      .width('100%')
      .height('100%')
    }
    .width('100%')
    .height('100%')
    .backgroundColor($r('app.color.back_color'))
  }
}