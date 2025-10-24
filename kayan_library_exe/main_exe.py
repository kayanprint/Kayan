#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
برنامج مكتبة ومطبعة كيان - إصدار EXE للويندوز
Kayan Library & Printing - Windows EXE Version

المطور: نظام إدارة متكامل
التاريخ: 2024
الإصدار: 1.0
"""

import tkinter as tk
from tkinter import ttk, messagebox, filedialog
import sqlite3
import os
import sys
from datetime import datetime
import json
import webbrowser
from pathlib import Path

# إضافة مسار الموارد للـ EXE
if getattr(sys, 'frozen', False):
    # إذا كان التطبيق مجمد (EXE)
    application_path = sys._MEIPASS
else:
    # إذا كان يعمل كـ script عادي
    application_path = os.path.dirname(os.path.abspath(__file__))

class DatabaseManager:
    """مدير قاعدة البيانات"""
    
    def __init__(self):
        # إنشاء مجلد البيانات في مجلد المستخدم
        self.data_dir = Path.home() / "KayanLibrary"
        self.data_dir.mkdir(exist_ok=True)
        
        self.db_path = self.data_dir / "kayan_library.db"
        self.init_database()
    
    def init_database(self):
        """إنشاء قاعدة البيانات والجداول"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
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
                SupplierID INTEGER,
                CreatedDate DATETIME DEFAULT CURRENT_TIMESTAMP,
                IsActive BOOLEAN DEFAULT 1
            )
        ''')
        
        # جدول العملاء
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS Customers (
                CustomerID INTEGER PRIMARY KEY AUTOINCREMENT,
                CustomerName TEXT NOT NULL,
                Phone TEXT,
                Address TEXT,
                Email TEXT,
                CreatedDate DATETIME DEFAULT CURRENT_TIMESTAMP,
                IsActive BOOLEAN DEFAULT 1
            )
        ''')
        
        # جدول الموردين
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS Suppliers (
                SupplierID INTEGER PRIMARY KEY AUTOINCREMENT,
                SupplierName TEXT NOT NULL,
                Phone TEXT,
                Address TEXT,
                Email TEXT,
                CreatedDate DATETIME DEFAULT CURRENT_TIMESTAMP,
                IsActive BOOLEAN DEFAULT 1
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
                DiscountAmount REAL DEFAULT 0,
                TaxAmount REAL DEFAULT 0,
                TotalAmount REAL DEFAULT 0,
                InvoiceStatus TEXT DEFAULT 'مفتوحة',
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
                Total REAL NOT NULL,
                FOREIGN KEY (InvoiceID) REFERENCES Invoices(InvoiceID),
                FOREIGN KEY (ProductID) REFERENCES Products(ProductID)
            )
        ''')
        
        # جدول حركة المخزن
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS StockTransactions (
                TransactionID INTEGER PRIMARY KEY AUTOINCREMENT,
                ProductID INTEGER NOT NULL,
                TransactionType TEXT CHECK(TransactionType IN ('شراء', 'بيع', 'مرتجع', 'تسوية')),
                Quantity INTEGER NOT NULL,
                TransactionDate DATETIME DEFAULT CURRENT_TIMESTAMP,
                BalanceBefore INTEGER DEFAULT 0,
                BalanceAfter INTEGER DEFAULT 0,
                ReferenceType TEXT,
                ReferenceID INTEGER,
                Notes TEXT,
                FOREIGN KEY (ProductID) REFERENCES Products(ProductID)
            )
        ''')
        
        # إدراج بيانات تجريبية إذا لم تكن موجودة
        cursor.execute("SELECT COUNT(*) FROM Products")
        if cursor.fetchone()[0] == 0:
            self.insert_sample_data(cursor)
        
        conn.commit()
        conn.close()
    
    def insert_sample_data(self, cursor):
        """إدراج بيانات تجريبية"""
        # إضافة مورد تجريبي
        cursor.execute('''
            INSERT INTO Suppliers (SupplierName, Phone, Address, Email)
            VALUES ('مكتبة الرياض', '966xxxxxxxxx', 'الرياض، المملكة العربية السعودية', 'info@riyadh-library.com')
        ''')
        
        # إضافة عميل تجريبي
        cursor.execute('''
            INSERT INTO Customers (CustomerName, Phone, Address)
            VALUES ('عميل نقدي', '', 'عميل افتراضي للمبيعات النقدية')
        ''')
        
        # إضافة منتجات تجريبية
        sample_products = [
            ('قلم جاف أزرق', 'أدوات مكتبية', 1.50, 2.50, 100, 5, 1),
            ('قلم جاف أحمر', 'أدوات مكتبية', 1.50, 2.50, 80, 5, 1),
            ('دفتر 100 ورقة', 'أدوات مكتبية', 8.00, 15.00, 50, 10, 1),
            ('كتاب تعليمي', 'كتب', 25.00, 45.00, 20, 5, 1),
            ('طباعة ورقة A4 ملونة', 'خدمات طباعة', 0.50, 1.00, 0, 0, 1),
            ('مجلد بلاستيك A4', 'أدوات مكتبية', 3.00, 5.00, 75, 10, 1),
        ]
        
        cursor.executemany('''
            INSERT INTO Products (ProductName, Category, PurchasePrice, SalePrice, StockQty, MinStockLevel, SupplierID)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', sample_products)
    
    def get_all_products(self):
        """الحصول على جميع المنتجات"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        cursor.execute('''
            SELECT p.*, s.SupplierName 
            FROM Products p 
            LEFT JOIN Suppliers s ON p.SupplierID = s.SupplierID
            WHERE p.IsActive = 1
            ORDER BY p.ProductName
        ''')
        products = cursor.fetchall()
        conn.close()
        return products
    
    def get_all_customers(self):
        """الحصول على جميع العملاء"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM Customers WHERE IsActive = 1 ORDER BY CustomerName')
        customers = cursor.fetchall()
        conn.close()
        return customers
    
    def add_product(self, name, category, purchase_price, sale_price, stock_qty, min_stock, supplier_id):
        """إضافة منتج جديد"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        cursor.execute('''
            INSERT INTO Products (ProductName, Category, PurchasePrice, SalePrice, StockQty, MinStockLevel, SupplierID)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', (name, category, purchase_price, sale_price, stock_qty, min_stock, supplier_id))
        conn.commit()
        conn.close()
        return True
    
    def add_customer(self, name, phone, address, email):
        """إضافة عميل جديد"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        cursor.execute('''
            INSERT INTO Customers (CustomerName, Phone, Address, Email)
            VALUES (?, ?, ?, ?)
        ''', (name, phone, address, email))
        conn.commit()
        conn.close()
        return True
    
    def create_invoice(self, customer_id, payment_method, items, discount=0):
        """إنشاء فاتورة جديدة"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        try:
            # حساب الإجمالي
            subtotal = sum(item['quantity'] * item['unit_price'] for item in items)
            tax_amount = subtotal * 0.15  # ضريبة 15%
            total_amount = subtotal + tax_amount - discount
            
            # إنشاء رقم فاتورة
            invoice_number = f"INV{datetime.now().strftime('%Y%m%d%H%M%S')}"
            
            # إدراج الفاتورة
            cursor.execute('''
                INSERT INTO Invoices (InvoiceNumber, CustomerID, PaymentMethod, SubTotal, DiscountAmount, TaxAmount, TotalAmount)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            ''', (invoice_number, customer_id, payment_method, subtotal, discount, tax_amount, total_amount))
            
            invoice_id = cursor.lastrowid
            
            # إدراج تفاصيل الفاتورة وتحديث المخزن
            for item in items:
                cursor.execute('''
                    INSERT INTO InvoiceDetails (InvoiceID, ProductID, Quantity, UnitPrice, Total)
                    VALUES (?, ?, ?, ?, ?)
                ''', (invoice_id, item['product_id'], item['quantity'], item['unit_price'], 
                      item['quantity'] * item['unit_price']))
                
                # تحديث المخزن
                self.update_stock(cursor, item['product_id'], 'بيع', item['quantity'], invoice_id)
            
            conn.commit()
            return invoice_id
            
        except Exception as e:
            conn.rollback()
            raise e
        finally:
            conn.close()
    
    def update_stock(self, cursor, product_id, transaction_type, quantity, reference_id=None):
        """تحديث المخزن"""
        # الحصول على الرصيد الحالي
        cursor.execute('SELECT StockQty FROM Products WHERE ProductID = ?', (product_id,))
        current_stock = cursor.fetchone()[0]
        
        # حساب الرصيد الجديد
        if transaction_type in ['شراء', 'مرتجع']:
            new_stock = current_stock + quantity
        elif transaction_type == 'بيع':
            new_stock = current_stock - quantity
        else:  # تسوية
            new_stock = quantity
        
        # تحديث رصيد المنتج
        cursor.execute('UPDATE Products SET StockQty = ? WHERE ProductID = ?', (new_stock, product_id))
        
        # إضافة حركة مخزن
        cursor.execute('''
            INSERT INTO StockTransactions (ProductID, TransactionType, Quantity, BalanceBefore, BalanceAfter, ReferenceType, ReferenceID)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', (product_id, transaction_type, quantity, current_stock, new_stock, 'فاتورة', reference_id))
    
    def get_dashboard_stats(self):
        """الحصول على إحصائيات لوحة المعلومات"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        stats = {}
        
        # عدد المنتجات
        cursor.execute('SELECT COUNT(*) FROM Products WHERE IsActive = 1')
        stats['products'] = cursor.fetchone()[0]
        
        # عدد العملاء
        cursor.execute('SELECT COUNT(*) FROM Customers WHERE IsActive = 1')
        stats['customers'] = cursor.fetchone()[0]
        
        # عدد الفواتير
        cursor.execute('SELECT COUNT(*) FROM Invoices')
        stats['invoices'] = cursor.fetchone()[0]
        
        # إجمالي المبيعات
        cursor.execute('SELECT COALESCE(SUM(TotalAmount), 0) FROM Invoices')
        stats['sales'] = cursor.fetchone()[0]
        
        # المنتجات منخفضة المخزن
        cursor.execute('SELECT COUNT(*) FROM Products WHERE StockQty <= MinStockLevel AND IsActive = 1')
        stats['low_stock'] = cursor.fetchone()[0]
        
        conn.close()
        return stats
    
    def get_low_stock_products(self):
        """الحصول على المنتجات منخفضة المخزن"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        cursor.execute('''
            SELECT ProductName, StockQty, MinStockLevel
            FROM Products 
            WHERE StockQty <= MinStockLevel AND IsActive = 1
            ORDER BY StockQty
        ''')
        products = cursor.fetchall()
        conn.close()
        return products
    
    def backup_database(self, backup_path):
        """إنشاء نسخة احتياطية"""
        try:
            import shutil
            shutil.copy2(self.db_path, backup_path)
            return True
        except Exception as e:
            return False, str(e)

class KayanLibraryApp:
    """التطبيق الرئيسي"""
    
    def __init__(self):
        self.root = tk.Tk()
        self.root.title("مكتبة ومطبعة كيان - نظام إدارة متكامل")
        self.root.geometry("1200x800")
        self.root.state('zoomed')  # تكبير النافذة
        
        # تعيين الأيقونة (إذا كانت متوفرة)
        try:
            icon_path = os.path.join(application_path, "icon.ico")
            if os.path.exists(icon_path):
                self.root.iconbitmap(icon_path)
        except:
            pass
        
        # إنشاء مدير قاعدة البيانات
        self.db_manager = DatabaseManager()
        
        # إعداد الخطوط العربية
        self.setup_fonts()
        
        # إعداد الواجهة الرئيسية
        self.setup_main_interface()
        
        # تحديث الإحصائيات
        self.update_dashboard()
    
    def setup_fonts(self):
        """إعداد الخطوط العربية"""
        self.arabic_font = ('Arial Unicode MS', 12)
        self.title_font = ('Arial Unicode MS', 16, 'bold')
        self.header_font = ('Arial Unicode MS', 14, 'bold')
    
    def setup_main_interface(self):
        """إعداد الواجهة الرئيسية"""
        # إنشاء القائمة العلوية
        self.create_menu()
        
        # إنشاء شريط الأدوات
        self.create_toolbar()
        
        # إنشاء النوت بوك للتبويبات
        self.notebook = ttk.Notebook(self.root)
        self.notebook.pack(fill='both', expand=True, padx=10, pady=5)
        
        # إنشاء التبويبات
        self.create_dashboard_tab()
        self.create_products_tab()
        self.create_customers_tab()
        self.create_invoices_tab()
        self.create_reports_tab()
        
        # شريط الحالة
        self.create_status_bar()
    
    def create_menu(self):
        """إنشاء القائمة العلوية"""
        menubar = tk.Menu(self.root)
        self.root.config(menu=menubar)
        
        # قائمة ملف
        file_menu = tk.Menu(menubar, tearoff=0)
        menubar.add_cascade(label="ملف", menu=file_menu)
        file_menu.add_command(label="نسخة احتياطية", command=self.backup_database)
        file_menu.add_separator()
        file_menu.add_command(label="خروج", command=self.root.quit)
        
        # قائمة عرض
        view_menu = tk.Menu(menubar, tearoff=0)
        menubar.add_cascade(label="عرض", menu=view_menu)
        view_menu.add_command(label="تحديث البيانات", command=self.refresh_all_data)
        
        # قائمة مساعدة
        help_menu = tk.Menu(menubar, tearoff=0)
        menubar.add_cascade(label="مساعدة", menu=help_menu)
        help_menu.add_command(label="حول البرنامج", command=self.show_about)
    
    def create_toolbar(self):
        """إنشاء شريط الأدوات"""
        toolbar = tk.Frame(self.root, bg='lightgray', height=40)
        toolbar.pack(fill='x', padx=5, pady=2)
        
        # أزرار شريط الأدوات
        tk.Button(toolbar, text="🏠 الرئيسية", font=self.arabic_font, 
                 command=lambda: self.notebook.select(0)).pack(side='left', padx=2)
        
        tk.Button(toolbar, text="📦 منتج جديد", font=self.arabic_font, 
                 command=self.add_new_product).pack(side='left', padx=2)
        
        tk.Button(toolbar, text="👤 عميل جديد", font=self.arabic_font, 
                 command=self.add_new_customer).pack(side='left', padx=2)
        
        tk.Button(toolbar, text="🧾 فاتورة جديدة", font=self.arabic_font, 
                 command=self.create_new_invoice).pack(side='left', padx=2)
        
        # زر التحديث على اليمين
        tk.Button(toolbar, text="🔄 تحديث", font=self.arabic_font, 
                 command=self.refresh_all_data).pack(side='right', padx=2)
    
    def create_status_bar(self):
        """إنشاء شريط الحالة"""
        self.status_bar = tk.Label(self.root, text="جاهز", bd=1, relief='sunken', anchor='w')
        self.status_bar.pack(side='bottom', fill='x')
    
    def create_dashboard_tab(self):
        """إنشاء تبويب لوحة المعلومات"""
        dashboard_frame = ttk.Frame(self.notebook)
        self.notebook.add(dashboard_frame, text="📊 لوحة المعلومات")
        
        # عنوان لوحة المعلومات
        title_label = tk.Label(dashboard_frame, text="لوحة معلومات مكتبة ومطبعة كيان", 
                              font=self.title_font, fg='navy')
        title_label.pack(pady=10)
        
        # إطار الإحصائيات
        stats_frame = tk.Frame(dashboard_frame)
        stats_frame.pack(fill='x', padx=20, pady=10)
        
        # بطاقات الإحصائيات
        self.stats_cards = {}
        
        # الصف الأول من البطاقات
        row1_frame = tk.Frame(stats_frame)
        row1_frame.pack(fill='x', pady=5)
        
        self.stats_cards['products'] = self.create_stat_card(row1_frame, "المنتجات", "0", "#3498db")
        self.stats_cards['customers'] = self.create_stat_card(row1_frame, "العملاء", "0", "#2ecc71")
        self.stats_cards['invoices'] = self.create_stat_card(row1_frame, "الفواتير", "0", "#e74c3c")
        self.stats_cards['sales'] = self.create_stat_card(row1_frame, "المبيعات", "0 ريال", "#f39c12")
        
        # المنتجات منخفضة المخزن
        low_stock_frame = tk.LabelFrame(dashboard_frame, text="⚠️ منتجات منخفضة المخزن", 
                                       font=self.header_font, fg='red')
        low_stock_frame.pack(fill='both', expand=True, padx=20, pady=10)
        
        # جدول المنتجات منخفضة المخزن
        columns = ('اسم المنتج', 'الكمية المتاحة', 'الحد الأدنى')
        self.low_stock_tree = ttk.Treeview(low_stock_frame, columns=columns, show='headings', height=8)
        
        for col in columns:
            self.low_stock_tree.heading(col, text=col)
            self.low_stock_tree.column(col, width=150, anchor='center')
        
        # شريط التمرير للجدول
        scrollbar = ttk.Scrollbar(low_stock_frame, orient='vertical', command=self.low_stock_tree.yview)
        self.low_stock_tree.configure(yscrollcommand=scrollbar.set)
        
        self.low_stock_tree.pack(side='left', fill='both', expand=True)
        scrollbar.pack(side='right', fill='y')
    
    def create_stat_card(self, parent, title, value, color):
        """إنشاء بطاقة إحصائية"""
        card_frame = tk.Frame(parent, bg=color, relief='raised', bd=2)
        card_frame.pack(side='left', fill='both', expand=True, padx=5)
        
        title_label = tk.Label(card_frame, text=title, font=self.header_font, 
                              bg=color, fg='white')
        title_label.pack(pady=(10, 5))
        
        value_label = tk.Label(card_frame, text=value, font=('Arial Unicode MS', 20, 'bold'), 
                              bg=color, fg='white')
        value_label.pack(pady=(0, 10))
        
        return value_label
    
    def update_dashboard(self):
        """تحديث لوحة المعلومات"""
        stats = self.db_manager.get_dashboard_stats()
        
        # تحديث بطاقات الإحصائيات
        self.stats_cards['products'].config(text=str(stats['products']))
        self.stats_cards['customers'].config(text=str(stats['customers']))
        self.stats_cards['invoices'].config(text=str(stats['invoices']))
        self.stats_cards['sales'].config(text=f"{stats['sales']:.2f} ريال")
        
        # تحديث جدول المنتجات منخفضة المخزن
        for item in self.low_stock_tree.get_children():
            self.low_stock_tree.delete(item)
        
        low_stock_products = self.db_manager.get_low_stock_products()
        for product in low_stock_products:
            self.low_stock_tree.insert('', 'end', values=product)
        
        # تحديث شريط الحالة
        self.status_bar.config(text=f"آخر تحديث: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    def run(self):
        """تشغيل التطبيق"""
        self.root.mainloop()

if __name__ == '__main__':
    app = KayanLibraryApp()
    app.run()
