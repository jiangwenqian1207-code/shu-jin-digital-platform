# 经纬之间 / 浏览器重建

## 原作依据

参考 `touchdesigner-source/pattern-weaving-v01.2.toe`，使用已安装的 `toeexpand.exe` 解包读取，没有运行或嵌入 TD 工程。录屏长度约 64.93 秒，已检查全段抽帧及 8–14 秒的连续变化。

工程内的关键结构：

- `constant1`: `point-num=277`, `h=6`。
- `geo1..4`: 四组线实例，第三、第四组旋转 +90° / -90°。
- `line1/3/4`: 线段长度 12 / 14 / 14；`line2` 材质宽度约 1–1.3。
- `pattern1..12`: ramp 排列、random 偏移和 0.6 / 0.8 周期的波形位置。
- `math2/4`: phase 范围 -0.56→-0.14、-0.46→-0.12。
- `hand_tracking/pinch → rename1 → lag1`，lag 参数 6.2。
- 1280×720 输出，纹样 `fitoutside`，线条后接 bloom/composite。

2026-09-25 按用户提供的两个新视频及细线反馈更新。保留网页尺寸、布局和全部文案，替换旧的四向聚散逻辑。初始为 277 根纵向经线；每次有效往返摆动只增加 1/277 织造进度，插入一根细纬线，约 240ms 横向穿行并带金色高光。纬线按交替方向从底部向上构建纹样，线间保留暗隙，停止动作保留进度。原 TD 参数仅作历史参考，本次运动方向以新视频1为准。

TD 的 switch 有第六张清代素材，但当前页面严格只使用用户指定的五张图片。

## 文件和资源

- `weaving.html / .css`: 无全站导航的沉浸式页面；画布、上方关闭区、下方信息区使用独立布局行。
- `weaving-renderer.mjs`: WebGL2 单次全屏三角形绘制，旧设备 Canvas 2D 降级；像素比上限 1.5，宽度上限 1600。
- `weaving-gesture.mjs`: 纯手势状态机与顺序换图；可运行自动化测试。
- `weaving-hands-worker.mjs`: 独立线程优先 GPU，初始化失败退回 CPU；单帧在途，上限约 30 Hz，实际频率取决于设备；不上传视频。检测/存在/跟踪阈值分别为 0.45/0.5/0.45。
- `weaving-data.mjs`: 五组文案（每组 100–150 个汉字）与单任务打字机。
- `patterns/`: 用户提供的五张 JPG，原文件不变。
- `vendor/`: npm `@mediapipe/tasks-vision` **0.10.32**（Apache-2.0）、两个 WASM 变体；Google Hand Landmarker float16 **版本 1**。固定本地资源，不依赖网页运行时的 CDN。

MediaPipe 使用方式依据 [Google 官方 Web 指南](https://developers.google.com/edge/mediapipe/solutions/vision/hand_landmarker/web_js)，模型来自 [Google 官方模型](https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task)。库代码保留原版权标识，许可证见 `vendor/LICENSE`。

## 交互与隐私

- 单手掌心横向移动使用 35ms 平滑、12% 画宽有效行程、100–1800ms 行程窗口与 180ms 防抖；连续同向移动只计一次，必须反向完成下一梭。拒绝过大纵向移动、跳点和轻微抖动。
- 双手同时捏合才切换：距离按掌宽与掌长中的较大值归一化，并考虑摄像头宽高比；0.45 / 0.65 双阈值、240ms 有效双手观测确认、1800ms 冷却。短暂漏检 180ms 内暂停确认而非清零，漏检帧不计入确认时间，也不能触发切换。两手均松开持续 240ms 即解除捏合锁（冷却仍独立生效）。持续捏合或丢手不会解锁。页面显示手数、捏合数、确认与解锁状态。
- 两只手出现时停止单手织造检测，避免与切换冲突；300ms 内短暂丢手保留真实坐标历史，不虚构运动。超时或坐标跳跃则重置采样，不清除已经织出的进度。
- 摄像头拒绝、模型失败、超时、设备断开均保留画布和鼠标/空格操作。
- 隐藏页面、关闭作品即释放摄像头和 worker；返回页面需主动重新开启摄像头。
- 原始视频元素隐藏，不录制、不存储、不发送网络。网页使用 localhost 或 HTTPS 才能请求摄像头。
- 换图先用 520ms 退去旧纬线，在裸经线状态替换一个纹理并重置进度为零；680ms 过渡结束后等待用户重新织造。旧文字任务立即停止，新标题与纹理同步更新。

## 验证

`node --test tests/weaving.test.mjs`：往返摆动、单向防重复、抖动、丢手、双手捏合确认与解锁、进度累积与重置、五张循环、打字任务取消、文案长度。

`http://localhost:5173/tests/weaving-browser.html`：实际 WebGL 编译/三个生长阶段、本地模型与 WASM worker 推理、权限拒绝的 iframe、画布与 UI 边界、帧间隔；“Run page interaction checks” 检查实际页面键盘状态、五张切换和打字重置。此页仅供开发验证，不从网站菜单链接。

摄像头实时手势仍需人在镜头前验收。合成坐标测试通过不代表不同光线、相机、肤色或手部遮挡下的识别已经得到实测。
