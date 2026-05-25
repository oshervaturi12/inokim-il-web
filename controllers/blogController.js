const factory = require('./handlerFactory')
const Blog = require('./../models/Blog')

exports.getAllBlogs = factory.getAll(Blog)

exports.createBlog = factory.createOne(Blog)

exports.getBlog = factory.getOne(Blog)

exports.updateBlog = factory.updateOne(Blog)

exports.deleteBlog = factory.deleteOne(Blog)





async function seedBlogPosts() {



  const posts = [
    {
      title: 'איך לבחור קורקינט חשמלי שמתאים לך?',
      slug: 'איך-לבחור-קורקינט-חשמלי-שמתאים-לך',
      excerpt: 'מתלבטים איזה קורקינט חשמלי הכי מתאים לכם? הנה המדריך שיעזור לכם לבחור נכון.',
      content: `<h2>הקדמה</h2>
<p>קורקינט חשמלי הוא כלי תחבורה יעיל, נוח וחסכוני שמתאים למגוון שימושים.</p>
<h2>מה לבדוק לפני רכישה?</h2>
<ul>
  <li>טווח נסיעה</li>
  <li>מהירות מקסימלית</li>
  <li>יכולת קיפול ומשקל</li>
  <li>נוחות בולמים ובטיחות</li>
</ul>
<p>כל הדגמים שלנו ב-Inokim נבדקים בקפידה ועומדים בתקנים המחמירים ביותר.</p>`,
      tags: ['קורקינט', 'מדריך רכישה', 'השוואה'],
      coverImage: '/optimized/blog/blog4.png',
      author: "67bf81cdd4481836bfd31f13",
      isPublished: true,
      publishedAt: new Date(),
    },
    {
      title: 'הבדלים בין דגמי Inokim: OX, Quick ו-Light',
      slug: 'הבדלים-בין-דגמי-inokim-ox-quick-light',
      excerpt: 'ב-Inokim תמצאו מגוון דגמים, אז איך יודעים מה מתאים לכם? הנה ההשוואה המקיפה.',
      content: `<h2>השוואת הדגמים</h2>
<table>
  <tr><th>דגם</th><th>מהירות</th><th>טווח</th><th>משקל</th></tr>
  <tr><td>OX</td><td>25 קמ"ש</td><td>60 ק"מ</td><td>26 ק"ג</td></tr>
  <tr><td>Quick</td><td>25 קמ"ש</td><td>45 ק"מ</td><td>18 ק"ג</td></tr>
  <tr><td>Light</td><td>25 קמ"ש</td><td>35 ק"מ</td><td>13 ק"ג</td></tr>
</table>
<p>כל הדגמים מגיעים עם אחריות מלאה של Inokim.</p>`,
      tags: ['השוואת דגמים', 'קורקינטים חשמליים'],
      coverImage: '/optimized/blog/blog3.JPG',
      author: "67bf81cdd4481836bfd31f13",
      isPublished: true,
      publishedAt: new Date(),
    },
    {
      title: 'אביזרים שחובה שיהיו לך עם הקורקינט החשמלי שלך',
      slug: 'אביזרים-שחובה-שיהיו-לך-עם-הקורקינט-החשמלי-שלך',
      excerpt: 'אביזרים משלימים הם לא רק עניין של סטייל – הם הופכים את הרכיבה לבטוחה, נוחה ומהנה יותר.',
      content: `<ul>
  <li>קסדה תקנית</li>
  <li>נעילת אבטחה איכותית</li>
  <li>תאורת לילה</li>
  <li>תיק נשיאה לקורקינט</li>
</ul>
<p>בדקו את כל האביזרים המקוריים של Inokim באתר.</p>`,
      tags: ['אביזרים לקורקינט', 'בטיחות', 'קורקינט'],
      coverImage: '/optimized/blog/blog1.JPG',
      author: "67bf81cdd4481836bfd31f13",
      isPublished: true,
      publishedAt: new Date(),
    },
    {
      title: 'איך לשמור על הסוללה של הקורקינט החשמלי לאורך זמן',
      slug: 'איך-לשמור-על-הסוללה-של-הקורקינט-החשמלי-לאורך-זמן',
      excerpt: 'סוללה תקינה היא הלב של הקורקינט. הנה טיפים לתחזוקה נכונה שתאריך את חיי הסוללה שלך.',
      content: `<ul>
  <li>אל תטעינו עד 100% כל הזמן</li>
  <li>הימנעו מהטענה מלאה ופריקה מלאה</li>
  <li>אחסנו את הקורקינט במקום יבש ומוצל</li>
  <li>הימנעו מהטענה בטמפרטורות קיצוניות</li>
</ul>`,
      tags: ['סוללה', 'תחזוקה', 'קורקינט'],
      coverImage: '/optimized/blog/blog1.JPG',
      author: "67bf81cdd4481836bfd31f13",
      isPublished: true,
      publishedAt: new Date(),
    },
    {
      title: 'מסלולים מומלצים לרכיבה על קורקינט בתל אביב והסביבה',
      slug: 'מסלולים-מומלצים-לרכיבה-על-קורקינט-בתל-אביב-והסביבה',
      excerpt: 'תכננתם לצאת לרכיבה? הנה כמה מסלולים שווים בקורקינט של Inokim ברחבי תל אביב.',
      content: `<ol>
  <li>שדרות רוטשילד</li>
  <li>נמל תל אביב לאורך הטיילת</li>
  <li>פארק הירקון</li>
  <li>יפו העתיקה עד הטיילת</li>
</ol>
<p>אל תשכחו קסדה ומצב סוללה מלא!</p>`,
      tags: ['תל אביב', 'רכיבה', 'מסלולים'],
      coverImage: '/optimized/blog/blog2.JPG',
      author: "67bf81cdd4481836bfd31f13",
      isPublished: true,
      publishedAt: new Date(),
    },
    {
      title: 'האם קורקינט חשמלי מתאים לילדים? כל מה שצריך לדעת',
      slug: 'האם-קורקינט-חשמלי-מתאים-לילדים-כל-מה-שצריך-לדעת',
      excerpt: 'הילדים מבקשים קורקינט חשמלי? הנה כל המידע על הגיל המומלץ, הבטיחות והחוק.',
      content: `<p>לפי החוק בישראל, הגיל המינימלי לרכיבה הוא 16. עם זאת, יש קורקינטים קטנים יותר שמתאימים גם לגילים נמוכים יותר לשימוש בשטחים פרטיים בלבד.</p>
<p>בכל מקרה, תמיד חשוב לוודא שיש קסדה, מגני ברכיים ופיקוח הורי.</p>`,
      tags: ['קורקינט לילדים', 'בטיחות ילדים'],
      coverImage: '/optimized/blog/blog4.png',
      author: "67bf81cdd4481836bfd31f13",
      isPublished: true,
      publishedAt: new Date(),
    },
    {
      title: 'למה כדאי לבחור בקורקינט של Inokim?',
      slug: 'למה-כדאי-לבחור-בקורקינט-של-inokim',
      excerpt: 'Inokim מובילה את שוק הקורקינטים בישראל – אבל מה באמת הופך אותה לבחירה הנכונה?',
      content: `<ul>
  <li>עיצוב פרימיום ישראלי</li>
  <li>שירות לקוחות זמין ופרוס בכל הארץ</li>
  <li>אביזרים מקוריים ואחריות מלאה</li>
  <li>עמידה בתקנים מחמירים</li>
</ul>
<p>Inokim – כשאיכות פוגשת ניידות.</p>`,
      tags: ['יתרונות Inokim', 'קורקינטים בישראל'],
      coverImage: '/optimized/blog/blog1.JPG',
      author: "67bf81cdd4481836bfd31f13",
      isPublished: true,
      publishedAt: new Date(),
    }
  ];

  await Blog.insertMany(posts);
  console.log('✅ Blog posts inserted');
}

//   seedBlogPosts();