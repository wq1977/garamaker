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
  for (let prefix in processunits) {
    if (yin.startsWith(prefix)) {
      const ret = processunits[prefix](yin, idx, lastyin)
      if (ret.length > 0) lastyin = ret
      return ret
    }
  }
  const ret = yin.match(/.{1,2}/g).map(y => [idx * 2, yingao(y), 40, 2])
  if (ret.length > 0) lastyin = ret
  return ret
}
