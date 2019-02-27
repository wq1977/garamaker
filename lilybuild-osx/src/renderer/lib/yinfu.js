const jitabase = [65, 60, 56, 51, 46, 41]
const processunits = {
  '@2': () => {

  }
}

export function process (yin, idx) {
  for (let prefix in processunits) {
    if (yin.startsWith(prefix)) {
      return processunits[prefix](yin, idx)
    }
  }
  return [[idx * 2, jitabase[Number(yin[0]) - 1] + Number(yin[1]), 43, 2]]
}
