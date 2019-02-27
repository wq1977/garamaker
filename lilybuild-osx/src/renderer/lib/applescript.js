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

on setxzoom()
    tell application "System Events"
        tell last window of process "库乐队"
            set value of attribute "AXValue" of slider 1 of group 1 of group 3 to 0.5
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

function params (val) {
  const lst = NSAppleEventDescriptor.listDescriptor()
  if (val) {
    lst.insertDescriptor_atIndex_(NSAppleEventDescriptor.descriptorWithInt32_(val), 0)
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
  call('setxzoom') // so that we have a fixed width
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
