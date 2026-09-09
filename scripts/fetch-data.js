var https = require('https');
var fs = require('fs');
var path = require('path');

var SAMPLE_DATA = [
  {
    id: 1,
    title: '三体',
    originalTitle: '三体',
    author: '刘慈欣',
    translator: '',
    language: 'zh',
    category: 'scifi',
    description: '文化大革命如火如荼进行的同时，军方探寻外星文明的绝秘计划“红岸工程”取得了突破性进展。地球文明向宇宙发出的第一声啼鸣，以太阳为中心，以光速向宇宙深处飞驰……',
    coverUrl: 'https://images.unsplash.com/photo-1614728263952-84ea256f9679?w=400&h=560&fit=crop',
    rating: 4.8,
    pages: 302,
    publishYear: 2008,
    isbn: '9787536692930',
    downloadUrl: 'https://example.com/download/santi',
    readUrl: 'https://example.com/read/santi'
  },
  {
    id: 2,
    title: '活着',
    originalTitle: '活着',
    author: '余华',
    translator: '',
    language: 'zh',
    category: 'novel',
    description: '《活着》讲述了农村人福贵悲惨的人生遭遇。福贵本是个阔少爷，可他嗜赌如命，终于赌光了家业，一贫如洗。',
    coverUrl: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=560&fit=crop',
    rating: 4.9,
    pages: 191,
    publishYear: 1993,
    isbn: '9787506365437',
    downloadUrl: 'https://example.com/download/huozhe',
    readUrl: 'https://example.com/read/huozhe'
  },
  {
    id: 3,
    title: 'Steve Jobs',
    originalTitle: 'Steve Jobs',
    author: 'Walter Isaacson',
    translator: '',
    language: 'en',
    category: 'biography',
    description: 'Based on more than forty interviews with Steve Jobs conducted over two years—as well as interviews with more than 100 family members, friends, adversaries, competitors, and colleagues.',
    coverUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=560&fit=crop',
    rating: 4.5,
    pages: 656,
    publishYear: 2011,
    isbn: '9781451648539',
    downloadUrl: 'https://example.com/download/stevejobs',
    readUrl: 'https://example.com/read/stevejobs'
  },
  {
    id: 4,
    title: 'Clean Code',
    originalTitle: 'Clean Code: A Handbook of Agile Software Craftsmanship',
    author: 'Robert C. Martin',
    translator: '',
    language: 'en',
    category: 'programming',
    description: 'Even bad code can function. But if code isn\'t clean, it can bring a development organization to its knees.',
    coverUrl: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&h=560&fit=crop',
    rating: 4.7,
    pages: 464,
    publishYear: 2008,
    isbn: '9780132350884',
    downloadUrl: 'https://example.com/download/cleancode',
    readUrl: 'https://example.com/read/cleancode'
  },
  {
    id: 5,
    title: 'ノルウェイの森',
    originalTitle: 'ノルウェイの森',
    author: '村上春樹',
    translator: '',
    language: 'ja',
    category: 'novel',
    description: '僕は三十七歳で、そのときボーイング747のシートに座っていた。その巨大な飛行機はぶ厚い雨雲をくぐり抜けて降下し、ハンブルク空港に着陸しようとしているところだった。',
    coverUrl: 'https://images.unsplash.com/photo-1520637836862-4d197d17c65a?w=400&h=560&fit=crop',
    rating: 4.6,
    pages: 400,
    publishYear: 1987,
    isbn: '9784062710024',
    downloadUrl: 'https://example.com/download/norwegianwood',
    readUrl: 'https://example.com/read/norwegianwood'
  },
  {
    id: 6,
    title: 'Le Petit Prince',
    originalTitle: 'Le Petit Prince',
    author: 'Antoine de Saint-Exupéry',
    translator: '',
    language: 'fr',
    category: 'novel',
    description: 'Lorsque j\'avais six ans j\'ai vu, une fois, une magnifique image, dans un livre sur la forêt vierge qui s\'appelait \'Histoires vécues\'.',
    coverUrl: 'https://images.unsplash.com/photo-1459767129954-1b1c1f9b9ace?w=400&h=560&fit=crop',
    rating: 4.8,
    pages: 96,
    publishYear: 1943,
    isbn: '9780156012195',
    downloadUrl: 'https://example.com/download/petitprince',
    readUrl: 'https://example.com/read/petitprince'
  },
  {
    id: 7,
    title: 'Cien años de soledad',
    originalTitle: 'Cien años de soledad',
    author: 'Gabriel García Márquez',
    translator: '',
    language: 'es',
    category: 'novel',
    description: 'Muchos años después, frente al pelotón de fusilamiento, el coronel Aureliano Buendía había de recordar aquella tarde remota en que su padre lo llevó a conocer el hielo.',
    coverUrl: 'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?w=400&h=560&fit=crop',
    rating: 4.6,
    pages: 471,
    publishYear: 1967,
    isbn: '9780307474728',
    downloadUrl: 'https://example.com/download/cienaños',
    readUrl: 'https://example.com/read/cienaños'
  },
  {
    id: 8,
    title: '미움받을 용기',
    originalTitle: '미움받을 용기',
    author: '기시미 이치로',
    translator: '',
    language: 'ko',
    category: 'philosophy',
    description: '트라우마는 없다. 인간은 현재를 바꿀 수 있다. 인간관계의 고민에서 벗어나 자유롭게 사는 방법!',
    coverUrl: 'https://images.unsplash.com/photo-1508672019048-805c876b67e2?w=400&h=560&fit=crop',
    rating: 4.4,
    pages: 320,
    publishYear: 2013,
    isbn: '9788991759565',
    downloadUrl: 'https://example.com/download/yonggi',
    readUrl: 'https://example.com/read/yonggi'
  },
  {
    id: 9,
    title: 'Война и мир',
    originalTitle: 'Война и мир',
    author: 'Лев Николаевич Толстой',
    translator: '',
    language: 'ru',
    category: 'history',
    description: 'Eh bien, mon prince. Gênes et Lucques ne sont plus que des apanages, des поместья, de la famille Buonaparte.',
    coverUrl: 'https://images.unsplash.com/photo-1521295121783-8a321d551ad2?w=400&h=560&fit=crop',
    rating: 4.5,
    pages: 1225,
    publishYear: 1869,
    isbn: '9785170891864',
    downloadUrl: 'https://example.com/download/voynaimir',
    readUrl: 'https://example.com/read/voynaimir'
  },
  {
    id: 10,
    title: 'Faust',
    originalTitle: 'Faust',
    author: 'Johann Wolfgang von Goethe',
    translator: '',
    language: 'de',
    category: 'poetry',
    description: 'Habe nun, ach! Philosophie, Juristerei und Medizin, und leider auch Theologie durchaus studiert, mit heißem Bemühn.',
    coverUrl: 'https://images.unsplash.com/photo-1519682337058-a94d519337bc?w=400&h=560&fit=crop',
    rating: 4.3,
    pages: 256,
    publishYear: 1808,
    isbn: '9783150000045',
    downloadUrl: 'https://example.com/download/faust',
    readUrl: 'https://example.com/read/faust'
  }
];

function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function writeSampleData(targetPath) {
  console.log('[fetch-data] 生成示例数据到:', targetPath);
  ensureDir(path.dirname(targetPath));
  fs.writeFileSync(targetPath, JSON.stringify(SAMPLE_DATA, null, 2), 'utf8');
  console.log('[fetch-data] 示例数据写入完成，共 ' + SAMPLE_DATA.length + ' 条');
}

function fetchFromUrl(url, targetPath) {
  return new Promise(function (resolve, reject) {
    console.log('[fetch-data] 正在从 ' + url + ' 获取数据...');
    var req = https.get(url, { timeout: 10000 }, function (res) {
      if (res.statusCode !== 200) {
        reject(new Error('HTTP ' + res.statusCode));
        return;
      }
      var chunks = [];
      res.on('data', function (chunk) { chunks.push(chunk); });
      res.on('end', function () {
        try {
          var body = Buffer.concat(chunks).toString('utf8');
          var data = JSON.parse(body);
          ensureDir(path.dirname(targetPath));
          fs.writeFileSync(targetPath, JSON.stringify(data, null, 2), 'utf8');
          console.log('[fetch-data] 远程数据写入完成，共 ' + (Array.isArray(data) ? data.length : (data.books ? data.books.length : 0)) + ' 条');
          resolve();
        } catch (err) {
          reject(err);
        }
      });
    });
    req.on('timeout', function () {
      req.destroy(new Error('请求超时'));
    });
    req.on('error', reject);
  });
}

function main() {
  var args = process.argv.slice(2);
  var targetDir = path.resolve(__dirname, '..', 'data');
  var targetPath = path.join(targetDir, 'data.json');
  var url = args[0] || process.env.DATA_URL;

  if (url) {
    fetchFromUrl(url, targetPath)
      .catch(function (err) {
        console.warn('[fetch-data] 获取远程数据失败:', err.message);
        console.log('[fetch-data] 回退到生成示例数据');
        writeSampleData(targetPath);
      });
  } else {
    console.log('[fetch-data] 未指定远程 URL，直接生成示例数据');
    writeSampleData(targetPath);
  }
}

main();
