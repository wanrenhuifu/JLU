interface message{
  imgUrl:string|Resource,
  name:string,
  messageData:string
}
@Entry
@Component
export struct ListTest {
  @State messageList:message[]=[
    {imgUrl:'https://kkimgs.yisou.com/ims?kt=url&at=ori&key=aHR0cHM6Ly9pbWcuc290dWppZS5jb20vY2FpamkvbXJpNzAvMjAyMDExLzE3MDIvMjAyMDExMTcwMjMyNDNfMzE4OS5qcGc=&sign=yx:omy4ykY7PDGAoILCrNvBAn-3HQY=&tv=0_0',name:'名字张三',messageData:'[30条] 哈哈'},
  {imgUrl:'https://kkimgs.yisou.com/ims?kt=url&at=ori&key=aHR0cHM6Ly9pbWcuc290dWppZS5jb20vY2FpamkvbXJpNzAvMjAyMDExLzE3MDIvMjAyMDExMTcwMjMyNDNfMzE4OS5qcGc=&sign=yx:omy4ykY7PDGAoILCrNvBAn-3HQY=&tv=0_0',name:'名字张三',messageData:'[30条] 哈哈'}  ,
{imgUrl:'https://kkimgs.yisou.com/ims?kt=url&at=ori&key=aHR0cHM6Ly9pbWcuc290dWppZS5jb20vY2FpamkvbXJpNzAvMjAyMDExLzE3MDIvMjAyMDExMTcwMjMyNDNfMzE4OS5qcGc=&sign=yx:omy4ykY7PDGAoILCrNvBAn-3HQY=&tv=0_0',name:'名字张三',messageData:'[30条] 哈哈'},
{imgUrl:'https://kkimgs.yisou.com/ims?kt=url&at=ori&key=aHR0cHM6Ly9pbWcuc290dWppZS5jb20vY2FpamkvbXJpNzAvMjAyMDExLzE3MDIvMjAyMDExMTcwMjMyNDNfMzE4OS5qcGc=&sign=yx:omy4ykY7PDGAoILCrNvBAn-3HQY=&tv=0_0',name:'名字张三',messageData:'[30条] 哈哈'},
{imgUrl:'https://kkimgs.yisou.com/ims?kt=url&at=ori&key=aHR0cHM6Ly9pbWcuc290dWppZS5jb20vY2FpamkvbXJpNzAvMjAyMDExLzE3MDIvMjAyMDExMTcwMjMyNDNfMzE4OS5qcGc=&sign=yx:omy4ykY7PDGAoILCrNvBAn-3HQY=&tv=0_0',name:'名字张三',messageData:'[30条] 哈哈'},
{imgUrl:'https://kkimgs.yisou.com/ims?kt=url&at=ori&key=aHR0cHM6Ly9pbWcuc290dWppZS5jb20vY2FpamkvbXJpNzAvMjAyMDExLzE3MDIvMjAyMDExMTcwMjMyNDNfMzE4OS5qcGc=&sign=yx:omy4ykY7PDGAoILCrNvBAn-3HQY=&tv=0_0',name:'名字张三',messageData:'[30条] 哈哈'},
{imgUrl:'https://kkimgs.yisou.com/ims?kt=url&at=ori&key=aHR0cHM6Ly9pbWcuc290dWppZS5jb20vY2FpamkvbXJpNzAvMjAyMDExLzE3MDIvMjAyMDExMTcwMjMyNDNfMzE4OS5qcGc=&sign=yx:omy4ykY7PDGAoILCrNvBAn-3HQY=&tv=0_0',name:'名字张三',messageData:'[30条] 哈哈'},
{imgUrl:'https://kkimgs.yisou.com/ims?kt=url&at=ori&key=aHR0cHM6Ly9pbWcuc290dWppZS5jb20vY2FpamkvbXJpNzAvMjAyMDExLzE3MDIvMjAyMDExMTcwMjMyNDNfMzE4OS5qcGc=&sign=yx:omy4ykY7PDGAoILCrNvBAn-3HQY=&tv=0_0',name:'名字张三',messageData:'[30条] 哈哈'},
{imgUrl:'https://kkimgs.yisou.com/ims?kt=url&at=ori&key=aHR0cHM6Ly9pbWcuc290dWppZS5jb20vY2FpamkvbXJpNzAvMjAyMDExLzE3MDIvMjAyMDExMTcwMjMyNDNfMzE4OS5qcGc=&sign=yx:omy4ykY7PDGAoILCrNvBAn-3HQY=&tv=0_0',name:'名字张三',messageData:'[30条] 哈哈'}

  ]
  build() {
    List(){
      ForEach(this.messageList,(item:message)=>{
        //UI组件
        ListItem(){
          Row(){
            Image(item.imgUrl)
              .width(40)
              .height(40)
              .margin({right:20})
              .borderRadius(20)
            Column(){
              Text(item.name)
              Text(item.messageData)
            }
            .alignItems(HorizontalAlign.Start)
            .border({width:{bottom:1}})
          }
          .padding(20)
          .width('100%')

        }

        .width('100%')
      //ListItem(){
        //Text(item.toString())
      //}
      //.border({width:2})
      //.width('90%')
     // ListItem(){
       // Text('2')
     //}
      //.border({width:2})
      //分组
      //ListItemGroup()
    })




  }
  .width('100%')
    .height('100%')
    .border({width:2})
}
}