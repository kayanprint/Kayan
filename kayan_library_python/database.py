#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
مدير قاعدة البيانات لنظام مكتبة ومطبعة كيان
Database Manager for Kayan Library & Printing System
"""

import sqlite3
import os
from datetime import datetime
import json
import shutil

class DatabaseManager:
    def __init__(self, db_path="kayan_library.db"):
        """تهيئة مدير قاعدة البيانات"""
        self.db_path = db_path
        self.connection = None
        self.connect()
        self.create_tables()
        self.insert_initial_data()
        
    def connect(self):
        """الاتصال بقاعدة البيانات"""
        try:
            self.connection = sqlite3.connect(self.db_path, check_same_thread=False)
            self.connection.row_factory = sqlite3.Row
            return True
        except sqlite3.Error as e:
            print(f"خطأ في الاتصال بقاعدة البيانات: {e}")
            return False
            
    def create_tables(self):
        """إنشاء الجداول"""
        cursor = self.connection.cursor()
        
        try:
            # جدول الموردين
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS Suppliers (
                    SupplierID INTEGER PRIMARY KEY AUTOINCREMENT,
                    SupplierName TEXT NOT NULL,
                    Phone TEXT,
                    Address TEXT,
                    Email TEXT,
                    IsActive BOOLEAN DEFAULT 1,
                    CreatedDate DATETIME DEFAULT CURRENT_TIMESTAMP,
                    Notes TEXT
                )
            ''')
            
            # جدول المنتجات
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS Products (
                    ProductID INTEGER PRIMARY KEY AUTOINCREMENT,
                    ProductName TEXT NOT NULL,
                    Category TEXT CHECK(Category IN ('أدوات مكتبية', 'كتب', 'خدمات طباعة')),
                    PurchasePrice REAL DEFAULT 0,
                    SalePrice REAL NOT NULL,
                    StockQty INTEGER DEFAULT 0,
                    MinStockLevel INTEGER DEFAULT 5,
                    MaxStockLevel INTEGER DEFAULT 100,
                    SupplierID INTEGER,
                    Barcode TEXT,
                    IsActive BOOLEAN DEFAULT 1,
                    CreatedDate DATETIME DEFAULT CURRENT_TIMESTAMP,
                    Description TEXT,
                    FOREIGN KEY (SupplierID) REFERENCES Suppliers(SupplierID)
                )
            ''')
            
            # جدول العملاء
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS Customers (
                    CustomerID INTEGER PRIMARY KEY AUTOINCREMENT,
                    CustomerName TEXT NOT NULL,
                    Phone TEXT,
                    Mobile TEXT,
                    Address TEXT,
                    Email TEXT,
                    TaxNumber TEXT,
                    CreditLimit REAL DEFAULT 0,
                    CurrentBalance REAL DEFAULT 0,
                    IsActive BOOLEAN DEFAULT 1,
                    CreatedDate DATETIME DEFAULT CURRENT_TIMESTAMP,
                    Notes TEXT
                )
            ''')
            
            # جدول الفواتير
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS Invoices (
                    InvoiceID INTEGER PRIMARY KEY AUTOINCREMENT,
                    InvoiceNumber TEXT UNIQUE NOT NULL,
                    InvoiceDate DATETIME DEFAULT CURRENT_TIMESTAMP,
                    CustomerID INTEGER,
                    PaymentMethod TEXT CHECK(PaymentMethod IN ('كاش', 'فيزا', 'آجل', 'تحويل بنكي')),
                    SubTotal REAL DEFAULT 0,
                    DiscountPercent REAL DEFAULT 0,
                    DiscountAmount REAL DEFAULT 0,
                    TaxPercent REAL DEFAULT 15,
                    TaxAmount REAL DEFAULT 0,
                    TotalAmount REAL DEFAULT 0,
                    PaidAmount REAL DEFAULT 0,
                    RemainingAmount REAL DEFAULT 0,
                    InvoiceStatus TEXT DEFAULT 'مفتوحة' CHECK(InvoiceStatus IN ('مفتوحة', 'مدفوعة', 'ملغاة', 'مرتجعة')),
                    DueDate DATETIME,
                    CreatedBy TEXT,
                    CreatedDate DATETIME DEFAULT CURRENT_TIMESTAMP,
                    Notes TEXT,
                    FOREIGN KEY (CustomerID) REFERENCES Customers(CustomerID)
                )
            ''')
            
            # جدول تفاصيل الفواتير
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS InvoiceDetails (
                    DetailID INTEGER PRIMARY KEY AUTOINCREMENT,
                    InvoiceID INTEGER NOT NULL,
                    ProductID INTEGER NOT NULL,
                    Quantity INTEGER DEFAULT 1,
                    UnitPrice REAL NOT NULL,
                    DiscountPercent REAL DEFAULT 0,
                    DiscountAmount REAL DEFAULT 0,
                    Total REAL NOT NULL,
                    LineNotes TEXT,
                    FOREIGN KEY (InvoiceID) REFERENCES Invoices(InvoiceID) ON DELETE CASCADE,
                    FOREIGN KEY (ProductID) REFERENCES Products(ProductID)
                )
            ''')
            
            # جدول حركة المخزن
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS StockTransactions (
                    TransactionID INTEGER PRIMARY KEY AUTOINCREMENT,
                    ProductID INTEGER NOT NULL,
                    TransactionType TEXT CHECK(TransactionType IN ('شراء', 'بيع', 'مرتجع شراء', 'مرتجع بيع', 'تسوية', 'تالف')),
                    Quantity INTEGER NOT NULL,
                    UnitCost REAL DEFAULT 0,
                    TotalCost REAL DEFAULT 0,
                    TransactionDate DATETIME DEFAULT CURRENT_TIMESTAMP,
                    BalanceBefore INTEGER DEFAULT 0,
                    BalanceAfter INTEGER DEFAULT 0,
                    ReferenceType TEXT,
                    ReferenceID INTEGER,
                    CreatedBy TEXT,
                    Notes TEXT,
                    FOREIGN KEY (ProductID) REFERENCES Products(ProductID)
                )
            ''')
            
            # جدول المدفوعات
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS Payments (
                    PaymentID INTEGER PRIMARY KEY AUTOINCREMENT,
                    InvoiceID INTEGER NOT NULL,
                    PaymentDate DATETIME DEFAULT CURRENT_TIMESTAMP,
                    PaymentMethod TEXT CHECK(PaymentMethod IN ('كاش', 'فيزا', 'آجل', 'تحويل بنكي', 'شيك')),
                    Amount REAL NOT NULL,
                    ReferenceNumber TEXT,
                    BankName TEXT,
                    CheckNumber TEXT,
                    CheckDate DATETIME,
                    CreatedBy TEXT,
                    Notes TEXT,
                    FOREIGN KEY (InvoiceID) REFERENCES Invoices(InvoiceID)
                )
            ''')
            
            # جدول إعدادات النظام
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS SystemSettings (
                    SettingID INTEGER PRIMARY KEY AUTOINCREMENT,
                    SettingKey TEXT UNIQUE NOT NULL,
                    SettingValue TEXT,
                    SettingDescription TEXT,
                    ModifiedDate DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            ''')
            
            self.connection.commit()
            return True
            
        except sqlite3.Error as e:
            print(f"خطأ في إنشاء الجداول: {e}")
            return False
            
    def insert_initial_data(self):
        """إدراج البيانات الأولية"""
        cursor = self.connection.cursor()
        
        try:
            # التحقق من وجود البيانات الأولية
            cursor.execute("SELECT COUNT(*) FROM SystemSettings")
            if cursor.fetchone()[0] > 0:
                return  # البيانات موجودة بالفعل
                
            # إعدادات النظام الأساسية
            settings = [
                ('CompanyName', 'مكتبة ومطبعة كيان', 'اسم الشركة'),
                ('CompanyAddress', 'المملكة العربية السعودية', 'عنوان الشركة'),
                ('CompanyPhone', '966xxxxxxxxx', 'هاتف الشركة'),
                ('CompanyEmail', 'info@kayan.com', 'بريد الشركة الإلكتروني'),
                ('TaxNumber', '123456789012345', 'الرقم الضريبي'),
                ('TaxRate', '15', 'نسبة الضريبة المضافة'),
                ('InvoicePrefix', 'INV', 'بادئة رقم الفاتورة'),
                ('LastInvoiceNumber', '0', 'آخر رقم فاتورة'),
                ('Currency', 'ريال سعودي', 'العملة المستخدمة'),
                ('BackupPath', './backups/', 'مسار النسخ الاحتياطي'),
            ]
            
            cursor.executemany(
                "INSERT INTO SystemSettings (SettingKey, SettingValue, SettingDescription) VALUES (?, ?, ?)",
                settings
            )
            
            # مورد افتراضي
            cursor.execute(
                "INSERT INTO Suppliers (SupplierName, Phone, Address, Notes) VALUES (?, ?, ?, ?)",
                ('مورد عام', '966xxxxxxxxx', 'المملكة العربية السعودية', 'مورد افتراضي للمنتجات العامة')
            )
            
            # عميل نقدي افتراضي
            cursor.execute(
                "INSERT INTO Customers (CustomerName, Notes) VALUES (?, ?)",
                ('عميل نقدي', 'عميل افتراضي للمبيعات النقدية')
            )
            
            # منتجات تجريبية
            products = [
                ('قلم جاف أزرق', 'أدوات مكتبية', 1.50, 2.50, 100, 1),
                ('دفتر 100 ورقة', 'أدوات مكتبية', 10.00, 15.00, 50, 1),
                ('طباعة ورقة A4 ملونة', 'خدمات طباعة', 0.50, 1.00, 0, 1),
                ('كتاب تعليمي', 'كتب', 30.00, 45.00, 20, 1),
                ('مجلد بلاستيك', 'أدوات مكتبية', 3.00, 5.00, 75, 1),
            ]
            
            cursor.executemany(
                "INSERT INTO Products (ProductName, Category, PurchasePrice, SalePrice, StockQty, SupplierID) VALUES (?, ?, ?, ?, ?, ?)",
                products
            )
            
            self.connection.commit()
            
        except sqlite3.Error as e:
            print(f"خطأ في إدراج البيانات الأولية: {e}")
            
    # ==================== وظائف المنتجات ====================
    
    def get_all_products(self):
        """الحصول على جميع المنتجات"""
        cursor = self.connection.cursor()
        cursor.execute('''
            SELECT p.*, s.SupplierName 
            FROM Products p 
            LEFT JOIN Suppliers s ON p.SupplierID = s.SupplierID
            WHERE p.IsActive = 1
            ORDER BY p.ProductName
        ''')
        return cursor.fetchall()
        
    def add_product(self, product_data):
        """إضافة منتج جديد"""
        cursor = self.connection.cursor()
        try:
            cursor.execute('''
                INSERT INTO Products (ProductName, Category, PurchasePrice, SalePrice, StockQty, SupplierID, Barcode, Description)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ''', product_data)
            self.connection.commit()
            return cursor.lastrowid
        except sqlite3.Error as e:
            print(f"خطأ في إضافة المنتج: {e}")
            return None
            
    def update_product(self, product_id, product_data):
        """تحديث منتج"""
        cursor = self.connection.cursor()
        try:
            cursor.execute('''
                UPDATE Products 
                SET ProductName=?, Category=?, PurchasePrice=?, SalePrice=?, StockQty=?, SupplierID=?, Barcode=?, Description=?
                WHERE ProductID=?
            ''', product_data + (product_id,))
            self.connection.commit()
            return True
        except sqlite3.Error as e:
            print(f"خطأ في تحديث المنتج: {e}")
            return False
            
    def delete_product(self, product_id):
        """حذف منتج (حذف منطقي)"""
        cursor = self.connection.cursor()
        try:
            cursor.execute("UPDATE Products SET IsActive = 0 WHERE ProductID = ?", (product_id,))
            self.connection.commit()
            return True
        except sqlite3.Error as e:
            print(f"خطأ في حذف المنتج: {e}")
            return False
            
    # ==================== وظائف العملاء ====================
    
    def get_all_customers(self):
        """الحصول على جميع العملاء"""
        cursor = self.connection.cursor()
        cursor.execute("SELECT * FROM Customers WHERE IsActive = 1 ORDER BY CustomerName")
        return cursor.fetchall()
        
    def add_customer(self, customer_data):
        """إضافة عميل جديد"""
        cursor = self.connection.cursor()
        try:
            cursor.execute('''
                INSERT INTO Customers (CustomerName, Phone, Mobile, Address, Email, TaxNumber, Notes)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            ''', customer_data)
            self.connection.commit()
            return cursor.lastrowid
        except sqlite3.Error as e:
            print(f"خطأ في إضافة العميل: {e}")
            return None
            
    # ==================== وظائف الموردين ====================
    
    def get_all_suppliers(self):
        """الحصول على جميع الموردين"""
        cursor = self.connection.cursor()
        cursor.execute("SELECT * FROM Suppliers WHERE IsActive = 1 ORDER BY SupplierName")
        return cursor.fetchall()
        
    def add_supplier(self, supplier_data):
        """إضافة مورد جديد"""
        cursor = self.connection.cursor()
        try:
            cursor.execute('''
                INSERT INTO Suppliers (SupplierName, Phone, Address, Email, Notes)
                VALUES (?, ?, ?, ?, ?)
            ''', supplier_data)
            self.connection.commit()
            return cursor.lastrowid
        except sqlite3.Error as e:
            print(f"خطأ في إضافة المورد: {e}")
            return None
            
    # ==================== وظائف الفواتير ====================
    
    def get_all_invoices(self):
        """الحصول على جميع الفواتير"""
        cursor = self.connection.cursor()
        cursor.execute('''
            SELECT i.*, c.CustomerName 
            FROM Invoices i 
            LEFT JOIN Customers c ON i.CustomerID = c.CustomerID
            ORDER BY i.InvoiceDate DESC
        ''')
        return cursor.fetchall()
        
    def create_invoice(self, invoice_data, invoice_details):
        """إنشاء فاتورة جديدة"""
        cursor = self.connection.cursor()
        try:
            # إنشاء رقم فاتورة جديد
            invoice_number = self.generate_invoice_number()
            invoice_data = (invoice_number,) + invoice_data
            
            # إدراج الفاتورة
            cursor.execute('''
                INSERT INTO Invoices (InvoiceNumber, CustomerID, PaymentMethod, SubTotal, DiscountAmount, TaxAmount, TotalAmount, Notes)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ''', invoice_data)
            
            invoice_id = cursor.lastrowid
            
            # إدراج تفاصيل الفاتورة
            for detail in invoice_details:
                cursor.execute('''
                    INSERT INTO InvoiceDetails (InvoiceID, ProductID, Quantity, UnitPrice, Total)
                    VALUES (?, ?, ?, ?, ?)
                ''', (invoice_id,) + detail)
                
                # تحديث المخزن
                self.update_stock(detail[0], 'بيع', detail[1], invoice_id)
                
            self.connection.commit()
            return invoice_id
            
        except sqlite3.Error as e:
            print(f"خطأ في إنشاء الفاتورة: {e}")
            self.connection.rollback()
            return None
            
    def generate_invoice_number(self):
        """توليد رقم فاتورة جديد"""
        cursor = self.connection.cursor()
        cursor.execute("SELECT SettingValue FROM SystemSettings WHERE SettingKey = 'LastInvoiceNumber'")
        last_number = int(cursor.fetchone()[0])
        new_number = last_number + 1
        
        # تحديث آخر رقم فاتورة
        cursor.execute("UPDATE SystemSettings SET SettingValue = ? WHERE SettingKey = 'LastInvoiceNumber'", (str(new_number),))
        
        # إنشاء رقم الفاتورة
        cursor.execute("SELECT SettingValue FROM SystemSettings WHERE SettingKey = 'InvoicePrefix'")
        prefix = cursor.fetchone()[0]
        
        return f"{prefix}{new_number:06d}"
        
    # ==================== وظائف المخزن ====================
    
    def update_stock(self, product_id, transaction_type, quantity, reference_id=None):
        """تحديث المخزن"""
        cursor = self.connection.cursor()
        try:
            # الحصول على الرصيد الحالي
            cursor.execute("SELECT StockQty FROM Products WHERE ProductID = ?", (product_id,))
            current_stock = cursor.fetchone()[0]
            
            # حساب الرصيد الجديد
            if transaction_type in ['شراء', 'مرتجع بيع']:
                new_stock = current_stock + quantity
            elif transaction_type in ['بيع', 'مرتجع شراء', 'تالف']:
                new_stock = current_stock - quantity
            else:  # تسوية
                new_stock = quantity
                
            # تحديث رصيد المنتج
            cursor.execute("UPDATE Products SET StockQty = ? WHERE ProductID = ?", (new_stock, product_id))
            
            # إضافة حركة مخزن
            cursor.execute('''
                INSERT INTO StockTransactions (ProductID, TransactionType, Quantity, BalanceBefore, BalanceAfter, ReferenceType, ReferenceID)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            ''', (product_id, transaction_type, quantity, current_stock, new_stock, 'فاتورة', reference_id))
            
            return True
            
        except sqlite3.Error as e:
            print(f"خطأ في تحديث المخزن: {e}")
            return False
            
    def get_low_stock_products(self, limit=10):
        """الحصول على المنتجات منخفضة المخزن"""
        cursor = self.connection.cursor()
        cursor.execute('''
            SELECT ProductName, StockQty, MinStockLevel
            FROM Products 
            WHERE StockQty <= MinStockLevel AND IsActive = 1
            ORDER BY StockQty
            LIMIT ?
        ''', (limit,))
        return cursor.fetchall()
        
    # ==================== وظائف الإحصائيات ====================
    
    def get_dashboard_stats(self):
        """الحصول على إحصائيات لوحة المعلومات"""
        cursor = self.connection.cursor()
        
        stats = {}
        
        # عدد المنتجات
        cursor.execute("SELECT COUNT(*) FROM Products WHERE IsActive = 1")
        stats['products'] = cursor.fetchone()[0]
        
        # عدد العملاء
        cursor.execute("SELECT COUNT(*) FROM Customers WHERE IsActive = 1")
        stats['customers'] = cursor.fetchone()[0]
        
        # عدد الفواتير
        cursor.execute("SELECT COUNT(*) FROM Invoices")
        stats['invoices'] = cursor.fetchone()[0]
        
        # إجمالي المبيعات
        cursor.execute("SELECT COALESCE(SUM(TotalAmount), 0) FROM Invoices WHERE InvoiceStatus != 'ملغاة'")
        stats['sales'] = cursor.fetchone()[0]
        
        return stats
        
    # ==================== وظائف النسخ الاحتياطي ====================
    
    def create_backup(self, backup_path=None):
        """إنشاء نسخة احتياطية"""
        if not backup_path:
            backup_path = f"./backups/kayan_backup_{datetime.now().strftime('%Y%m%d_%H%M%S')}.db"
            
        try:
            # إنشاء مجلد النسخ الاحتياطي إذا لم يكن موجوداً
            os.makedirs(os.path.dirname(backup_path), exist_ok=True)
            
            # نسخ قاعدة البيانات
            shutil.copy2(self.db_path, backup_path)
            return backup_path
            
        except Exception as e:
            print(f"خطأ في إنشاء النسخة الاحتياطية: {e}")
            return None
            
    def restore_backup(self, backup_path):
        """استعادة نسخة احتياطية"""
        try:
            # إغلاق الاتصال الحالي
            self.connection.close()
            
            # استعادة النسخة الاحتياطية
            shutil.copy2(backup_path, self.db_path)
            
            # إعادة الاتصال
            self.connect()
            return True
            
        except Exception as e:
            print(f"خطأ في استعادة النسخة الاحتياطية: {e}")
            return False
            
    def close(self):
        """إغلاق الاتصال بقاعدة البيانات"""
        if self.connection:
            self.connection.close()

