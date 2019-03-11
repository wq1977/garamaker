const {convert, savemidi} = require('../src/renderer/lib/mid')

let yins = [[0, 40, 50, 2, 0]]
let wans = []
let events = convert(yins, wans) // [ [ 'noteOn', 0, 40, 0, 50 ], [ 'noteOff', 0, 40, 64 ] ]

yins = [[0, 40, 50, 1, 0], [1, 41, 50, 1, 0]]
wans = []
events = convert(yins, wans)
/**
[ [ 'noteOn', 0, 40, 0, 50 ],
  [ 'noteOff', 0, 40, 16 ],
  [ 'noteOn', 0, 41, 0, 50 ],
  [ 'noteOff', 0, 41, 16 ] ]
 */

yins = [[0, 40, 50, 2], [0, 41, 50, 2]]
wans = []
events = convert(yins, wans)
/**
[ [ 'noteOn', 0, 40, 0, 50 ],
  [ 'noteOn', 0, 41, 0, 50 ],
  [ 'noteOff', 0, 40, 32 ],
  [ 'noteOff', 0, 41, 0 ] ]
 */

yins = [[0, 40, 50, 2], [0, 41, 50, 2]]
wans = [[0, 1, 1, 1]]
events = convert(yins, wans)
/*
[ [ 'noteOn', 0, 40, 0, 50 ],
  [ 'noteOn', 0, 41, 0, 50 ],
  [ 'pitchBend', 0, 1, 16 ],
  [ 'noteOff', 0, 40, 16 ],
  [ 'noteOff', 0, 41, 0 ],
  [ 'pitchBend', 0, 0.5, 0 ] ]
*/

yins = [[0, 40, 50, 2], [0, 41, 50, 2], [4, 34, 60, 4]]
wans = [[0, 1, 1, 1], [2, 0, 2, 1]]
events = convert(yins, wans)

yins = [[0, 41, 40, 2, 0], [2, 53, 40, 2, 1], [4, 63, 40, 2, 2], [6, 56, 40, 2, 3]]
wans = []
events = convert(yins, wans)

console.log('midi', events)
savemidi(events)
