/* ============================================================================
   MKH · بيانات الأعمال والخدمات
   ----------------------------------------------------------------------------
   كل صورة/ملف هنا موجود فعليًا داخل المشروع. ما فيه أي عمل تجريبي أو صورة عشوائية:
   - معاينات العروض = شرائح حقيقية مصدّرة من ملف البوربوينت / صفحات ملف PDF.
   - معاينات الفيديو = إطارات حقيقية مأخوذة من ملفات الفيديو نفسها.
   - أغلفة المواقع = صور الغلاف المستخدمة داخل الموقعين أنفسهما.
   ========================================================================== */
'use strict';

window.MKH_TELEGRAM = 'https://t.me/MKH_ksa';

window.MKH_CATEGORIES = [
  { id: 'all', label: 'الكل' },
  { id: 'logos', label: 'تصميم الشعارات' },
  { id: 'presentations', label: 'العروض التقديمية' },
  { id: 'designs', label: 'التصاميم والإعلانات' },
  { id: 'videos', label: 'الفيديوهات والمونتاج' },
  { id: 'games', label: 'الألعاب التعليمية' },
  { id: 'documents', label: 'المستندات والملفات' },
  { id: 'websites', label: 'تصميم المواقع' }
];

window.MKH_SERVICES = [
  {
    id: 'research',
    icon: 'search',
    name: 'الأبحاث',
    desc: 'من تجميع المصادر وترتيب الأفكار، إلى بحث جاهز ومنسّق بشكل يليق بتسليمك.',
    options: [
      { id: 'research-format', label: 'تنسيق وترتيب بحث جاهز', price: 3, unit: 'للصفحة', qtyMax: 400 },
      { id: 'research-full', label: 'إعداد البحث', price: 5, unit: 'للصفحة', qtyMax: 400 }
    ]
  },
  {
    id: 'deck-static',
    icon: 'slides',
    name: 'عرض بوربوينت ثابت',
    desc: 'شرائح مرتّبة بعناية، تصميم نظيف ومحتوى واضح من أول شريحة لآخرها.',
    options: [{ id: 'ppt-static', label: 'الشريحة', price: 5, unit: 'للشريحة', qtyMax: 400 }]
  },
  {
    id: 'deck-animated',
    icon: 'spark',
    name: 'عرض بوربوينت متحرك',
    desc: 'حركة وانتقالات تخلّي العرض ينبض، ويشدّ الانتباه من أول لحظة.',
    options: [{ id: 'ppt-animated', label: 'الشريحة', price: 10, unit: 'للشريحة', qtyMax: 400 }],
    tag: 'مميّز'
  },
  {
    id: 'cv',
    icon: 'id',
    name: 'تصميم سيرة ذاتية',
    desc: 'سيرة مرتّبة تُبرز خبراتك وتخلّي أول انطباع في صالحك.',
    options: [{ id: 'cv', label: 'تصميم سيرة ذاتية', price: 30, unit: 'للتصميم', qtyMax: 20 }]
  },
  {
    id: 'games',
    icon: 'game',
    name: 'الألعاب التعليمية',
    desc: 'ألعاب تعليمية تجعل الطالب يتعلّم وهو مستمتع — بوربوينت أو Wordwall.',
    options: [
      { id: 'game-ppt', label: 'PowerPoint', price: 30, unit: 'للعبة', qtyMax: 40 },
      { id: 'game-wordwall', label: 'Wordwall', price: 5, unit: 'للّعبة', qtyMax: 200 }
    ]
  },
  {
    id: 'ad',
    icon: 'megaphone',
    name: 'تصميم إعلان',
    desc: 'إعلان يوصل رسالتك بسرعة وبشكل يخلّي العين توقف عنده.',
    options: [{ id: 'ad', label: 'تصميم إعلان', price: 20, unit: 'للتصميم', qtyMax: 60 }],
    tag: 'الأكثر طلبًا'
  },
  {
    id: 'logo',
    icon: 'pen',
    name: 'تصميم شعار',
    desc: 'شعار بسيط وقوي يعبّر عن فكرتك، ويشتغل على الفاتح والغامق.',
    options: [{ id: 'logo', label: 'تصميم شعار', price: 25, unit: 'للشعار', qtyMax: 20 }]
  },
  {
    id: 'brochure',
    icon: 'layers',
    name: 'مطويات وخرائط ذهنية',
    desc: 'معلومة كثيرة… مرتّبة في تصميم سهل القراءة وسريع الفهم.',
    options: [{ id: 'brochure', label: 'مطوية أو خريطة ذهنية', price: 10, unit: 'للتصميم', qtyMax: 80 }]
  },
  {
    id: 'video',
    icon: 'film',
    name: 'مونتاج فيديو',
    desc: 'قص وترتيب وموسيقى وانتقالات، يطلع الفيديو مرتّب وجاهز للنشر.',
    options: [{ id: 'video', label: 'مونتاج', price: 25, unit: 'للدقيقة', qtyMax: 120 }]
  },
  {
    id: 'invitation',
    icon: 'card',
    name: 'كروت دعوة أو تهنئة',
    desc: 'كروت دعوة وتهنئة بتفاصيل أنيقة تناسب المناسبة وقدرها.',
    options: [{ id: 'invitation', label: 'كرت', price: 20, unit: 'للكرت', qtyMax: 200 }]
  },
  {
    id: 'website',
    icon: 'browser',
    name: 'تصميم مواقع',
    desc: 'موقع كامل بهوية واضحة وتجربة استخدام مريحة على الجوال والكمبيوتر.',
    options: [{ id: 'website', label: 'تصميم موقع', price: null, unit: 'حسب المشروع', qtyMax: 1 }],
    tag: 'حسب المشروع'
  }
];

window.MKH_PRICE_NOTE = 'الأسعار المذكورة هي أسعار البداية للخدمات المحددة، والسعر النهائي يعتمد على تفاصيل الطلب ونطاق العمل.';

window.MKH_WORKS = [
  /* ------------------------------------------------------------------ الشعار */
  {
    id: 'logo-mkh',
    title: 'شعار MKH',
    cats: ['logos'],
    eyebrow: 'هوية بصرية',
    ratio: [800, 798],
    cover: 'assets/works/thumbs/logo-mkh-light.jpg',
    coverFull: 'assets/works/logo-mkh-light.jpg',
    coverFit: 'contain',
    desc: 'شعار متجر MKH، هويتنا اللي تجمع الإبداع والبساطة في تصميم واحد.',
    detail: 'كحلي غامق مع ذهبي دافئ، وشكل «V» مستوحى من طيّة الشريط. نفس الهوية اللي تشوفها في كل جزء من هذا الموقع: الأزرار، البطاقات، والأيقونات — كلها خارجة من هذي الألوان بالضبط.',
    note: 'الشعار معروض هنا كما هو بدون أي تعديل على الشكل أو النسب أو الألوان. الخلفيات الفاتحة والداكنة والذهبية مجرد خلفيات عرض مختلفة لنفس الشعار.',
    swatches: [
      { hex: '#1A3149', name: 'كحلي MKH' },
      { hex: '#0C1A28', name: 'كحلي غامق' },
      { hex: '#F5AD1B', name: 'ذهبي MKH' },
      { hex: '#F7F4EE', name: 'عاجي' }
    ],
    gallery: [
      { type: 'image', src: 'assets/works/logo-mkh-light.jpg', label: 'على خلفية فاتحة', fit: 'contain' },
      { type: 'image', src: 'assets/works/logo-mkh-dark.jpg', label: 'على خلفية داكنة', fit: 'contain' },
      { type: 'image', src: 'assets/works/logo-mkh-gold.jpg', label: 'على خلفية ذهبية', fit: 'contain' },
      { type: 'image', src: 'assets/brand/logo-original.png', label: 'ملف الشعار الأصلي', fit: 'contain' }
    ]
  },

  /* ------------------------------------------------------------- المواقع */
  {
    id: 'site-palestine',
    title: 'فلسطين | حكاية وطن',
    cats: ['websites'],
    eyebrow: 'موقع تفاعلي',
    ratio: [900, 600],
    cover: 'assets/works/thumbs/site-palestine-cover.jpg',
    coverFull: 'assets/works/site-palestine-cover.jpg',
    coverTag: 'صورة الغلاف المستخدمة داخل الموقع',
    desc: 'تجربة رقمية تفاعلية تستعرض حكاية فلسطين وهويتها وتراثها وذاكرتها، بأسلوب بصري يجمع بين السرد والتفاعل.',
    detail: 'موقع من عدة أقسام: الخريطة، الخط الزمني، مدن فلسطين، والذاكرة. التنقل فيه سلس، والمحتوى مبني على بطاقات وأقسام تفتح معك واحد بعد الثاني.',
    live: { url: 'https://palestine-interactiv-nv9w.bolt.host/', label: 'palestine-interactiv-nv9w.bolt.host' },
    facts: [
      { k: 'النوع', v: 'موقع تفاعلي متعدد الأقسام' },
      { k: 'المحتوى', v: 'خريطة · خط زمني · مدن · ذاكرة' },
      { k: 'التقنية', v: 'موقع ويب حديث يعمل على الجوال والكمبيوتر' }
    ],
    gallery: [
      { type: 'live', src: 'https://palestine-interactiv-nv9w.bolt.host/', label: 'معاينة مباشرة' },
      { type: 'image', src: 'assets/works/site-palestine-cover.jpg', label: 'صورة من داخل الموقع', fit: 'contain' }
    ]
  },
  {
    id: 'site-yemen',
    title: 'فجر اليمن',
    cats: ['websites'],
    eyebrow: 'منصة تعريفية',
    ratio: [900, 655],
    cover: 'assets/works/thumbs/site-yemen-cover.jpg',
    coverFull: 'assets/works/site-yemen-cover.jpg',
    coverTag: 'صورة الغلاف المستخدمة داخل الموقع',
    desc: 'مشروع رقمي بهوية يمنية، يجمع بين المحتوى التعريفي والتاريخي والتغطية الإعلامية ضمن تجربة تفاعلية.',
    detail: 'منصة فيها أقسام للأخبار والمحافظات والوسائط والمصادر، بهوية لونية مستوحاة من العلم اليمني وترتيب واضح للمحتوى.',
    live: { url: 'https://fajr-al-yemen.bolt.host/', label: 'fajr-al-yemen.bolt.host' },
    facts: [
      { k: 'النوع', v: 'منصة تعريفية وإخبارية' },
      { k: 'الأقسام', v: 'الرئيسية · عن المنصة · الأخبار · المحافظات · الوسائط · المصادر' },
      { k: 'التقنية', v: 'موقع ويب حديث يعمل على الجوال والكمبيوتر' }
    ],
    gallery: [
      { type: 'live', src: 'https://fajr-al-yemen.bolt.host/', label: 'معاينة مباشرة' },
      { type: 'image', src: 'assets/works/site-yemen-cover.jpg', label: 'صورة من داخل الموقع', fit: 'contain' }
    ]
  },

  /* --------------------------------------------------------- العروض التقديمية */
  {
    id: 'deck-animated',
    title: 'عرض تقديمي متحرك',
    cats: ['presentations'],
    eyebrow: 'عرض متحرك',
    ratio: [800, 450],
    cover: 'assets/works/thumbs/deck-slide-1.jpg',
    coverFull: 'assets/works/deck-slide-1.jpg',
    desc: 'عرض من ٩ شرائح بعنوان «مدرسي مسؤوليتي» — تصميم متكامل بحركة وانتقالات ورسومات توضيحية.',
    detail: 'اخترنا لك هنا شرائح حقيقية من العرض نفسه، من الغلاف إلى الخاتمة. العرض جاهز للتشغيل على البوربوينت بحركاته وانتقالاته.',
    note: 'ملف البوربوينت ما ينعرض داخل المتصفح مباشرة، فعرضنا لك كل شرائح العرض كصور حقيقية مصدّرة من الملف. تقدر تحمّل الملف وتشغّله بالبوربوينت وتشوف الحركة.',
    file: { href: 'assets/docs/animated-presentation.pptx', label: 'تحميل العرض (PPTX)', size: '12.9 ميجابايت' },
    gallery: [1, 2, 3, 4, 5, 6, 7, 8, 9].map(function (n) {
      return { type: 'image', src: 'assets/works/deck-slide-' + n + '.jpg', label: 'شريحة ' + n, fit: 'contain' };
    })
  },
  {
    id: 'static-deck',
    title: 'نماذج عروض تقديمية ثابتة',
    cats: ['presentations', 'documents'],
    eyebrow: 'ملف PDF',
    ratio: [850, 478],
    cover: 'assets/works/thumbs/static-slide-1.jpg',
    coverFull: 'assets/works/static-slide-1.jpg',
    desc: 'ملف فيه ١٢ صفحة من تصاميم عروض ثابتة — تنسيق وترتيب وألوان متناسقة.',
    detail: 'هنا ٤ صفحات من الملف كمعاينة سريعة، وتقدر تفتح الملف كامل داخل الموقع بنفس الصفحة.',
    file: { href: 'assets/docs/static-presentations.pdf', label: 'تحميل الملف (PDF)', size: '956 كيلوبايت' },
    gallery: [
      { type: 'pdf', src: 'assets/docs/static-presentations.pdf', label: 'الملف كامل — ١٢ صفحة' },
      { type: 'image', src: 'assets/works/static-slide-1.jpg', label: 'صفحة ١', fit: 'contain' },
      { type: 'image', src: 'assets/works/static-slide-2.jpg', label: 'صفحة ٢', fit: 'contain' },
      { type: 'image', src: 'assets/works/static-slide-3.jpg', label: 'صفحة ٣', fit: 'contain' },
      { type: 'image', src: 'assets/works/static-slide-4.jpg', label: 'صفحة ٤', fit: 'contain' }
    ]
  },

  /* ------------------------------------------------------ التصاميم والإعلانات */
  {
    id: 'ad-school',
    title: 'تصميم إعلان مدرسي',
    cats: ['designs'],
    eyebrow: 'إعلان',
    ratio: [900, 506],
    cover: 'assets/works/thumbs/ad-school-invitation.jpg',
    coverFull: 'assets/works/ad-school-invitation.jpg',
    desc: 'إعلان دعوة لحضور مجلس الأمهات — محاور مرتّبة، ألوان هادئة، ومعلومات واضحة تقرأها بنظرة.',
    detail: 'التصميم بني على تقسيم المعلومات في صناديق مرتبة: العنوان، المحاور، ثم الموعد والمكان. الفكرة إن القارئ يوصل للمعلومة بدون ما يتعب.',
    gallery: [
      { type: 'image', src: 'assets/works/ad-school-invitation.jpg', label: 'التصميم كامل', fit: 'contain' }
    ]
  },
  {
    id: 'cv-design',
    title: 'تصميم سيرة ذاتية',
    cats: ['designs'],
    eyebrow: 'سيرة ذاتية',
    ratio: [900, 1300],
    cover: 'assets/works/thumbs/cv-design-2.jpg',
    coverFull: 'assets/works/cv-design-2.jpg',
    desc: 'سيرة ذاتية بتقسيم واضح: نبذة، تعليم، خبرات، مهارات — مع عمود جانبي للبيانات.',
    detail: 'اعتمدنا عمودين: جانب للمعلومات السريعة (البيانات، اللغات، الشهادات، المهارات) وجانب للتفاصيل. الشكل يخلّي القارئ يلقط أهم شي بسرعة.',
    gallery: [
      { type: 'image', src: 'assets/works/cv-design-2.jpg', label: 'صفحة السيرة الذاتية', fit: 'contain' }
    ]
  },
  {
    id: 'invitation-card',
    title: 'كروت دعوة وتهنئة',
    cats: ['designs'],
    eyebrow: 'كرت دعوة',
    ratio: [900, 575],
    cover: 'assets/works/thumbs/invitation-card.jpg',
    coverFull: 'assets/works/invitation-card.jpg',
    desc: 'كرت دعوة لورشة عمل، بلمسة ذهبية على خلفية عاجية وإطار مزخرف بخفة.',
    detail: 'الذهبي هنا هو البطل: في العنوان، الأيقونات، والإطار. والخلفية العاجية تخلي النص مقروء ومريح للعين.',
    gallery: [
      { type: 'image', src: 'assets/works/invitation-card.jpg', label: 'الكرت كامل', fit: 'contain' }
    ]
  },
  {
    id: 'brochure',
    title: 'مطويات وخرائط ذهنية',
    cats: ['designs'],
    eyebrow: 'مطوية تعليمية',
    ratio: [779, 910],
    cover: 'assets/works/thumbs/brochure-mindmap.jpg',
    coverFull: 'assets/works/brochure-mindmap.jpg',
    desc: 'مطوية من ٤ صفحات لدرس السكان — عنوان واضح، نقاط مرقّمة، وأرقام مقارنة.',
    detail: 'المطوية تصلح للطالب والمعلم: كل صفحة فيها فكرة واحدة، والنقاط مرقّمة عشان الوصول للمعلومة يكون سهل.',
    gallery: [
      { type: 'image', src: 'assets/works/brochure-mindmap.jpg', label: 'الأربع صفحات', fit: 'contain' }
    ]
  },

  /* ------------------------------------------------------- الفيديو والمونتاج */
  {
    id: 'video-editing',
    title: 'مونتاج فيديو',
    cats: ['videos'],
    eyebrow: 'مونتاج',
    ratio: [560, 840],
    cover: 'assets/works/thumbs/video-editing-poster.jpg',
    coverFull: 'assets/works/video-editing-poster.jpg',
    desc: 'نموذج مونتاج بصيغة ريلز عمودية — إيقاع، انتقالات، ونصوص متحركة.',
    detail: 'الفيديو عمودي (٩:١٦) ومناسب للنشر على السوشال. الصورة اللي تشوفها في البطاقة إطار حقيقي مأخوذ من الفيديو نفسه.',
    video: { src: 'assets/video/video-editing-sample.mp4', poster: 'assets/works/video-editing-poster.jpg', w: 512, h: 768, duration: '1:37' },
    gallery: [
      { type: 'video', src: 'assets/video/video-editing-sample.mp4', poster: 'assets/works/video-editing-poster.jpg', label: 'مشاهدة الفيديو', vertical: true }
    ]
  },
  {
    id: 'pptx-game',
    title: 'لعبة تعليمية بالبوربوينت',
    cats: ['games', 'videos'],
    eyebrow: 'لعبة تعليمية',
    ratio: [900, 510],
    cover: 'assets/works/thumbs/pptx-game-poster.jpg',
    coverFull: 'assets/works/pptx-game-poster.jpg',
    desc: 'لعبة «اختر الكيس المناسب لإضاءة اللمبات» — لعبة تفاعلية بالبوربوينت مع فيديو يشرح طريقة اللعب.',
    detail: 'اللعبة تعتمد على الاختيار والتفاعل داخل البوربوينت. الصورة في البطاقة إطار حقيقي من الفيديو، وتقدر تشغّل الفيديو وتعرف كيف تشتغل اللعبة.',
    video: { src: 'assets/video/pptx-game-sample.mp4', poster: 'assets/works/pptx-game-poster.jpg', w: 1908, h: 1080, duration: '0:49' },
    gallery: [
      { type: 'video', src: 'assets/video/pptx-game-sample.mp4', poster: 'assets/works/pptx-game-poster.jpg', label: 'مشاهدة اللعبة' },
      { type: 'image', src: 'assets/works/pptx-game-poster.jpg', label: 'شريحة من اللعبة', fit: 'contain' }
    ]
  },

  /* -------------------------------------------------------- المستندات والملفات */
  {
    id: 'research-paper',
    title: 'إعداد وتنسيق بحث',
    cats: ['documents'],
    eyebrow: 'ملف PDF',
    ratio: [750, 1060],
    cover: 'assets/works/thumbs/research-page-1.jpg',
    coverFull: 'assets/works/research-page-1.jpg',
    desc: 'بحث من ١٨ صفحة بعنوان «تأثير الذكاء الاصطناعي على التعليم» — ترتيب ومنهجية وتنسيق موحّد.',
    detail: 'البحث فيه مقدمة ومشكلة وأهداف ومنهجية ونتائج وتوصيات ومراجع. تقدر تفتح الملف كامل داخل الموقع أو تحمّله.',
    file: { href: 'assets/docs/research-paper.pdf', label: 'تحميل البحث (PDF)', size: '654 كيلوبايت' },
    gallery: [
      { type: 'pdf', src: 'assets/docs/research-paper.pdf', label: 'البحث كامل — ١٨ صفحة' },
      { type: 'image', src: 'assets/works/research-page-1.jpg', label: 'صفحة الغلاف', fit: 'contain' },
      { type: 'image', src: 'assets/works/research-page-2.jpg', label: 'صفحة من البحث', fit: 'contain' },
      { type: 'image', src: 'assets/works/research-page-3.jpg', label: 'صفحة أخرى', fit: 'contain' }
    ]
  }
];

window.MKH_WHY = [
  { icon: 'tag', title: 'أسعار واضحة ومناسبة', text: 'الأسعار معلنة من البداية، وتشوفها قبل أي شي. لا مفاجآت ولا زيادات مخفية.' },
  { icon: 'target', title: 'اهتمام بالتفاصيل والترتيب', text: 'نهتم بالمحاذاة والمسافات وتناسق الألوان — التفاصيل الصغيرة هي اللي تفرق.' },
  { icon: 'grid', title: 'تنوع في الخدمات الرقمية والتعليمية', text: 'من الأبحاث والعروض إلى الفيديو والمواقع والألعاب التعليمية… كل شي في مكان واحد.' },
  { icon: 'shuffle', title: 'تصاميم تناسب احتياج المشروع', text: 'ما نكرّر نفس القالب. كل تصميم يتبنى على فكرتك وجمهورك وطبيعة استخدامه.' },
  { icon: 'chat', title: 'سهولة التواصل والطلب', text: 'افتح تيليجرام، أرسل التفاصيل، ونكمل باتفاق واضح قبل ما نبدأ الشغل.' }
];

window.MKH_STEPS = [
  { n: '01', title: 'اختَر الخدمة اللي تناسبك', text: 'تصفّح الخدمات وشوف الأسعار، واختر اللي يخدم فكرتك.' },
  { n: '02', title: 'أرسل لنا التفاصيل والملفات المطلوبة', text: 'أرسل على تيليجرام كل ما تحتاجه الفكرة: النصوص، الصور، أو أي شي يساعدنا.' },
  { n: '03', title: 'نتفق على التفاصيل والسعر النهائي، ونبدأ الشغل', text: 'نحدد النطاق والسعر النهائي، ونتفق عليه — وبعدها نبدأ فعليًا.' }
];
