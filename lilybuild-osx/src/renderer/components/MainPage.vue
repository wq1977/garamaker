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
        <a class="nav-link" @click.stop.prevent="showEditChord" href="#">添加和弦<span class="sr-only">(current)</span></a>
      </li>
      <li class="nav-item">
        <a class="nav-link" @click.stop.prevent="save" href="#">保存 {{ this.modified ? '*' : ''}}</a>
      </li>
      <li class="nav-item">
        <a class="nav-link" @click.stop.prevent="load" href="#">加载</a>
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
<div class="container d-flex flex-row">
  <div class="d-flex flex-column chords">
    <button @click="curchord = -1;" :class="{active:curchord===-1}" class="btn btn-secondary mt-2">无和弦</button>
    <button @click="curchord = idx;" :class="{active:curchord===idx}" :key="idx" :title="chord.chord" v-for="(chord, idx) in chords" class="btn btn-secondary mt-1">
      {{ chord.name }}
    </button>
  </div>
  <div class="d-flex flex-column yinjie">
    <button @click="curyinjie = -1;" :class="{active:curyinjie===-1}" class="btn btn-secondary mt-2">无音阶</button>
    <button @click="curyinjie = idx;" :class="{active:curyinjie===idx}" :key="idx" v-for="(chord, idx) in ['低八度', '中八度', '高八度']" class="btn btn-secondary mt-1">
      {{ chord }}
    </button>
  </div>
  <div id="pics" class="position-relative overflow-hidden">
    <div @mousedown="dragruler" :style="{backgroundColor: curline.cnt.split(',').length % jiepaiqi === 1 ? 'green' : 'red', left:rulex + 'px',top:ruley + 'px'}" @mouseup="stopdragrule" id="ruler"></div>
    <div class="row" :key="`file${idx}`" v-for="(file,idx) in files">
      <div class="col"><img style="width:100%;" :src="`file://${file}`" /></div>
    </div>
    <div @click="lineClick(line)" class="row px-0 mx-0 position-absolute" :style="lineStyle(line)" :key="idx" v-for="(line, idx) in lines">
      <span class="mr-3" :key="`piece${idx}`" v-for="(piece,idx) in split(line.cnt)"> {{ piece }} </span>
    </div>
  </div>
</div>
<ModalChord id="chord" :okcb="addchord" />
</div>
</template>

<script>
import ModalChord from './ModalChord.vue'
/* global $ */
const { dialog } = require('electron').remote

export default {
  components: {
    ModalChord
  },
  data: () => ({
    files: [],
    rulex: 100,
    ruley: 100,
    lines: [],
    chords: [],
    modified: false,
    curchord: -1,
    curyinjie: -1,
    jiepai: '3/4'
  }),
  computed: {
    jiepaiqi: function () {
      return Number(this.jiepai[0])
    },
    curline: function () {
      let lines = this.lines.filter(l => {
        const pos = this.linerule(l)
        return pos[1] === this.ruley
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
    addchord (name, chord) {
      this.chords.push({name, chord})
      this.modified = true
      $('#chord').modal('hide')
    },
    showEditChord () {
      $('#chord').modal('show')
    },
    clear () {
      this.lines = []
      this.file = ''
    },
    linerule (line) {
      return [line.x * this.width() / line.width, line.y * this.width() / line.width]
    },
    width: () => document.querySelector('#pics').clientWidth,
    lineClick (line) {
      const pos = this.linerule(line)
      this.rulex = pos[0]
      this.ruley = pos[1]
    },
    lineStyle (line) {
      return {
        color: line.cnt.split(',').length % this.jiepaiqi === 1 ? 'green' : 'red',
        left: line.x * this.width() / line.width + 'px',
        top: (line.y * this.width() / line.width - 25) + 'px',
        fontWeight: 800,
        opacity: line === this.curline ? 1 : 0.1
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
          jiepai: this.jiepai,
          chords: this.chords
        }))
        this.modified = false
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
        this.files = tmp.files
        this.lines = tmp.lines
        this.jiepai = tmp.jiepai
        this.chords = tmp.chords || []
        this.file = files[0]
        setTimeout(() => {
          this.$forceUpdate()
        }, 100)
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
        return process(p, idx, this.jiepai, this.chords)
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
      if (e.target.tagName === 'INPUT') return
      const ga = (c1, c2) => {
        let a = []
        let i = c1.charCodeAt(0)
        let j = c2.charCodeAt(0)
        for (; i <= j; ++i) {
          a.push(String.fromCharCode(i))
        }
        return a
      }
      if (e.key === 'P') {
        // copy last param with all chord change to current chord
        if (this.curchord >= 0) {
          let groups = this.split(this.curline.cnt).filter(r => r)
          let base = groups
          const chordChar = String.fromCharCode('A'.charCodeAt(0) + this.curchord)
          if (groups.length === 0) {
            const line = this.lines.filter(l => l.cnt.length > 0).slice(-1)[0]
            groups = this.split(line.cnt).filter(r => r)
            base = []
          }
          let newp = groups.slice(-2)
          newp = newp.map(p => p.replace(/([UuDd0-9])[A-Z]/g, (p1, p2) => p2 + chordChar))
          groups = base.concat(newp)
          this.curline.cnt = groups.join('')
          this.modified = true
          return
        }
      }
      if (e.key === 'L') {
        // copy last param with all chord change to current chord
        if (this.curchord >= 0) {
          let groups = this.split(this.curline.cnt).filter(r => r)
          let base = groups
          const chordChar = String.fromCharCode('A'.charCodeAt(0) + this.curchord)
          if (groups.length === 0) {
            const line = this.lines.filter(l => l.cnt.length > 0).slice(-1)[0]
            groups = this.split(line.cnt).filter(r => r)
            base = []
          }
          let newp = groups.slice(-1)
          newp = newp.map(p => p.replace(/([UuDd0-9])[A-Z]/g, (p1, p2) => p2 + chordChar))
          groups = base.concat(newp)
          this.curline.cnt = groups.join('')
          this.modified = true
          return
        }
      }
      if (e.key === 'Backspace') {
        this.curline.cnt = this.curline.cnt.slice(0, -1)
        this.modified = true
        return
      }
      if (e.key === 'Tab') { // auto complete chord
        e.preventDefault()
        const pieces = this.curline.cnt.split(',')
        const lastpiece = pieces.splice(-1)[0]
        const chord = String.fromCharCode('A'.charCodeAt(0) + this.curchord)
        const newpiece = lastpiece.match(/.{1,1}/g).map(c => `${c}${chord},`).join('')
        pieces.push(newpiece)
        this.curline.cnt = pieces.join(',')
        return
      }
      if (e.key === 'x') { // auto complete chord
        if (this.curchord >= 0) {
          this.curline.cnt += String.fromCharCode('A'.charCodeAt(0) + this.curchord)
          return
        }
      }
      const allowchars = ga('a', 'z').concat(ga('0', '9')).concat(['@', '|', '-', ',', 'u', 'd', 'U', 'D'])
      if (allowchars.indexOf(e.key) >= 0) {
        if ((['1', '2', '3', '4', '5', '6', '7'].indexOf(e.key) >= 0) && (this.curyinjie >= 0)) {
          this.curline.cnt += this.convertYinjie(e.key)
        } else {
          this.curline.cnt += e.key
        }
        this.modified = true
      }
    },
    convertYinjie (key) {
      const define = [
        ['', '', '60', '62', '63', '50', '52'],
        ['53', '40', '42', '43', '30', '32', '20'],
        ['21', '23', '10', '11', '13', '15', '17']
      ]
      const v = parseInt(key)
      if ((v >= 1) && (v <= 7)) {
        return define[this.curyinjie][v - 1]
      }
      return ''
    },
    dragruler (e) {
      e.preventDefault()
      this.drag_start = { x: e.clientX, y: e.clientY }
      this.ruler_start = { x: this.rulex, y: this.ruley }
      document.onmousemove = this.moveruler
    },
    stopdragrule (e) {
      e.preventDefault()
      this.drag_start = null
      document.onmousemove = null
      this.lines.push({ x: this.rulex, y: this.ruley, width: this.width(), cnt: '' })
    },
    moveruler (e) {
      e.preventDefault()
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
      const {savemidi, convert} = require('../lib/mid')
      const thisduoduo = this.exportduoduo()
      const thiswanyin = this.exportwanyin(thisduoduo)
      savemidi(convert(thisduoduo, thiswanyin))
      console.log('done!')
    }
  },
  created () {
    document.onkeydown = this.globalkey
  }
}
</script>


<style scoped>
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
button {
  background-color: #f8f8f8;
  color: black;
}
.chords {
  position: fixed;
  left: 10px;
  top: 200px;
  width: 100px;
  z-index: 100;
}

.yinjie {
  position: fixed;
  right: 10px;
  top: 200px;
  width: 100px;
  z-index: 100;
}
</style>

