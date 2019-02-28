const WanUnit = 24
const processunits = {
  '@p': (yin, idx, yinfus) => {
    let wanyinidx = 0
    for (let yinfuidx in yinfus) {
      if (yinfus[yinfuidx][4] === idx) {
        wanyinidx = yinfuidx
        break
      }
    }
    return [
      [wanyinidx, 1, 0.5 * WanUnit, WanUnit]
    ]
  }}

export function process (yin, idx, yinfus) {
  for (let prefix in processunits) {
    if (yin.startsWith(prefix)) {
      return processunits[prefix](yin, idx, yinfus)
    }
  }
  return []
}
