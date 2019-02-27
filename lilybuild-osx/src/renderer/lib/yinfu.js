const jitabase = [65, 60, 56, 51, 46, 41]
const processunits = {
  '@2': (yin, idx) => [
    [idx * 2, yingao(yin.substr(2, 2)), 40, 1],
    [idx * 2 + 1, yingao(yin.substr(4, 2)), 40, 1]
  ]
}

function yingao (yin) {
  return jitabase[Number(yin[0]) - 1] + Number(yin[1])
}

export function process (yin, idx) {
  for (let prefix in processunits) {
    if (yin.startsWith(prefix)) {
      return processunits[prefix](yin, idx)
    }
  }
  return [[idx * 2, yingao(yin), 40, 2]]
}
