# دليل إنشاء النماذج في Microsoft Access
## نظام إدارة مكتبة ومطبعة كيان

---

## 📋 المحتويات
1. [النموذج الرئيسي للفواتير](#النموذج-الرئيسي-للفواتير)
2. [نموذج إدارة المنتجات](#نموذج-إدارة-المنتجات)
3. [نموذج إدارة العملاء](#نموذج-إدارة-العملاء)
4. [نموذج إدارة الموردين](#نموذج-إدارة-الموردين)
5. [نموذج حركة المخزن](#نموذج-حركة-المخزن)
6. [النموذج الرئيسي للنظام](#النموذج-الرئيسي-للنظام)

---

## 1. النموذج الرئيسي للفواتير

### 🎯 الهدف
إنشاء نموذج متكامل لإدارة الفواتير مع إمكانية إضافة المنتجات وحساب الإجماليات تلقائياً.

### 📝 خطوات الإنشاء

#### الخطوة 1: إنشاء النموذج الأساسي
1. افتح Microsoft Access
2. اذهب إلى **Create** → **Form Design**
3. احفظ النموذج باسم `frm_Invoices`

#### الخطوة 2: إعداد مصدر البيانات
```sql
-- Record Source للنموذج الرئيسي
SELECT Invoices.*, Customers.CustomerName 
FROM Invoices 
LEFT JOIN Customers ON Invoices.CustomerID = Customers.CustomerID
```

#### الخطوة 3: تصميم رأس الفاتورة
**العناصر المطلوبة:**
- **رقم الفاتورة**: `txt_InvoiceNumber` (Text Box)
- **تاريخ الفاتورة**: `txt_InvoiceDate` (Date/Time)
- **العميل**: `cmb_CustomerID` (Combo Box)
- **طريقة الدفع**: `cmb_PaymentMethod` (Combo Box)

**إعدادات Combo Box للعملاء:**
```sql
-- Row Source
SELECT CustomerID, CustomerName FROM Customers WHERE IsActive = True ORDER BY CustomerName
```
- Column Count: 2
- Column Widths: 0";2"
- Bound Column: 1

**إعدادات Combo Box لطريقة الدفع:**
```
كاش;فيزا;آجل;تحويل بنكي
```

#### الخطوة 4: إنشاء Subform لتفاصيل الفاتورة
1. أنشئ نموذج فرعي جديد: `subfrm_InvoiceDetails`
2. اربطه بجدول `InvoiceDetails`

**Record Source للـ Subform:**
```sql
SELECT InvoiceDetails.*, Products.ProductName, Products.SalePrice
FROM InvoiceDetails 
INNER JOIN Products ON InvoiceDetails.ProductID = Products.ProductID
```

**العناصر المطلوبة في الـ Subform:**
- **المنتج**: `cmb_ProductID` (Combo Box)
- **الكمية**: `txt_Quantity` (Number)
- **سعر الوحدة**: `txt_UnitPrice` (Currency)
- **الإجمالي**: `txt_Total` (Currency - محسوب)

#### الخطوة 5: ربط النموذج الفرعي
- **Link Child Fields**: `InvoiceID`
- **Link Master Fields**: `InvoiceID`

#### الخطوة 6: إضافة حقول الحسابات
```vba
' في قسم Form Footer
- الإجمالي الفرعي: =Sum([subfrm_InvoiceDetails].[Form]![Total])
- الخصم: txt_DiscountAmount
- الضريبة: =([SubTotal]-[DiscountAmount])*0.15
- الإجمالي النهائي: =[SubTotal]-[DiscountAmount]+[TaxAmount]
```

### 🔧 كود VBA المطلوب

#### كود حساب الإجمالي في تفاصيل الفاتورة
```vba
Private Sub txt_Quantity_AfterUpdate()
    Me.txt_Total = Me.txt_Quantity * Me.txt_UnitPrice
    Me.Parent.Recalc
End Sub

Private Sub txt_UnitPrice_AfterUpdate()
    Me.txt_Total = Me.txt_Quantity * Me.txt_UnitPrice
    Me.Parent.Recalc
End Sub

Private Sub cmb_ProductID_AfterUpdate()
    If Not IsNull(Me.cmb_ProductID) Then
        Me.txt_UnitPrice = DLookup("SalePrice", "Products", "ProductID=" & Me.cmb_ProductID)
        Me.txt_Total = Me.txt_Quantity * Me.txt_UnitPrice
    End If
End Sub
```

#### كود تحديث المخزن عند حفظ الفاتورة
```vba
Private Sub Form_AfterUpdate()
    Dim rs As DAO.Recordset
    Dim db As DAO.Database
    
    Set db = CurrentDb
    
    ' تحديث المخزن لكل منتج في الفاتورة
    Set rs = db.OpenRecordset("SELECT ProductID, Quantity FROM InvoiceDetails WHERE InvoiceID=" & Me.InvoiceID)
    
    Do While Not rs.EOF
        ' تقليل الكمية من المخزن
        db.Execute "UPDATE Products SET StockQty = StockQty - " & rs!Quantity & " WHERE ProductID = " & rs!ProductID
        
        ' إضافة حركة مخزن
        db.Execute "INSERT INTO StockTransactions (ProductID, TransactionType, Quantity, TransactionDate, ReferenceType, ReferenceID) " & _
                   "VALUES (" & rs!ProductID & ", 'بيع', " & rs!Quantity & ", Now(), 'فاتورة', " & Me.InvoiceID & ")"
        
        rs.MoveNext
    Loop
    
    rs.Close
    Set rs = Nothing
    Set db = Nothing
End Sub
```

---

## 2. نموذج إدارة المنتجات

### 📝 خطوات الإنشاء

#### الخطوة 1: إنشاء النموذج
1. **Create** → **Form Wizard**
2. اختر جدول `Products`
3. اختر **Tabular Layout**
4. احفظ باسم `frm_Products`

#### الخطوة 2: تخصيص النموذج
**العناصر المطلوبة:**
- **اسم المنتج**: `txt_ProductName`
- **الفئة**: `cmb_Category`
- **سعر الشراء**: `txt_PurchasePrice`
- **سعر البيع**: `txt_SalePrice`
- **الكمية**: `txt_StockQty`
- **المورد**: `cmb_SupplierID`

**إعدادات Combo Box للفئات:**
```
أدوات مكتبية;كتب;خدمات طباعة
```

**إعدادات Combo Box للموردين:**
```sql
SELECT SupplierID, SupplierName FROM Suppliers WHERE IsActive = True ORDER BY SupplierName
```

### 🔧 كود VBA للتحقق من البيانات
```vba
Private Sub Form_BeforeUpdate(Cancel As Integer)
    ' التحقق من أن سعر البيع أكبر من سعر الشراء
    If Me.txt_SalePrice <= Me.txt_PurchasePrice Then
        MsgBox "سعر البيع يجب أن يكون أكبر من سعر الشراء", vbExclamation
        Cancel = True
        Me.txt_SalePrice.SetFocus
    End If
    
    ' التحقق من عدم تكرار اسم المنتج
    If DCount("ProductID", "Products", "ProductName='" & Me.txt_ProductName & "' AND ProductID<>" & Nz(Me.ProductID, 0)) > 0 Then
        MsgBox "اسم المنتج موجود بالفعل", vbExclamation
        Cancel = True
        Me.txt_ProductName.SetFocus
    End If
End Sub
```

---

## 3. نموذج إدارة العملاء

### 📝 خطوات الإنشاء

#### الخطوة 1: إنشاء النموذج
1. **Create** → **Form Wizard**
2. اختر جدول `Customers`
3. اختر **Columnar Layout**
4. احفظ باسم `frm_Customers`

#### الخطوة 2: تخصيص النموذج
**العناصر المطلوبة:**
- **اسم العميل**: `txt_CustomerName`
- **الهاتف**: `txt_Phone`
- **الجوال**: `txt_Mobile`
- **العنوان**: `txt_Address`
- **البريد الإلكتروني**: `txt_Email`
- **الرقم الضريبي**: `txt_TaxNumber`

### 🔧 كود VBA للتحقق من البيانات
```vba
Private Sub txt_Email_BeforeUpdate(Cancel As Integer)
    ' التحقق من صحة البريد الإلكتروني
    If Len(Me.txt_Email) > 0 Then
        If InStr(Me.txt_Email, "@") = 0 Or InStr(Me.txt_Email, ".") = 0 Then
            MsgBox "يرجى إدخال بريد إلكتروني صحيح", vbExclamation
            Cancel = True
        End If
    End If
End Sub

Private Sub txt_Phone_BeforeUpdate(Cancel As Integer)
    ' التحقق من صحة رقم الهاتف السعودي
    If Len(Me.txt_Phone) > 0 Then
        If Not (Left(Me.txt_Phone, 2) = "05" And Len(Me.txt_Phone) = 10) Then
            MsgBox "يرجى إدخال رقم هاتف سعودي صحيح (05xxxxxxxx)", vbExclamation
            Cancel = True
        End If
    End If
End Sub
```

---

## 4. نموذج إدارة الموردين

### 📝 خطوات الإنشاء
مشابه لنموذج العملاء مع التركيز على:
- **اسم المورد**: `txt_SupplierName`
- **الهاتف**: `txt_Phone`
- **العنوان**: `txt_Address`
- **البريد الإلكتروني**: `txt_Email`

---

## 5. نموذج حركة المخزن

### 📝 خطوات الإنشاء

#### الخطوة 1: إنشاء النموذج
1. **Create** → **Form Design**
2. احفظ باسم `frm_StockTransactions`

#### الخطوة 2: إعداد مصدر البيانات
```sql
SELECT StockTransactions.*, Products.ProductName 
FROM StockTransactions 
INNER JOIN Products ON StockTransactions.ProductID = Products.ProductID
ORDER BY TransactionDate DESC
```

**العناصر المطلوبة:**
- **المنتج**: `cmb_ProductID`
- **نوع الحركة**: `cmb_TransactionType`
- **الكمية**: `txt_Quantity`
- **تاريخ الحركة**: `txt_TransactionDate`
- **الملاحظات**: `txt_Notes`

### 🔧 كود VBA لتحديث المخزن
```vba
Private Sub Form_AfterUpdate()
    Dim CurrentStock As Long
    Dim NewStock As Long
    
    ' الحصول على الرصيد الحالي
    CurrentStock = DLookup("StockQty", "Products", "ProductID=" & Me.cmb_ProductID)
    
    ' حساب الرصيد الجديد
    Select Case Me.cmb_TransactionType
        Case "شراء", "مرتجع بيع"
            NewStock = CurrentStock + Me.txt_Quantity
        Case "بيع", "مرتجع شراء", "تالف"
            NewStock = CurrentStock - Me.txt_Quantity
        Case "تسوية"
            NewStock = Me.txt_Quantity
    End Select
    
    ' تحديث رصيد المنتج
    CurrentDb.Execute "UPDATE Products SET StockQty=" & NewStock & " WHERE ProductID=" & Me.cmb_ProductID
    
    ' تحديث الرصيد في حركة المخزن
    Me.BalanceAfter = NewStock
End Sub
```

---

## 6. النموذج الرئيسي للنظام

### 📝 خطوات الإنشاء

#### الخطوة 1: إنشاء النموذج الرئيسي
1. **Create** → **Form Design**
2. احفظ باسم `frm_Main`

#### الخطوة 2: إضافة أزرار التنقل
```vba
' زر الفواتير
Private Sub btn_Invoices_Click()
    DoCmd.OpenForm "frm_Invoices"
End Sub

' زر المنتجات
Private Sub btn_Products_Click()
    DoCmd.OpenForm "frm_Products"
End Sub

' زر العملاء
Private Sub btn_Customers_Click()
    DoCmd.OpenForm "frm_Customers"
End Sub

' زر الموردين
Private Sub btn_Suppliers_Click()
    DoCmd.OpenForm "frm_Suppliers"
End Sub

' زر التقارير
Private Sub btn_Reports_Click()
    DoCmd.OpenForm "frm_Reports"
End Sub
```

---

## 🎨 نصائح التصميم

### الألوان والخطوط
- **الخط الأساسي**: Tahoma أو Arial Unicode MS
- **لون الخلفية**: أبيض أو رمادي فاتح
- **لون العناوين**: أزرق داكن (#003366)
- **لون الأزرار**: أخضر (#006600) للحفظ، أحمر (#CC0000) للحذف

### التخطيط
- **عرض النموذج**: 800 بكسل كحد أقصى
- **المسافات**: 0.2 سم بين العناصر
- **محاذاة العناصر**: من اليمين للعربية
- **حجم الخط**: 11 نقطة للنصوص، 14 للعناوين

### إمكانية الوصول
- **Tab Order**: ترتيب منطقي للتنقل
- **Shortcut Keys**: مفاتيح اختصار للوظائف الأساسية
- **Tool Tips**: نصائح مساعدة للمستخدمين

---

## 🔧 الوظائف التلقائية

### ترقيم الفواتير التلقائي
```vba
Private Sub Form_BeforeInsert(Cancel As Integer)
    Dim LastNumber As Long
    LastNumber = Nz(DMax("Right(InvoiceNumber,6)", "Invoices"), 0)
    Me.InvoiceNumber = "INV" & Format(LastNumber + 1, "000000")
End Sub
```

### حفظ تلقائي كل 5 دقائق
```vba
Private Sub Form_Timer()
    If Me.Dirty Then
        DoCmd.RunCommand acCmdSaveRecord
    End If
End Sub
```

---

## 📱 التوافق مع الشاشات المختلفة

### للشاشات الصغيرة
- استخدم **Tab Control** لتقسيم المحتوى
- قلل عدد الأعمدة في الجداول
- استخدم **Scroll Bars** عند الحاجة

### للشاشات الكبيرة
- استفد من المساحة الإضافية لعرض المزيد من المعلومات
- أضف **Dashboard** مع الإحصائيات السريعة
- استخدم **Split Forms** لعرض القائمة والتفاصيل معاً

---

## ✅ قائمة التحقق النهائية

- [ ] جميع النماذج تدعم اللغة العربية
- [ ] الحقول المطلوبة محددة بوضوح
- [ ] التحقق من صحة البيانات مفعل
- [ ] الحسابات التلقائية تعمل بشكل صحيح
- [ ] تحديث المخزن يتم تلقائياً
- [ ] النماذج متجاوبة مع أحجام الشاشات المختلفة
- [ ] أزرار الطباعة والحفظ متاحة
- [ ] رسائل الخطأ واضحة ومفيدة
- [ ] النسخ الاحتياطي يعمل تلقائياً

---

*تم إعداد هذا الدليل لنظام إدارة مكتبة ومطبعة كيان - 2024*

