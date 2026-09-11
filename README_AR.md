# PROVE IT | STEP Training Lab

منصة تدريب تدريجية قابلة للتعميم:
- Owner / Teacher / Student
- Unit 1 Reading + Grammar
- STEP-style timed practice
- Student progress report
- Teacher class overview + individual student profile
- Owner global dashboard
- PDF/CSV downloads
- GitHub Pages compatible
- Firebase Authentication + Firestore compatible

## قبل النشر
### 1) أنشئي Firebase Web App
من Firebase Console > Project settings > Your apps > Web.

### 2) في `firebase-config.js`
- ضعي بريد المالكة في `ownerEmail`.
- غيري `enabled: false` إلى `enabled: true`.
- الصقي قيم Firebase Web App.

### 3) Authentication
فعلي:
- Email/Password

ملاحظة: حساب الطالبة لا يطلب بريدًا منها. المنصة تولد بريدًا تقنيًا داخليًا من الاسم + كود الفصل وتستخدم PIN كجزء من كلمة مرور داخلية.

### 4) Firestore
أنشئي قاعدة Firestore.
في `firestore.rules` استبدلي:
`YOUR_OWNER_EMAIL@example.com`
ببريد المالكة نفسه، ثم انشري القواعد.

### 5) حساب المالكة
من Firebase Authentication > Users:
أنشئي حسابًا ببريد المالكة وكلمة مرور.
ثم سجلي الدخول من Owner. عند أول دخول ستنشأ وثيقة owner تلقائيًا إذا كان البريد يطابق `ownerEmail`.

### 6) المعلمة
يمكنها إنشاء حساب من شاشة Teacher، ثم إنشاء فصل.
كل فصل يحصل على كود تلقائي مثل `MG1-7KQ4`.

### 7) الطالبة
أول مرة:
- الاسم الكامل
- كود الفصل
- PIN من 4 أرقام
ثم Create My Profile.
في المرات التالية تستخدم نفس البيانات.

## GitHub Pages
ارفعي الملفات كما هي إلى Repository.
ثم:
Settings > Pages > Deploy from a branch > main / root.

الرابط الأساسي يكون:
`https://USERNAME.github.io/REPOSITORY/`

## التقارير
- الطالبة: Download My Report (PDF) + Save PDF عبر الطباعة.
- المعلمة: CSV للفصل/محاولات المعلمة + حفظ الصفحة PDF.
- المالكة: CSV لكل المنصة + حفظ الصفحة PDF.

## ما هو جاهز الآن
### Unit 1 Reading
`Progress towards the future`
النص مأخوذ حرفيًا من كتاب الطالب الذي رفعته المستخدم لهذه المحادثة.

### Unit 1 Grammar
تدريب STEP-style مبني على قواعد الوحدة الأولى:
- Simple Present vs Present Progressive
- Simple Past vs Present Perfect
- Simple Past
- Past Progressive
- Past Progressive + when + Simple Past
- Stative Verbs

## التوسع لاحقًا
لا نعيد بناء المنصة.
نضيف فقط بيانات Unit 2 ثم Unit 3 ... داخل `data.js`.
نفس الحسابات، الفصول، التقارير، وFirebase تستمر.
## تحديث v2 — الداشبورد والتقارير
### الطالبة
لا تحتاج تنزيل تقرير لمتابعة تقدمها.
Dashboard الطالبة تعرض مباشرة:
- نسبة التقدم في التدريبات.
- مستوى Reading.
- مستوى Grammar.
- المستوى العام الحالي.
- تقدم كل وحدة.
- Skill Profile.
- What I Need to Work On.
- آخر النتائج والدرجات والزمن والحالة.
- جميع التدريبات المتاحة.

تم حذف أزرار تنزيل التقرير من واجهة الطالبة.

### المعلمة
Dashboard المعلمة تعرض مباشرة:
- عدد طالبات الفصل.
- نسبة إكمال التدريبات.
- متوسط Reading.
- متوسط Grammar.
- احتياجات الفصل.
- أداء كل مهارة.
- جدول كل الطالبات مع Reading / Grammar / Overall.

للمعلمة خياران للتصدير للفصل المحدد:
- Export PDF
- Export Excel (.xlsx)

ومن ملف الطالبة داخل لوحة المعلمة:
- Export PDF
- Export Excel (.xlsx)
## تحديث v3.1 — النسخة الموصى بنشرها
تم إصلاح ربط Firebase قبل النشر الفعلي:

- `joinCodes`: للتحقق من كود الفصل قبل تسجيل دخول الطالبة.
- لا يمكن عرض قائمة أكواد الفصول؛ يسمح فقط بفحص كود محدد.
- استعلامات المعلمة مقيدة ببياناتها فقط.
- الطالبة تقرأ فصلها ومحاولاتها فقط.
- فتح/قفل الوحدة يتزامن مع بيانات الانضمام.
- تمت إضافة وظائف المسار التلقائي الناقصة في v3.
