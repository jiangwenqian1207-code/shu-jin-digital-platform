# 花鸟单元提取记录

- 输入：mosaic-floral-bird-01.png（原图保持不变）
- 输出：mosaic-floral-bird-unit.png，透明 PNG
- 工具：内置 image_gen，background-extraction；AI 辅助编辑，非逐像素无损抠图。
- 检查：只保留中心鸟及相连花枝；浏览器验证存在透明像素，连续排列不再带矩形图片底色。

## 使用的提示词

Use case: background-extraction. Edit target: attached mosaic floral bird image. Extract ONLY the single CENTRAL blue bird with its connected purple flowering branch, retaining all flowers/leaves belonging to that central branch. Remove cream background completely including all negative spaces between branch/flowers. Remove ALL other partial repeated birds and branches at the top, left, right and bottom edges. Preserve original central motif shape, pixelated mosaic squares, muted blue purple green colors, proportions and details exactly; do not reinterpret, smooth, add or redraw stylistically. Output a single isolated central bird-and-flowering-branch motif on true transparent alpha, centered with small transparent padding, no background, no shadows, no surrounding repeat fragments. This is a reusable motif for a pattern editor.
