# 📱💻 دليل إنشاء تطبيق APK وبرنامج EXE لنظام مكتبة ومطبعة كيان

---

## 📋 نظرة عامة

تم إنشاء حلول إضافية لنظام مكتبة ومطبعة كيان:

1. **📱 تطبيق APK للأندرويد** - باستخدام Kivy/KivyMD
2. **💻 برنامج EXE للويندوز** - باستخدام Tkinter + PyInstaller

---

## 📱 تطبيق الأندرويد (APK)

### 📁 المجلد: `kayan_library_android/`

### 🎯 المميزات:
- واجهة Material Design عربية
- قاعدة بيانات SQLite محلية
- إدارة المنتجات والعملاء
- نظام فواتير مبسط
- تصميم متجاوب للهواتف

### 🛠️ المتطلبات:
- Python 3.8+
- Kivy 2.1.0
- KivyMD 1.1.1
- Buildozer (لبناء APK)

### 🚀 طريقة البناء:

#### 1. تثبيت المتطلبات:
```bash
# تثبيت Python dependencies
pip install kivy==2.1.0 kivymd==1.1.1

# تثبيت Buildozer (على Linux/Mac)
pip install buildozer

# تثبيت Cython
pip install cython
```

#### 2. إعداد البيئة (Linux/Mac):
```bash
# تثبيت Java JDK
sudo apt-get install openjdk-8-jdk

# تثبيت Android SDK tools
# يمكن تحميلها من موقع Android Developer

# تعيين متغيرات البيئة
export JAVA_HOME=/usr/lib/jvm/java-8-openjdk-amd64
export ANDROID_HOME=/path/to/android-sdk
export PATH=$PATH:$ANDROID_HOME/tools:$ANDROID_HOME/platform-tools
```

#### 3. بناء APK:
```bash
cd kayan_library_android

# تهيئة Buildozer (المرة الأولى فقط)
buildozer init

# بناء APK للتطبيق
buildozer android debug

# أو للإصدار النهائي
buildozer android release
```

#### 4. العثور على APK:
```bash
# ملف APK سيكون في:
./bin/kayanLibrary-1.0-debug.apk
```

### 📋 ملف buildozer.spec:
```ini
[app]
title = مكتبة ومطبعة كيان
package.name = kayanLibrary
package.domain = com.kayan.library
source.dir = .
version = 1.0
requirements = python3,kivy==2.1.0,kivymd==1.1.1,sqlite3,pillow,plyer
orientation = portrait
android.api = 33
android.minapi = 21
android.permissions = INTERNET,WRITE_EXTERNAL_STORAGE,READ_EXTERNAL_STORAGE
```

### 🎨 الواجهة:
- **الشاشة الرئيسية**: بطاقات إحصائية وأزرار سريعة
- **شاشة المنتجات**: قائمة بجميع المنتجات مع إمكانية البحث
- **شاشة إضافة منتج**: نموذج إدخال بسيط
- **شاشة العملاء**: إدارة بيانات العملاء
- **شاشة الفواتير**: إنشاء وعرض الفواتير

---

## 💻 برنامج الويندوز (EXE)

### 📁 المجلد: `kayan_library_exe/`

### 🎯 المميزات:
- واجهة Tkinter عربية احترافية
- قاعدة بيانات SQLite في مجلد المستخدم
- نظام تبويبات متكامل
- لوحة معلومات تفاعلية
- نسخ احتياطي تلقائي
- تقارير قابلة للطباعة

### 🛠️ المتطلبات:
- Python 3.8+
- Tkinter (مدمج مع Python)
- PyInstaller 5.0+
- Windows 10+

### 🚀 طريقة البناء:

#### 1. تثبيت المتطلبات:
```bash
pip install pyinstaller>=5.0
pip install pillow>=9.0.0
```

#### 2. بناء EXE:
```bash
cd kayan_library_exe

# تشغيل سكريبت البناء التلقائي
python build_exe.py

# أو يدوياً باستخدام PyInstaller
pyinstaller --onefile --windowed --name=KayanLibrary main_exe.py
```

#### 3. العثور على EXE:
```bash
# ملف EXE سيكون في:
./release/KayanLibrary.exe
```

### 📋 مواصفات البناء:
```python
# PyInstaller specs
--onefile          # ملف واحد قابل للتشغيل
--windowed          # بدون نافذة console
--name=KayanLibrary # اسم الملف النهائي
--icon=icon.ico     # أيقونة التطبيق
--add-data         # إضافة ملفات إضافية
--hidden-import    # استيرادات مخفية
```

### 🎨 الواجهة:
- **لوحة المعلومات**: إحصائيات ومنتجات منخفضة المخزن
- **تبويب المنتجات**: جدول تفاعلي مع إمكانية البحث والتصفية
- **تبويب العملاء**: إدارة شاملة لبيانات العملاء
- **تبويب الفواتير**: إنشاء وطباعة الفواتير
- **تبويب التقارير**: تقارير مفصلة وإحصائيات

### 💾 تخزين البيانات:
```
C:\Users\[اسم المستخدم]\KayanLibrary\
├── kayan_library.db    # قاعدة البيانات الرئيسية
├── backups\            # مجلد النسخ الاحتياطية
└── reports\            # مجلد التقارير المحفوظة
```

---

## 🔧 الميزات المشتركة

### 📊 قاعدة البيانات:
- **SQLite** محلية وسريعة
- **6 جداول رئيسية** مترابطة
- **بيانات تجريبية** للاختبار
- **نسخ احتياطي** تلقائي

### 🛡️ الأمان:
- تشفير البيانات الحساسة
- التحقق من صحة المدخلات
- حماية من الأخطاء الشائعة
- نسخ احتياطي آمن

### 🌐 اللغة العربية:
- دعم كامل للنصوص العربية
- واجهة RTL (من اليمين لليسار)
- خطوط Unicode متوافقة
- رسائل خطأ باللغة العربية

---

## 🚀 التشغيل والاختبار

### 📱 تطبيق الأندرويد:
```bash
# للاختبار على الكمبيوتر
cd kayan_library_android
python main.py

# لتثبيت APK على الهاتف
adb install bin/kayanLibrary-1.0-debug.apk
```

### 💻 برنامج الويندوز:
```bash
# للاختبار قبل البناء
cd kayan_library_exe
python main_exe.py

# لتشغيل EXE النهائي
./release/KayanLibrary.exe
```

---

## 📦 التوزيع

### 📱 تطبيق الأندرويد:
- **حجم APK**: ~15-25 MB
- **متطلبات النظام**: Android 5.0+ (API 21)
- **الأذونات**: تخزين، إنترنت (اختياري)
- **التوزيع**: Google Play Store أو تثبيت مباشر

### 💻 برنامج الويندوز:
- **حجم EXE**: ~20-30 MB
- **متطلبات النظام**: Windows 10+
- **التثبيت**: لا يتطلب تثبيت، تشغيل مباشر
- **التوزيع**: ملف واحد قابل للنسخ والتشغيل

---

## 🛠️ التخصيص والتطوير

### 🎨 تخصيص الواجهة:
```python
# تغيير الألوان الأساسية
PRIMARY_COLOR = "#2196F3"
SECONDARY_COLOR = "#4CAF50"
ACCENT_COLOR = "#FF9800"

# تخصيص الخطوط
ARABIC_FONT = ('Arial Unicode MS', 12)
TITLE_FONT = ('Arial Unicode MS', 16, 'bold')
```

### 📊 إضافة ميزات جديدة:
```python
# إضافة جدول جديد
def create_new_table(self):
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS NewTable (
            ID INTEGER PRIMARY KEY AUTOINCREMENT,
            Name TEXT NOT NULL,
            CreatedDate DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    ''')

# إضافة شاشة جديدة (Android)
class NewScreen(MDScreen):
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.name = 'new_screen'
        # تصميم الشاشة هنا

# إضافة تبويب جديد (Windows)
def create_new_tab(self):
    new_frame = ttk.Frame(self.notebook)
    self.notebook.add(new_frame, text="تبويب جديد")
```

---

## 🔍 استكشاف الأخطاء

### 📱 مشاكل شائعة في الأندرويد:
```bash
# خطأ في Buildozer
buildozer android clean  # تنظيف الملفات المؤقتة

# مشكلة في Java
export JAVA_HOME=/usr/lib/jvm/java-8-openjdk-amd64

# مشكلة في Android SDK
buildozer android update  # تحديث SDK
```

### 💻 مشاكل شائعة في الويندوز:
```bash
# خطأ في PyInstaller
pip install --upgrade pyinstaller

# مشكلة في الخطوط العربية
# تأكد من وجود Arial Unicode MS في النظام

# مشكلة في قاعدة البيانات
# تحقق من أذونات مجلد المستخدم
```

---

## 📞 الدعم والمساعدة

### 🌐 الموارد:
- **التوثيق الرسمي**: README.md في كل مجلد
- **أمثلة الكود**: ملفات مفصلة مع تعليقات
- **دليل المستخدم**: أدلة خطوة بخطوة

### 📧 الدعم الفني:
- **البريد الإلكتروني**: support@kayan.com
- **الهاتف**: 966xxxxxxxxx
- **الموقع**: https://kayan.com

---

## ✅ قائمة التحقق النهائية

### 📱 تطبيق الأندرويد:
- [ ] تم تثبيت Kivy و KivyMD
- [ ] تم إعداد Buildozer
- [ ] تم بناء APK بنجاح
- [ ] تم اختبار التطبيق على الهاتف
- [ ] جميع الوظائف تعمل بشكل صحيح

### 💻 برنامج الويندوز:
- [ ] تم تثبيت PyInstaller
- [ ] تم بناء EXE بنجاح
- [ ] تم اختبار البرنامج على Windows
- [ ] قاعدة البيانات تعمل بشكل صحيح
- [ ] الواجهة العربية تظهر بشكل سليم

---

*© 2024 مكتبة ومطبعة كيان - جميع الحقوق محفوظة*
