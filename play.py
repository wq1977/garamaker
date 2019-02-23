# -*- coding: utf-8 -*-
#!/usr/bin/python
import requests,sys,argparse

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
format='lily'

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
  base = [41,35,31,27,22,17]
  return (base[xuan]+pin,0)
def mapA2B_jita(yin):
  xpos = [65, 205, 335, 455, 570, 680, 760, 875, 975];
  ypos = [380, 435, 495, 560, 625, 685]
  if yin[0] == '0':
    return (0,0)
  if yin[1] in hexuan:
    value = hexuan[yin[1]]["value"]
    yin = yin[0] + "%d" % (value[ord(yin[0])-ord('1')])
  if format == 'dd':
    return standname(ord(yin[0]) - ord('1'),ord(yin[1]) - ord('0'))
  return (xpos[ord(yin[1]) - ord('0')],ypos[ord(yin[0]) - ord('1')])

def mapA2B_xiaotiqin(yin):
  xpos = [80, 200, 320, 440, 560, 620, 750, 860, 1000];
  ypos = [400,480,560,640]
  if yin[0] == '0':
    return (0,0)
  if yin[1] in hexuan:
    value = hexuan[yin[1]]["value"]
    yin = yin[0] + "%d" % (value[ord(yin[0])-ord('1')])
  return (xpos[ord(yin[1]) - ord('0')],ypos[ord(yin[0]) - ord('1')])

def mapA2B_beisi(yin):
  xpos = [60, 195, 323, 453, 560, 671, 781, 867, 973];
  ypos = [382,494,576,666]
  if yin[0] == '0':
    return (0,0)
  return (xpos[ord(yin[1]) - ord('0')],ypos[ord(yin[0]) - ord('1')])

def mapA2B_gangqin(yin):
  global puhao,gangqinDiao
  startpos={
    1: -13,
    4: -1
  }
  poses = [
    (50,715),(74,601),(104,704),(143,618),(158,713),(197,617),(215,705),
    (271,701),(292,607),(317,704),(358,606),(375,700),(434,706),(460,597),(488,712),(509,603),(545,723),(576,601),(596,721),
    (645,713),(671,607),(707,707),(736,595),(754,698),(813,709),(841,604),(866,709),(897,609),(922,716),(956,599),(974,702),
    (46,384),(63,300),(101,384),(124,298),(149,391),(206,409),(222,310),(261,398),(274,289),(299,401),(356,299),(368,393),
    (425,417),(453,292),(478,409),(516,301),(548,412),(592,422),(617,300),(652,412),(674,306),(706,410),(734,300),(755,415),
    (807,425),(842,299),(869,410),(893,306),(929,402),(967,419),(995,299),
  ]
  index=0
  if yin[0] in ['1','a','A']:
    if yin[1] in [chr(ord('a')+x) for x in range(0,10)]:
      index = -1 * (ord(yin[1]) - ord('a') + 1)
    if yin[1] in [chr(ord('0')+x) for x in range(0,10)]:
      index = ord(yin[1]) - ord('1')
    if yin[1] in [chr(ord('A')+x) for x in range(0,10)]:
      index = 9 + ord(yin[1]) - ord('A')
    index_in_pos = 0
    index_i = startpos[puhao]
    while index_i != index:
      index_i += 1
      index_in_pos += 1
      if (index_in_pos % 12) in [1,3,5,8,10]:
        index_in_pos += 1
    if yin[0] == 'A':
      index_in_pos+=1
    if yin[0] == 'a':
      index_in_pos-=1
    return poses[index_in_pos+gangqinDiao]
  return (0,0)

def mapA2B_gu(yin):
  points={
    "A" : [112,200], #镲拔
    "B" : [112,350], #踏板踏拔
    "C" : [80,400], #开音踏拔
    "D" : [200,400], #合音踏拔
    "E" : [100,600], #鼓皮边缘
    "F" : [200,600], #响弦鼓
    "G" : [200,750], #鼓边
    "H" : [400,400], #高音桶鼓
    "I" : [600,400], #中音桶鼓
    "J" : [500,650], #低音鼓
    "K" : [1000,200], #钟铃
    "L" : [900,200], #骑拔
    "M" : [900,600] #低音桶鼓
  }
  if yin[1] in points:
    return points[yin[1]]
  return (0,0)

def mapA2B(yin):
  global play
  if play == "吉他":
    return mapA2B_jita(yin)
  elif play == "小提琴":
    return mapA2B_xiaotiqin(yin)
  elif play == "架子鼓":
    return mapA2B_gu(yin)
  elif play == "钢琴":
    return mapA2B_gangqin(yin)
  elif play == "贝斯":
    return mapA2B_beisi(yin)
  print '不能识别的乐器'

def appendCmd(yin, cmds, startat, duration):
  if yin[0] in ['1','2','3','4','5','6']:
    x,y=mapA2B(yin)
    cmds.append("%d,%d,%d,%d" % (startat,x,y,duration - 5))
  elif yin[0] in ['U','D']:
    for i in range(1,7):
      x,y=mapA2B(chr(ord('0')+i)+yin[1])
      subduration = 60000 / 75 / 2 / 30 #fix this to 75
      if yin[0]=='D':
        cmds.append("%d,%d,%d,%d" % (startat + (6 - i) * subduration,x,y,duration - 50))
      else:
        cmds.append("%d,%d,%d,%d" % (startat + (i - 1) * subduration,x,y,duration - 50))
  elif yin[0] in ['u','d']:
    for i in range(1,4):
      x,y=mapA2B(chr(ord('0')+i)+yin[1])
      subduration = 60000 / 75 / 2 / 30 #fix this to 75
      if yin[0]=='d':
        cmds.append("%d,%d,%d,%d" % (startat + (3 - i) * subduration,x,y,duration - 50))
      else:
        cmds.append("%d,%d,%d,%d" % (startat + (i - 1) * subduration,x,y,duration - 50))

def convert(jianpu):
  global bpm,puhao,gangqinDiao
  lines = [line for line in jianpu.strip().strip(",").split("\n") if not line.startswith('#')]
  jianpu = "".join(lines)
  pieces = jianpu.strip().split(',')
  cmds=[]
  for idx in range(len(pieces)):
    piece = pieces[idx].strip();
    yins = [piece[i:i+2] for i in range(0, len(piece), 2)]
    if len(yins) <=0 :
      print "参数错误，长度为0的音", piece, idx
      sys.exit(1)
    if yins[0]=="@2":
      startat1 = idx * 60000 / bpm / 2
      startat2 = startat1 + 60000 / bpm / 4
      appendCmd(yins[1],cmds, startat1, 60000 / bpm / 4)
      appendCmd(yins[2],cmds, startat2, 60000 / bpm / 4)
      continue
    if yins[0]=="@3":
      startat1 = idx * 60000 / bpm / 2
      startat2 = startat1 + 60000 / bpm / 6
      startat3 = startat2 + 60000 / bpm / 6
      appendCmd(yins[1],cmds, startat1, 60000 / bpm / 6)
      appendCmd(yins[2],cmds, startat2, 60000 / bpm / 6)
      appendCmd(yins[3],cmds, startat3, 60000 / bpm / 6)
      continue
    if yins[0]=="@4":
      startat = idx * 60000 / bpm / 2
      duration = 60000 / bpm / 8
      for i in range(4):
        appendCmd(yins[i],cmds, startat + i*duration, duration)
      continue
    if yins[0]=="@p":
      cmdidx = len(cmds)-1
      prevstart=0
      while True:
        if cmdidx < 0:
          break
        lastcmd = cmds[cmdidx].split(',')
        if prevstart == 0 or prevstart == lastcmd[0]:
          prevstart = lastcmd[0]
          lastcmd[len(lastcmd)-1] = "%d" % (int(lastcmd[len(lastcmd)-1]) + 60000 / bpm  / 4 )
          cmds[cmdidx] = ",".join(lastcmd)
          cmdidx-=1
        else:
          break
      startat = idx * 60000 / bpm / 2 + 60000 / bpm  / 4
      duration = 60000 / bpm / 4
      appendCmd(yins[1], cmds, startat, duration)
      appendCmd(yins[2], cmds, startat + duration / 2 - 10, 50)
      #cmds.append("%d,%d,%d,%d" % (startat,x1,y1,duration));
      #cmds.append("%d,%d,%d,%d" % (startat + duration / 2 - 10,x2,y2,20));
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
          lastcmd[len(lastcmd)-1] = "%d" % (int(lastcmd[len(lastcmd)-1]) + 60000 / bpm  / 4 )
          cmds[cmdidx] = ",".join(lastcmd)
          cmdidx-=1
        else:
          break
      startat = idx * 60000 / bpm / 2 + 60000 / bpm  / 4
      appendCmd(yins[1], cmds, startat, 60000 / bpm / 4)
      continue
    if yins[0]=="&4":
      puhao=4
      yins = yins[1:]
    if yins[0]=="&a":
      puhao=1
      gangqinDiao=-1
      yins = yins[1:]
    if yins[0]=="&d":
      puhao=4
      gangqinDiao=-1
      yins = yins[1:]
    if yins[0]=="@s":
      x1,y1=mapA2B(yins[1]);
      startat1 = idx * 60000 / bpm / 2
      duration1 = 60000 / bpm / 2 / 2;
      x2,y2=mapA2B(yins[2]);
      startat2 = idx * 60000 / bpm / 2 + duration1
      duration2 = 60000 / bpm / 2 / 2;
      cmds.append("%d,%d,%d,%d,%d,%d,%d" % (startat1,x1,y1,duration1,x2,y2,duration2));
      continue
    if yins[0]=="@-": #上一个音停留 2/3 时长，然后用 2/3 时长滑到下一个音 然后停留 2/3
      duration = 60000 / bpm * 3 / 8
      duration_slide = 60000 / bpm * 2 / 8
      lastcmd = cmds[len(cmds)-1].split(',')
      lastcmd[len(lastcmd)-1] = "%d" % (duration)
      x1,y1=mapA2B(yins[1]);
      lastcmd.append(lastcmd[1])
      lastcmd.append(lastcmd[2])
      lastcmd.append("%d" % (duration_slide))
      lastcmd.append("%d" % (x1))
      lastcmd.append("%d" % (y1))
      lastcmd.append("%d" % (duration))
      cmds[len(cmds)-1] = ",".join(lastcmd)
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
            lastcmd[len(lastcmd)-1] = "%d" % (int(lastcmd[len(lastcmd)-1]) + 60000 / bpm  / 4 )
            cmds[cmdidx] = ",".join(lastcmd)
            cmdidx-=1
          else:
            break
        continue
      startat = idx * 60000 / bpm / 2
      duration = 1;
      appendCmd(yin, cmds, startat,duration * 60000 / bpm / 2)
  return cmds

parser = argparse.ArgumentParser(description='用 GarageBand 播放 lily 格式的歌曲.')
parser.add_argument('path', metavar='path', type=str, help='要播放的歌曲路径')
parser.add_argument('-r', dest='record', action='store_true', help='是否自动启动录音')
parser.add_argument('-g', dest='gateway', action='store', help='指定iPad地址')
parser.add_argument('-d', dest='debug', action='store_true', help='是否打印命令')
parser.add_argument('-s', dest='skip_grammar', action='store_true', help='是否跳过语法检查')
parser.add_argument('-y', dest='confirm', action='store_false', help='是否询问执行')
parser.add_argument('-f', dest='format', default='lily', action='store', help='指定输出格式')
parser.add_argument('-t', dest='target', default="", action='store', help='指定播放段落（吉他，贝斯等）')
args = parser.parse_args()
target = args.target
record = args.record
format = args.format
gateway = "http://127.0.0.1:8088"
if args.gateway:
  gateway = args.gateway
checkGrammar = not args.skip_grammar
jianpu=parse(args.path)
if args.debug:
  print jianpu
if format == 'dd':
  song = "\n".join(convert(jianpu))
  print song
  sys.exit()
else:
  song = "|".join(convert(jianpu))
if record:
  delta={3:57,4:61, 2:51}
  song = ('R,%d,572,48,%d,453,48|' % (60000 * beats / bpm + delta[beats], 60000 * beats / bpm)) + song

for i in range(len(hexianSequences) / beats / 2 + 1):
  hexuanhelp = "%3d:\t" % (i)
  for j in range(beats * 2):
    idx = i*beats*2+j
    if idx >= len(hexianSequences):
      break
    hexuanhelp += "%s\t" % (hexianSequences[idx])
  print hexuanhelp
if len(needFix) > 0:
  print "\n录音以后需要手动调整以下和弦："
  for k,v in needFix.items():
    print "\t第 %d 小节，%s" % (k+1, " ".join([hexuan[x]["name"] for x in v]))

print "\n总共 %d 小节" % (totalbeats)
run=True
if args.confirm:
  run=False
  answer = raw_input('输入 Y 确认开始演奏 [%s] ...\n' % (play))
  if len(answer)>0 and (answer[0] == 'Y' or answer[0] == 'y'):
    run=True
if run:
  if args.debug:
    print song
  r = requests.post(gateway, data="play="+song)
  print(r.text)
else:
  print '放弃演奏，退出'
