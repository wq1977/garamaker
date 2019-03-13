const WanUnit = 24

function yinfulen (yinfus, idx) {
  const yinfu = yinfus.filter(y => y[0] === idx * 2)
  if (yinfu.length > 0) return yinfu[0][3]
  return 2
}

const processunits = {
  '@p': (yin, idx, yinfus, params) => [[idx, params ? parseInt(params, 16) : 2, 0.5 * WanUnit * yinfulen(yinfus, idx), 0.5 * WanUnit * yinfulen(yinfus, idx)]],
  '@s': (yin, idx, yinfus, params) => [[idx, -1 * (params ? parseInt(params, 16) : 2), 0, 0.5 * WanUnit * yinfulen(yinfus, idx)]],
  '@S': (yin, idx, yinfus, params) => [[idx, -1 * (params ? parseInt(params, 16) : 2), 0.5 * WanUnit * yinfulen(yinfus, idx), 0.5 * WanUnit * yinfulen(yinfus, idx)]],
  '@P': (yin, idx, yinfus, params) => [[idx, params ? parseInt(params, 16) : 2, 0, 0.5 * WanUnit * yinfulen(yinfus, idx)]]
}

export function process (yin, idx, yinfus) {
  for (let prefix in processunits) {
    if (yin.startsWith(prefix)) {
      const params = yin.split(/[\[\]]/) // eslint-disable-line
      if (params.length === 3) {
        return processunits[prefix](params[0] + params[2], idx, yinfus, params[1])
      } else {
        return processunits[prefix](yin, idx, yinfus)
      }
    }
  }
  return []
}
