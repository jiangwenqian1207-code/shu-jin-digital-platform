# 数字之花素材与网页展示

入口：数字艺术作品第二张封面 → `flowers.html`；关闭返回 `digital-artworks.html#flora`。

五段说明逐字取自用户的《数字之花的设计说明.docx》，保存在 `flowers-data.mjs`。英文名未在说明中提供，因此页面不补写英文花名。

## 素材映射

每个目录内的 GLB 对应该花。SVG 是提取后的纹样元素，并非历史织锦全幅照片。页面明确标为“纹样提取元素”。来源名称按用户列表与设计说明，文件按目录、实际 SVG 图形及现有海报核对：

|花|SVG 文件后缀|来源名称|
|---|---|---|
|兰花|fangfang-brocade / cross-floral|方方锦 / 黄地对鹿纹锦|
|水仙|persimmon-calyx / cross-floral|鹤鹿同春柿蒂纹锦 / 黄地对鹿纹锦|
|菊花|diamond / small-cross-floral-magpie / small-cross-floral-deer|菱纹锦 / 联珠对鹊纹锦 / 黄地对鹿纹锦|
|芙蓉|small-cross-floral-magpie / small-cross-floral-deer / fangfang-brocade|红地五彩鸟纹锦 / 黄地对鹿纹锦 / 方方锦|
|梅花|yellow-ground-deer|黄地对鹿纹锦|

芙蓉目录鸟纹元素的英文文件名含 magpie；来源中文名称以用户明确指定和文档中的“红地五彩鸟纹锦”为准，而非从英文文件名推断历史来源。

缩略图复用 `public/shu-brocade-floral/*-poster.jpg`，没有生成或替换用户素材。

## 实现

Three.js 0.180.0 / GLTFLoader / OrbitControls，本地依赖副本在 `public/vendor/three`（MIT 许可证随附），无运行时 CDN 请求。静态重复部件使用 InstancedMesh 保留世界变换，降低绘制次数；保留模型颜色，为展厅光照将零粗糙度提升至最低 0.18。环境光为 RoomEnvironment，不增加外部纹理素材。

模型只按需载入，最多缓存两个；快速切换会中止旧下载并废弃过期解析结果。切换前停止打字，模型载入后同步更新标题、原文、来源卡片和选中状态。拖动后 3.5 秒恢复自转；提供暂停、自转、复位和键盘旋转/缩放。隐藏页面暂停渲染，退出释放资源。小屏使用纵向布局；遵循减少动态效果偏好。

2026-09-26 按最新反馈恢复第一版布局、列宽、间距和纵向转译结构，仅将小字号下限设为 12px。默认模型绕 Y 轴转 180°，切换与复位均回到这一正面。材质恢复原有金属度，取消高饱和调色；在原始色相上将饱和度乘 0.92、明度乘 0.96，粗糙度下限 0.22、环境反射强度 1.05，光照接近第一版。GLB 原文件及默认缩放公式不变。

检查：`node --test tests/flowers.test.mjs`。需通过 HTTP 启动项目，不能以 file 协议直接打开页面。
