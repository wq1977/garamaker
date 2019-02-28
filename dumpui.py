# -*- coding: utf-8 -*-
import applescript

scpt = applescript.AppleScript(u'''
tell application "System Events"
	tell last window of process "库乐队"
		set uiElems to entire contents
		repeat with theItem in uiElems
			try
				set var to the value of attribute "AXHelp" of theItem
				log var
			end try
		end repeat
	end tell
end tell
''')
for ae in scpt.run():
    print ae
