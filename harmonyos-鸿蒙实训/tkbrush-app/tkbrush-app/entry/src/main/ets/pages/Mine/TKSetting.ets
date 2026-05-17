import { logoutApi, updateUserInfoApi } from '../../api/UserApi'
import { TKCard } from '../../components/TKCard'
import { TKNavBar } from '../../components/TKNavBar'
import { TKSettingItem } from '../../components/TKSettingItem'
import { SettingItem } from '../../models/Mine'
import userStore from '../../utils/UserStore'
import { promptAction, router } from '@kit.ArkUI'
import { UpdateUserParms, UserInfo } from '../../models/User'
import { Utils } from '../../utils/Utils'
import { picker } from '@kit.CoreFileKit'
import fs from '@ohos.file.fs'
import { FormData } from '@ohos/axios'
import { UploadImgApi } from '../../api/UploadImgsApi'
import { TKRouterParms } from '../../models/TKRouterParms'

@Entry
@Component
struct TKSetting {
  @State
  userInfo: UserInfo = {} as UserInfo

  aboutToAppear(): void {
    const parms = router.getParams() as UserInfo
    if (parms) {
      this.userInfo = parms
      const listItem: SettingItem =
        {
          leftTitle: '昵称',
          rightTitle: this.userInfo.nickname,
          itemClick: () => {
            router.pushUrl({
              url:'pages/Mine/TKUpdateNickName',
              params:{name:this.userInfo.nickname}
            })
          }
        }
      this.list.splice(0, 1, listItem)
    }
  }

  onPageShow(): void {
    const parms = router.getParams() as TKRouterParms
    if (parms&&parms.name) {
      this.userInfo.nickname = parms.name
      const listItem: SettingItem =
        {
          leftTitle: '昵称',
          rightTitle: this.userInfo.nickname,
          itemClick: () => {
            router.pushUrl({
              url:'pages/Mine/TKUpdateNickName',
              params:{name:this.userInfo.nickname}
            })
          }
        }
      this.list.splice(0, 1, listItem)
    }
  }

  //退出登录
  async logout() {
    await logoutApi()
    await userStore.deleteUserToken()
    router.clear()
    router.replaceUrl({
      url: 'pages/Login/TKLogin'
    })
  }

  @State
  list: SettingItem[] =
    [
      {
        leftTitle: '昵称',
        rightTitle: this.userInfo.nickname,
        itemClick: () => {
        }
      },
      {
        leftTitle: '修改密码',
        itemClick: () => {
          router.pushUrl({
            url:'pages/Mine/TKUpdatePassword'
          })
        }
      }
    ]

  //打开系统相册选择照片
  async selectPhotos() {
    const pickerOption = new picker.PhotoSelectOptions
    pickerOption.MIMEType = picker.PhotoViewMIMETypes.IMAGE_TYPE
    pickerOption.maxSelectNumber = 1

    const photoPicker = new picker.PhotoViewPicker
    picker.PhotoSelectResult
    const result = await photoPicker.select(pickerOption)
    for (let index = 0; index < result.photoUris.length; index++) {
      const element = result.photoUris[index];
      this.upload(element)
    }
  }

  //上传图片
  async upload(imgUrl: string) {
    //读取相册图片
    let file = fs.openSync(imgUrl, fs.OpenMode.READ_ONLY)
    const context = getContext(this)
    //要拷贝到的沙箱路径
    const filePath = context.cacheDir + '/' + file.name
    //拷贝到沙箱路径
    fs.copyFileSync(file.fd, filePath)

    let formData = new FormData()
    formData.append('img', `internal://cache/${file.name}`)
    formData.append('type', '1')
    formData.append('sourceId', '123')

    const imgData = await UploadImgApi(formData, context)
    this.updateAvatar(imgData.imgUrl)
  }

  //调用接口修改头像
  async updateAvatar(imgUrl: string) {
    const parms: UpdateUserParms = {
      avatar: imgUrl
    }
    await updateUserInfoApi(parms)
    promptAction.showToast({
      message:'头像修改成功'
    })
    this.userInfo.avatar = imgUrl
    getContext().eventHub.emit('userInfoChange')
  }

  build() {
    Stack({ alignContent: Alignment.Top }) {
      Image($r('app.media.second_navbar_back'))
        .width('100%')
        .height(81)
        .expandSafeArea([SafeAreaType.SYSTEM], [SafeAreaEdge.TOP])
      Column() {
        TKNavBar({ title: '个人信息' })
        Stack({ alignContent: Alignment.Bottom }) {
          Image(Utils.getImgUrl(this.userInfo.avatar))
            .width(63)
            .aspectRatio(1)
            .borderRadius(31.5)
            .margin({
              bottom: 5
            })
          Image($r('app.media.user_photo'))
            .width(27)
            .height(18)
        }
        .margin({
          top: 30
        })
        .onClick(() => {
          this.selectPhotos()
        })

        TKCard({ marginTop: 11, marginLeft: 0, marginRight: 0 }) {
          List() {
            ForEach(this.list, (item: SettingItem) => {
              TKSettingItem({ item: item })
            })
          }
          .divider({ strokeWidth: 0.5, color: $r('app.color.line_color') })
        }

        Button('退出登录')
          .width('100%')
          .height(47)
          .type(ButtonType.Normal)
          .border({
            width: 1,
            color: $r('app.color.primary')
          })
          .fontSize(15)
          .fontWeight(FontWeight.Bold)
          .fontColor($r('app.color.primary'))
          .backgroundColor($r('app.color.white'))
          .borderRadius(23.5)
          .margin({
            top: 30
          })
          .onClick(() => {
            this.logout()
          })
      }
      .padding({
        left: 15,
        right: 15
      })
      .width('100%')
      .height('100%')
    }
    .backgroundColor($r('app.color.back_color'))
    .width('100%')
    .height('100%')
  }
}