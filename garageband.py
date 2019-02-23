# -*- coding: utf-8 -*-
import applescript
import pyautogui
import time
import sys

XUnit=10
YUnit=10

def brint_to_front():
    applescript.tell.app("System Events","""
        set frontmost of process "库乐队" to true
        tell first UI element of scroll area 2 of splitter group 2 of splitter group 1 of group 2 of group 3
            set value of attribute "AXFocused" to 1
        end tell 
    """)

def whereami():
    r = applescript.tell.app("System Events","""
        tell last window of process "库乐队"
                tell scroll area 2 of splitter group 2 of splitter group 1 of group 2 of group 3
                    tell first UI element
                        set var1 to the value of attribute "AXFrame"
                        do shell script "echo " & ({item 1 of var1} as string) & " " & ({item 2 of var1} as string) & " " & ({item 3 of var1} as string) & " " & ({item 4 of var1} as string)
                    end tell
                end tell
            end tell
        """)
    (x,y,r,b)=[int(x) for x in r.out.split()]
    return (x,y,r-x,b-y)

def parent():
    r = applescript.tell.app("System Events","""
        tell last window of process "库乐队"
                tell scroll area 2 of splitter group 2 of splitter group 1 of group 2 of group 3
                    set var1 to the value of attribute "AXFrame"
                    do shell script "echo " & ({item 1 of var1} as string) & " " & ({item 2 of var1} as string) & " " & ({item 3 of var1} as string) & " " & ({item 4 of var1} as string)
                end tell
            end tell
        """)
    (x,y,r,b)=[int(x) for x in r.out.split()]
    return (x,y,r-x,b-y)

def count():
    r = applescript.tell.app("System Events","""
        tell last window of process "库乐队"
                tell scroll area 2 of splitter group 2 of splitter group 1 of group 2 of group 3
                    tell first UI element
                            set var1 to count UI elements
                            do shell script "echo " & (var1 as string)
                    end tell
                end tell
            end tell
        """)
    return int(r.out)

def lastchild():
    r = applescript.tell.app("System Events","""
        tell last window of process "库乐队"
                tell scroll area 2 of splitter group 2 of splitter group 1 of group 2 of group 3
                    tell first UI element
                        tell last ui element
                            set var1 to the value of attribute "AXFrame"
                            do shell script "echo " & ({item 1 of var1} as string) & " " & ({item 2 of var1} as string) & " " & ({item 3 of var1} as string) & " " & ({item 4 of var1} as string)
                        end tell
                    end tell
                end tell
            end tell
        """)
    (x,y,r,b)=[int(x) for x in r.out.split()]
    return (x,y,r-x,b-y)

def setxzoom():
    r = applescript.tell.app("System Events","""
        tell last window of process "库乐队"
            set value of attribute "AXValue" of slider 1 of group 1 of group 3 to 0.5
        end tell
        """)

def setforce(value):
    r = applescript.tell.app("System Events","""
        set target to %d
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
        """ % (value))

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

    (mx,my,mw,mh) = whereami()
    (targetx,targety) = (mx+x, my+mh  - y)
    #首先保证X方向上可见，也就是需要保证 targetx>=Px and targetx+w < Px+Pw
    #如果目标X在可见区域左侧 将目标移动到可见位置即可
    while targetx < Px:
        pyautogui.hscroll(10)
        (mx,my,mw,mh) = whereami()
        (targetx,targety) = (mx+x, my+mh  - y)
    #如果targetx+w在可见区域右侧，将targetx+w移动到可见区域即可
    while targetx+w > Px+Pw:
        pyautogui.hscroll(-10)
        (mx,my,mw,mh) = whereami()
        (targetx,targety) = (mx+x, my+mh  - y)

    #然后保证Y方向上可见，也是一样的原理 也就是需要保证 targety>=Py and targety+YUnit < Py+Ph
    #如果目标Y在可见区域上方 将目标移动到可见位置即可
    while targety < Py:
        pyautogui.scroll(10)
        (mx,my,mw,mh) = whereami()
        (targetx,targety) = (mx+x, my+mh  - y)
    #如果targety+1在可见区域右侧，将targety+1移动到可见区域即可
    while targety+YUnit > Py+Ph:
        pyautogui.scroll(-10)
        (mx,my,mw,mh) = whereami()
        (targetx,targety) = (mx+x, my+mh  - y)
    return (targetx, targety, w,force)

def insertP(p):   
    (px,py,pw,force) = scrollto(p)
    lastcount = count()

    # add point
    pyautogui.keyDown('command')
    pyautogui.moveTo(px, py)
    pyautogui.click()
    pyautogui.keyUp('command')

    if lastcount == count():
        print 'insert fail!'
        sys.exit(1)

    # fix length
    global Px,Py,Pw,Ph   #在这个范围内的内容是可见区域
    (x,y,w,h) = lastchild()
    if abs(w - pw) > 5: 
        while x+w > Px + Pw:
            pyautogui.hscroll(-10)
            (x,y,w,h) = lastchild()
        pyautogui.moveTo(x+w-1,y+h/2)
        pyautogui.dragTo(x+pw-1, y+h/2, button='left') 

    setforce(force)

brint_to_front()
setxzoom() #so that we have a fixed width
time.sleep(1)
(Px,Py,Pw,Ph) = parent() #we now know which part are shown now
pyautogui.moveTo(Px+Pw/2, Py+Ph/2)

p=getP()
while p!=False:
    print 'insert',p
    insertP(p)
    p=getP()
