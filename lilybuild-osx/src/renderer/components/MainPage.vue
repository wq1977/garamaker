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
      <li class="nav-item">
        <a class="nav-link" @click="save" href="#">保存</a>
      </li>
      <li class="nav-item">
        <a class="nav-link" @click="load" href="#">加载</a>
      </li>
    </ul>
    <form class="form-inline my-2 my-lg-0">
      <select v-model="jiepai" class="form-control mr-2">
        <option :key="idx" v-for="(value, idx) in ['3/4','4/4','6/8']">{{ value }}</option>
      </select>
      <button class="btn btn-outline-success mr-2 my-2 my-sm-0" @click="chooseFile" type="button">选择歌谱</button>
      <button class="btn btn-outline-success mr-2 my-2 my-sm-0" @click="saveFile" type="button">演奏</button>
      <button class="btn btn-outline-success my-2 my-sm-0" @click="clear" type="button">重来</button>
    </form>
  </div>
</nav>
<div id="pics" class="container position-relative overflow-hidden">
  <div @mousedown="dragruler" :style="{backgroundColor: curline.cnt.split(',').length % jiepaiqi === 1 ? 'green' : 'red', left:rulex + 'px',top:ruley + 'px'}" @mouseup="stopdragrule" id="ruler"></div>
  <div class="row" :key="`file${idx}`" v-for="(file,idx) in files">
    <div class="col"><img style="width:100%;" :src="`file://${file}`" /></div>
  </div>
  <div @click="lineClick(line)" class="row px-0 mx-0 position-absolute" :style="lineStyle(line)" :key="idx" v-for="(line, idx) in lines">
    <span class="mr-3" :key="`piece${idx}`" v-for="(piece,idx) in split(line.cnt)"> {{ piece }} </span>
  </div>
</div>
</div>
</template>

<script>
const { dialog } = require('electron').remote
let lastduoduo = []
let lastwanyin = []

function notInLast (y, a) {
  return a.filter(a1 => a1[0] === y[0] && a1[1] === y[1] && a1[2] === y[2] && a1[3] === y[3]).length === 0
}

function nouse () {
}

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
    clear () {
      lastduoduo = []
      lastwanyin = []
      this.lines = []
    },
    width: () => document.querySelector('#pics').clientWidth,
    lineClick (line) {
      this.rulex = line.x * this.width() / line.width
      this.ruley = line.y * this.width() / line.width
    },
    lineStyle (line) {
      return {
        color: line.cnt.split(',').length % this.jiepaiqi === 1 ? 'green' : 'red',
        left: line.x * this.width() / line.width + 'px',
        top: (line.y * this.width() / line.width - 25) + 'px'
      }
    },
    async save () {
      if (!this.file) {
        this.file = await dialog.showSaveDialog()
      }
      if (this.file) {
        require('fs').writeFileSync(this.file, JSON.stringify({
          lines: this.lines.filter(l => l.cnt.length > 0),
          files: this.files,
          jiepai: this.jiepai
        }))
      }
    },
    async load () {
      const files = await dialog.showOpenDialog({
        properties: ['openFile'],
        filters: [{ name: 'Lily', extensions: ['lily'] }]
      })
      if (files) {
        this.clear()
        const tmp = JSON.parse(require('fs').readFileSync(files[0]))
        this.lines = tmp.lines
        this.files = tmp.files
        this.jiepai = tmp.jiepai
        this.file = files[0]
      }
    },
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
    exportwanyin: function (yinfus) {
      const {process} = require('../lib/wanyin')
      const lines = this.lines.filter(l => l.cnt.length > 0).sort((a, b) => a.y - b.y)
      return lines.reduce((a, line) => a.concat(line.cnt.split(',')), []).filter(l => l.length > 0).map((p, idx) => {
        // console.log('process', process(p, idx))
        return process(p, idx, yinfus)
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
      this.lines.push({ x: this.rulex, y: this.ruley, width: this.width(), cnt: '' })
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
      this.clear()
    },
    async saveFile () {
      const {play, wanyin, yinfu} = require('../lib/applescript')
      const thisduoduo = this.exportduoduo()
      const thiswanyin = this.exportwanyin(thisduoduo)
      if (yinfu(thisduoduo)) {
        wanyin(thiswanyin)
        // lastduoduo = thisduoduo
        // lastwanyin = thiswanyin
        nouse(lastduoduo, lastwanyin, notInLast)
        play()
      }
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

