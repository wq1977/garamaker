import 'package:flutter/material.dart';
import 'package:multi_image_picker/asset.dart';

class AssetView extends StatefulWidget {
  final int _index;
  final Asset _asset;

  AssetView(
    this._index,
    this._asset, {
    Key key,
  }) : super(key: key);

  @override
  State<StatefulWidget> createState() => AssetState(this._index, this._asset);
}

class AssetState extends State<AssetView> {
  int _index = 0;
  Asset _asset;
  AssetState(this._index, this._asset);

  @override
  void initState() {
    super.initState();
    _loadImage();
  }

  void _loadImage() async {
    await this._asset.requestOriginal();

    if (this.mounted) {
      setState(() {});
    }
  }

  @override
  Widget build(BuildContext context) {
    if (null != this._asset.imageData) {
      return Image.memory(
        this._asset.imageData.buffer.asUint8List(),
        fit: BoxFit.fill,
        gaplessPlayback: true,
      );
    }

    return Text(
      '${this._index}',
      style: Theme.of(context).textTheme.headline,
    );
  }
}