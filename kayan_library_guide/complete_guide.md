# الدليل الشامل لإنشاء نظام إدارة مكتبة ومطبعة كيان في Microsoft Access

## 📋 المحتويات
1. [مقدمة](#مقدمة)
2. [متطلبات النظام](#متطلبات-النظام)
3. [إنشاء قاعدة البيانات](#إنشاء-قاعدة-البيانات)
4. [إنشاء الجداول](#إنشاء-الجداول)
5. [إنشاء العلاقات](#إنشاء-العلاقات)
6. [إنشاء النماذج](#إنشاء-النماذج)
7. [إنشاء التقارير](#إنشاء-التقارير)
8. [برمجة VBA](#برمجة-vba)
9. [الاختبار والتشغيل](#الاختبار-والتشغيل)

---

## 🎯 مقدمة

هذا الدليل يوضح خطوة بخطوة كيفية إنشاء نظام إدارة متكامل لمكتبة ومطبعة كيان باستخدام Microsoft Access. النظام يتضمن إدارة شاملة للمنتجات والعملاء والموردين والفواتير مع إمكانيات طباعة متقدمة.

### ✨ مميزات النظام
- إدارة شاملة للمنتجات والمخزون
- نظام فواتير متكامل مع حساب تلقائي
- إدارة العملاء والموردين
- تقارير مفصلة قابلة للطباعة
- واجهة عربية سهلة الاستخدام
- نسخ احتياطي تلقائي

---

## 💻 متطلبات النظام

### البرامج المطلوبة
- Microsoft Access 2016 أو أحدث
- Windows 10 أو أحدث
- .NET Framework 4.7 أو أحدث

### المتطلبات التقنية
- معالج: Intel Core i3 أو أفضل
- الذاكرة: 4 جيجابايت RAM كحد أدنى
- مساحة القرص: 2 جيجابايت متاحة
- دقة الشاشة: 1024x768 كحد أدنى

---

## 🗄️ إنشاء قاعدة البيانات

### الخطوة 1: إنشاء قاعدة بيانات جديدة
1. افتح Microsoft Access
2. اختر **Blank database**
3. اكتب اسم قاعدة البيانات: `Kayan_Library_System`
4. اختر المجلد المناسب للحفظ
5. انقر **Create**

### الخطوة 2: إعداد خصائص قاعدة البيانات
1. اذهب إلى **File** → **Info** → **View and edit database properties**
2. املأ المعلومات التالية:
   - **Title**: نظام إدارة مكتبة ومطبعة كيان
   - **Subject**: نظام إدارة متكامل
   - **Author**: مكتبة ومطبعة كيان
   - **Company**: مكتبة ومطبعة كيان
   - **Comments**: نظام إدارة شامل للمكتبات والمطابع

---

## 📊 إنشاء الجداول

### جدول الموردين (Suppliers)

#### الخطوة 1: إنشاء الجدول
1. في شريط **Create**، انقر **Table Design**
2. احفظ الجدول باسم `Suppliers`

#### الخطوة 2: إضافة الحقول
| اسم الحقل | نوع البيانات | الحجم | خصائص إضافية |
|-----------|-------------|-------|---------------|
| SupplierID | AutoNumber | - | Primary Key |
| SupplierName | Short Text | 100 | Required: Yes |
| Phone | Short Text | 20 | - |
| Address | Long Text | - | - |
| Email | Short Text | 100 | - |
| IsActive | Yes/No | - | Default: Yes |
| CreatedDate | Date/Time | - | Default: Now() |
| Notes | Long Text | - | - |

#### الخطوة 3: إعداد الفهارس
1. اذهب إلى **Design** → **Indexes**
2. أضف فهرس على `SupplierName`

### جدول المنتجات (Products)

#### إنشاء الجدول وإضافة الحقول
| اسم الحقل | نوع البيانات | الحجم | خصائص إضافية |
|-----------|-------------|-------|---------------|
| ProductID | AutoNumber | - | Primary Key |
| ProductName | Short Text | 150 | Required: Yes |
| Category | Short Text | 50 | Required: Yes |
| PurchasePrice | Currency | - | Default: 0 |
| SalePrice | Currency | - | Required: Yes |
| StockQty | Number (Long) | - | Default: 0 |
| MinStockLevel | Number (Long) | - | Default: 5 |
| SupplierID | Number (Long) | - | Foreign Key |
| Barcode | Short Text | 50 | - |
| IsActive | Yes/No | - | Default: Yes |
| CreatedDate | Date/Time | - | Default: Now() |
| Description | Long Text | - | - |

#### إعداد قائمة الفئات
1. انقر على حقل `Category`
2. في **Lookup** tab:
   - Display Control: Combo Box
   - Row Source Type: Value List
   - Row Source: `"أدوات مكتبية";"كتب";"خدمات طباعة"`

### جدول العملاء (Customers)

| اسم الحقل | نوع البيانات | الحجم | خصائص إضافية |
|-----------|-------------|-------|---------------|
| CustomerID | AutoNumber | - | Primary Key |
| CustomerName | Short Text | 100 | Required: Yes |
| Phone | Short Text | 20 | - |
| Mobile | Short Text | 20 | - |
| Address | Long Text | - | - |
| Email | Short Text | 100 | - |
| TaxNumber | Short Text | 50 | - |
| CreditLimit | Currency | - | Default: 0 |
| CurrentBalance | Currency | - | Default: 0 |
| IsActive | Yes/No | - | Default: Yes |
| CreatedDate | Date/Time | - | Default: Now() |
| Notes | Long Text | - | - |

### جدول الفواتير (Invoices)

| اسم الحقل | نوع البيانات | الحجم | خصائص إضافية |
|-----------|-------------|-------|---------------|
| InvoiceID | AutoNumber | - | Primary Key |
| InvoiceNumber | Short Text | 20 | Required: Yes, Indexed: No Duplicates |
| InvoiceDate | Date/Time | - | Default: Now() |
| CustomerID | Number (Long) | - | Foreign Key |
| PaymentMethod | Short Text | 20 | Required: Yes |
| SubTotal | Currency | - | Default: 0 |
| DiscountPercent | Number (Single) | - | Default: 0 |
| DiscountAmount | Currency | - | Default: 0 |
| TaxPercent | Number (Single) | - | Default: 15 |
| TaxAmount | Currency | - | Default: 0 |
| TotalAmount | Currency | - | Default: 0 |
| PaidAmount | Currency | - | Default: 0 |
| RemainingAmount | Currency | - | Default: 0 |
| InvoiceStatus | Short Text | 20 | Default: "مفتوحة" |
| DueDate | Date/Time | - | - |
| CreatedBy | Short Text | 50 | - |
| CreatedDate | Date/Time | - | Default: Now() |
| Notes | Long Text | - | - |

#### إعداد قوائم الاختيار
**PaymentMethod:**
- Row Source: `"كاش";"فيزا";"آجل";"تحويل بنكي"`

**InvoiceStatus:**
- Row Source: `"مفتوحة";"مدفوعة";"ملغاة";"مرتجعة"`

### جدول تفاصيل الفواتير (InvoiceDetails)

| اسم الحقل | نوع البيانات | الحجم | خصائص إضافية |
|-----------|-------------|-------|---------------|
| DetailID | AutoNumber | - | Primary Key |
| InvoiceID | Number (Long) | - | Required: Yes, Foreign Key |
| ProductID | Number (Long) | - | Required: Yes, Foreign Key |
| Quantity | Number (Long) | - | Default: 1 |
| UnitPrice | Currency | - | Required: Yes |
| DiscountPercent | Number (Single) | - | Default: 0 |
| DiscountAmount | Currency | - | Default: 0 |
| Total | Currency | - | Required: Yes |
| LineNotes | Short Text | 255 | - |

### جدول حركة المخزن (StockTransactions)

| اسم الحقل | نوع البيانات | الحجم | خصائص إضافية |
|-----------|-------------|-------|---------------|
| TransactionID | AutoNumber | - | Primary Key |
| ProductID | Number (Long) | - | Required: Yes, Foreign Key |
| TransactionType | Short Text | 20 | Required: Yes |
| Quantity | Number (Long) | - | Required: Yes |
| UnitCost | Currency | - | Default: 0 |
| TotalCost | Currency | - | Default: 0 |
| TransactionDate | Date/Time | - | Default: Now() |
| BalanceBefore | Number (Long) | - | Default: 0 |
| BalanceAfter | Number (Long) | - | Default: 0 |
| ReferenceType | Short Text | 20 | - |
| ReferenceID | Number (Long) | - | - |
| CreatedBy | Short Text | 50 | - |
| Notes | Long Text | - | - |

#### إعداد قائمة أنواع الحركات
**TransactionType:**
- Row Source: `"شراء";"بيع";"مرتجع شراء";"مرتجع بيع";"تسوية";"تالف"`

---

## 🔗 إنشاء العلاقات

### الخطوة 1: فتح نافذة العلاقات
1. اذهب إلى **Database Tools** → **Relationships**
2. أضف جميع الجداول إلى النافذة

### الخطوة 2: إنشاء العلاقات

#### العلاقة بين Suppliers و Products
1. اسحب `SupplierID` من جدول `Suppliers` إلى `SupplierID` في جدول `Products`
2. في نافذة **Edit Relationships**:
   - ✅ Enforce Referential Integrity
   - ✅ Cascade Update Related Fields
   - ❌ Cascade Delete Related Records (لحماية البيانات)

#### العلاقة بين Customers و Invoices
1. اسحب `CustomerID` من `Customers` إلى `CustomerID` في `Invoices`
2. فعّل **Referential Integrity** و **Cascade Update**

#### العلاقة بين Invoices و InvoiceDetails
1. اسحب `InvoiceID` من `Invoices` إلى `InvoiceID` في `InvoiceDetails`
2. فعّل جميع الخيارات بما في ذلك **Cascade Delete**

#### العلاقة بين Products و InvoiceDetails
1. اسحب `ProductID` من `Products` إلى `ProductID` في `InvoiceDetails`
2. فعّل **Referential Integrity** و **Cascade Update**

#### العلاقة بين Products و StockTransactions
1. اسحب `ProductID` من `Products` إلى `ProductID` في `StockTransactions`
2. فعّل **Referential Integrity** و **Cascade Update**

---

## 📝 إنشاء النماذج

سيتم تفصيل إنشاء النماذج في الملفات المنفصلة:
- [دليل إنشاء النماذج](forms_guide.md)
- [دليل إنشاء التقارير](reports_guide.md)
- [دليل برمجة VBA](vba_automation_guide.md)

---

## ✅ قائمة التحقق النهائية

### قاعدة البيانات
- [ ] تم إنشاء جميع الجداول بالحقول الصحيحة
- [ ] تم إعداد العلاقات بين الجداول
- [ ] تم إعداد الفهارس المطلوبة
- [ ] تم إدراج البيانات الأولية

### النماذج
- [ ] نموذج إدارة المنتجات
- [ ] نموذج إدارة العملاء
- [ ] نموذج إدارة الموردين
- [ ] نموذج الفواتير الرئيسي
- [ ] نموذج حركة المخزن

### التقارير
- [ ] تقرير طباعة فاتورة A4
- [ ] تقرير طباعة فاتورة B5
- [ ] تقرير حصر المخزون
- [ ] تقرير المبيعات اليومية
- [ ] تقرير المبيعات الشهرية

### البرمجة
- [ ] كود حساب الإجماليات التلقائي
- [ ] كود تحديث المخزن
- [ ] كود توليد أرقام الفواتير
- [ ] كود النسخ الاحتياطي

### الاختبار
- [ ] اختبار إضافة المنتجات
- [ ] اختبار إنشاء الفواتير
- [ ] اختبار تحديث المخزون
- [ ] اختبار طباعة التقارير
- [ ] اختبار النسخ الاحتياطي

---

*تم إعداد هذا الدليل لنظام إدارة مكتبة ومطبعة كيان - 2024*
