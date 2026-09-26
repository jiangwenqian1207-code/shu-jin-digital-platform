const source=(file,name)=>({file,name});
// Descriptions transcribed verbatim from 数字之花的设计说明.docx.
// SVGs are extracted motifs, not photographs of the historical textiles.
export const flowers=[
 {id:'orchid',name:'兰花',idea:'高洁',description:'兰花以“高洁”为意象核心，从晚清方方锦与唐代黄地对鹿纹锦中提取纹样元素，并融入花瓣、叶片与花芯造型。通过删减、重组与结构转译，将传统蜀锦纹样转化为立体花形，再经挤压、弯曲、克隆与组合，使织锦的秩序感与兰花的自然姿态在三维空间中形成新的视觉表达。',sources:[source('fangfang-brocade','方方锦'),source('cross-floral','黄地对鹿纹锦')]},
 {id:'narcissus',name:'水仙',idea:'清雅',description:'水仙以“清雅”为意象核心，从清代鹤鹿同春柿蒂纹锦与唐代黄地对鹿纹锦中提取纹样元素，并融入花瓣、花苞与叶片造型。通过删减、镜像、拉长等方式重构传统纹样，再结合挤压、弯曲、克隆与组合，将平面的蜀锦纹饰转化为具有空间层次的数字花形，呈现水仙轻盈舒展、清雅含蓄的东方气质。',sources:[source('persimmon-calyx','鹤鹿同春柿蒂纹锦'),source('cross-floral','黄地对鹿纹锦')]},
 {id:'chrysanthemum',name:'菊花',idea:'坚韧',description:'菊花以“坚韧”为意象核心，从菱纹锦、唐代联珠对鹊纹锦及黄地对鹿纹锦中提取纹样元素，并融入花瓣与叶片结构。通过删减、组合与形态重构，将传统蜀锦纹样转译为花体造型，再结合挤压、弯曲、克隆等三维建模方式，使几何秩序与菊花层叠舒展的形态相互融合，呈现坚韧而富有层次的数字花形。',sources:[source('diamond','菱纹锦'),source('small-cross-floral-magpie','联珠对鹊纹锦'),source('small-cross-floral-deer','黄地对鹿纹锦')]},
 {id:'hibiscus',name:'芙蓉',idea:'繁盛',description:'芙蓉花以“繁盛”为意象核心，从红地五彩鸟纹锦、唐代黄地对鹿纹锦及方方锦中提取纹样元素，并融入花瓣与叶片结构。通过删减、旋转、组合与形态重构，将传统蜀锦纹饰转化为富有层次的花体造型，再结合挤压、弯曲与克隆等三维建模方式，呈现芙蓉舒展丰盈、生机繁盛的数字化视觉形态。',sources:[source('small-cross-floral-magpie','红地五彩鸟纹锦'),source('small-cross-floral-deer','黄地对鹿纹锦'),source('fangfang-brocade','方方锦')]},
 {id:'plum-blossom',name:'梅花',idea:'坚毅',description:'梅花以“坚毅”为意象核心，从唐代黄地对鹿纹锦中提取纹样元素，并将其转化融入花瓣结构。通过删减、拉长与形态重构，提炼传统蜀锦纹样的节奏与秩序，再结合导入线稿、弯曲、挤压、克隆与组合等三维建模方式，使纹饰结构与梅花简洁有力的形态相互融合，呈现坚毅、克制而富有东方气质的数字花形。',sources:[source('yellow-ground-deer','黄地对鹿纹锦')]}
].map(f=>({...f,model:`./public/digital-artworks/digital-flowers/${f.id}/${f.id}.glb`,poster:`./public/shu-brocade-floral/${f.id}-poster.jpg`,sources:f.sources.map(s=>({...s,url:`./public/digital-artworks/digital-flowers/${f.id}/patterns/${f.id}-${s.file}-pattern.svg`}))}));
