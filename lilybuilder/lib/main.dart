import 'package:flutter/material.dart';
import 'package:multi_image_picker/multi_image_picker.dart';
import 'package:flutter/foundation.dart';
import 'dart:async';
import 'asset_view.dart';
import 'package:flutter/rendering.dart';

void main() => runApp(MyApp());

class MyPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    var rect = Offset.zero & size;
    canvas.drawRect(
      rect,
      Paint()..color = Color(0x80FFFFFF),
    );
  }  
  @override
  bool shouldRepaint(MyPainter oldDelegate) => false;
  @override
  bool shouldRebuildSemantics(MyPainter oldDelegate) => false;
}

class MyApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
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

  doTap(idx, offset, size){
    debugPrint('pos: $idx $offset $size');
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
                    painter: MyPainter(),
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
        :SingleChildScrollView(
          child: ConstrainedBox(
            constraints: BoxConstraints(),
            child: Column(
              children:List<Widget>.generate(images.length, (i)=>_buildRow(context, i))
            )
          ),
        ),
      floatingActionButton: FloatingActionButton(
        onPressed: loadAssets,
        tooltip: '选择图片',
        child: Icon(Icons.add),
      ), 
    );
  }
}
