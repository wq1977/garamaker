const jitabase = [65, 60, 56, 51, 46, 41]
const processunits = {
  '@2': (yin, idx, lastyin, jiepai, chords) => [
    [idx * 2, yin.substr(2, 2), yinqiang(jiepai, idx * 2), 1],
    [idx * 2 + 1, yin.substr(4, 2), yinqiang(jiepai, idx * 2 + 1), 1]
  ],
  '@|': (yin, idx, lastyin, jiepai, chords) => {
    const base = yin.split('|').slice(1)
    let result = []
    for (let i = 0; i < base.length; i++) {
      result = result.concat(base[i].match(/.{1,2}/g).map(y => [idx * 2 + i, y, yinqiang(jiepai, idx * 2 + i), 1]))
    }
    return result
  },
  '@s': (yin, idx, lastyin, jiepai, chords) => yin.substr(2).match(/.{1,2}/g).map(y => [idx * 2, y, yinqiang(jiepai, idx * 2), 2]),
  '@p': (yin, idx, lastyin, jiepai, chords) => yin.substr(2).match(/.{1,2}/g).map(y => [idx * 2, y, yinqiang(jiepai, idx * 2), 2]),
  '@S': (yin, idx, lastyin, jiepai, chords) => yin.substr(2).match(/.{1,2}/g).map(y => [idx * 2, y, yinqiang(jiepai, idx * 2), 2]),
  '@P': (yin, idx, lastyin, jiepai, chords) => yin.substr(2).match(/.{1,2}/g).map(y => [idx * 2, y, yinqiang(jiepai, idx * 2), 2]),
  '--': (yin, idx, lastyin, jiepai) => {
    lastyin.forEach(yin => {
      yin[3] += 2
    })
    return []
  },
  '00': () => []
}

function yinqiang (jiepai, idx, addon) {
  if (!addon) addon = 0
  return 40 + 40 * addon / 10
}

function yingao (yin, chords) {
  // process 24 || 2A
  const code = yin.charCodeAt(1)
  if ((code >= 'A'.charCodeAt(0)) && (code <= 'Z'.charCodeAt(0))) {
    const chord = chords[code - 'A'.charCodeAt(0)]
    yin = yin[0] + chord.chord.split(',')[parseInt(yin[0], 16) - 1]
  }
  return jitabase[parseInt(yin[0], 16) - 1] + parseInt(yin[1], 16)
}

function base (b, chords) {
  const [pos, yin, qiang, duration] = b
  if (yin[0] === 'U') {
    return [
      [pos, yingao(`1${yin[1]}`, chords), qiang * 1.25, duration, 0],
      [pos, yingao(`2${yin[1]}`, chords), qiang * 1.2, duration, 1],
      [pos, yingao(`3${yin[1]}`, chords), qiang * 1.15, duration, 2],
      [pos, yingao(`4${yin[1]}`, chords), qiang * 1.1, duration, 3],
      [pos, yingao(`5${yin[1]}`, chords), qiang * 1.05, duration, 3],
      [pos, yingao(`6${yin[1]}`, chords), qiang, duration, 4]
    ]
  }
  if (yin[0] === 'D') {
    return [
      [pos, yingao(`6${yin[1]}`, chords), qiang * 1.25, duration, 0],
      [pos, yingao(`5${yin[1]}`, chords), qiang * 1.2, duration, 1],
      [pos, yingao(`4${yin[1]}`, chords), qiang * 1.15, duration, 2],
      [pos, yingao(`3${yin[1]}`, chords), qiang * 1.1, duration, 3],
      [pos, yingao(`2${yin[1]}`, chords), qiang * 1.05, duration, 4],
      [pos, yingao(`1${yin[1]}`, chords), qiang, duration, 5]
    ]
  }
  if (yin[0] === 'u') {
    return [
      [pos, yingao(`1${yin[1]}`, chords), qiang * 1.1, duration, 0],
      [pos, yingao(`2${yin[1]}`, chords), qiang * 1.05, duration, 1],
      [pos, yingao(`3${yin[1]}`, chords), qiang, duration, 2]
    ]
  }
  if (yin[0] === 'd') {
    return [
      [pos, yingao(`3${yin[1]}`, chords), qiang * 1.1, duration, 0],
      [pos, yingao(`2${yin[1]}`, chords), qiang * 1.05, duration, 1],
      [pos, yingao(`1${yin[1]}`, chords), qiang, duration, 2]
    ]
  }
  return [[pos, yingao(yin, chords), qiang, duration]]
}

let lastyin = []
export function process (yin, idx, jiepai, chords) {
  let ret
  for (let prefix in processunits) {
    if (yin.startsWith(prefix)) {
      const params = yin.split(/[\[\]]/) // eslint-disable-line
      if (params.length === 3) {
        ret = processunits[prefix](params[0] + params[2], idx, lastyin, jiepai, chords, params[1])
      } else {
        ret = processunits[prefix](yin, idx, lastyin, jiepai, chords)
      }
      break
    }
  }
  if (!ret) {
    ret = yin.match(/.{1,2}/g).map(y => [idx * 2, y, yinqiang(jiepai, idx * 2), 2])
  }
  ret.forEach(v => v.push(idx))
  ret = ret.reduce((r, i) => r.concat(base(i, chords)), [])
  ret = ret.sort((a, b) => (Number(a[0]) * 200 + Number(a[1])) - (Number(b[0]) * 200 + Number(b[1]))) // 声音低的排前面
  if (ret.length > 0) lastyin = ret
  return ret
}
