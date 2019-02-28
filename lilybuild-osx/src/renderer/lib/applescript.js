const objc = require('objc')
const robot = require('robotjs')
const {NSAppleScript, NSAppleEventDescriptor} = objc

const XUnit = 10
const YUnit = 10

const script = NSAppleScript.alloc().initWithSource_(`on brint_to_front()
    tell application "System Events"
        set frontmost of process "库乐队" to true
        tell last window of process "库乐队"
            tell first UI element of scroll area 2 of splitter group 2 of splitter group 1 of group 2 of group 3
                set value of attribute "AXFocused" to 1
            end tell
        end tell
    end tell
end brint_to_front

on whereami()
    tell application "System Events"
        tell last window of process "库乐队"
            tell scroll area 2 of splitter group 2 of splitter group 1 of group 2 of group 3
                tell first UI element
                    return the value of attribute "AXFrame"
                end tell
            end tell
        end tell
    end tell
end whereami

on wanframe()
  tell application "System Events"
    tell last window of process "库乐队"
      tell group 1 of scroll area 1 of splitter group 3 of splitter group 1 of group 2 of group 3
        return the value of attribute "AXFrame"
      end tell
    end tell
  end tell
end wanframe

on parentframe()
    tell application "System Events"
        tell last window of process "库乐队"
            tell scroll area 2 of splitter group 2 of splitter group 1 of group 2 of group 3
                return the value of attribute "AXFrame"
            end tell
        end tell
    end tell
end parentframe

on itemcount()
    tell application "System Events"
        tell last window of process "库乐队"
            tell scroll area 2 of splitter group 2 of splitter group 1 of group 2 of group 3
                tell first UI element
                    return count UI elements
                end tell
            end tell
        end tell
    end tell
end itemcount

on lastchild()
    tell application "System Events"
        tell last window of process "库乐队"
            tell scroll area 2 of splitter group 2 of splitter group 1 of group 2 of group 3
                tell first UI element
                    tell last UI element
                        return the value of attribute "AXFrame"
                    end tell
                end tell
            end tell
        end tell
    end tell
end lastchild

on setxzoom(zoom)
    tell application "System Events"
        tell last window of process "库乐队"
            set value of attribute "AXValue" of slider 1 of group 1 of group 3 to zoom
        end tell
    end tell
end setxzoom

on setforce(force)
    tell application "System Events"
        set target to force
        tell last window of process "库乐队"
            tell slider 1 of group 2 of group 1 of UI element 1 of splitter group 2 of splitter group 1 of group 2 of group 3
                set var1 to the value of attribute "AXValue"
                repeat while var1 < target or var1 > target
                    if var1 < target and target - var1 ≥ 10 then
                        perform action "AXIncrement"
                    end if
                    if var1 > target and var1 - target ≥ 10 then
                        perform action "AXDecrement"
                    end if
                    set value of attribute "AXValue" to target
                    set var1 to the value of attribute "AXValue"
                end repeat
            end tell
        end tell
    end tell
end setforce`)

function isInt (n) {
  return Number(n) === n && n % 1 === 0
}

function params (val) {
  const lst = NSAppleEventDescriptor.listDescriptor()
  if (val && isInt(val)) {
    lst.insertDescriptor_atIndex_(NSAppleEventDescriptor.descriptorWithInt32_(val), 0)
  } else {
    if (val === 0.5) {
      lst.insertDescriptor_atIndex_(NSAppleEventDescriptor.descriptorWithDescriptorType_bytes_length_(
        1685026146, Buffer.from('000000000000e03f', 'hex'), 8), 0)
    } else {
      lst.insertDescriptor_atIndex_(NSAppleEventDescriptor.descriptorWithDescriptorType_bytes_length_(
        1685026146, Buffer.from('000000000000f03f', 'hex'), 8), 0)
    }
  }
  return lst
}

function call (name, val) {
  const evt = NSAppleEventDescriptor.appleEventWithEventClass_eventID_targetDescriptor_returnID_transactionID_(
    1634952050, 1886610034, NSAppleEventDescriptor.nullDescriptor(), 0, 0)
  evt.setDescriptor_forKeyword_(params(val), 757935405)
  evt.setDescriptor_forKeyword_(NSAppleEventDescriptor.descriptorWithString_(name), 1936613741)
  return script.executeAppleEvent_error_(evt, null)
}

function frame (ret) {
  const x1 = ret.descriptorAtIndex_(1).int32Value()
  const y1 = ret.descriptorAtIndex_(2).int32Value()
  const x2 = ret.descriptorAtIndex_(3).int32Value()
  const y2 = ret.descriptorAtIndex_(4).int32Value()
  return [ x1, y1, x2 - x1, y2 - y1 ]
}

function count (ret) {
  return ret.int32Value()
}

function deleteall () {
  robot.keyTap('a', 'command')
  robot.keyTap('delete')
}

function convert (p) {
  const [x, y, force, w] = p
  return [(x + 2) * XUnit, y * YUnit, force, w * XUnit]
}

function scrollto (p, Px, Py, Pw, Ph) {
  const [x, y, force, w] = convert(p)

  let [mx, my, , mh] = frame(call('whereami'))
  let [targetx, targety] = [mx + x, my + mh - y]

  // 首先保证X方向上可见，也就是需要保证 targetx>=Px and targetx+w < Px+Pw
  // 如果目标X在可见区域左侧 将目标移动到可见位置即可
  let loopvar = targetx - XUnit
  while (loopvar < Px) {
    robot.scrollMouse(10, 0); [mx, my, , mh] = frame(call('whereami')); [targetx, targety] = [mx + x, my + mh - y]
    loopvar = targetx - XUnit
  }

  // 如果targetx+w在可见区域右侧，将targetx+w移动到可见区域即可
  loopvar = targetx + w + XUnit
  while (loopvar > Px + Pw) {
    robot.scrollMouse(-10, 0); [mx, my, , mh] = frame(call('whereami')); [targetx, targety] = [mx + x, my + mh - y]
    loopvar = targetx + w + XUnit
  }

  // 然后保证Y方向上可见，也是一样的原理 也就是需要保证 targety>=Py and targety+YUnit < Py+Ph
  // 如果目标Y在可见区域上方 将目标移动到可见位置即可
  loopvar = targety
  while (loopvar < Py) {
    robot.scrollMouse(0, 10); [mx, my, , mh] = frame(call('whereami')); [targetx, targety] = [mx + x, my + mh - y]
    loopvar = targety
  }

  // 如果targety+1在可见区域右侧，将targety+1移动到可见区域即可
  loopvar = targety + YUnit
  while (loopvar > Py + Ph) {
    robot.scrollMouse(0, -10); [mx, my, , mh] = frame(call('whereami')); [targetx, targety] = [mx + x, my + mh - y]
    loopvar = targety + YUnit
  }

  return [targetx, targety, w, force]
}

function insertP (p, idx, Px, Py, Pw, Ph) {
  const [px, py, pw, force] = scrollto(p, Px, Py, Pw, Ph)

  // add point
  robot.keyToggle('command', 'down', 'command')
  robot.moveMouse(px, py + YUnit / 3)
  robot.mouseClick('left')
  robot.keyToggle('command', 'up', 'command')

  if (idx + 1 !== count(call('itemcount'))) {
    return false
  }

  // fix length
  let [x, y, w, h] = frame(call('lastchild'))
  if (Math.abs(w - pw) > 5) {
    let loopvar = x + w
    while (loopvar > Px + Pw) {
      robot.scrollMouse(-10, 0); [x, y, w, h] = frame(call('lastchild'))
      loopvar = x + w
    }
    robot.moveMouse(x + w - 1, y + h / 2)
    robot.mouseToggle('down')
    robot.dragMouse(x + pw - 1, y + h / 2)
    robot.mouseToggle('up')
  }

  call('setforce', force)

  return true
}

export async function play (duoduo) {
  call('brint_to_front')
  call('setxzoom', 0.5) // so that we have a fixed width
  const [Px, Py, Pw, Ph] = frame(call('parentframe')) // we now know which part are shown now
  robot.moveMouse(Px + Pw / 2, Py + Ph / 2)
  deleteall()

  for (let idx in duoduo) {
    if (!insertP(duoduo[idx], Number(idx), Px, Py, Pw, Ph)) {
      console.log('insert fail', idx, duoduo[idx])
      break
    }
  }
}

function convertw (p) {
  const [x, y, force, w] = p
  return [(x + 12) * XUnit, y * YUnit, force, w * XUnit]
}

function scrolltoW (p, Px, Py, Pw, Ph) {
  const [x, y, force, w] = convertw(p)
  let [mx, my, , mh] = frame(call('wanframe'))
  let [targetx, targety] = [mx + x, my + mh - y]

  // 首先保证X方向上可见，也就是需要保证 targetx>=Px and targetx+w < Px+Pw
  // 如果目标X在可见区域左侧 将目标移动到可见位置即可
  let loopvar = targetx - XUnit
  while (loopvar < Px) {
    robot.scrollMouse(10, 0); [mx, my, , mh] = frame(call('wanframe')); [targetx, targety] = [mx + x, my + mh - y]
    loopvar = targetx - XUnit
  }

  // 如果targetx+w在可见区域右侧，将targetx+w移动到可见区域即可
  loopvar = targetx + w + XUnit
  while (loopvar > Px + Pw) {
    robot.scrollMouse(-10, 0); [mx, my, , mh] = frame(call('wanframe')); [targetx, targety] = [mx + x, my + mh - y]
    loopvar = targetx + w + XUnit
  }

  return [targetx, targety, w, force]
}

async function sleep (d) {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve()
    }, d)
  })
}

async function insertW (p, idx, Px, Py, Pw, Ph) {
  console.log('insertW', idx)

  const [px, , pw] = scrolltoW(p, Px, Py, Pw, Ph)
  const wanyin = p[1]

  const delta = 6
  const sleepd = 0.01
  // remove old wanyin
  // robot.moveMouse(px - 8, Py + 8)
  // robot.mouseToggle('down')
  // robot.dragMouse(px + pw + 8, Py + Ph - 8)
  // robot.mouseToggle('up')
  // await sleep(sleepd)
  // robot.keyTap('delete')
  // await sleep(sleepd)
  console.log(pw)
  sleep(sleepd)

  if (wanyin === 1) { // 上弯音
    // add point
    for (let i = 0; i < 1; i++) {
      robot.moveMouse(px + delta * i, Py + Ph / 2 + 2)
      robot.mouseClick('left')
      // robot.moveMouse(px + pw - delta * i, Py + Ph / 2 + 2)
      // robot.mouseClick('left')
    }

    // for (let i = 1; i < 2; i++) {
    //   robot.moveMouse(px + delta * i, Py + Ph / 2 + 2)
    //   // robot.mouseClick('left')
    //   await sleep(sleepd)
    //   robot.mouseToggle('down')
    //   await sleep(sleepd)
    //   robot.dragMouse(px + delta * i, Py + delta * 5 - delta * 5 * Math.sin(Math.PI * i / 2 / 5))
    //   await sleep(sleepd)
    //   robot.mouseToggle('up')
    //   await sleep(sleepd)

    //   robot.moveMouse(px + pw - delta * i, Py + Ph / 2 + 2)
    //   // robot.mouseClick('left')
    //   await sleep(sleepd)
    //   robot.mouseToggle('down')
    //   await sleep(sleepd)
    //   robot.dragMouse(px + pw - delta * i, Py + delta * 5 - delta * 5 * Math.sin(Math.PI * i / 2 / 5))
    //   await sleep(sleepd)
    //   robot.mouseToggle('up')
    //   await sleep(sleepd)
    // }
  }
}

/**
 * 弯音是一种特殊的修饰，格式为 开始时间,高度,0,时长
 * 通过 @p 等修饰产生
 * 弯音的时间单位比音符大12倍
 * @param {*} duoduo
 */
export async function wanyin (duoduo) {
  call('brint_to_front')
  call('setxzoom', 1.0) // so that we have a fixed width
  const [Px, , Pw] = frame(call('parentframe')) // we now know which part are shown now
  const [, Wy, , Wh] = frame(call('wanframe'))
  robot.moveMouse(Px + Pw / 2, Wy + Wh / 2)

  for (let idx in duoduo) {
    if (!insertW(duoduo[idx], Number(idx), Px, Wy, Pw, Wh)) {
      console.log('insertw fail', idx, duoduo[idx])
      break
    }
  }
}
