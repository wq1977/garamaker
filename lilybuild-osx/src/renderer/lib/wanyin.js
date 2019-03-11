const WanUnit = 24

function yinfulen (yinfus, idx) {
  const yinfu = yinfus.filter(y => y[0] === idx * 2)
  if (yinfu.length > 0) return yinfu[0][3]
  return 2
}

const processunits = {
  '@p': (yin, idx, yinfus) => [[idx, 1, 0.5 * WanUnit * yinfulen(yinfus, idx), 0.5 * WanUnit * yinfulen(yinfus, idx)]],
  '@s': (yin, idx, yinfus) => [[idx, -1, 0, 0.5 * WanUnit * yinfulen(yinfus, idx)]]
}

export function process (yin, idx, yinfus) {
  for (let prefix in processunits) {
    if (yin.startsWith(prefix)) {
      return processunits[prefix](yin, idx, yinfus)
    }
  }
  return []
}
