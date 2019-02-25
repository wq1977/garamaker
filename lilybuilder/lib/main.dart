import 'package:flutter/material.dart';
import 'package:multi_image_picker/multi_image_picker.dart';
import 'package:flutter/foundation.dart';
import 'dart:async';
import 'asset_view.dart';
import 'package:flutter/rendering.dart';

void main() => runApp(MyApp());

final _scaffoldKey = new GlobalKey<ScaffoldState>();
final rowlevel1 = new GlobalKey();
final expLevel2 = new GlobalKey();

class Yinfu {
  int xian;
  int pin;
  int pos; //从开始每个
  int duration;

  int pinxian;
  int picidx;
  Offset offset;
  Size size;
}

class HeXuan {
  String name;
  var pins = [0,0,0,0,0,0];
}

class PinXian {
  double y1;
  double y6;
  int picidx;
  bool contains(offset){
    return (offset.dy > y1 - unit) && (offset.dy < y6 + unit);
  }
  double get unit {
    return (y6 - y1) / 5 ;
  }
}

class MyPainter extends CustomPainter {
  final List<Yinfu> yinfus;
  final List<HeXuan> hexuans;
  final List<PinXian> pinxians;
  final int selectYinfu;
  final selectHexuan;
  final int picidx;

  MyPainter({
    @required this.yinfus,
    @required this.hexuans, 
    @required this.selectHexuan,
    @required this.selectYinfu,
    @required this.picidx,
    @required this.pinxians,
  }):super();


  void drawBg(canvas, size){
    final bgPaint = Paint()..color = Color(0x80FFFFFF);
    var rect = Offset.zero & size;
    canvas.drawRect(rect, bgPaint);
  }

  void drawPinXian(canvas, size) {
    final linePaint = Paint()..color = Color(0x800000FF);
    for (int i=0;i<pinxians.length; i++) {
      if (pinxians[i].picidx != picidx) continue;
      for (int j=0;j<6;j++){
        canvas.drawLine(Offset(0, pinxians[i].y1 + j * pinxians[i].unit), Offset(size.width, pinxians[i].y1 + j * pinxians[i].unit), linePaint);
      }
    }
  }

  void drawYinfu(canvas) {
    final stylenormal = new TextStyle(color:Colors.black);
    final stylesel = new TextStyle(color:Colors.red);
    for (int i=0;i<yinfus.length;i++){
      if (yinfus[i].picidx != picidx) continue;
      TextSpan span = new TextSpan(text: yinfus[i].pin < 0 ? 'x' : '${yinfus[i].pin}', style: i ==selectYinfu ? stylesel : stylenormal);
      TextPainter tp = new TextPainter(text: span, textDirection: TextDirection.ltr);
      tp.layout();
      tp.paint(canvas,Offset(yinfus[i].offset.dx, pinxians[yinfus[i].pinxian].y1 + pinxians[yinfus[i].pinxian].unit * yinfus[i].xian - tp.height / 2));
    }
  }

  @override
  void paint(Canvas canvas, Size size) {
    drawBg(canvas, size);
    drawPinXian(canvas, size);
    drawYinfu(canvas);
  }  
  @override
  bool shouldRepaint(MyPainter oldDelegate){
    if (yinfus.length !=oldDelegate.yinfus.length) return true;
    if (hexuans.length !=oldDelegate.hexuans.length) return true;
    for (int i=0;i<hexuans.length;i++) {
      if (hexuans[i] !=oldDelegate.hexuans[i]) return true;
    }
    for (int i=0;i<yinfus.length;i++) {
      if (yinfus[i] !=oldDelegate.yinfus[i]) return true;
    }
    if (selectHexuan !=oldDelegate.selectHexuan) return true;
    if (selectYinfu !=oldDelegate.selectYinfu) return true;
    return false;
  }
  @override
  bool shouldRebuildSemantics(MyPainter oldDelegate) => false;
}

class MyApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      key: _scaffoldKey,
      title: 'Flutter Demo',
      theme: ThemeData(
        primarySwatch: Colors.blue,
      ),
      home: MyHomePage(title: 'Lily Builder'),
    );
  }
}

class MyHomePage extends StatefulWidget {
  MyHomePage({Key key, this.title}) : super(key: key);
  final String title;
  @override
  _MyHomePageState createState() => _MyHomePageState();
}

class _MyHomePageState extends State<MyHomePage> {
  List<Asset> images = List<Asset>();
  List<GlobalKey> keys = List<GlobalKey>();
  List<Yinfu> yinfus = List<Yinfu>();
  List<HeXuan> hexuans = List<HeXuan>();
  List<PinXian> pinxians = List<PinXian>();
  int selectYinfu=-1;
  int selectHexuan=-1;
  final ScrollController _controller = new ScrollController();

  @override
  void dispose() {
    //为了避免内存泄露，需要调用_controller.dispose
    _controller.dispose();
    super.dispose();
  }

  @override
  void initState() {
    super.initState();
    //监听滚动事件，打印滚动位置
    _controller.addListener(() {
      debugPrint('${_controller.offset}'); //打印滚动位置
    });
  }

  pinxianup(){
    pinxians[yinfus[selectYinfu].pinxian].y1-=1;
    setState(() {});
  }

  pinxiandown(){
    pinxians[yinfus[selectYinfu].pinxian].y1+=1;
    setState(() {});
  }

  pinxiangrow() {
    pinxians[yinfus[selectYinfu].pinxian].y6+=1;
    setState(() {});
  }

  pinxianshrink() {
    pinxians[yinfus[selectYinfu].pinxian].y6-=1;
    setState(() {});
  }

  pin(idx){
    yinfus[selectYinfu].pin = idx-1;
    setState(() {});
  }

  doTap(idx, offset, size){
    if ((pinxians.length > 0) &&(pinxians.last.contains(offset))) {
      int xian = ((offset.dy + pinxians.last.unit - pinxians.last.y1) / pinxians.last.unit).round();
      yinfus.add(Yinfu()..pinxian =pinxians.length-1..xian = xian..pin=0..pos=0..duration=0..picidx=idx..offset=offset..size=size);
    } else {
      pinxians.add(PinXian()..picidx=idx..y1 =offset.dy..y6 =offset.dy + (pinxians.length > 0 ? pinxians.last.unit * 5 : 50));
      yinfus.add(Yinfu()..pinxian =pinxians.length-1 ..xian = 0..pin=0..pos=0..duration=0..picidx=idx..offset=offset..size=size);
    }
    selectYinfu = yinfus.length-1;
    setState(() {});
  }

  Future loadAssets() async {
    List<Asset> resultList = List<Asset>();
    resultList = await MultiImagePicker.pickImages(
      enableCamera: false,
      maxImages: 10,
      options: CupertinoOptions(takePhotoIcon: "chat"),
    );    
    setState(() {
      keys = List<GlobalKey>.generate(resultList.length, (i)=>GlobalKey());
      images = resultList;
    });
  }

  Widget _buildRow(BuildContext context, int idx){
    Asset asset = images[idx];
        return Stack(
          key:keys[idx],
          children: <Widget>[
            FractionallySizedBox(widthFactor: 1, child:AssetView(idx, asset,key: UniqueKey())),
            Positioned(
              right: 0,
              top: 0,
              left: 0,
              bottom: 0,
              child: Container(
                child:GestureDetector(
                  onTapUp: (details) {
                    RenderBox rb = keys[idx].currentContext.findRenderObject();
                    Offset local = rb.globalToLocal(details.globalPosition);
                    doTap(idx, local, rb.size);
                  },
                  child: CustomPaint(
                    painter: MyPainter(pinxians: pinxians, picidx: idx, yinfus: yinfus, hexuans: hexuans, selectHexuan: selectHexuan, selectYinfu: selectYinfu),
                  )
                ),
              ),
            )
          ]
        );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(widget.title),
      ),
      body: images.length == 0 ? 
        Center(child: Text('No image selected.'))
        :Row(
          key: rowlevel1,
          children: <Widget>[
          SingleChildScrollView(key:PageStorageKey(1), child: Column(children: List<Widget>.generate(20, (i)=>OutlineButton(child: Text(i==0 ? 'X' : '${i-1}'), shape:CircleBorder(), onPressed: (){pin(i);},))),),
          Expanded(
            key: expLevel2,
            child:Column(children: <Widget>[
              ButtonBar(children: <Widget>[
                IconButton(icon: Icon(Icons.arrow_upward), onPressed: pinxianup,),
                IconButton(icon: Icon(Icons.arrow_downward), onPressed: pinxiandown,),
                IconButton(icon: Icon(Icons.exposure_plus_2), onPressed: pinxiangrow,),
                IconButton(icon: Icon(Icons.exposure_neg_2), onPressed: pinxianshrink,),
              ],),
              Expanded(
                child:SingleChildScrollView(
                    controller: _controller, 
                    key:PageStorageKey(3),
                    child:Column(
                    children:List<Widget>.generate(images.length, (i)=>_buildRow(context, i))
                  )
                )
              ),
            ],),
          ),
          SingleChildScrollView(child: Column(children: List<Widget>.generate(hexuans.length, (i)=>OutlineButton(child: Text(hexuans[i].name), shape:CircleBorder(), onPressed: (){},))),),
        ],
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: loadAssets,
        tooltip: '选择图片',
        child: Icon(Icons.add),
      ), 
    );
  }
}
