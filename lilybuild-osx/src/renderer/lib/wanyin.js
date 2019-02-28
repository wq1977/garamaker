const WanUnit = 12
const processunits = {
  '@p': (yin, idx) => [
    [idx * WanUnit + 6, 1, 0, WanUnit]
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
