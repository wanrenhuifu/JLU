@Entry
@Component
struct ScrollTest {
  build() {
    Scroll(){
      Text()
        .height(2000)
        .width(300)
        .border({width:2})


    }
    .scrollBarWidth(50)
    .scrollBarColor(Color.Pink)

  }
}