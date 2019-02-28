const WanUnit = 24
const processunits = {
  '@p': (yin, idx) => [
    [idx, 1, 0.5 * WanUnit, WanUnit]
  ]
}

export function process (yin, idx) {
  for (let prefix in processunits) {
    if (yin.startsWith(prefix)) {
      return processunits[prefix](yin, idx)
    }
  }
  return []
}
