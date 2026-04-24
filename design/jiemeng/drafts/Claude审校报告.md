# 周公解梦 drafts 审校报告

本报告供 Claude 继续修订 `design/jiemeng/drafts/*.md` 使用。  
审校基准按以下优先级执行：

1. `design/jiemeng/raw/*.md`：古文口径最高优先级，不可被 drafts 任意改写。
2. `design/jiemeng/drafts/README.md`：字段格式、语气边界、敏感题材处理规则。
3. `src/modules/jiemeng/data/dreams.ts`：现有产品样本的语气与结构参考。

当前仓库实数如下：

- `design/jiemeng/raw/*.md`：8 个主题文件，共 495 条
- `design/jiemeng/drafts/*.md`：8 个主题文件，共 495 条

说明：这不是早期 130 条版本的审校记录，而是基于当前扩展后的 495 条版本整理的修订报告。  
审校目标不是重写全部 495 条，而是帮助 Claude 快速定位需要改动的内容。  
报告按四层输出：

- `必须修改`：明确与 raw 不符，或明显违反 README 规则。
- `建议修改`：不算硬错误，但表达过强、越界或不够稳。
- `统一风格清理项`：建议批量收紧 `advice` 语气。
- `通过`：本轮未发现明显问题，可暂不处理。

## 问题总览

### 必须修改

1. `梦见陌生人` [02-people.md](/Users/TerrellShe/Documents/personal/tt-projects/tt-divination/design/jiemeng/drafts/02-people.md:29)
2. `梦见考试` [05-life.md](/Users/TerrellShe/Documents/personal/tt-projects/tt-divination/design/jiemeng/drafts/05-life.md:29)
3. `梦见迷路` [05-life.md](/Users/TerrellShe/Documents/personal/tt-projects/tt-divination/design/jiemeng/drafts/05-life.md:49)
4. `梦见佛像` [06-ghost.md](/Users/TerrellShe/Documents/personal/tt-projects/tt-divination/design/jiemeng/drafts/06-ghost.md:38)
5. `梦见财神` [06-ghost.md](/Users/TerrellShe/Documents/personal/tt-projects/tt-divination/design/jiemeng/drafts/06-ghost.md:98)

### 建议修改

1. `梦见蛇吞物` [01-animal.md](/Users/TerrellShe/Documents/personal/tt-projects/tt-divination/design/jiemeng/drafts/01-animal.md:28)
2. `梦见打雷` [03-nature.md](/Users/TerrellShe/Documents/personal/tt-projects/tt-divination/design/jiemeng/drafts/03-nature.md:65)
3. `梦见洪水` [03-nature.md](/Users/TerrellShe/Documents/personal/tt-projects/tt-divination/design/jiemeng/drafts/03-nature.md:25)
4. `梦见海` [03-nature.md](/Users/TerrellShe/Documents/personal/tt-projects/tt-divination/design/jiemeng/drafts/03-nature.md:145)
5. `梦见生子` [02-people.md](/Users/TerrellShe/Documents/personal/tt-projects/tt-divination/design/jiemeng/drafts/02-people.md:65)
6. `梦见争吵` [05-life.md](/Users/TerrellShe/Documents/personal/tt-projects/tt-divination/design/jiemeng/drafts/05-life.md:85)
7. `梦见出汗` [04-body.md](/Users/TerrellShe/Documents/personal/tt-projects/tt-divination/design/jiemeng/drafts/04-body.md:125)
8. `梦见吃东西` [04-body.md](/Users/TerrellShe/Documents/personal/tt-projects/tt-divination/design/jiemeng/drafts/04-body.md:135)

### 统一风格清理项

- [07-building.md](/Users/TerrellShe/Documents/personal/tt-projects/tt-divination/design/jiemeng/drafts/07-building.md:15) `梦见房子`
- [07-building.md](/Users/TerrellShe/Documents/personal/tt-projects/tt-divination/design/jiemeng/drafts/07-building.md:35) `梦见坟墓`
- [07-building.md](/Users/TerrellShe/Documents/personal/tt-projects/tt-divination/design/jiemeng/drafts/07-building.md:65) `梦见宫殿`
- [07-building.md](/Users/TerrellShe/Documents/personal/tt-projects/tt-divination/design/jiemeng/drafts/07-building.md:125) `梦见井`
- [07-building.md](/Users/TerrellShe/Documents/personal/tt-projects/tt-divination/design/jiemeng/drafts/07-building.md:165) `梦见学校`
- [08-other.md](/Users/TerrellShe/Documents/personal/tt-projects/tt-divination/design/jiemeng/drafts/08-other.md:55) `梦见衣服`
- [08-other.md](/Users/TerrellShe/Documents/personal/tt-projects/tt-divination/design/jiemeng/drafts/08-other.md:75) `梦见书`
- [08-other.md](/Users/TerrellShe/Documents/personal/tt-projects/tt-divination/design/jiemeng/drafts/08-other.md:85) `梦见笔`
- [08-other.md](/Users/TerrellShe/Documents/personal/tt-projects/tt-divination/design/jiemeng/drafts/08-other.md:95) `梦见宝物`
- [08-other.md](/Users/TerrellShe/Documents/personal/tt-projects/tt-divination/design/jiemeng/drafts/08-other.md:105) `梦见花朵`
- [08-other.md](/Users/TerrellShe/Documents/personal/tt-projects/tt-divination/design/jiemeng/drafts/08-other.md:135) `梦见礼物`
- [08-other.md](/Users/TerrellShe/Documents/personal/tt-projects/tt-divination/design/jiemeng/drafts/08-other.md:145) `梦见信件`
- [08-other.md](/Users/TerrellShe/Documents/personal/tt-projects/tt-divination/design/jiemeng/drafts/08-other.md:155) `梦见钥匙`
- [08-other.md](/Users/TerrellShe/Documents/personal/tt-projects/tt-divination/design/jiemeng/drafts/08-other.md:165) `梦见笑声`
- [05-life.md](/Users/TerrellShe/Documents/personal/tt-projects/tt-divination/design/jiemeng/drafts/05-life.md:15) `梦见飞翔`
- [05-life.md](/Users/TerrellShe/Documents/personal/tt-projects/tt-divination/design/jiemeng/drafts/05-life.md:115) `梦见唱歌`
- [05-life.md](/Users/TerrellShe/Documents/personal/tt-projects/tt-divination/design/jiemeng/drafts/05-life.md:135) `梦见睡觉`
- [05-life.md](/Users/TerrellShe/Documents/personal/tt-projects/tt-divination/design/jiemeng/drafts/05-life.md:145) `梦见写字`
- [05-life.md](/Users/TerrellShe/Documents/personal/tt-projects/tt-divination/design/jiemeng/drafts/05-life.md:155) `梦见读书`
- [05-life.md](/Users/TerrellShe/Documents/personal/tt-projects/tt-divination/design/jiemeng/drafts/05-life.md:165) `梦见旅行`

## 问题明细

### 必须修改

#### 1. 梦见陌生人

- 文件：[02-people.md](/Users/TerrellShe/Documents/personal/tt-projects/tt-divination/design/jiemeng/drafts/02-people.md:29)
- 类型：与古文不符
- 问题说明：`summary` 写成“古籍多留白”；但 raw 明确写的是“与不识之人相对，主遇新识；接陌路之言，近有贵人”。
- 建议修订方向：恢复“新识 / 贵人”口径，不要写成“古籍留白”。`modern` 第一条也应保留传统象征，不要弱化过头。

#### 2. 梦见考试

- 文件：[05-life.md](/Users/TerrellShe/Documents/personal/tt-projects/tt-divination/design/jiemeng/drafts/05-life.md:29)
- 类型：summary 口径偏差
- 问题说明：raw 已有明确条文“梦中应试，主近有评选之事；忘带笔墨，心有所忧，事未备齐”，不应再写“古籍少见”。
- 建议修订方向：直接概括 raw 原义，例如“近有评选之事 / 准备未齐 / 心中有忧”，避免写元评论。

#### 3. 梦见迷路

- 文件：[05-life.md](/Users/TerrellShe/Documents/personal/tt-projects/tt-divination/design/jiemeng/drafts/05-life.md:49)
- 类型：summary 口径偏差
- 问题说明：raw 已写“梦中迷途，主心事未定；路不得归，近有犹豫之事”，不应写“古籍少载”。
- 建议修订方向：改成直接转述 raw 含义，不写“少载 / 少见”。

#### 4. 梦见佛像

- 文件：[06-ghost.md](/Users/TerrellShe/Documents/personal/tt-projects/tt-divination/design/jiemeng/drafts/06-ghost.md:38)
- 类型：违反神怪题材规则
- 问题说明：`advice` 写成“近期的‘心静’会带来不少好运”，属于吉运承诺。神怪题材应以文化象征和情绪安顿为主，不能给出现实好运判断。
- 建议修订方向：保留“正念 / 安静 / 安住”主题，删掉“好运”相关表述。

#### 5. 梦见财神

- 文件：[06-ghost.md](/Users/TerrellShe/Documents/personal/tt-projects/tt-divination/design/jiemeng/drafts/06-ghost.md:98)
- 类型：建议越界
- 问题说明：`advice` 中“哪些价值你还没好好开价，开价本身就是一种自重”过于靠近现实财务/商业定价建议。
- 建议修订方向：保留“自我价值感”主题，改成关注“自我认可 / 资源感 / 丰盛感”，去掉“开价”语义。

### 建议修改

#### 1. 梦见蛇吞物

- 文件：[01-animal.md](/Users/TerrellShe/Documents/personal/tt-projects/tt-divination/design/jiemeng/drafts/01-animal.md:28)
- 类型：advice 过强
- 问题说明：直接写“不宜开展重大承诺与长途出行”，已经接近替用户做现实决策。
- 建议修订方向：弱化为“可暂缓推进 / 放慢节奏 / 多观察两天”。

#### 2. 梦见打雷

- 文件：[03-nature.md](/Users/TerrellShe/Documents/personal/tt-projects/tt-divination/design/jiemeng/drafts/03-nature.md:65)
- 类型：advice 过强
- 问题说明：“果断做决定”像现实指令，不够温和。
- 建议修订方向：改成“若有悬而未决之事，可尝试逐步厘清 / 顺着直觉去看一看”。

#### 3. 梦见洪水

- 文件：[03-nature.md](/Users/TerrellShe/Documents/personal/tt-projects/tt-divination/design/jiemeng/drafts/03-nature.md:25)
- 类型：advice 任务化
- 问题说明：“果断砍掉最尾端”语气太硬，更像效率管理建议。
- 建议修订方向：改成“适度减负、给自己留白、先照顾节奏”。

#### 4. 梦见海

- 文件：[03-nature.md](/Users/TerrellShe/Documents/personal/tt-projects/tt-divination/design/jiemeng/drafts/03-nature.md:145)
- 类型：表达绝对化
- 问题说明：“在海边做决定常比在桌前更准”像玄学断言。
- 建议修订方向：改成“独处与安静环境更有助于听见内心声音”。

#### 5. 梦见生子

- 文件：[02-people.md](/Users/TerrellShe/Documents/personal/tt-projects/tt-divination/design/jiemeng/drafts/02-people.md:65)
- 类型：advice 推进感过强
- 问题说明：“先发出去、做出来”太像执行命令。
- 建议修订方向：改成“可以考虑让它开始落地 / 进入现实世界”。

#### 6. 梦见争吵

- 文件：[05-life.md](/Users/TerrellShe/Documents/personal/tt-projects/tt-divination/design/jiemeng/drafts/05-life.md:85)
- 类型：可能放大现实冲突
- 问题说明：直接鼓励“把那句憋了很久的话说出来”，可能放大现实关系风险。
- 建议修订方向：改成“寻找更平和、清晰、不伤人的表达方式”。

#### 7. 梦见出汗

- 文件：[04-body.md](/Users/TerrellShe/Documents/personal/tt-projects/tt-divination/design/jiemeng/drafts/04-body.md:125)
- 类型：advice 过度具体
- 问题说明：“砍掉一项待办、提前 30 分钟睡”过于任务化。
- 建议修订方向：改成“适度减负、尽量早点休息、先照顾身体节奏”。

#### 8. 梦见吃东西

- 文件：[04-body.md](/Users/TerrellShe/Documents/personal/tt-projects/tt-divination/design/jiemeng/drafts/04-body.md:135)
- 类型：现实引导过具体
- 问题说明：“最好不是一个人”过于具体，现实引导感太强。
- 建议修订方向：弱化成“若能和信任的人共享，也许会更有滋养感”。

## 统一风格清理项

以下条目不一定算错，但建议 Claude 在本轮批量收紧 `advice` 语气，减少以下风格特征：

- “今天就 / 今晚 / 立刻 / 主动 / 果断 / 先去做”
- “安排一次 / 发一条消息 / 打一个电话 / 读几页 / 写多少字”
- 过于像现实任务分配、效率管理、关系操作指令的句式

建议改法：

- 从“命令式动作”改成“温和提示”
- 从“具体执行清单”改成“留意 / 可以试着 / 不妨 / 若愿意”
- 保留可执行性，但不要替用户下现实决策

本轮建议顺手收紧这些条目：

- [07-building.md](/Users/TerrellShe/Documents/personal/tt-projects/tt-divination/design/jiemeng/drafts/07-building.md:15) `梦见房子`
- [07-building.md](/Users/TerrellShe/Documents/personal/tt-projects/tt-divination/design/jiemeng/drafts/07-building.md:35) `梦见坟墓`
- [07-building.md](/Users/TerrellShe/Documents/personal/tt-projects/tt-divination/design/jiemeng/drafts/07-building.md:65) `梦见宫殿`
- [07-building.md](/Users/TerrellShe/Documents/personal/tt-projects/tt-divination/design/jiemeng/drafts/07-building.md:125) `梦见井`
- [07-building.md](/Users/TerrellShe/Documents/personal/tt-projects/tt-divination/design/jiemeng/drafts/07-building.md:165) `梦见学校`
- [08-other.md](/Users/TerrellShe/Documents/personal/tt-projects/tt-divination/design/jiemeng/drafts/08-other.md:55) `梦见衣服`
- [08-other.md](/Users/TerrellShe/Documents/personal/tt-projects/tt-divination/design/jiemeng/drafts/08-other.md:75) `梦见书`
- [08-other.md](/Users/TerrellShe/Documents/personal/tt-projects/tt-divination/design/jiemeng/drafts/08-other.md:85) `梦见笔`
- [08-other.md](/Users/TerrellShe/Documents/personal/tt-projects/tt-divination/design/jiemeng/drafts/08-other.md:95) `梦见宝物`
- [08-other.md](/Users/TerrellShe/Documents/personal/tt-projects/tt-divination/design/jiemeng/drafts/08-other.md:105) `梦见花朵`
- [08-other.md](/Users/TerrellShe/Documents/personal/tt-projects/tt-divination/design/jiemeng/drafts/08-other.md:135) `梦见礼物`
- [08-other.md](/Users/TerrellShe/Documents/personal/tt-projects/tt-divination/design/jiemeng/drafts/08-other.md:145) `梦见信件`
- [08-other.md](/Users/TerrellShe/Documents/personal/tt-projects/tt-divination/design/jiemeng/drafts/08-other.md:155) `梦见钥匙`
- [08-other.md](/Users/TerrellShe/Documents/personal/tt-projects/tt-divination/design/jiemeng/drafts/08-other.md:165) `梦见笑声`
- [05-life.md](/Users/TerrellShe/Documents/personal/tt-projects/tt-divination/design/jiemeng/drafts/05-life.md:15) `梦见飞翔`
- [05-life.md](/Users/TerrellShe/Documents/personal/tt-projects/tt-divination/design/jiemeng/drafts/05-life.md:115) `梦见唱歌`
- [05-life.md](/Users/TerrellShe/Documents/personal/tt-projects/tt-divination/design/jiemeng/drafts/05-life.md:135) `梦见睡觉`
- [05-life.md](/Users/TerrellShe/Documents/personal/tt-projects/tt-divination/design/jiemeng/drafts/05-life.md:145) `梦见写字`
- [05-life.md](/Users/TerrellShe/Documents/personal/tt-projects/tt-divination/design/jiemeng/drafts/05-life.md:155) `梦见读书`
- [05-life.md](/Users/TerrellShe/Documents/personal/tt-projects/tt-divination/design/jiemeng/drafts/05-life.md:165) `梦见旅行`

## 通过

以下文件本轮已通读，除上文点名条目外，暂未发现需要优先修改的明显问题。可在 Claude 修完问题项后，如有余力再统一润色。

- `design/jiemeng/drafts/01-animal.md`：除 `梦见蛇吞物` 外，其余条目暂未发现明显硬伤。
- `design/jiemeng/drafts/02-people.md`：除 `梦见陌生人`、`梦见生子` 外，其余条目暂未发现明显硬伤。
- `design/jiemeng/drafts/03-nature.md`：除 `梦见洪水`、`梦见打雷`、`梦见海` 外，其余条目暂未发现明显硬伤。
- `design/jiemeng/drafts/04-body.md`：除 `梦见出汗`、`梦见吃东西` 外，其余条目暂未发现明显硬伤。
- `design/jiemeng/drafts/05-life.md`：除 `梦见考试`、`梦见迷路`、`梦见争吵` 及风格清理项外，其余条目暂未发现明显硬伤。
- `design/jiemeng/drafts/06-ghost.md`：除 `梦见佛像`、`梦见财神` 外，其余条目暂未发现明显硬伤。
- `design/jiemeng/drafts/07-building.md`：以风格收紧为主，暂未发现明显 raw 口径错误。
- `design/jiemeng/drafts/08-other.md`：以风格收紧为主，暂未发现明显 raw 口径错误。

## 给 Claude 的统一修订规则

请在修改时统一遵守以下约束：

1. `summary` 不再出现“古籍少见 / 古籍少载 / 古籍多留白”这类可被 raw 直接否定的表述。
2. `summary` 优先直接概括 raw 原义，再接现代解释，不写元评论。
3. 神怪 / 死亡 / 疾病题材不得出现“好运、解厄、开价、财运保证”等现实承诺。
4. `advice` 统一改成温和提示，少用命令式动词。
5. `advice` 要“可执行”，但不能替用户下现实决策。
6. `ambiguous` 条目保留“视情境而定”的复杂度，不要洗成单向积极。
7. 每条仍保持“传统象征 + 现代心理学”双轨结构。

## Claude 修订后自检清单

- 不再出现“古籍少见 / 古籍多留白”这类 summary。
- 神怪 / 死亡 / 疾病题材不出现“好运、解厄、开价、财运保证”等词义。
- `advice` 语气统一收软，少用“今天就 / 主动 / 果断 / 安排一次 / 读几页 / 写多少字 / 发消息 / 打电话”。
- `ambiguous` 条目仍保留双向或视情境而定的表达。
- 所有修改后条目仍满足“传统象征 + 现代心理学”双轨要求。
