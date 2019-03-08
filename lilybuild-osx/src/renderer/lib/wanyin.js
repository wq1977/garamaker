const WanUnit = 24
const processunits = {
  '@p': (yin, idx, yinfus) => [[idx, 1, 0.5 * WanUnit, 0.5 * WanUnit]],
  '@s': (yin, idx, yinfus) => [[idx, -1, 0, WanUnit]]
}

export function process (yin, idx, yinfus) {
  for (let prefix in processunits) {
    if (yin.startsWith(prefix)) {
      return processunits[prefix](yin, idx, yinfus)
    }
  }
  return []
}
