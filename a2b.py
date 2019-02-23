# -*- coding: utf-8 -*-
#!/usr/bin/python
import sys,argparse

bpm=90
hexuan={}
play="吉他"
target=""
beats=0
record=False
totalbeats = 0
debug=False
checkGrammar=True
hexianSequences = []
needFix={}
puhao=1
gangqinDiao=0
format='dd'

def parse(path):
  global bpm,hexuan,play,target,beats,totalbeats,checkGrammar,needFix
  inPlay=False
  lines = open(path).readlines()
  result=""
  for idx,line in enumerate(lines):
    defines = line.split("#")
    desc=""
    if len(defines)>1:
      desc = "#".join(defines[1:]).strip()
    line = defines[0].strip()
    if line.startswith("bpm="):
      bpm = int(line.split("=")[1])
    if line.startswith("beats="):
      beats = int(line.split("=")[1])
    if len(line)>2 and line[0] in [chr(ch+ord('A')) for ch in range(26)] and line[1]=='=':
      hexuan[line[:1]]={"value":[ord(ch.strip()[0])-ord('0') for ch in line[2:].split(",")], "name":desc.split(" ")[0]}
    if inPlay and len(line)>0:
      if (beats > 0):
        blocks = line.split(",")
        if len(blocks) % beats != 1 and checkGrammar:
          print "line(%d): %s 节拍数不对！" % (idx+1, line)
          for i in range(0, len(blocks)/3):
            print "%d:%s\t%d:%s\t%d:%s" % (i*3+1, blocks[i*3], i*3+2, blocks[i*3+1], i*3+3, blocks[i*3+2])
          sys.exit()
        else:
          for i in range(len(blocks) / beats / 2):
            foundTarget = ("".join(blocks[i*beats*2:i*beats*2+beats*2])).strip()
            hexianinBeat = []
            currentBeat = totalbeats + i
            for idx, ch in enumerate(foundTarget):
              if idx % 2 == 1 and ch in hexuan:
                hexianname = hexuan[ch]["name"]
                if len(hexianinBeat)<=0 or hexianname != hexianinBeat[len(hexianinBeat)-1]:
                  hexianinBeat.append(hexianname)
                if len(hexianname)>2 and hexianname[len(hexianname)-2] == "+":
                  if not currentBeat in needFix:
                    needFix[currentBeat]=set()
                  needFix[currentBeat].add(ch)
            hexianSequences.append(" ".join(hexianinBeat))
          totalbeats += len(blocks) / beats / 2
      result += line
    if (line in ["[吉他]", "[贝斯]", "[架子鼓]", "[Solo]", "[小提琴]", "[钢琴]"]):
      if (target == "" or target == line.strip('[]')):
        if not inPlay:
          inPlay=True
          play=line.strip('[]')
          if play=='Solo':
            play="吉他"
        else:
          inPlay = False
      else:
        if inPlay:
          inPlay=False
  return result

def standname(xuan, pin):
  base = [65,60,56,51,46,41]
  return (base[xuan]+pin, 40)
def mapA2B_jita(yin):
  if yin[0] == '0':
    return (0,0)
  if yin[1] in hexuan:
    value = hexuan[yin[1]]["value"]
    yin = yin[0] + "%d" % (value[ord(yin[0])-ord('1')])
  return standname(ord(yin[0]) - ord('1'),ord(yin[1]) - ord('0'))

def mapA2B(yin):
  global play
  if play == "吉他":
    return mapA2B_jita(yin)
  print '不能识别的乐器'

def appendCmd(yin, cmds, startat, duration):
  force = 40
  if startat % 16 == 0:
    force = 45
  elif startat % 8 == 0:
    force = 50

  if yin[0] in ['1','2','3','4','5','6']:
    x,y=mapA2B(yin)
    cmds.append("%d,%d,%d,%d" % (startat,x,force,duration))
  elif yin[0] in ['U','D']:
    for i in range(1,7):
      x,y=mapA2B(chr(ord('0')+i)+yin[1])
      if yin[0]=='D':
        cmds.append("%d,%d,%d,%d" % (startat,x,force,duration))
      else:
        cmds.append("%d,%d,%d,%d" % (startat,x,force,duration))
  elif yin[0] in ['u','d']:
    for i in range(1,4):
      x,y=mapA2B(chr(ord('0')+i)+yin[1])
      if yin[0]=='d':
        cmds.append("%d,%d,%d,%d" % (startat,x,force,duration))
      else:
        cmds.append("%d,%d,%d,%d" % (startat,x,force,duration))

def convert(jianpu):
  global bpm,puhao,gangqinDiao
  lines = [line for line in jianpu.strip().strip(",").split("\n") if not line.startswith('#')]
  jianpu = "".join(lines)
  pieces = jianpu.strip().split(',')
  cmds=[]
  for idx in range(len(pieces)):
    piece = pieces[idx].strip()
    yins = [piece[i:i+2] for i in range(0, len(piece), 2)]
    if len(yins) <=0 :
      print "参数错误，长度为0的音", piece, idx
      sys.exit(1)
    if yins[0]=="@2":
      startat1 = idx * 2
      startat2 = startat1 + 1
      appendCmd(yins[1],cmds, startat1, 1)
      appendCmd(yins[2],cmds, startat2, 1)
      continue
    if yins[0]=="@'": #这个音长度减半，上个音延长半个长度
      cmdidx = len(cmds)-1
      prevstart=0
      while True:
        if cmdidx < 0:
          break
        lastcmd = cmds[cmdidx].split(',')
        if prevstart == 0 or prevstart == lastcmd[0]:
          prevstart = lastcmd[0]
          lastcmd[len(lastcmd)-1] = "%d" % (int(lastcmd[len(lastcmd)-1]) + 1 )
          cmds[cmdidx] = ",".join(lastcmd)
          cmdidx-=1
        else:
          break
      startat = idx * 2 + 1
      appendCmd(yins[1], cmds, startat, 1)
      continue
    for yin in yins:
      if yin == '--': #上一个音延长一个八分音符
        cmdidx = len(cmds)-1
        prevstart=0
        while True:
          if cmdidx < 0:
            break
          lastcmd = cmds[cmdidx].split(',')
          if prevstart == 0 or prevstart == lastcmd[0]:
            prevstart = lastcmd[0]
            lastcmd[len(lastcmd)-1] = "%d" % (int(lastcmd[len(lastcmd)-1]) + 2 )
            cmds[cmdidx] = ",".join(lastcmd)
            cmdidx-=1
          else:
            break
        continue
      startat = idx * 2
      duration = 2
      appendCmd(yin, cmds, startat, duration)
  return cmds

parser = argparse.ArgumentParser(description='将lily格式转换为标准格式.')
parser.add_argument('path', metavar='path', type=str, help='要播放的歌曲路径')
parser.add_argument('-s', dest='skip_grammar', action='store_true', help='是否跳过语法检查')
args = parser.parse_args()
checkGrammar = not args.skip_grammar
jianpu=parse(args.path)
song = "\n".join(convert(jianpu))
print song
