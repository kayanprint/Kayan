-- ===================================================================
-- نظام إدارة مكتبة ومطبعة كيان - Microsoft Access Database Structure
-- Kayan Library & Printing Management System - Database Structure
-- ===================================================================

-- ملاحظة: هذا الملف يحتوي على الأوامر SQL لإنشاء قاعدة البيانات في Microsoft Access
-- يمكن تنفيذ هذه الأوامر من خلال Query Design في Access أو استيرادها مباشرة

-- ===================================================================
-- 1. جدول الموردين (Suppliers)
-- ===================================================================
CREATE TABLE Suppliers (
    SupplierID AUTOINCREMENT PRIMARY KEY,
    SupplierName TEXT(100) NOT NULL,
    Phone TEXT(20),
    Address TEXT(255),
    Email TEXT(100),
    CreatedDate DATETIME DEFAULT Now(),
    IsActive YESNO DEFAULT True,
    Notes MEMO
);

-- فهرس على اسم المورد
CREATE INDEX IX_Suppliers_Name ON Suppliers (SupplierName);

-- ===================================================================
-- 2. جدول المنتجات (Products)
-- ===================================================================
CREATE TABLE Products (
    ProductID AUTOINCREMENT PRIMARY KEY,
    ProductName TEXT(150) NOT NULL,
    Category TEXT(50) NOT NULL CHECK (Category IN ('أدوات مكتبية', 'كتب', 'خدمات طباعة')),
    PurchasePrice CURRENCY DEFAULT 0,
    SalePrice CURRENCY NOT NULL,
    StockQty LONG DEFAULT 0,
    MinStockLevel LONG DEFAULT 5,
    MaxStockLevel LONG DEFAULT 100,
    SupplierID LONG,
    Barcode TEXT(50),
    Description MEMO,
    CreatedDate DATETIME DEFAULT Now(),
    IsActive YESNO DEFAULT True,
    CONSTRAINT FK_Products_Suppliers FOREIGN KEY (SupplierID) REFERENCES Suppliers(SupplierID)
);

-- فهارس على جدول المنتجات
CREATE INDEX IX_Products_Name ON Products (ProductName);
CREATE INDEX IX_Products_Category ON Products (Category);
CREATE INDEX IX_Products_Barcode ON Products (Barcode);
CREATE INDEX IX_Products_Supplier ON Products (SupplierID);

-- ===================================================================
-- 3. جدول العملاء (Customers)
-- ===================================================================
CREATE TABLE Customers (
    CustomerID AUTOINCREMENT PRIMARY KEY,
    CustomerName TEXT(100) NOT NULL,
    Phone TEXT(20),
    Mobile TEXT(20),
    Address TEXT(255),
    Email TEXT(100),
    TaxNumber TEXT(50),
    CreditLimit CURRENCY DEFAULT 0,
    CurrentBalance CURRENCY DEFAULT 0,
    CreatedDate DATETIME DEFAULT Now(),
    IsActive YESNO DEFAULT True,
    Notes MEMO
);

-- فهارس على جدول العملاء
CREATE INDEX IX_Customers_Name ON Customers (CustomerName);
CREATE INDEX IX_Customers_Phone ON Customers (Phone);
CREATE INDEX IX_Customers_Mobile ON Customers (Mobile);

-- ===================================================================
-- 4. جدول الفواتير (Invoices)
-- ===================================================================
CREATE TABLE Invoices (
    InvoiceID AUTOINCREMENT PRIMARY KEY,
    InvoiceNumber TEXT(20) UNIQUE NOT NULL,
    InvoiceDate DATETIME DEFAULT Now(),
    CustomerID LONG,
    PaymentMethod TEXT(20) NOT NULL CHECK (PaymentMethod IN ('كاش', 'فيزا', 'آجل', 'تحويل بنكي')),
    SubTotal CURRENCY DEFAULT 0,
    DiscountPercent SINGLE DEFAULT 0,
    DiscountAmount CURRENCY DEFAULT 0,
    TaxPercent SINGLE DEFAULT 15,
    TaxAmount CURRENCY DEFAULT 0,
    TotalAmount CURRENCY DEFAULT 0,
    PaidAmount CURRENCY DEFAULT 0,
    RemainingAmount CURRENCY DEFAULT 0,
    InvoiceStatus TEXT(20) DEFAULT 'مفتوحة' CHECK (InvoiceStatus IN ('مفتوحة', 'مدفوعة', 'ملغاة', 'مرتجعة')),
    DueDate DATETIME,
    CreatedBy TEXT(50),
    CreatedDate DATETIME DEFAULT Now(),
    ModifiedBy TEXT(50),
    ModifiedDate DATETIME,
    Notes MEMO,
    CONSTRAINT FK_Invoices_Customers FOREIGN KEY (CustomerID) REFERENCES Customers(CustomerID)
);

-- فهارس على جدول الفواتير
CREATE INDEX IX_Invoices_Number ON Invoices (InvoiceNumber);
CREATE INDEX IX_Invoices_Date ON Invoices (InvoiceDate);
CREATE INDEX IX_Invoices_Customer ON Invoices (CustomerID);
CREATE INDEX IX_Invoices_Status ON Invoices (InvoiceStatus);

-- ===================================================================
-- 5. جدول تفاصيل الفواتير (InvoiceDetails)
-- ===================================================================
CREATE TABLE InvoiceDetails (
    DetailID AUTOINCREMENT PRIMARY KEY,
    InvoiceID LONG NOT NULL,
    ProductID LONG NOT NULL,
    Quantity LONG DEFAULT 1,
    UnitPrice CURRENCY NOT NULL,
    DiscountPercent SINGLE DEFAULT 0,
    DiscountAmount CURRENCY DEFAULT 0,
    Total CURRENCY NOT NULL,
    LineNotes TEXT(255),
    CONSTRAINT FK_InvoiceDetails_Invoices FOREIGN KEY (InvoiceID) REFERENCES Invoices(InvoiceID) ON DELETE CASCADE,
    CONSTRAINT FK_InvoiceDetails_Products FOREIGN KEY (ProductID) REFERENCES Products(ProductID)
);

-- فهارس على جدول تفاصيل الفواتير
CREATE INDEX IX_InvoiceDetails_Invoice ON InvoiceDetails (InvoiceID);
CREATE INDEX IX_InvoiceDetails_Product ON InvoiceDetails (ProductID);

-- ===================================================================
-- 6. جدول حركة المخزن (StockTransactions)
-- ===================================================================
CREATE TABLE StockTransactions (
    TransactionID AUTOINCREMENT PRIMARY KEY,
    ProductID LONG NOT NULL,
    TransactionType TEXT(20) NOT NULL CHECK (TransactionType IN ('شراء', 'بيع', 'مرتجع شراء', 'مرتجع بيع', 'تسوية', 'تالف')),
    Quantity LONG NOT NULL,
    UnitCost CURRENCY DEFAULT 0,
    TotalCost CURRENCY DEFAULT 0,
    TransactionDate DATETIME DEFAULT Now(),
    BalanceBefore LONG DEFAULT 0,
    BalanceAfter LONG DEFAULT 0,
    ReferenceType TEXT(20),
    ReferenceID LONG,
    CreatedBy TEXT(50),
    Notes MEMO,
    CONSTRAINT FK_StockTransactions_Products FOREIGN KEY (ProductID) REFERENCES Products(ProductID)
);

-- فهارس على جدول حركة المخزن
CREATE INDEX IX_StockTransactions_Product ON StockTransactions (ProductID);
CREATE INDEX IX_StockTransactions_Date ON StockTransactions (TransactionDate);
CREATE INDEX IX_StockTransactions_Type ON StockTransactions (TransactionType);

-- ===================================================================
-- 7. جدول المدفوعات (Payments)
-- ===================================================================
CREATE TABLE Payments (
    PaymentID AUTOINCREMENT PRIMARY KEY,
    InvoiceID LONG NOT NULL,
    PaymentDate DATETIME DEFAULT Now(),
    PaymentMethod TEXT(20) NOT NULL CHECK (PaymentMethod IN ('كاش', 'فيزا', 'آجل', 'تحويل بنكي', 'شيك')),
    Amount CURRENCY NOT NULL,
    ReferenceNumber TEXT(50),
    BankName TEXT(100),
    CheckNumber TEXT(50),
    CheckDate DATETIME,
    CreatedBy TEXT(50),
    Notes MEMO,
    CONSTRAINT FK_Payments_Invoices FOREIGN KEY (InvoiceID) REFERENCES Invoices(InvoiceID)
);

-- فهارس على جدول المدفوعات
CREATE INDEX IX_Payments_Invoice ON Payments (InvoiceID);
CREATE INDEX IX_Payments_Date ON Payments (PaymentDate);

-- ===================================================================
-- 8. جدول إعدادات النظام (SystemSettings)
-- ===================================================================
CREATE TABLE SystemSettings (
    SettingID AUTOINCREMENT PRIMARY KEY,
    SettingKey TEXT(50) UNIQUE NOT NULL,
    SettingValue TEXT(255),
    SettingDescription TEXT(255),
    ModifiedDate DATETIME DEFAULT Now()
);

-- ===================================================================
-- 9. جدول المستخدمين (Users) - اختياري
-- ===================================================================
CREATE TABLE Users (
    UserID AUTOINCREMENT PRIMARY KEY,
    Username TEXT(50) UNIQUE NOT NULL,
    FullName TEXT(100) NOT NULL,
    Password TEXT(255),
    UserRole TEXT(20) DEFAULT 'مستخدم' CHECK (UserRole IN ('مدير', 'مستخدم', 'محاسب')),
    IsActive YESNO DEFAULT True,
    LastLogin DATETIME,
    CreatedDate DATETIME DEFAULT Now()
);

-- ===================================================================
-- إدراج البيانات الأساسية (Initial Data)
-- ===================================================================

-- إعدادات النظام الأساسية
INSERT INTO SystemSettings (SettingKey, SettingValue, SettingDescription) VALUES
('CompanyName', 'مكتبة ومطبعة كيان', 'اسم الشركة'),
('CompanyAddress', 'المملكة العربية السعودية', 'عنوان الشركة'),
('CompanyPhone', '966xxxxxxxxx', 'هاتف الشركة'),
('CompanyEmail', 'info@kayan.com', 'بريد الشركة الإلكتروني'),
('TaxNumber', '123456789012345', 'الرقم الضريبي'),
('TaxRate', '15', 'نسبة الضريبة المضافة'),
('InvoicePrefix', 'INV', 'بادئة رقم الفاتورة'),
('LastInvoiceNumber', '0', 'آخر رقم فاتورة'),
('Currency', 'ريال سعودي', 'العملة المستخدمة'),
('BackupPath', 'C:\Backups\Kayan', 'مسار النسخ الاحتياطي');

-- مورد افتراضي
INSERT INTO Suppliers (SupplierName, Phone, Address, Notes) VALUES
('مورد عام', '966xxxxxxxxx', 'المملكة العربية السعودية', 'مورد افتراضي للمنتجات العامة');

-- عميل نقدي افتراضي
INSERT INTO Customers (CustomerName, Notes) VALUES
('عميل نقدي', 'عميل افتراضي للمبيعات النقدية');

-- منتجات تجريبية
INSERT INTO Products (ProductName, Category, SalePrice, StockQty, SupplierID) VALUES
('قلم جاف أزرق', 'أدوات مكتبية', 2.50, 100, 1),
('دفتر 100 ورقة', 'أدوات مكتبية', 15.00, 50, 1),
('طباعة ورقة A4 ملونة', 'خدمات طباعة', 1.00, 0, 1),
('كتاب تعليمي', 'كتب', 45.00, 20, 1);

-- ===================================================================
-- نهاية ملف إنشاء قاعدة البيانات
-- ===================================================================

-- ملاحظات مهمة:
-- 1. يجب تنفيذ هذه الأوامر بالترتيب المذكور
-- 2. تأكد من تفعيل Referential Integrity في Access
-- 3. يمكن تعديل أحجام الحقول حسب الحاجة
-- 4. تأكد من إعداد النسخ الاحتياطي التلقائي
-- 5. يُنصح بإنشاء مستخدم مدير افتراضي في جدول Users

