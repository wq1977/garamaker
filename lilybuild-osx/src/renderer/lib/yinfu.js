const jitabase = [65, 60, 56, 51, 46, 41]
const processunits = {
  '@2': (yin, idx) => [
    [idx * 2, yingao(yin.substr(2, 2)), 40, 1],
    [idx * 2 + 1, yingao(yin.substr(4, 2)), 40, 1]
  ],
  '@p': (yin, idx) => [
    [idx * 2, yingao(yin.substr(2, 2)), 40, 2]
  ],
  '--': (yin, idx, lastyin) => {
    lastyin.forEach(yin => {
      yin[3] += 2
    })
    return []
  },
  '00': () => []
}

function yingao (yin) {
  return jitabase[Number(yin[0]) - 1] + Number(yin[1])
}

let lastyin = []
export function process (yin, idx) {
  let ret
  for (let prefix in processunits) {
    if (yin.startsWith(prefix)) {
      ret = processunits[prefix](yin, idx, lastyin)
      break
    }
  }
  if (!ret) {
    ret = yin.match(/.{1,2}/g).map(y => [idx * 2, yingao(y), 40, 2])
  }
  ret.forEach(v => v.push(idx))
  ret = ret.sort((a, b) => Number(a[1]) - Number(b[1])) // 声音低的排前面
  if (ret.length > 0) lastyin = ret
  return ret
}
