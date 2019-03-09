const Midi = require('jsmidgen')

Midi.Track.prototype.addPitchBend = function (channel, value, time) {
  value = Math.round(value * 16383)
  this.events.push(new Midi.Event({
    type: Midi.Event.PITCH_BEND,
    channel: channel,
    param1: value & 0x7F,
    param2: value >> 7,
    time: time || 0
  }))
  return this
}

Midi.Track.prototype.setSustain = function (channel, value, time) {
  this.events.push(new Midi.Event({
    type: 0xB0,
    channel: channel,
    param1: 0x40,
    param2: value * 127,
    time: time || 0
  }))
  return this
}

const fs = require('fs')

export function convert (yins, wans) {
  require('fs').writeFileSync('/tmp/src.txt', JSON.stringify({yins, wans}))
  // yin 的格式 [delta_to_0, yingao, yin_qiang, yin_chang, origin index]
  // wan 的格式 [origin_yin_index, type, start_pos, duration]
  // format to [delta_to_0, event_type, event_param]
  // do sort

  const channel = 0
  const UNIT = 32
  const WanUnit = 24
  const events = []
  for (let yin of yins) {
    const [delta, yingao, force, duration, sdelta] = yin
    let ssdelta = sdelta || 0
    events.push(['yinstart', delta * UNIT + ssdelta, yingao, force])
    events.push(['yinend', (delta + duration) * UNIT + ssdelta, yingao])
  }
  for (let wan of wans) {
    const [index, type, startPos, duration] = wan
    const value = type === 1 ? 1 : 0
    events.push(['wanstart', (index * 2 + startPos / WanUnit) * UNIT, value])
    events.push(['wanend', (index * 2 + startPos / WanUnit + duration / WanUnit) * UNIT, value])
  }

  events.sort((a, b) => {
    const rate = [ 'yinstart', 'wanstart', 'wanend', 'yinend' ]
    if (a[1] === b[1]) return rate.indexOf(a[0]) - rate.indexOf(b[0])
    return a[1] - b[1]
  })

  // console.log('middle ware', events)

  const midievts = []
  let playind = 0
  midievts.push(['sustain', channel, 1, 0])
  for (let evt of events) {
    const [evttype, pos, p1, p2] = evt
    if (evttype === 'yinstart') {
      midievts.push([ 'noteOn', channel, p1, pos - playind, p2 ])
      playind = pos
    }
    if (evttype === 'yinend') {
      let time = pos - playind
      if (time < 0) time = 0
      midievts.push([ 'noteOff', channel, p1, time ])
      playind = pos
    }
    if (evttype === 'wanstart') {
      midievts.push([ 'pitchBend', channel, 0.5, pos - playind ])
      midievts.push([ 'pitchBend', channel, p1, 1 ])
      playind = pos + 1
    }
    if (evttype === 'wanend') {
      let time = pos - playind - 1
      if (time < 0) time = 0
      midievts.push(['pitchBend', channel, p1, time])
      midievts.push(['pitchBend', channel, 0.5, 1])
      playind = pos
    }
  }
  return midievts
}

export function savemidi (events) {
  const file = new Midi.File()
  const track = new Midi.Track()
  file.addTrack(track)
  for (let evt of events) {
    if (evt[0] === 'sustain') {
      const [, channel, value, time] = evt
      track.setSustain(channel, value, time)
    }
    if (evt[0] === 'noteOn') {
      const [, channel, yingao, time, force] = evt
      track.noteOn(channel, yingao, time, force)
    }
    if (evt[0] === 'noteOff') {
      const [, channel, yingao, time] = evt
      track.noteOff(channel, yingao, time)
    }
    if (evt[0] === 'pitchBend') {
      const [, channel, value, time] = evt
      track.addPitchBend(channel, value, time)
    }
  }
  fs.writeFileSync('/Users/baba/Desktop/test.mid', file.toBytes(), 'binary')
}

// module.exports = {
//   convert,
//   savemidi
// }
