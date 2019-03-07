const jitabase = [65, 60, 56, 51, 46, 41]
const processunits = {
  '@2': (yin, idx, lastyin, jiepai) => [
    [idx * 2, yingao(yin.substr(2, 2)), yinqiang(jiepai, idx * 2), 1],
    [idx * 2 + 1, yingao(yin.substr(4, 2)), yinqiang(jiepai, idx * 2 + 1), 1]
  ],
  '@|': (yin, idx, lastyin, jiepai) => {
    const base = yin.split('|').slice(1)
    let result = []
    for (let i = 0; i < base.length; i++) {
      result = result.concat(base[i].match(/.{1,2}/g).map(y => [idx * 2 + i, yingao(y), yinqiang(jiepai, idx * 2 + i), 1]))
    }
    return result
  },
  '@p': (yin, idx, lastyin, jiepai) => [
    [idx * 2, yingao(yin.substr(2, 2)), yinqiang(jiepai, idx * 2), 2]
  ],
  '--': (yin, idx, lastyin, jiepai) => {
    lastyin.forEach(yin => {
      yin[3] += 2
    })
    return []
  },
  '00': () => []
}

function yinqiang(jiepai, idx) {
  return 40
}

function yingao (yin) {
  return jitabase[parseInt(yin[0], 16) - 1] + parseInt(yin[1], 16)
}

let lastyin = []
export function process (yin, idx, jiepai) {
  let ret
  for (let prefix in processunits) {
    if (yin.startsWith(prefix)) {
      ret = processunits[prefix](yin, idx, lastyin, jiepai)
      break
    }
  }
  if (!ret) {
    ret = yin.match(/.{1,2}/g).map(y => [idx * 2, yingao(y), yinqiang(jiepai, idx * 2), 2])
  }
  ret.forEach(v => v.push(idx))
  ret = ret.sort((a, b) => (Number(a[0]) * 200 + Number(a[1])) - (Number(b[0]) * 200 + Number(b[1]))) // 声音低的排前面
  if (ret.length > 0) lastyin = ret
  return ret
}
