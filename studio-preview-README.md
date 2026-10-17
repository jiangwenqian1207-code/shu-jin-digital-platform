# AI 创作空间 · 产品应用预览

- ai-studio.html / ai-studio.css：工作台布局、产品与贴图控制。
- studio-preview.mjs：Three.js 场景、灯光、OrbitControls、贴图加载、视图生命周期。
- studio-products.mjs：抱枕、裙子、围巾、丝巾、帽子、手提包和领带使用用户提供的原始 OBJ；笔记本保留简化模型。旧程序化分支不再用于已配置 OBJ 的产品，加载失败不会退回简易模型。
- 六个替换模型分别映射 pillow.obj、skirt.obj、scarf.obj、silk-scarf.obj、hat.obj、handbag.obj，袜子入口已替换为帽子。各产品独立设置统一缩放、朝向、相机与 UV 密度，保留原始几何和 UV 岛比例。围巾、丝巾 UV 统一乘以默认平铺密度；用户平铺滑块在此基础上继续调节。
- 抱枕导出含远离主体的极小附属网格：不删除该网格，仅按最大主体网格居中取景，避免主体显示过小。裙子文件中的上衣与长裙均保留。
- 领带使用 productConfigs.tie 配置及本地 OBJLoader 加载用户提供的 tie.obj，不重新建模。统一缩放和居中不修改原始顶点结构；保留原始 UV 岛与接缝，因 CLO 导出 UV 范围约为 -200～210，对两轴同乘 1/200 以获得可读的纹样密度。OBJ 引用的 62.mtl 不需要加载，统一使用当前纹样与柔和 sheen 丝织材质。
- 新增 OBJ 产品：添加 productConfigs 配置和 products 列表项；加载器自动处理异步切换、释放和居中。camera、scale、rotation、position、uvScale 均可独立配置。
- 平铺密度、方向、水平/垂直位置对所有产品有效，切换产品保留设置。真实 AI 生成仍需通过下述事件连接。

运行 npm run dev，打开 /ai-studio.html，点击「应用预览」。
默认纹样为本地 ai-geometric-dot-lattice-pattern.png；支持上传 PNG/JPEG/WebP（15 MB 内），文件仅在浏览器读取，不上传服务器。
切换产品保留当前纹样、平铺倍数与方向；切换时复位相机。拖动旋转、滚轮缩放、右键平移，触屏双指缩放/平移。

后续生成器可在获得图片后调用：

    document.dispatchEvent(new CustomEvent('studio:pattern-ready', {
      detail: { url: generatedLocalImageUrl }
    }));

跨域图片必须允许 CORS。失败时保留已有纹样并显示提示。
当前为简化产品模型，不是裁片生产模型；模型采用基础 UV，接缝处不能保证工业级连续对花。
真实 AI 生成服务仍未接入。本模块不伪造生成结果。
后续可替换 buildProduct 的分支为带 UV 的 GLTF 模型，并保留共享材质接口。
切换产品释放旧几何体和非共享材质，替换纹样释放旧纹理，隐藏预览时停止动画。
