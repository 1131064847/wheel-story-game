(function (global) {
  'use strict';

  const DEFAULT_DATA = {
    "rootNodeId": "root",
    "nodes": {
      "root": {
        "id": "root",
        "title": "序章：雾都委托",
        "content": "1934年的伦敦，雨下了一整周。你是个三流侦探——接的都是捉奸、找猫、查账的活儿。今天这单很俗：富商梅瑟先生甩来五十镑，要你抓他那夜不归宿的未婚妻，和\"那个不知道死活的小白脸\"。\n\n地址把你引到老城区深处的灰水宅。推门的一瞬间，湿冷的咸腥味从楼梯上淌下来，像退潮后的滩涂。你的后颈汗毛倒竖——这宅子里，有什么东西正在看你。",
        "isEnding": false,
        "sectors": [
          {
            "text": "循鱼腥味上二楼",
            "angle": 150,
            "color": "#FF6B6B",
            "targetNodeId": "t2"
          },
          {
            "text": "循哭声进会客厅",
            "angle": 110,
            "color": "#FFE66D",
            "targetNodeId": "o2"
          },
          {
            "text": "撬开地下室木门",
            "angle": 100,
            "color": "#4ECDC4",
            "targetNodeId": "d2"
          }
        ]
      },
      "t2": {
        "id": "t2",
        "title": "第一幕：鱼腥阳台",
        "content": "二楼阳台的栏杆上挂满暗绿的水藻，木地板上蜿蜒着一道湿痕，一路淌向走廊尽头虚掩的房门。咸腥味浓得让人反胃。\n\n湿痕旁散落着几片半透明的薄片。你捡起一枚对着月光——是鳞片，指甲盖大小，泛着人皮肤不该有的虹彩。",
        "isEnding": false,
        "sectors": [
          {
            "text": "推开尽头虚掩的房门",
            "angle": 210,
            "color": "#FF6B6B",
            "targetNodeId": "t3"
          },
          {
            "text": "沿湿痕走向黑暗深处",
            "angle": 150,
            "color": "#4ECDC4",
            "targetNodeId": "d3"
          }
        ]
      },
      "d2": {
        "id": "d2",
        "title": "第一幕：锁孔之后",
        "content": "撬锁是你的老本行，可这扇橡木门后不是储物间——是一道向下延伸的陡峭石阶。铁锈混着腐肉的气味从黑暗里涌上来。\n\n你划亮火柴。阶面积着薄薄一层黏液，上面的脚印比人的大，也比人的多。",
        "isEnding": false,
        "sectors": [
          {
            "text": "举灯走下石阶",
            "angle": 210,
            "color": "#4ECDC4",
            "targetNodeId": "d3"
          },
          {
            "text": "退回去查看大厅",
            "angle": 150,
            "color": "#FFE66D",
            "targetNodeId": "o3"
          }
        ]
      },
      "o2": {
        "id": "o2",
        "title": "第一幕：留声机",
        "content": "哭声来自大厅深处的会客厅。你推门进去，却只看到一台留声机自己在转——哭声是唱片里录下的。针尖跳了一下，从唱片夹层里滑出一张照片。\n\n照片上，梅瑟家的未婚妻依偎着一个穿旧式长衫的男人，背景正是灰水宅的门廊。而那个\"小白脸\"的眉眼，你在哪儿见过。",
        "isEnding": false,
        "sectors": [
          {
            "text": "细看照片上的男人",
            "angle": 200,
            "color": "#FFE66D",
            "targetNodeId": "o3"
          },
          {
            "text": "跟着湿痕上二楼",
            "angle": 160,
            "color": "#FF6B6B",
            "targetNodeId": "t3"
          }
        ]
      },
      "t3": {
        "id": "t3",
        "title": "第二幕：新娘的房间",
        "content": "虚掩的房门后是间婚房。湿透的婚纱摊在床上，梳妆台的银梳上缠着几根过长的黑发，墙上的铜镜蒙着一层水雾。\n\n你抬手抹开雾气——镜子里的你比你慢了半拍。它歪着头，冲你笑了笑，抬手指向地板：湿痕正穿过房间，渗进墙角的裂缝。",
        "isEnding": false,
        "sectors": [
          {
            "text": "翻看梳妆台的日记",
            "angle": 200,
            "color": "#FF6B6B",
            "targetNodeId": "t4"
          },
          {
            "text": "循湿痕逃入地下",
            "angle": 160,
            "color": "#4ECDC4",
            "targetNodeId": "d4"
          }
        ]
      },
      "d3": {
        "id": "d3",
        "title": "第二幕：腐味深处",
        "content": "石阶尽头的走廊漫着齐踝的冷水。墙上有抓痕，深深浅浅，最新的几道还挂着肉屑。走廊深处，你听见另一串脚步——不多不少，和你完全同拍。\n\n你停下，它也停下。走廊一侧的窄梯通向上层，梯口挂着块褪色的门牌：藏书室。",
        "isEnding": false,
        "sectors": [
          {
            "text": "循腐肉味走向深处",
            "angle": 200,
            "color": "#4ECDC4",
            "targetNodeId": "d4"
          },
          {
            "text": "从窄梯摸进藏书室",
            "angle": 160,
            "color": "#AA96DA",
            "targetNodeId": "t4"
          }
        ]
      },
      "o3": {
        "id": "o3",
        "title": "第二幕：历代画像",
        "content": "大厅的墙上挂着一整排画像，历任梅瑟家主。画风一致，唯有一处古怪：每幅画的角落都添了一位新娘，而新娘的脸，一幅比一幅模糊。\n\n最末一幅没有画完。画布上只有一个湿漉漉的轮廓，颜料还在流动——画中人的手，正指向侧边藏书室的门。",
        "isEnding": false,
        "sectors": [
          {
            "text": "推开藏书室的门",
            "angle": 200,
            "color": "#AA96DA",
            "targetNodeId": "t4"
          },
          {
            "text": "去会客室翻行李箱",
            "angle": 160,
            "color": "#FFE66D",
            "targetNodeId": "o4"
          }
        ]
      },
      "t4": {
        "id": "t4",
        "title": "第三幕：人皮典籍",
        "content": "藏书室的书架浸在阴影里。你抽出一册没有书名的书——封皮纹理细腻，毛孔与汗腺清晰可辨。是人皮。\n\n《深海婚约》以血写就：梅瑟家每逢大潮，须向\"深海中的那位\"献上新嫁娘，以换家业不衰。后面几页记着历代新娘的名字，每一个都被指甲反复抠过。你的手指刚离开书页，余下几册人皮书齐齐发烫，烫向地下。",
        "isEnding": false,
        "sectors": [
          {
            "text": "循书页发烫处下地下室",
            "angle": 210,
            "color": "#FF6B6B",
            "targetNodeId": "t5"
          },
          {
            "text": "怀揣残卷退向暗廊",
            "angle": 150,
            "color": "#4ECDC4",
            "targetNodeId": "d5"
          }
        ]
      },
      "d4": {
        "id": "d4",
        "title": "第三幕：牛羊尸骸",
        "content": "走廊尽头是一间库房。牛、羊、猪的尸体被码成整齐的锥形——这绝不是为了储存肉食。所有尸体的皮都完好无损，可你很快发现不对：\n\n它们是空的。每具皮囊里都没有血，没有骨，什么都没有。库房深处的暗门后，传来许多声音整齐的吟唱。",
        "isEnding": false,
        "sectors": [
          {
            "text": "推开暗门迎向吟唱",
            "angle": 190,
            "color": "#FF6B6B",
            "targetNodeId": "t5"
          },
          {
            "text": "退向走廊旁的石龛",
            "angle": 170,
            "color": "#4ECDC4",
            "targetNodeId": "d5"
          }
        ]
      },
      "o4": {
        "id": "o4",
        "title": "第三幕：她的行李",
        "content": "会客室的角落敞着一只行李箱。婚纱叠得整整齐齐，压着一条鳞纹披肩，最底下是一张单程车票——终点是海边小镇，发车时间：今夜涨潮时分。\n\n箱子夹层里露出一角纸页，纸质温凉，像是某种皮肤。残文末尾画着一道向下的石阶。",
        "isEnding": false,
        "sectors": [
          {
            "text": "循残页下地下石龛",
            "angle": 160,
            "color": "#AA96DA",
            "targetNodeId": "d5"
          },
          {
            "text": "举起相机拍照留证",
            "angle": 200,
            "color": "#FFE66D",
            "targetNodeId": "o5"
          }
        ]
      },
      "t5": {
        "id": "t5",
        "title": "第四幕：地下祭坛",
        "content": "暗门后是圆形的祭厅。牛羊的尸体垒成祭坛，十二根鲸油蜡烛燃着绿火，石槽里盛满腥油，油面倒映着不属于这间屋子的星空。\n\n吟唱声很近了。人皮书摊在祭坛中央，血字未干：\"潮起三更，婚约既成，见证者至，万邪退避。\"——见证者，说的是你这样的外人。",
        "isEnding": false,
        "sectors": [
          {
            "text": "留在祭坛前细看",
            "angle": 220,
            "color": "#FF6B6B",
            "targetNodeId": "t6"
          },
          {
            "text": "绿烛熄灭夺路而逃",
            "angle": 140,
            "color": "#4ECDC4",
            "targetNodeId": "d6"
          }
        ]
      },
      "d5": {
        "id": "d5",
        "title": "第四幕：龛中黑经",
        "content": "石龛里供着一册黑经，封皮不是人皮，你叫不出那是什么。血字警告只有三行：勿视其形，勿应其声，勿呼其名。\n\n黑经末页画着一条路：一条以长发为经线织成的毯，铺在二楼的走廊，路的那头写着\"出口\"。可你分明听见，身后的黑暗里，有什么东西正学着你的呼吸。",
        "isEnding": false,
        "sectors": [
          {
            "text": "上二楼寻发毯之路",
            "angle": 210,
            "color": "#AA96DA",
            "targetNodeId": "t6"
          },
          {
            "text": "深入黑暗腹地",
            "angle": 150,
            "color": "#4ECDC4",
            "targetNodeId": "d6"
          }
        ]
      },
      "o5": {
        "id": "o5",
        "title": "第四幕：闪光灯",
        "content": "你想起那五十镑。三流侦探的体面，就是留证据。你举起相机对准会客厅——取景框里，窗外的月亮有两个。\n\n快门落下，闪光灯白得刺眼。相纸吸墨般洇出了你身后的景象：那里站满了穿婚纱的\"人\"。你没有回头。",
        "isEnding": false,
        "sectors": [
          {
            "text": "等相纸彻底显影",
            "angle": 220,
            "color": "#FFE66D",
            "targetNodeId": "o6"
          },
          {
            "text": "循咸腥风上二楼",
            "angle": 140,
            "color": "#FF6B6B",
            "targetNodeId": "t6"
          }
        ]
      },
      "t6": {
        "id": "t6",
        "title": "第五幕：织发地毯",
        "content": "二楼的走廊铺着一张厚毯。你弯腰细看，胃里一阵翻涌——那不是羊毛，是头发。女人的长发织成的地毯，发丝根根朝着同一个方向：楼梯下的黑暗。\n\n地毯在你脚下轻轻起伏，像某种呼吸。走廊尽头的低语声越来越大，无数音节拼凑成一个你听不懂、却本能想回应的名字。",
        "isEnding": false,
        "sectors": [
          {
            "text": "踩着发毯走向低语",
            "angle": 200,
            "color": "#FF6B6B",
            "targetNodeId": "t7"
          },
          {
            "text": "贴墙绕行避开发毯",
            "angle": 160,
            "color": "#4ECDC4",
            "targetNodeId": "d7"
          }
        ]
      },
      "d6": {
        "id": "d6",
        "title": "第五幕：空皮囊",
        "content": "黑暗里的墙面上挂满了皮。羊皮、牛皮——以及几张人形的。皮囊微微鼓着，风从你背后的通道灌进来，它们却没有摆动。\n\n因为充起它们的不是风。最近的一张人形皮囊缓缓转了过来，皮面上浮起五官的凸起，朝着你的方向——像在认领。",
        "isEnding": false,
        "sectors": [
          {
            "text": "撞开皮囊夺路而逃",
            "angle": 210,
            "color": "#4ECDC4",
            "targetNodeId": "d7"
          },
          {
            "text": "屏息贴墙静立不动",
            "angle": 150,
            "color": "#FF6B6B",
            "targetNodeId": "t7"
          }
        ]
      },
      "o6": {
        "id": "o6",
        "title": "第五幕：显影",
        "content": "相纸在显影液里泛起灰雾。历代新娘的影像一位接一位浮出，每一位都朝镜头微笑。而最边缘的一块阴影还在缓慢成形——风衣、礼帽、举着相机的手。\n\n那是你的轮廓。可你的影子里，多出了一双不属于你的脚，正和你踩着同一个节拍。",
        "isEnding": false,
        "sectors": [
          {
            "text": "守在会客厅等她来",
            "angle": 200,
            "color": "#FFE66D",
            "targetNodeId": "o7"
          },
          {
            "text": "循同步的脚步回头",
            "angle": 160,
            "color": "#4ECDC4",
            "targetNodeId": "d7"
          }
        ]
      },
      "t7": {
        "id": "t7",
        "title": "第六幕：群影低语",
        "content": "低语在你推开门的瞬间静止了。烛火照不到的角落里立满了\"东西\"——湿长的轮廓层层叠叠，没有一张脸，却全都朝着你。那是些扭曲的、不可名状的存在，你的眼睛每看清一分，太阳穴就多疼一分。\n\n它们没有攻击。它们只是在等，像乐队等指挥抬起手。人群中央，留出了一把空椅子。",
        "isEnding": false,
        "sectors": [
          {
            "text": "坐上那把空椅子",
            "angle": 200,
            "color": "#FF6B6B",
            "targetNodeId": "t8"
          },
          {
            "text": "撞开群影冲向楼梯",
            "angle": 160,
            "color": "#4ECDC4",
            "targetNodeId": "d8"
          }
        ]
      },
      "d7": {
        "id": "d7",
        "title": "第六幕：学步者",
        "content": "你跑，它也跑；你停，它停在你身后一拳的距离。手电的光柱里始终没有它的影子，只有湿冷的呼吸，一下一下，拍在你的后颈。\n\n楼梯口的墙上全是镜子。镜子里的你和身后的\"它\"——它比你先笑了。",
        "isEnding": false,
        "sectors": [
          {
            "text": "反身直视它的眼睛",
            "angle": 170,
            "color": "#FF6B6B",
            "targetNodeId": "t8"
          },
          {
            "text": "冲进发毯尽头之门",
            "angle": 190,
            "color": "#4ECDC4",
            "targetNodeId": "d8"
          }
        ]
      },
      "o7": {
        "id": "o7",
        "title": "第六幕：她来了",
        "content": "楼梯上传来环佩轻响。梅瑟家的未婚妻提着湿透的裙摆款款而下，赤着脚，足踝以下泛着珠光。鱼腥味随她而至，浓得像整个深海贴在你耳边。\n\n她朝你歉意地笑了笑：\"你不该接这单委托的，侦探先生。每一任'小三'，都是我。\"",
        "isEnding": false,
        "sectors": [
          {
            "text": "追问委托的内情",
            "angle": 190,
            "color": "#FFE66D",
            "targetNodeId": "o8"
          },
          {
            "text": "请她讲家族的故事",
            "angle": 170,
            "color": "#AA96DA",
            "targetNodeId": "t8"
          }
        ]
      },
      "t8": {
        "id": "t8",
        "title": "第七幕：深海婚约",
        "content": "你坐上那把椅子的瞬间，无数记忆涌进脑海——你看见了。三百年来，梅瑟家与深海之主缔约：家业、财富、不老，代价是每一代的新娘。而仪式需要一位不知情的外人到场\"见证\"，婚约才生效。\n\n所以才有那五十镑，才有\"抓小三\"的委托。你不是侦探。你是祭典请来的证人。",
        "isEnding": false,
        "sectors": [
          {
            "text": "见证仪式直到黎明",
            "angle": 200,
            "color": "#FF6B6B",
            "targetNodeId": "t9"
          },
          {
            "text": "趁低语松懈翻窗而逃",
            "angle": 160,
            "color": "#4ECDC4",
            "targetNodeId": "d9"
          }
        ]
      },
      "d8": {
        "id": "d8",
        "title": "第七幕：千丝缠身",
        "content": "你逃上二楼，那张头发地毯突然活了。千万根发丝缠住你的脚踝、手腕、咽喉，把你往毯子中心拖——那里敞着一个由头发旋成的洞。\n\n你摸到口袋里的折叠小刀。发丝在你耳边发出声音，像无数女人的哭声叠在一起：\"留下来吧，做我们的新线。\"",
        "isEnding": false,
        "sectors": [
          {
            "text": "割断发丝滚向大厅",
            "angle": 190,
            "color": "#4ECDC4",
            "targetNodeId": "d9"
          },
          {
            "text": "任由发毯拖拽",
            "angle": 170,
            "color": "#FF6B6B",
            "targetNodeId": "t9"
          }
        ]
      },
      "o8": {
        "id": "o8",
        "title": "第七幕：委托的真相",
        "content": "\"梅瑟先生每年都会雇一位侦探来抓'小三'。\"她的指尖划过画像上那些模糊的新娘，\"契约需要一位外来的见证人。前九位侦探都很尽职——只是没人能把故事讲出这座宅子。\"\n\n\"你是第十位。\"她看了眼窗外的月亮，\"潮涨之前，你还有一次选择的机会。\"",
        "isEnding": false,
        "sectors": [
          {
            "text": "趁她让路夺门而出",
            "angle": 190,
            "color": "#FFE66D",
            "targetNodeId": "o9"
          },
          {
            "text": "留到潮起再走",
            "angle": 170,
            "color": "#FF6B6B",
            "targetNodeId": "t9"
          }
        ]
      },
      "t9": {
        "id": "t9",
        "title": "第八幕：潮汐将至",
        "content": "涨潮了。海水从地基渗上来，漫过大厅的地板。一张湿透的书页被浪推到你脸上，血字誓约灼烧着你的视网膜：\"见证者须待至黎明，不得言，不得名，不得背约。\"\n\n群影在你四周缓缓围拢，像潮水围拢礁石。黎明的方向，就是出口的方向。你离它，只差一个誓言和一个长夜。",
        "isEnding": false,
        "sectors": [
          {
            "text": "守约至黎明",
            "angle": 220,
            "color": "#FF6B6B",
            "targetNodeId": "ending_truth"
          },
          {
            "text": "背约冲出大门",
            "angle": 140,
            "color": "#4ECDC4",
            "targetNodeId": "ending_death"
          }
        ]
      },
      "d9": {
        "id": "d9",
        "title": "第八幕：无名之口",
        "content": "你滚进大厅，正撞进一个湿冷的怀抱。它低下头——那张脸上没有五官，只有一道正在缓缓张开的、深不见底的缝。缝里传来潮汐的声音。\n\n你的背后是大门，门缝里透进一线月光。所有的\"存在\"都停了下来，等着看你怎么选。",
        "isEnding": false,
        "sectors": [
          {
            "text": "举刀刺向那道缝",
            "angle": 190,
            "color": "#4ECDC4",
            "targetNodeId": "ending_death"
          },
          {
            "text": "喊出它腹中的名字",
            "angle": 170,
            "color": "#FF6B6B",
            "targetNodeId": "ending_death"
          }
        ]
      },
      "o9": {
        "id": "o9",
        "title": "第八幕：黎明前",
        "content": "她侧身，让开了大门。潮水正在退去，晨光有一搭没一搭地落在门阶上。\n\n\"走的人都会说'结束了'。\"她替你拉开门，声音轻得像水痕，\"你也这么觉得吗，侦探先生？\"你攥着那一叠照片，一步跨出门槛——没有回头。",
        "isEnding": false,
        "sectors": [
          {
            "text": "上车回城交差",
            "angle": 200,
            "color": "#FFE66D",
            "targetNodeId": "ending_over"
          },
          {
            "text": "回头望一眼宅邸",
            "angle": 160,
            "color": "#AA96DA",
            "targetNodeId": "ending_over"
          }
        ]
      },
      "ending_truth": {
        "id": "ending_truth",
        "title": "结局：探寻真相",
        "content": "你守到了黎明。当第一缕天光落进祭厅，群影向你俯首——三百年来第一位守约到天亮的见证人。你带着满本记录走出灰水宅：梅瑟家的每一笔财富、每一位新娘的名字、深海之下那位\"姻亲\"的真名。\n\n五十镑你收了。委托人列的\"小三\"，你一个也没抓到。从此每逢大潮夜，你都能闻见自家窗台的鱼腥风——你查明了全部真相，而真相，也记住了你。",
        "isEnding": true,
        "sectors": []
      },
      "ending_death": {
        "id": "ending_death",
        "title": "结局：死亡",
        "content": "刀刃刺进去，像扎进一整片深海。你的手臂先于你溶成了细小的鳞片，在绿烛光里闪着虹彩。倒下前你看见大厅的画像——历代\"证人\"的脸上，每一张都慢慢变成了你的脸。\n\n三天后，灰水宅的藏书室多了一册崭新的、没有书名的人皮书。而城里，梅瑟先生正把五十镑拍在下一位侦探的手心。",
        "isEnding": true,
        "sectors": []
      },
      "ending_over": {
        "id": "ending_over",
        "title": "结局：结束了吗……？",
        "content": "照片拍在梅瑟先生的桌上，五十镑落袋，委托结案。\n\n可从那晚起，每逢大潮，你都会在清晨闻见袖口的鱼腥味；梳子上缠着来历不明的长发；新买的地毯，摸上去总有点湿。你没再接梅瑟家的单子——你告诉自己，那晚的事，结束了。\n\n……真的结束了吗？",
        "isEnding": true,
        "sectors": []
      }
    }
  };

  function StoryEngine() {
    this.data = null;
    this.currentNodeId = null;
  }

  StoryEngine.prototype.init = function () {
    const saved = Storage.get(CONFIG.STORAGE_KEYS.STORY_DATA);
    if (this._isValidData(saved) && !this._isLegacyDefault(saved)) {
      this.data = Utils.deepClone(saved);
    } else {
      this.data = Utils.deepClone(DEFAULT_DATA);
      this.save();
    }
    this.currentNodeId = this.data.rootNodeId;
  };

  StoryEngine.prototype._isValidData = function (d) {
    if (!d || typeof d !== 'object') return false;
    if (!d.rootNodeId || typeof d.rootNodeId !== 'string') return false;
    if (!d.nodes || typeof d.nodes !== 'object') return false;
    if (Object.keys(d.nodes).length === 0) return false;
    return true;
  };

  /**
   * 旧版内置剧本（古堡）识别：默认剧本升级为灰水宅后，
   * 存量用户的本地缓存若仍是旧默认剧本，则自动迁移为新默认；
   * 管理员导入的自定义剧本不受影响
   */
  StoryEngine.prototype._isLegacyDefault = function (d) {
    return d.rootNodeId === 'root' &&
      !!d.nodes.root &&
      d.nodes.root.title === '序章：神秘的古堡';
  };

  StoryEngine.prototype.getNode = function (id) {
    if (!id) return null;
    const node = this.data.nodes[id];
    return node ? Utils.deepClone(node) : null;
  };

  StoryEngine.prototype.getRootNode = function () {
    return this.getNode(this.data.rootNodeId);
  };

  StoryEngine.prototype.getCurrentNode = function () {
    return this.getNode(this.currentNodeId);
  };

  StoryEngine.prototype.getAllNodes = function () {
    return Utils.deepClone(this.data.nodes);
  };

  StoryEngine.prototype.reset = function () {
    this.currentNodeId = this.data.rootNodeId;
  };

  StoryEngine.prototype.jumpTo = function (nodeId) {
    if (!nodeId) {
      console.warn('[StoryEngine] 跳转失败: 目标节点 ID 为空');
      return null;
    }
    const node = this.data.nodes[nodeId];
    if (!node) {
      console.warn('[StoryEngine] 跳转失败: 节点 "' + nodeId + '" 不存在');
      return null;
    }
    this.currentNodeId = nodeId;
    return Utils.deepClone(node);
  };

  StoryEngine.prototype.isEnding = function (nodeId) {
    const node = this.data.nodes[nodeId];
    return !!(node && node.isEnding);
  };

  StoryEngine.prototype.addNode = function (node) {
    if (!node || !node.id) return false;
    if (this.data.nodes[node.id]) return false;
    this.data.nodes[node.id] = {
      id: node.id,
      title: node.title || '',
      content: node.content || '',
      isEnding: !!node.isEnding,
      sectors: Array.isArray(node.sectors) ? node.sectors : [],
    };
    this.save();
    return true;
  };

  StoryEngine.prototype.updateNode = function (id, patch) {
    if (!this.data.nodes[id]) return false;
    const target = this.data.nodes[id];
    for (const key in patch) {
      if (Object.prototype.hasOwnProperty.call(patch, key) && key !== 'id') {
        target[key] = patch[key];
      }
    }
    if (patch.isEnding) {
      target.sectors = [];
    }
    this.save();
    return true;
  };

  StoryEngine.prototype.deleteNode = function (id) {
    if (!this.data.nodes[id]) return false;
    if (id === this.data.rootNodeId) return false;
    delete this.data.nodes[id];
    for (const nid in this.data.nodes) {
      const n = this.data.nodes[nid];
      if (Array.isArray(n.sectors)) {
        n.sectors.forEach(s => {
          if (s.targetNodeId === id) s.targetNodeId = '';
        });
      }
    }
    if (this.currentNodeId === id) {
      this.currentNodeId = this.data.rootNodeId;
    }
    this.save();
    return true;
  };

  StoryEngine.prototype.validate = function () {
    const errors = [];
    if (!this.data.rootNodeId) {
      errors.push('缺少根节点 ID');
    }
    if (!this.data.nodes[this.data.rootNodeId]) {
      errors.push('根节点 "' + this.data.rootNodeId + '" 不存在');
    }
    for (const id in this.data.nodes) {
      const n = this.data.nodes[id];
      if (!n.isEnding) {
        if (!Utils.validateTotalAngle(n.sectors)) {
          errors.push('节点 "' + id + '" 扇区角度总和 ≠ 360°');
        }
        n.sectors.forEach((s, i) => {
          if (s.targetNodeId && !this.data.nodes[s.targetNodeId]) {
            errors.push('节点 "' + id + '" 第 ' + (i + 1) + ' 扇区跳转目标 "' + s.targetNodeId + '" 不存在');
          }
        });
      }
    }
    return {
      ok: errors.length === 0,
      errors: errors,
    };
  };

  StoryEngine.prototype.save = function () {
    Storage.set(CONFIG.STORAGE_KEYS.STORY_DATA, this.data);
  };

  StoryEngine.prototype.exportJSON = function () {
    return JSON.stringify(this.data, null, 2);
  };

  StoryEngine.prototype.importJSON = function (jsonStr) {
    let parsed;
    try {
      parsed = JSON.parse(jsonStr);
    } catch (e) {
      return { ok: false, error: 'JSON 格式错误' };
    }
    if (!parsed || typeof parsed !== 'object') {
      return { ok: false, error: 'JSON 根节点必须是对象' };
    }
    if (!parsed.nodes || typeof parsed.nodes !== 'object') {
      return { ok: false, error: '缺少 nodes 对象' };
    }
    if (!parsed.rootNodeId) {
      return { ok: false, error: '缺少 rootNodeId' };
    }
    const nodeKeys = Object.keys(parsed.nodes);
    if (nodeKeys.length === 0) {
      return { ok: false, error: 'nodes 为空' };
    }
    if (!parsed.nodes[parsed.rootNodeId]) {
      return { ok: false, error: '根节点 "' + parsed.rootNodeId + '" 不存在于 nodes 中' };
    }

    const normalizedNodes = {};
    for (let i = 0; i < nodeKeys.length; i++) {
      const id = nodeKeys[i];
      const n = parsed.nodes[id];
      if (!n || typeof n !== 'object') {
        return { ok: false, error: '节点 "' + id + '" 结构非法' };
      }
      normalizedNodes[id] = {
        id: id,
        title: typeof n.title === 'string' ? n.title : '',
        content: typeof n.content === 'string' ? n.content : '',
        isEnding: !!n.isEnding,
        sectors: Array.isArray(n.sectors) ? n.sectors.map(function (s) {
          return {
            text: String(s.text || ''),
            angle: Number(s.angle) || 0,
            color: String(s.color || '#cccccc'),
            targetNodeId: String(s.targetNodeId || ''),
          };
        }) : [],
      };
    }

    this.data = {
      rootNodeId: String(parsed.rootNodeId),
      nodes: normalizedNodes,
    };
    this.currentNodeId = this.data.rootNodeId;
    this.save();
    return { ok: true };
  };

  StoryEngine.prototype.resetToDefault = function () {
    this.data = Utils.deepClone(DEFAULT_DATA);
    this.currentNodeId = this.data.rootNodeId;
    this.save();
  };

  global.StoryEngine = StoryEngine;
})(window);
