<template>
<div class="container-fluid px-0">
<nav class="navbar navbar-expand-lg navbar-light bg-light sticky-top">
  <a class="navbar-brand" href="#">LilyBuilder</a>
  <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
    <span class="navbar-toggler-icon"></span>
  </button>

  <div class="collapse navbar-collapse" id="navbarSupportedContent">
    <ul class="navbar-nav mr-auto">
      <li class="nav-item active">
        <a class="nav-link" href="#">添加和弦<span class="sr-only">(current)</span></a>
      </li>
    </ul>
    <form class="form-inline my-2 my-lg-0">
      <select v-model="jiepai" class="form-control mr-2">
        <option :key="idx" v-for="(value, idx) in ['3/4','4/4','6/8']">{{ value }}</option>
      </select>
      <button class="btn btn-outline-success mr-2 my-2 my-sm-0" @click="chooseFile" type="button">选择歌谱</button>
      <button class="btn btn-outline-success mr-2 my-2 my-sm-0" @click="saveFile" type="button">演奏</button>
      <button class="btn btn-outline-success my-2 my-sm-0" @click="lines=[]" type="button">重来</button>
    </form>
  </div>
</nav>
<div class="container position-relative">
  <div @mousedown="dragruler" :style="{backgroundColor: curline.cnt.split(',').length % jiepaiqi === 1 ? 'green' : 'red', left:rulex + 'px',top:ruley + 'px'}" @mouseup="stopdragrule" id="ruler"></div>
  <div class="row" :key="`file${idx}`" v-for="(file,idx) in files">
    <div class="col"><img style="width:100%;" :src="`file://${file}`" /></div>
  </div>
  <div @click="ruley=line.y; rulex = line.x;" class="row px-0 mx-0 position-absolute" :style="{color: line.cnt.split(',').length % jiepaiqi === 1 ? 'green' : 'red', left:line.x+'px', top:(line.y - 25)+'px'}" :key="idx" v-for="(line, idx) in lines">
    <span class="mr-3" :key="`piece${idx}`" v-for="(piece,idx) in split(line.cnt)"> {{ piece }} </span>
  </div>
</div>
</div>
</template>

<script>
const { dialog } = require('electron').remote

export default {
  data: () => ({
    files: [],
    rulex: 100,
    ruley: 100,
    lines: [],
    jiepai: '3/4'
  }),
  computed: {
    jiepaiqi: function () {
      return Number(this.jiepai[0])
    },
    curline: function () {
      let lines = this.lines.filter(l => {
        return l.y === this.ruley
      })
      if (lines.length === 0) {
        if (this.lines.length > 0) {
          return this.lines[this.lines.length - 1]
        }
        return { x: this.rulex, y: this.ruley, cnt: '' }
      }
      return lines[0]
    }
  },
  methods: {
    split (line) {
      let pieces = line.split(',')
      const ret = []
      while (pieces.length > 0) {
        let piece = pieces.splice(0, this.jiepaiqi).join(',')
        if (!piece.endsWith(',') && piece.length > 0 && pieces.length > 0) piece += ','
        ret.push(piece)
      }
      return ret
    },
    exportduoduo: function () {
      const {process} = require('../lib/yinfu')
      const lines = this.lines.filter(l => l.cnt.length > 0).sort((a, b) => a.y - b.y)
      return lines.reduce((a, line) => a.concat(line.cnt.split(',')), []).filter(l => l.length > 0).map((p, idx) => {
        return process(p, idx)
      }).reduce((a, v) => a.concat(v), [])
    },
    exportwanyin: function () {
      const {process} = require('../lib/wanyin')
      const lines = this.lines.filter(l => l.cnt.length > 0).sort((a, b) => a.y - b.y)
      return lines.reduce((a, line) => a.concat(line.cnt.split(',')), []).filter(l => l.length > 0).map((p, idx) => {
        // console.log('process', process(p, idx))
        return process(p, idx)
      }).reduce((a, v) => a.concat(v), [])
    },
    exportlily: function () {
      const lines = this.lines.filter(l => l.cnt.length > 0).sort((a, b) => a.y - b.y)
      return `[设置]\nbpm=71\nbeats=${this.jiepaiqi}\n\n[吉他]\n` + lines.map(l => l.cnt || '').join('\n')
    },
    globalkey (e) {
      if (['p', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '@', '-', ','].indexOf(e.key) >= 0) {
        this.curline.cnt += e.key
        return
      }
      if (e.key === 'Backspace') {
        this.curline.cnt = this.curline.cnt.slice(0, -1)
      }
    },
    dragruler (e) {
      this.drag_start = { x: e.clientX, y: e.clientY }
      this.ruler_start = { x: this.rulex, y: this.ruley }
      document.onmousemove = this.moveruler
    },
    stopdragrule (e) {
      this.drag_start = null
      document.onmousemove = null
      this.lines.push({ x: this.rulex, y: this.ruley, cnt: '' })
    },
    moveruler (e) {
      if (this.drag_start) {
        this.rulex = this.ruler_start.x + e.clientX - this.drag_start.x
        this.ruley = this.ruler_start.y + e.clientY - this.drag_start.y
      }
    },
    async chooseFile () {
      this.files = await dialog.showOpenDialog({
        properties: ['openFile', 'multiSelections'],
        filters: [{ name: 'Images', extensions: ['jpg', 'png', 'gif'] }]
      })
      this.lines = []
      this.file = ''
    },
    async saveFile () {
      this.lines = [{cnt: '32,@p23,12,56'}]
      const {play, wanyin, yinfu} = require('../lib/applescript')
      yinfu(this.exportduoduo())
      wanyin(this.exportwanyin())
      play()
    }
  },
  created () {
    document.onkeydown = this.globalkey
  }
}
</script>


<style>
body{
    margin: 0;
    padding: 0;
}
#ruler {
  position: absolute;
  z-index: 9;
  border: 1px solid #d3d3d3;
  text-align: center;
  height:5px;
  width:100%;
}
</style>

