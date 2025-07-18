const express = require('express');
const app = express();
const path = require('path');
const fs = require('fs');

// إعدادات الـ EJS والمجلدات
app.set('views', './views');
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

// تحميل ملفات JSON العادية (تأكد إن المسارات صحيحة)
const data = JSON.parse(fs.readFileSync('data.json', 'utf-8'));
const soilData = JSON.parse(fs.readFileSync('soil_data.json', 'utf-8'));
const productivityData = JSON.parse(fs.readFileSync('productivityData.json', 'utf-8'));

// تحميل ملف JSON بيانات نسب العناصر للنباتات - لوحده (في نفس مسار index.js)
const plantNutrientData = JSON.parse(fs.readFileSync('plant_nutrient_ranges.json', 'utf-8'));

// عداد الزوار
let visitors = 0;

// الصفحة الرئيسية
app.get('/', (req, res) => {
  visitors++;
  res.render('landing', { visitors });
});

// لوحة التحكم
app.get('/dashboard', (req, res) => {
  visitors++;
  res.render('dashboard', { visitors });
});

// قائمة النباتات
app.get('/plants', (req, res) => {
  visitors++;
  res.render('plants', { data, visitors });
});

// صفحة التحليل
app.get('/analysis', (req, res) => {
  visitors++;
  res.render('analysis', { visitors });
});

// صفحة التربة
app.get('/soil', (req, res) => {
  visitors++;
  res.render('soil', { soil: soilData, visitors });
});

// صفحة زيادة الإنتاج الرئيسية
app.get('/productivity', (req, res) => {
  visitors++;
  res.render('productivity', { visitors, productivityData });
});

// صفحات العناصر المختلفة
app.get('/productivity/minerals', (req, res) => {
  visitors++;
  const minerals = productivityData["العناصر المعدنية"] || [];
  res.render('productivity/minerals', { minerals, visitors });
});

app.get('/productivity/organics', (req, res) => {
  visitors++;
  const organics = productivityData["العناصر العضوية"] || [];
  res.render('productivity/organics', { organics, visitors });
});

app.get('/productivity/chemicals', (req, res) => {
  visitors++;
  const chemicals = {
    "الأسمدة": productivityData["الأسمدة"] || [],
    "المبيدات": productivityData["المبيدات"] || []
  };
  res.render('productivity/chemicals', { chemicals, visitors });
});

// بيانات الأمراض
const diseasesRawData = JSON.parse(fs.readFileSync(path.join(__dirname, 'diseases_data.json'), 'utf-8'));
const diseasesData = diseasesRawData["الأمراض"];

const diseaseTypes = {
  fungal: "فطري",
  insects: "حشري",
  virus: "فيروسي",
  nematode: "نيماتودي"
};

// صفحة اختيار تصنيف المرض
app.get('/diseases', (req, res) => {
  visitors++;
  res.render('diseases', { visitors });
});

// لكل نوع مرض صفحة قائمة الأمراض
Object.entries(diseaseTypes).forEach(([routeType, typeName]) => {
  app.get(`/diseases/${routeType}`, (req, res) => {
    visitors++;
    const filteredDiseases = diseasesData.filter(d => d.نوع === typeName);
    res.render(`diseases/diseases_${routeType}`, { visitors, diseases: filteredDiseases, routeType, typeName });
  });

  // صفحة تفاصيل المرض
  app.get(`/disease/${routeType}/:name`, (req, res) => {
    visitors++;
    const diseaseName = decodeURIComponent(req.params.name);
    const disease = diseasesData.find(d => d.نوع === typeName && d.الاسم === diseaseName);
    if (!disease) return res.status(404).send('❌ المرض غير موجود');
    res.render('diseases/disease_detail', { visitors, disease, routeType });
  });
});

const camelData = JSON.parse(fs.readFileSync(path.join(__dirname, 'camel.json'), 'utf8'));
const buffaloData = JSON.parse(fs.readFileSync(path.join(__dirname, 'buffalo.json'), 'utf8'));
const cattleData = JSON.parse(fs.readFileSync(path.join(__dirname, 'cattle.json'), 'utf8'));
const sheepData = JSON.parse(fs.readFileSync(path.join(__dirname, 'sheep.json'), 'utf8'));
const goatsData = JSON.parse(fs.readFileSync(path.join(__dirname, 'goats.json'), 'utf8'));

const animalsSummary = [
  { key: 'الإبل', data: camelData['الإبل'] },
  { key: 'الجاموس', data: buffaloData['الجاموس'] },
  { key: 'البقر', data: cattleData['البقر'] },
  { key: 'الغنم', data: sheepData['الغنم'] },
  { key: 'الماعز', data: goatsData['الماعز'] }
];

// عداد زوار

// زيادة عداد الزوار لأي روت تحت /animals
app.use('/animals', (req, res, next) => {
  visitors++;
  next();
});

// الصفحة الرئيسية
app.get('/', (req, res) => {
  res.send(`<h1>مرحباً بك في موقع معلومات الحيوانات الزراعية</h1>
    <p><a href="/animals">عرض المواشي</a></p>`);
});

// صفحة قائمة أنواع المواشي
app.get('/animals', (req, res) => {
  // قائمة تضم فئات الحيوانات - أنت ممكن تضيف أنواع أخرى مثل الطيور والأسماك هنا
  res.render('animals', {
    animals: [
      { key: 'المواشي', link: '/animals/cattle' },
      { key: 'الطيور', link: '/animals/birds' },
      { key: 'الأسماك', link: '/animals/fish' }
    ],
    visitors
  });
});

// صفحة قائمة المواشي (الأنواع: الإبل، الجاموس، البقر، الغنم، الماعز)
app.get('/animals/cattle', (req, res) => {
  res.render('animals/cattle', {
    animals: animalsSummary,
    visitors
  });
});

// صفحة تفاصيل نوع المواشي (مثل الإبل)
app.get('/animals/cattle/:type', (req, res) => {
  const type = decodeURIComponent(req.params.type);
  const animalEntry = animalsSummary.find(a => a.key === type);
  if (!animalEntry) return res.status(404).send('نوع المواشي غير موجود');

  res.render('animals/animal-details', {
    animal: animalEntry.data,
    type: animalEntry.key,
    visitors,
    breed: null
  });
});

// صفحة تفاصيل سلالة محددة من نوع معين
app.get('/animals/cattle/:type/:breed', (req, res) => {
  const type = decodeURIComponent(req.params.type);
  const breedName = decodeURIComponent(req.params.breed);

  const animalEntry = animalsSummary.find(a => a.key === type);
  if (!animalEntry) return res.status(404).send('نوع المواشي غير موجود');

  const breedData = animalEntry.data.السلالات.find(b => b.اسم_السلالة === breedName);
  if (!breedData) return res.status(404).send('السلالة غير موجودة');

  res.render('animals/animal-details', {
    animal: animalEntry.data,
    type: animalEntry.key,
    visitors,
    breed: breedData
  });
});

const birdsData = JSON.parse(fs.readFileSync(path.join(__dirname, 'birds.json'), 'utf8'));
const fishData = JSON.parse(fs.readFileSync(path.join(__dirname, 'fish.json'), 'utf8'));

// صفحة الطيور - عرض القائمة

app.get('/animals/birds', (req, res) => {
  visitors++;  // زيادة الزوار كل زيارة للصفحة
  res.render('animals/birds', { 
    type: 'طيور',
    animals: birdsData,
    visitors: visitors
  });
});


// صفحة تفاصيل طائر معين
app.get('/animals/birds/:birdKey', (req, res) => {
  const birdKey = req.params.birdKey;
  const bird = birdsData.find(b => b["مفتاح"] === birdKey);  // نبحث حسب "مفتاح"
  if (!bird) return res.status(404).send('غير موجود');

  res.render('animals/birds-detail', { type: 'طيور', animal: bird });
});

// صفحة الأسماك - عرض القائمة
app.get('/animals/fish', (req, res) => {
  visitors++; // زيادة عدد الزوار لكل زيارة
  res.render('animals/fish', { 
    type: 'أسماك',
    animals: fishData,
    visitors: visitors
  });
});

// صفحة تفاصيل سمكة معينة
app.get('/animals/fish/:fishKey', (req, res) => {
  const fishKey = req.params.fishKey;
  const fish = fishData.find(f => f["مفتاح"] === fishKey);  // البحث باستخدام مفتاح
  if (!fish) return res.status(404).send('غير موجود');

  res.render('animals/fish-detail', { type: 'أسماك', animal: fish });
});



// عرض نبات معين
app.get('/plant/:plantName', (req, res) => {
  visitors++;
  const plantName = decodeURIComponent(req.params.plantName);
  const plant = data.find(p => p["اسم"] === plantName);
  if (!plant) return res.status(404).send("❌ النبات غير موجود");

  const diseases = plant["الأمراض"] ? Object.keys(plant["الأمراض"]) : [];
  res.render('plant', { plant, diseases, visitors });
});

// عرض مرض معين داخل نبات
app.get('/plant/:plantName/disease/:diseaseName', (req, res) => {
  visitors++;
  const plantName = decodeURIComponent(req.params.plantName);
  const diseaseName = decodeURIComponent(req.params.diseaseName);

  const plant = data.find(p => p["اسم"] === plantName);
  if (!plant) return res.status(404).send("❌ النبات غير موجود");

  const disease = plant["الأمراض"] ? plant["الأمراض"][diseaseName] : null;
  if (!disease) return res.status(404).send("❌ المرض غير موجود");

  res.render('disease', { plant, diseaseName, disease, visitors });
});

// **المسار الجديد** صفحة نسب العناصر المثالية للنباتات
app.get('/plant-nutrient-ranges', (req, res) => {
  visitors++;
  res.render('plant_nutrients', { plantNutrientData, visitors });
});

// تشغيل السيرفر
app.listen(3000, () => {
  console.log('🟢 Server running on http://localhost:3000');
});
