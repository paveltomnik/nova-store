const products = [
  { id: "hoodie-shadow", category: "hoodie", name: "Худи Shadow", color: "Графит", price: 5490, sizes: ["S", "M", "L", "XL"], description: "Плотный трикотаж с эффектом выстиранной ткани, свободный крой и карман-кенгуру." },
  { id: "tee-core", category: "tee", name: "Футболка Core", color: "Молочный", price: 2490, sizes: ["XS", "S", "M", "L"], description: "Плотная футболка с круглым вырезом, спущенным плечом и прямым кроем." },
  { id: "pants-field", category: "pants", name: "Карго Field", color: "Олива", price: 5990, sizes: ["S", "M", "L"], description: "Прямые брюки из плотной ткани с боковыми карманами и накладными карманами с клапанами." },
  { id: "bomber-night", category: "outerwear", name: "Бомбер Night", color: "Чёрный", price: 8990, sizes: ["M", "L", "XL"], description: "Бомбер из матового нейлона с металлической молнией и эластичными манжетами." },
  { id: "hoodie-cloud", category: "hoodie", name: "Худи Cloud", color: "Серый меланж", price: 4990, sizes: ["XS", "S", "M", "L"], description: "Мягкое худи с объёмным капюшоном, широкими манжетами и карманом-кенгуру." },
  { id: "tee-washed", category: "tee", name: "Футболка Washed", color: "Выстиранный чёрный", price: 2790, sizes: ["S", "M", "L", "XL"], description: "Свободная футболка с удлинённым рукавом и мягкой фактурой выстиранного хлопка." },
  { id: "pants-dune", category: "pants", name: "Чиносы Dune", color: "Песочный", price: 5290, sizes: ["XS", "S", "M", "L"], description: "Свободные прямые брюки из хлопкового твила с прорезными боковыми карманами." },
  { id: "jacket-block", category: "outerwear", name: "Куртка Block", color: "Тёмная олива", price: 7490, sizes: ["S", "M", "L", "XL"], description: "Лёгкая куртка на кнопках с отложным воротником и боковыми карманами." },
].map((product, index) => ({
  ...product,
  section: ["men", "women", "men", "men", "women", "men", "women", "men"][index],
}));

const sections = { women: "Женское", men: "Мужское", accessories: "Аксессуары" };
const categories = {
  hoodie: "Худи", tee: "Футболки", pants: "Брюки", outerwear: "Верхняя одежда",
  shoes: "Обувь", bags: "Сумки", hats: "Головные уборы",
};

const collections = [
  ["women", "hoodie", "Худи Drift", ["XS", "S", "M", "L"], "Укороченное худи из плотного футера со спущенным плечом, капюшоном и карманом-кенгуру.", [
    ["hoodie-drift-lilac", "Лавандовый", 4790],
    ["hoodie-drift-cream", "Молочный", 4790],
    ["hoodie-drift-sage", "Шалфей", 4790],
  ]],
  ["women", "tee", "Футболка Line", ["XS", "S", "M", "L"], "Прямая футболка из хлопкового джерси с круглым вырезом и коротким рукавом.", [
    ["tee-line-rose", "Пыльная роза", 2390],
    ["tee-line-ink", "Чёрный", 2390],
    ["tee-line-blue", "Голубой", 2390],
  ]],
  ["women", "pants", "Брюки Flow", ["XS", "S", "M", "L"], "Брюки свободного кроя с высокой посадкой, защипами спереди и широкими штанинами.", [
    ["pants-flow-slate", "Графит", 5790],
    ["pants-flow-oat", "Овсяный", 5790],
  ]],
  ["women", "outerwear", "Куртка Harbor", ["XS", "S", "M", "L"], "Короткая стёганая куртка с воротником-стойкой, молнией и боковыми карманами.", [
    ["jacket-harbor-cream", "Молочный", 8490],
    ["jacket-harbor-wine", "Бордовый", 8490],
  ]],
  ["women", "shoes", "Кеды Tempo", ["36", "37", "38", "39", "40", "41"], "Низкие кеды на резиновой подошве со шнуровкой и мягкой стелькой.", [
    ["sneakers-tempo-cream", "Молочный", 6490],
    ["sneakers-tempo-black", "Чёрный", 6490],
    ["sneakers-tempo-sand", "Песочный", 6490],
  ]],
  ["men", "hoodie", "Худи Loft", ["S", "M", "L", "XL", "XXL"], "Худи на молнии из хлопкового футера с двойным капюшоном и двумя карманами.", [
    ["hoodie-loft-navy", "Тёмно-синий", 5690],
    ["hoodie-loft-olive", "Олива", 5690],
    ["hoodie-loft-sand", "Песочный", 5690],
  ]],
  ["men", "tee", "Футболка Frame", ["S", "M", "L", "XL", "XXL"], "Плотная футболка свободного кроя с нагрудным карманом и усиленной горловиной.", [
    ["tee-frame-white", "Белый", 2590],
    ["tee-frame-clay", "Терракотовый", 2590],
    ["tee-frame-navy", "Тёмно-синий", 2590],
  ]],
  ["men", "pants", "Брюки Shift", ["S", "M", "L", "XL", "XXL"], "Прямые брюки из хлопкового твила с эластичным поясом и прорезными карманами.", [
    ["pants-shift-black", "Чёрный", 5590],
    ["pants-shift-stone", "Каменный", 5590],
  ]],
  ["men", "outerwear", "Куртка Range", ["S", "M", "L", "XL", "XXL"], "Куртка из плотного канваса с отложным воротником и накладными карманами.", [
    ["jacket-range-khaki", "Хаки", 9290],
    ["jacket-range-coal", "Графит", 9290],
  ]],
  ["men", "shoes", "Кроссовки Track", ["40", "41", "42", "43", "44", "45", "46"], "Кроссовки из сетки и замши с амортизирующей подошвой и цепким протектором.", [
    ["sneakers-track-gray", "Серый", 7990],
    ["sneakers-track-black", "Чёрный", 7990],
    ["sneakers-track-moss", "Мох", 7990],
  ]],
  ["accessories", "bags", "Сумка Transit", ["Единый"], "Компактная сумка через плечо с регулируемым ремнём и двумя отделениями на молнии.", [
    ["bag-transit-black", "Чёрный", 3190],
    ["bag-transit-olive", "Олива", 3190],
    ["bag-transit-sand", "Песочный", 3190],
  ]],
  ["accessories", "bags", "Шопер Studio", ["Единый"], "Шопер из плотного хлопка с длинными ручками и внутренним карманом.", [
    ["tote-studio-cream", "Молочный", 2190],
    ["tote-studio-blue", "Синий", 2190],
  ]],
  ["accessories", "hats", "Кепка Curve", ["Единый"], "Шестипанельная хлопковая кепка с изогнутым козырьком и регулируемой застёжкой.", [
    ["cap-curve-black", "Чёрный", 1990],
    ["cap-curve-wine", "Бордовый", 1990],
    ["cap-curve-cream", "Молочный", 1990],
  ]],
  ["accessories", "hats", "Шапка Fold", ["Единый"], "Шапка в рубчик из мягкой пряжи с широким отворотом.", [
    ["beanie-fold-charcoal", "Графит", 1790],
    ["beanie-fold-rose", "Пыльная роза", 1790],
    ["beanie-fold-moss", "Мох", 1790],
  ]],
  ["accessories", "bags", "Рюкзак Commuter", ["Единый"], "Городской рюкзак с мягкими лямками, передним карманом и отделением для ноутбука.", [
    ["backpack-commuter-navy", "Тёмно-синий", 4990],
    ["backpack-commuter-black", "Чёрный", 4990],
    ["backpack-commuter-taupe", "Каменный", 4990],
  ]],
];

for (const [section, category, name, sizes, description, variants] of collections) {
  const family = variants[0][0];
  for (const [id, color, price] of variants) {
    products.push({ id, section, category, name, color, price, sizes, description, family });
  }
}

