import { TKNavBar } from '../../components/TKNavBar'
import { promptAction, router } from '@kit.ArkUI'
import { TKCard } from '../../components/TKCard'
import { picker } from '@kit.CoreFileKit'
import fs from '@ohos.file.fs'
import { UploadImgApi } from '../../api/UploadImgsApi'
import { FormData } from '@ohos/axios'
import { Utils } from '../../utils/Utils'
import { publishArticleApi, publishComment } from '../../api/CommunityApi'
import { PublishArticleParms } from '../../models/Community'
import { TKRouterParms } from '../../models/TKRouterParms'
import { TKIMGPreview } from '../../components/TKIMGPreview'

@Entry
@Component
struct TKPublishArticle {
  //预览图片数据源
  preViewIMGs:string[] = []
  //要预览的图片的索引
  preViewIndex:number = 0

  preViewController:CustomDialogController = new CustomDialogController({
    builder:TKIMGPreview({
      list:this.preViewIMGs,
      currentIndex:this.preViewIndex
    }),
    customStyle:true
  })
  //上传图片成功之后的数据源
  @State
  imgList:string[] = []

  //页面标题
  @State
  navTitle:string = '发问答'

  //标题
  title:string = ''
  //内容
  content:string = ''

  //文章id
  @State
  postId:string = ''

  aboutToAppear(): void {
    const parms = router.getParams() as TKRouterParms
    if (parms&&parms.id){
      this.postId = parms.id.toString()
    }
    if (this.postId.length > 0) {
      this.navTitle = '发评论'
    }

  }

  //发布方法
  publish(){
    if (this.postId.length > 0) {
      //发评论
      this.publishComment()
    }else{
      this.publishArticle()
    }
  }

  //发布评论
  async publishComment(){
    const parms:PublishArticleParms = {
      content:this.content,
      images:this.imgList
    }
    await publishComment(this.postId,parms)
    promptAction.showToast({
      message:'发布评论成功'
    })
    router.back()
    getContext().eventHub.emit('articleDetailChange')
  }


  //打开系统相册选择照片
  async selectPhotos(){
    const pickerOption = new picker.PhotoSelectOptions
    pickerOption.MIMEType = picker.PhotoViewMIMETypes.IMAGE_TYPE
    pickerOption.maxSelectNumber = 9 - this.imgList.length

    const photoPicker = new picker.PhotoViewPicker
    picker.PhotoSelectResult
    const result = await photoPicker.select(pickerOption)
    for (let index = 0; index < result.photoUris.length; index++) {
      const element = result.photoUris[index];
      this.upload(element)
    }
  }
  //上传图片
  async upload(imgUrl:string){
    //读取相册图片
    let file = fs.openSync(imgUrl,fs.OpenMode.READ_ONLY)
    const context = getContext(this)
    //要拷贝到的沙箱路径
    const filePath = context.cacheDir+'/'+file.name
    //拷贝到沙箱路径
    fs.copyFileSync(file.fd,filePath)

    let formData = new FormData()
    formData.append('img',`internal://cache/${file.name}`)
    formData.append('type','1')
    formData.append('sourceId','123')

    const imgData = await UploadImgApi(formData,context)
    this.imgList.push(imgData.imgUrl)
  }

  //发布问答方法
  async publishArticle(){
    if (this.title.length==0||this.content.length==0) {
      promptAction.showToast({
        message:'请先输入标题和内容'
      })
      return
    }
    const parms:PublishArticleParms = {
      title:this.title,
      content:this.content,
      images:this.imgList
    }
    await publishArticleApi(parms)
    promptAction.showToast({
      message:'发布成功'
    })
    router.back()
    getContext().eventHub.emit('articleListChange')
  }

  @Builder
  getTopTabs(){
    Row(){
      Text('取消')
        .fontSize(16)
        .fontWeight(FontWeight.Bold)
        .fontColor($r('app.color.text_primary'))
        .onClick(()=>{
          router.back()
        })
      Text('发布')
        .fontSize(16)
        .fontWeight(FontWeight.Bold)
        .fontColor($r('app.color.primary'))
        .onClick(()=>{
          this.publish()
        })
    }
    .justifyContent(FlexAlign.SpaceAround)
    .width('100%')
    .height(52)
  }

  build() {
    Stack({alignContent:Alignment.Top}){
      Image($r('app.media.navbar_back'))
        .width('100%')
        .expandSafeArea([SafeAreaType.SYSTEM],[SafeAreaEdge.TOP])
      Column(){
        TKNavBar({title:this.navTitle,ISShowBack:false})
        this.getTopTabs()
        TKCard({paddingBottom:16}){
          if (this.postId.length<=0){
            TextInput({placeholder:'请输入问答标题',text:$$this.title})
              .fontSize(15)
              .placeholderFont({size:15})
              .placeholderColor($r('app.color.text_second'))
              .backgroundColor($r('app.color.white'))
              .margin({
                top:40,
                bottom:13
              })
          }
          Divider().strokeWidth(1).width('100%').color($r('app.color.line_color'))
          TextArea({placeholder:'说点什么...',text:$$this.content})
            .placeholderColor($r('app.color.text_second'))
            .placeholderFont({size:12})
            .backgroundColor($r('app.color.white'))
            .height(170)
            .width('100%')
            .margin({
              top:15
            })
          GridRow({columns:3}){
            ForEach(this.imgList,(imgUlr:string,index:number)=>{
              GridCol(){
                Image(Utils.getImgUrl(imgUlr))
                  .borderRadius(7)
                  .onClick(()=>{
                    this.preViewIMGs=this.imgList
                    this.preViewIndex = index
                    this.preViewController.open()
                  })
              }
              .width(101)
              .height(74)
              .margin(4)
            })
            GridCol(){
              Image($r('app.media.publish_add'))
                .borderRadius(7)
                .onClick(()=>{
                  this.selectPhotos()
                })
            }
            .width(101)
            .height(74)
            .margin(4)
          }
          .width('100%')
        }
      }
      .width('100%')
      .height('100%')
    }
    .backgroundColor($r('app.color.back_color'))
    .width('100%')
    .height('100%')
  }
}