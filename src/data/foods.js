export const MEAL_SLOTS = ['breakfast', 'lunch', 'dinner', 'snack', 'drink'];

const food = (id, vi, en, serving, kcal, protein, carbs, fat, group) => ({ id, name: { vi, en }, serving, kcal, protein, carbs, fat, group });

export const FOOD_GROUPS = ['staple', 'protein', 'veggie', 'fruit', 'snack', 'drink'];

const CATALOG = [
    food('rice-white', 'Cơm trắng', 'White rice', { vi: '1 chén (150g)', en: '1 bowl (150g)' }, 200, 4, 44, 0.4, 'staple'),
    food('rice-brown', 'Cơm gạo lứt', 'Brown rice', { vi: '1 chén (150g)', en: '1 bowl (150g)' }, 170, 4, 36, 1.4, 'staple'),
    food('pho-bo', 'Phở bò', 'Beef pho', { vi: '1 tô', en: '1 bowl' }, 450, 25, 60, 12, 'staple'),
    food('bun-bo', 'Bún bò Huế', 'Hue beef noodle soup', { vi: '1 tô', en: '1 bowl' }, 520, 28, 65, 16, 'staple'),
    food('bun-rieu', 'Bún riêu', 'Crab noodle soup', { vi: '1 tô', en: '1 bowl' }, 450, 20, 60, 14, 'staple'),
    food('hu-tieu', 'Hủ tiếu', 'Hu tieu noodle soup', { vi: '1 tô', en: '1 bowl' }, 450, 22, 62, 12, 'staple'),
    food('bun-thit-nuong', 'Bún thịt nướng', 'Grilled pork vermicelli', { vi: '1 tô', en: '1 bowl' }, 550, 25, 75, 16, 'staple'),
    food('com-tam', 'Cơm tấm sườn', 'Broken rice with pork chop', { vi: '1 dĩa', en: '1 plate' }, 700, 30, 90, 22, 'staple'),
    food('com-ga', 'Cơm gà', 'Chicken rice', { vi: '1 dĩa', en: '1 plate' }, 600, 32, 80, 15, 'staple'),
    food('mi-goi', 'Mì gói', 'Instant noodles', { vi: '1 gói', en: '1 pack' }, 380, 8, 54, 14, 'staple'),
    food('banh-mi-thit', 'Bánh mì thịt', 'Pork baguette', { vi: '1 ổ', en: '1 loaf' }, 400, 16, 48, 15, 'staple'),
    food('banh-mi-trung', 'Bánh mì trứng', 'Egg baguette', { vi: '1 ổ', en: '1 loaf' }, 380, 14, 45, 15, 'staple'),
    food('xoi', 'Xôi', 'Sticky rice', { vi: '1 gói (150g)', en: '1 pack (150g)' }, 330, 6, 60, 7, 'staple'),
    food('oat', 'Yến mạch', 'Oats', { vi: '40g khô', en: '40g dry' }, 150, 5, 27, 3, 'staple'),
    food('sweet-potato', 'Khoai lang luộc', 'Boiled sweet potato', { vi: '1 củ vừa (150g)', en: '1 medium (150g)' }, 130, 2, 30, 0.2, 'staple'),

    food('chicken-breast', 'Ức gà luộc/nướng', 'Chicken breast', { vi: '100g', en: '100g' }, 165, 31, 0, 3.6, 'protein'),
    food('egg-boiled', 'Trứng luộc', 'Boiled egg', { vi: '1 quả', en: '1 egg' }, 78, 6.3, 0.6, 5.3, 'protein'),
    food('egg-fried', 'Trứng chiên', 'Fried egg', { vi: '1 quả', en: '1 egg' }, 100, 6, 0.4, 7.5, 'protein'),
    food('pork-lean', 'Thịt heo nạc luộc', 'Boiled lean pork', { vi: '100g', en: '100g' }, 200, 27, 0, 10, 'protein'),
    food('beef-stirfry', 'Thịt bò xào', 'Stir-fried beef', { vi: '100g', en: '100g' }, 200, 22, 3, 11, 'protein'),
    food('salmon', 'Cá hồi', 'Salmon', { vi: '100g', en: '100g' }, 208, 20, 0, 13, 'protein'),
    food('fish-braised', 'Cá kho', 'Braised fish', { vi: '1 khúc (100g)', en: '1 piece (100g)' }, 180, 18, 3, 10, 'protein'),
    food('shrimp', 'Tôm luộc', 'Boiled shrimp', { vi: '100g', en: '100g' }, 99, 24, 0.2, 0.3, 'protein'),
    food('tofu-boiled', 'Đậu hũ luộc', 'Plain tofu', { vi: '100g', en: '100g' }, 76, 8, 2, 5, 'protein'),
    food('tofu-fried', 'Đậu hũ chiên', 'Fried tofu', { vi: '1 miếng (80g)', en: '1 piece (80g)' }, 170, 9, 4, 13, 'protein'),
    food('whey', 'Whey protein', 'Whey protein', { vi: '1 muỗng (30g)', en: '1 scoop (30g)' }, 120, 24, 3, 1.5, 'protein'),

    food('veg-boiled', 'Rau luộc', 'Boiled vegetables', { vi: '1 dĩa (100g)', en: '1 plate (100g)' }, 30, 2, 5, 0.3, 'veggie'),
    food('salad', 'Salad rau', 'Green salad', { vi: '1 dĩa', en: '1 plate' }, 80, 2, 8, 5, 'veggie'),
    food('soup-veg', 'Canh rau', 'Vegetable soup', { vi: '1 chén', en: '1 bowl' }, 40, 2, 6, 1, 'veggie'),
    food('canh-chua', 'Canh chua cá', 'Sour fish soup', { vi: '1 chén', en: '1 bowl' }, 90, 8, 8, 3, 'veggie'),

    food('banana', 'Chuối', 'Banana', { vi: '1 quả', en: '1 piece' }, 90, 1.1, 23, 0.3, 'fruit'),
    food('apple', 'Táo', 'Apple', { vi: '1 quả', en: '1 piece' }, 95, 0.5, 25, 0.3, 'fruit'),
    food('orange', 'Cam', 'Orange', { vi: '1 quả', en: '1 piece' }, 62, 1.2, 15, 0.2, 'fruit'),
    food('mango', 'Xoài', 'Mango', { vi: '1 chén (165g)', en: '1 cup (165g)' }, 99, 1.4, 25, 0.6, 'fruit'),
    food('dragon-fruit', 'Thanh long', 'Dragon fruit', { vi: '1/2 quả (150g)', en: '1/2 fruit (150g)' }, 90, 2, 20, 0.5, 'fruit'),
    food('watermelon', 'Dưa hấu', 'Watermelon', { vi: '1 miếng (200g)', en: '1 slice (200g)' }, 60, 1.2, 15, 0.3, 'fruit'),

    food('yogurt-plain', 'Sữa chua không đường', 'Plain yogurt', { vi: '1 hũ (100g)', en: '1 cup (100g)' }, 60, 4, 6, 2, 'snack'),
    food('yogurt-sweet', 'Sữa chua có đường', 'Sweet yogurt', { vi: '1 hũ (100g)', en: '1 cup (100g)' }, 100, 3, 17, 2.5, 'snack'),
    food('cashew', 'Hạt điều', 'Cashews', { vi: '30g', en: '30g' }, 165, 5, 9, 13, 'snack'),
    food('chips', 'Bim bim / snack', 'Chips / snacks', { vi: '1 gói (40g)', en: '1 bag (40g)' }, 200, 2, 26, 10, 'snack'),
    food('cake', 'Bánh ngọt', 'Cake / pastry', { vi: '1 cái', en: '1 piece' }, 300, 4, 40, 14, 'snack'),
    food('fried-chicken', 'Gà rán', 'Fried chicken', { vi: '1 miếng', en: '1 piece' }, 320, 20, 11, 22, 'snack'),

    food('water', 'Nước lọc', 'Water', { vi: '1 ly (250ml)', en: '1 glass (250ml)' }, 0, 0, 0, 0, 'drink'),
    food('coffee-black', 'Cà phê đen không đường', 'Black coffee', { vi: '1 ly', en: '1 cup' }, 5, 0.3, 0, 0, 'drink'),
    food('coffee-milk', 'Cà phê sữa đá', 'Vietnamese iced milk coffee', { vi: '1 ly', en: '1 glass' }, 190, 3, 30, 6, 'drink'),
    food('tea-unsweet', 'Trà không đường', 'Unsweetened tea', { vi: '1 ly', en: '1 glass' }, 2, 0, 0, 0, 'drink'),
    food('milk-tea', 'Trà sữa trân châu', 'Bubble milk tea', { vi: '1 ly (700ml)', en: '1 cup (700ml)' }, 450, 3, 80, 10, 'drink'),
    food('soda', 'Nước ngọt', 'Soda', { vi: '1 lon (330ml)', en: '1 can (330ml)' }, 140, 0, 35, 0, 'drink'),
    food('sugarcane', 'Nước mía', 'Sugarcane juice', { vi: '1 ly (300ml)', en: '1 glass (300ml)' }, 180, 0.5, 45, 0, 'drink'),
    food('orange-juice', 'Nước cam vắt', 'Fresh orange juice', { vi: '1 ly (250ml)', en: '1 glass (250ml)' }, 110, 2, 26, 0.5, 'drink'),
    food('avocado-smoothie', 'Sinh tố bơ', 'Avocado smoothie', { vi: '1 ly', en: '1 glass' }, 300, 4, 35, 17, 'drink'),
    food('milk-plain', 'Sữa tươi không đường', 'Plain milk', { vi: '1 hộp (180ml)', en: '1 box (180ml)' }, 110, 6, 9, 6, 'drink'),
    food('beer', 'Bia', 'Beer', { vi: '1 lon (330ml)', en: '1 can (330ml)' }, 140, 1, 11, 0, 'drink'),
];

const AMOUNTS = {
    'rice-white': 150, 'rice-brown': 150, 'pho-bo': 500, 'bun-bo': 500, 'bun-rieu': 500, 'hu-tieu': 500,
    'bun-thit-nuong': 450, 'com-tam': 450, 'com-ga': 450, 'mi-goi': 75, 'banh-mi-thit': 180, 'banh-mi-trung': 170,
    xoi: 150, oat: 40, 'sweet-potato': 150,
    'chicken-breast': 100, 'egg-boiled': 50, 'egg-fried': 50, 'pork-lean': 100, 'beef-stirfry': 100, salmon: 100,
    'fish-braised': 100, shrimp: 100, 'tofu-boiled': 100, 'tofu-fried': 80, whey: 30,
    'veg-boiled': 100, salad: 120, 'soup-veg': 250, 'canh-chua': 250,
    banana: 100, apple: 180, orange: 130, mango: 165, 'dragon-fruit': 150, watermelon: 200,
    'yogurt-plain': 100, 'yogurt-sweet': 100, cashew: 30, chips: 40, cake: 90, 'fried-chicken': 100,
    water: 250, 'coffee-black': 200, 'coffee-milk': 250, 'tea-unsweet': 250, 'milk-tea': 700, soda: 330,
    sugarcane: 300, 'orange-juice': 250, 'avocado-smoothie': 350, 'milk-plain': 180, beer: 330,
};

const FIBER = { 'rice-white': 0.6, 'rice-brown': 2.7, 'pho-bo': 1.5, 'bun-bo': 2, 'bun-rieu': 2, 'hu-tieu': 1.5, 'bun-thit-nuong': 3, 'com-tam': 2, 'com-ga': 2, 'mi-goi': 2, 'banh-mi-thit': 2.5, 'banh-mi-trung': 2.5, xoi: 1, oat: 4, 'sweet-potato': 3.9, 'beef-stirfry': 0.5, 'tofu-boiled': 0.9, 'tofu-fried': 1, 'veg-boiled': 2.5, salad: 3, 'soup-veg': 2, 'canh-chua': 1.5, banana: 2.6, apple: 4.3, orange: 3.1, mango: 2.8, 'dragon-fruit': 2.9, watermelon: 0.8, cashew: 1, chips: 1.5, cake: 1, 'fried-chicken': 0.5, 'orange-juice': 0.5, 'avocado-smoothie': 6 };

export const FOODS = CATALOG.map((item) => ({ ...item, fiber: FIBER[item.id] ?? 0, amount: AMOUNTS[item.id], unit: item.group === 'drink' || item.id.startsWith('soup') || item.id === 'canh-chua' ? 'ml' : 'g' }));

export function foodById(id) {
    return FOODS.find((item) => item.id === id) ?? null;
}
