import 'package:flutter/material.dart';
import 'package:multi_image_picker/multi_image_picker.dart';
import 'package:flutter/foundation.dart';
import 'dart:async';
import 'asset_view.dart';

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
  
  // Since this Sky painter has no fields, it always paints
  // the same thing and semantics information is the same.
  // Therefore we return false here. If we had fields (set
  // from the constructor) then we would return true if any
  // of them differed from the same fields on the oldDelegate.
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

  Future loadAssets() async {
    List<Asset> resultList = List<Asset>();
    resultList = await MultiImagePicker.pickImages(
      enableCamera: false,
      maxImages: 10,
      options: CupertinoOptions(takePhotoIcon: "chat"),
    );    
    setState(() {
      images = resultList;
    });
  }

  Widget _buildRow(int idx){
    Asset asset = images[idx];
        return Stack(
          children: <Widget>[
            AssetView(
              idx,
              asset,
              key: UniqueKey(),
            ),
            Positioned(
              right: 15.0,
              top: 15.0,
              child: new Icon(
                Icons.share,
                color: Colors.white,
              ),
            ),
            Positioned(
              right: 0,
              top: 0,
              left: 0,
              bottom: 0,
              child: Container(
                child:GestureDetector(
                  onTap: () {
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

  Widget buildImages(){
    debugPrint('buildImages');
    return ListView.builder(
      itemCount: images.length,
      itemBuilder:(context, i) {
        return _buildRow(i);
      });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(widget.title),
      ),
      body: images.length == 0 ? 
        Center(
          child: Text('No image selected.')
        )
        :buildImages(),
      floatingActionButton: FloatingActionButton(
        onPressed: loadAssets,
        tooltip: '选择图片',
        child: Icon(Icons.add),
      ), 
    );
  }
}
