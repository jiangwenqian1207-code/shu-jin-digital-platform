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

网页将这些特征重建为四向、每组 277 条固定随机偏移的经纬遮罩。捏合控制长度、密度与交织覆盖；保持固定丝线编号，不存在移动粒子系统。并非 TD 渲染器逐像素移植：投影、bloom 和 Lag CHOP 的曲线用轻量近似替代。网页织造约数秒趋于完成，需结合真实手势体验进一步校准。

TD 的 switch 有第六张清代素材，但当前页面严格只使用用户指定的五张图片。

## 文件和资源

- `weaving.html / .css`: 无全站导航的沉浸式页面；画布、上方关闭区、下方信息区使用独立布局行。
- `weaving-renderer.mjs`: WebGL2 单次全屏三角形绘制，旧设备 Canvas 2D 降级；像素比上限 1.5，宽度上限 1600。
- `weaving-gesture.mjs`: 纯手势状态机与顺序换图；可运行自动化测试。
- `weaving-hands-worker.mjs`: 独立线程识别，单帧在途，上限约 15 Hz；不上传视频。
- `weaving-data.mjs`: 五组文案（每组 100–150 个汉字）与单任务打字机。
- `patterns/`: 用户提供的五张 JPG，原文件不变。
- `vendor/`: npm `@mediapipe/tasks-vision` **0.10.32**（Apache-2.0）、两个 WASM 变体；Google Hand Landmarker float16 **版本 1**。固定本地资源，不依赖网页运行时的 CDN。

MediaPipe 使用方式依据 [Google 官方 Web 指南](https://developers.google.com/edge/mediapipe/solutions/vision/hand_landmarker/web_js)，模型来自 [Google 官方模型](https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task)。库代码保留原版权标识，许可证见 `vendor/LICENSE`。

## 交互与隐私

- 捏合距离除以掌宽（已考虑摄像头宽高比）；0.32 / 0.52 双阈值、100 / 140ms 确认、55ms 平滑。
- 右挥只允许张开的手，位移 >20% 画宽、速度 >0.55 画宽/秒；与捏合互斥，松开后隔离 450ms。
- 一次右挥后冷却 1500ms，且需要手稳定 260ms 才重新解锁。
- 短暂丢手保留 280ms，之后平滑退散。
- 摄像头拒绝、模型失败、超时、设备断开均保留画布和鼠标/空格操作。
- 隐藏页面、关闭作品即释放摄像头和 worker；返回页面需主动重新开启摄像头。
- 原始视频元素隐藏，不录制、不存储、不发送网络。网页使用 localhost 或 HTTPS 才能请求摄像头。
- 换图 520ms 收线、680ms 展开，仅在完全收拢处替换一个纹理；旧文字任务立即停止，新标题与纹理同步更新。

## 验证

`node --test tests/weaving.test.mjs`：捏合、释放、丢手、抖动、左右挥动、捏合横移、冷却、五张循环、打字任务取消、文案长度。

`http://localhost:5173/tests/weaving-browser.html`：实际 WebGL 编译/三个生长阶段、本地模型与 WASM worker 推理、权限拒绝的 iframe、画布与 UI 边界、帧间隔；“Run page interaction checks” 检查实际页面键盘状态、五张切换和打字重置。此页仅供开发验证，不从网站菜单链接。

摄像头实时手势仍需人在镜头前验收。合成坐标测试通过不代表不同光线、相机、肤色或手部遮挡下的识别已经得到实测。
