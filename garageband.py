# -*- coding: utf-8 -*-
import applescript
import pyautogui
import time
import sys

XUnit=10
YUnit=10

scpt = applescript.AppleScript(u'''
on brint_to_front()
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
end setforce
''')

# lines=[
#     '10,15,90,17',
#     '170,80,40,4',
# ]
lines = sys.stdin.readlines()
# print '\n'.join(lines)
# sys.exit()
def sort(ele):
    params = ele.split(',')
    if len(params)<4:
        return 0
    return int(params[0]) * 1000 + int(params[1])
lines.sort(key=sort)
lineidx=-1

def frame(f):
    return (f[0],f[1],f[2]-f[0],f[3]-f[1])

def getP():
    global lines,lineidx
    lineidx+=1
    if lineidx<len(lines):
        return [int(x) for x in lines[lineidx].split(',')]
    return False

def convert(p):
    """
    这里的x和w的单位是一个16分音符，y的单位是一个半音,在屏幕上，一个16分音符的长度是10，一个半音的高度也是10
    """
    (x,y,force,w) = p
    return ((x+1) * XUnit, y * YUnit, force, w * XUnit) 


def scrollto(p):
    """
    这里的x,y是相对于整个卷帘区域，需要滚动屏幕以保证x,y,w都在屏幕可操作范围内
    """
    global Px,Py,Pw,Ph   #在这个范围内的内容是可见区域
    (x,y,force,w) = convert(p)

    (mx,my,mw,mh) = frame(scpt.call('whereami'))
    (targetx,targety) = (mx+x, my+mh  - y)
    #首先保证X方向上可见，也就是需要保证 targetx>=Px and targetx+w < Px+Pw
    #如果目标X在可见区域左侧 将目标移动到可见位置即可
    while targetx < Px:
        pyautogui.hscroll(10)
        (mx,my,mw,mh) = frame(scpt.call('whereami'))
        (targetx,targety) = (mx+x, my+mh  - y)
    #如果targetx+w在可见区域右侧，将targetx+w移动到可见区域即可
    while targetx+w > Px+Pw:
        pyautogui.hscroll(-10)
        (mx,my,mw,mh) = frame(scpt.call('whereami'))
        (targetx,targety) = (mx+x, my+mh  - y)

    #然后保证Y方向上可见，也是一样的原理 也就是需要保证 targety>=Py and targety+YUnit < Py+Ph
    #如果目标Y在可见区域上方 将目标移动到可见位置即可
    while targety < Py:
        pyautogui.scroll(10)
        (mx,my,mw,mh) = frame(scpt.call('whereami'))
        (targetx,targety) = (mx+x, my+mh  - y)
    #如果targety+1在可见区域右侧，将targety+1移动到可见区域即可
    while targety+YUnit > Py+Ph:
        pyautogui.scroll(-10)
        (mx,my,mw,mh) = frame(scpt.call('whereami'))
        (targetx,targety) = (mx+x, my+mh  - y)
    return (targetx, targety, w,force)

lastw=lastforce=0
def insertP(p, idx):  
    global lastw,lastforce
    (px,py,pw,force) = scrollto(p)

    # add point
    pyautogui.keyDown('command')
    pyautogui.moveTo(px, py)
    pyautogui.click()
    pyautogui.keyUp('command')

    # if False: #skip check
    #     if idx % 10 == 0: #check fail every 10
    if idx != scpt.call('itemcount'):
        print 'insert fail!'
        sys.exit(1)

    if lastw != pw:
        # fix length
        global Px,Py,Pw,Ph   #在这个范围内的内容是可见区域
        (x,y,w,h) = frame(scpt.call('lastchild'))
        if abs(w - pw) > 5: 
            while x+w > Px + Pw:
                pyautogui.hscroll(-10)
                (x,y,w,h) = frame(scpt.call('lastchild'))
            pyautogui.moveTo(x+w-1,y+h/2)
            pyautogui.dragTo(x+pw-1, y+h/2, button='left') 

    if lastforce != force:
        scpt.call('setforce',force)

    lastforce = force
    lastw = pw

scpt.call('brint_to_front')
scpt.call('setxzoom') #so that we have a fixed width
time.sleep(1)
(Px,Py,Pw,Ph) = frame(scpt.call('parentframe')) #we now know which part are shown now
pyautogui.moveTo(Px+Pw/2, Py+Ph/2)

p=getP()
idx=1
while p!=False:
    print 'insert',p
    insertP(p, idx)
    idx+=1
    p=getP()
