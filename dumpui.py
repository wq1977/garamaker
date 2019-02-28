# -*- coding: utf-8 -*-
import applescript

scpt = applescript.AppleScript(u'''
tell application "System Events"
    tell last window of process "库乐队"
        set theList to {}
        set uiElems to entire contents
        repeat with theItem in uiElems
            set end of theList to the value of attribute "AXFrame" of theItem
        end repeat
        return theList
  end tell
end tell
''')
for ae in scpt.run():
    print ae
