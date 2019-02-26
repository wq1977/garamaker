import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:multi_image_picker/multi_image_picker.dart';
import 'package:flutter/foundation.dart';
import 'dart:async';
import 'asset_view.dart';
import 'package:flutter/rendering.dart';

void main() => runApp(MyApp());

final _scaffoldKey = new GlobalKey<ScaffoldState>();
final rowlevel1 = new GlobalKey();
final expLevel2 = new GlobalKey();
final dragableKey = new GlobalKey();

class Yinfu {
  String yinfu;
  int lineidx;
  Offset pos;
}

class HeXuan {
  String name;
  String code;
  String define;
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

class LineYinfu{
  String line;
  Offset pos;
}

class _MyHomePageState extends State<MyHomePage> {
  List<Asset> images = List<Asset>();
  List<GlobalKey> keys = List<GlobalKey>();
  List<Yinfu> yinfus = List<Yinfu>();
  List<HeXuan> hexuans = List<HeXuan>();
  List<Widget> pics=List<Widget>();

  String tmphexuanname;
  String tmphexuan;
  String buffer='';
  String currentCmd='';
  String currentJiePai='';
  int currentPin=0;
  int currentHexuan=0;
  int curlineidx=0;
  Offset position=Offset(12, 384);

  List<String> cmds = ['@1','@2'];
  List<String> xians = ['1','2','3','4','5','6','u','U','d','D','-'];
  List<String> jiepais = ['3/4','6/8','4/4'];
  List<Widget> cmdWidgets = List<Widget>();

  List<LineYinfu> lineYinfu(){
    List<LineYinfu> result = List<LineYinfu>();
    var jiepai=4;
    if (currentJiePai.length>0){
      jiepai = currentJiePai.codeUnits[0] - '0'.codeUnits[0];
    }
    yinfus.forEach((f){
      LineYinfu line;
      result.forEach((l){
        if (line != null ) return;
        if (l.pos.dy == f.pos.dy) {
          line = l;
        }
      });
      if (line==null){
        line =LineYinfu()..pos = f.pos..line='';
        result.add(line);
      }
      line.line +=f.yinfu+",";
      if (line.line.split(',').length % jiepai == 1) {
        line.line += '    ';
      }
    });
    return result;
  }

  addyinfu(String xian){
    String pin = currentPin == 0 ? '${hexuans[currentHexuan].code}' : '${currentPin-1}';
    if (xian == '-') pin='-';
    buffer+='$xian$pin';    
    if (currentCmd == '@1'){
      yinfus.add(Yinfu()..yinfu=buffer..lineidx=curlineidx..pos=position);
      buffer='';
      SystemSound.play(SystemSoundType.click);
      setState(() {});
    }
    if (currentCmd == '@2'){
      if (buffer.length<4) return setState(() {});
      yinfus.add(Yinfu()..yinfu='@2$buffer'..lineidx=curlineidx..pos=position);
      buffer='';
      SystemSound.play(SystemSoundType.click);
      currentCmd='@1';
      setState(() {});
    }
  }

  addhexuan(context){
    showDialog(
      context: context,
      builder: (_) => new AlertDialog(
          title: new Text("增加新和弦"),
          content: new Row(
            children: <Widget>[
              Expanded(
                  child: new TextField(
                    autofocus: true,
                    decoration: new InputDecoration(
                        labelText: '和弦名称', hintText: 'Gadd9'),
                    onChanged: (value) {
                      tmphexuanname = value;
                    },
                  )),
              Expanded(
                  child: new TextField(
                    autofocus: true,
                    decoration: new InputDecoration(
                        labelText: '和弦定义', hintText: '1,0,2,0,1,3'),
                    onChanged: (value) {
                      tmphexuan = value;
                    },
                  )),
            ],
          ),
          actions:<Widget>[
            new FlatButton(child:new Text("取消"), onPressed: (){
              Navigator.of(context).pop();
            },),
            new FlatButton(child:new Text("确定"), onPressed: (){
              Navigator.of(context).pop();
              hexuans.add(HeXuan()..name=tmphexuanname..code = String.fromCharCode(0x41+hexuans.length)..define=tmphexuan);
              setState(() {});
            },)
          ]
      ));
  }

  erasehexian(){
    if (hexuans.length > 0){
      hexuans.removeLast();
      setState(() {});
    }
  }

  delyin() {
    if (yinfus.length>0){
      yinfus.removeLast();
      setState(() {});
    }
  }

  Future loadAssets() async {
    List<Asset> resultList = List<Asset>();
    resultList = await MultiImagePicker.pickImages(
      enableCamera: false,
      maxImages: 10,
      options: CupertinoOptions(takePhotoIcon: "chat"),
    );    
    if (resultList.length <= 0) return;
    setState(() {
      keys = List<GlobalKey>.generate(resultList.length, (i)=>GlobalKey());
      images = resultList;
      pics = List<Widget>.generate(resultList.length, (i)=>_buildRow(context, i));
    });
  }

  Widget _buildRow(BuildContext context, int idx){
    Asset asset = images[idx];
    return FractionallySizedBox(widthFactor: 1, child:AssetView(idx, asset));
  }

  @override
  Widget build(BuildContext context) {
    cmdWidgets = List<Widget>.generate(cmds.length, (i)=>OutlineButton(
      child: Text(cmds[i]), 
      borderSide: currentCmd == cmds[i] ? new BorderSide(color: Theme.of(context).primaryColor): null,
      onPressed: (){ setState(() {currentCmd = cmds[i];});},));
    List<Widget> pinWidgets = List<Widget>.generate(11, (i)=>OutlineButton(
      child: Text(i==0 ? 'X' : '${i-1}'), 
      borderSide: currentPin == i ? new BorderSide(color: Theme.of(context).primaryColor): null,
      onPressed: (){ setState(() {currentPin = i;});},));
    List<Widget> hexuan = List<Widget>.generate(hexuans.length, (i)=>OutlineButton(
      child: Text(hexuans[i].name),
      borderSide: currentHexuan == i ? new BorderSide(color: Theme.of(context).primaryColor): null,
      onPressed: (){setState(() {currentHexuan = i;});},));
    List<Widget> jpWidgets = List<Widget>.generate(jiepais.length, (i)=>OutlineButton(
      child: Text(jiepais[i]), 
      borderSide: currentJiePai == jiepais[i] ? new BorderSide(color: Theme.of(context).primaryColor): null,
      onPressed: (){ setState(() {currentJiePai = jiepais[i];});},));
    List<Widget> xianWidgets = List<Widget>.generate(xians.length, (i)=>OutlineButton(
      child: Text(xians[i]), 
      onPressed: (){addyinfu(xians[i]);},));
    
    var tmp=lineYinfu();
    List<Widget> yinfuWidgets = List<Widget>.generate(tmp.length, (i)=>Positioned(
      left: tmp[i].pos.dx,
      top: tmp[i].pos.dy - 20,
      child: Text('${tmp[i].line}', style: TextStyle(fontWeight: FontWeight.bold)),));
    return Scaffold(
      appBar: AppBar(
        title: Text(widget.title),
        actions: <Widget>[
                IconButton(icon: Icon(Icons.phonelink_erase), onPressed: erasehexian,),
                IconButton(icon: Icon(Icons.keyboard_backspace), onPressed: delyin,),
                IconButton(icon: Icon(Icons.add), onPressed: (){addhexuan(context);},),
                IconButton(icon: Icon(Icons.music_note), onPressed: loadAssets,),
        ],
      ),
      body: images.length == 0 ? 
        Center(child: Text('No image selected.'))
        :Stack(
          key: dragableKey,
          children: <Widget>[
          SingleChildScrollView(
              child:Column(
                children:pics,
            )
          ),
          Stack(children: yinfuWidgets,),
          Positioned(
            left: position.dx,
            top: position.dy,      
            width: 1000,
            height: 220,
            child: 
            Draggable(
              onDraggableCanceled: (velocity, offset) {
                RenderBox rb = dragableKey.currentContext.findRenderObject();
                Offset localp = rb.globalToLocal(offset);
                curlineidx++;
                setState(() => position = localp);
              },
              feedback: Container(
                width: 1000,
                height: 220,
                decoration: BoxDecoration(
                  color: Colors.white,
                  border: Border.all(color: Colors.black),
                  borderRadius: BorderRadius.circular(10.0)
                ),
              ),
              child: Container(
                padding: const EdgeInsets.all(10.0),
                child: Column(
                  children: <Widget>[
                    Row(children: hexuan),
                    Row(children: <Widget>[
                      Row(children: cmdWidgets,),
                      Text(' buf:$buffer'),
                      Row(children: jpWidgets,),
                    ],),
                    Row(children: pinWidgets,),
                    Row(children: xianWidgets,),
                  ],
                ),
                decoration: BoxDecoration(
                  color: Colors.white,
                  border: Border.all(color: Colors.black),
                  borderRadius: BorderRadius.circular(10.0),
                ),
              ),
            )            
          )
        ],) 
    );
  }
}
