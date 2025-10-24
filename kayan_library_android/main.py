#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
تطبيق مكتبة ومطبعة كيان للأندرويد
Kayan Library & Printing Android App

المطور: نظام إدارة متكامل
التاريخ: 2024
الإصدار: 1.0
"""

from kivy.app import App
from kivy.uix.screenmanager import ScreenManager, Screen
from kivy.uix.boxlayout import BoxLayout
from kivy.uix.gridlayout import GridLayout
from kivy.uix.label import Label
from kivy.uix.button import Button
from kivy.uix.textinput import TextInput
from kivy.uix.spinner import Spinner
from kivy.uix.popup import Popup
from kivy.uix.scrollview import ScrollView
from kivy.clock import Clock
from kivy.metrics import dp
from kivy.core.window import Window

from kivymd.app import MDApp
from kivymd.uix.screen import MDScreen
from kivymd.uix.toolbar import MDTopAppBar
from kivymd.uix.navigationdrawer import MDNavigationDrawer, MDNavigationDrawerMenu
from kivymd.uix.list import MDList, OneLineListItem, TwoLineListItem, ThreeLineListItem
from kivymd.uix.card import MDCard
from kivymd.uix.button import MDRaisedButton, MDIconButton, MDFlatButton
from kivymd.uix.textfield import MDTextField
from kivymd.uix.selectioncontrol import MDCheckbox
from kivymd.uix.menu import MDDropdownMenu
from kivymd.uix.dialog import MDDialog
from kivymd.uix.datatables import MDDataTable
from kivymd.uix.boxlayout import MDBoxLayout
from kivymd.uix.floatlayout import MDFloatLayout
from kivymd.uix.gridlayout import MDGridLayout
from kivymd.uix.scrollview import MDScrollView

import sqlite3
import os
from datetime import datetime
import json

class DatabaseManager:
    """مدير قاعدة البيانات للتطبيق"""
    
    def __init__(self):
        self.db_path = "kayan_mobile.db"
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
                SupplierID INTEGER,
                CreatedDate DATETIME DEFAULT CURRENT_TIMESTAMP
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
                CreatedDate DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        # جدول الموردين
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS Suppliers (
                SupplierID INTEGER PRIMARY KEY AUTOINCREMENT,
                SupplierName TEXT NOT NULL,
                Phone TEXT,
                Address TEXT,
                CreatedDate DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        # جدول الفواتير
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS Invoices (
                InvoiceID INTEGER PRIMARY KEY AUTOINCREMENT,
                InvoiceNumber TEXT UNIQUE NOT NULL,
                InvoiceDate DATETIME DEFAULT CURRENT_TIMESTAMP,
                CustomerID INTEGER,
                PaymentMethod TEXT CHECK(PaymentMethod IN ('كاش', 'فيزا', 'آجل')),
                SubTotal REAL DEFAULT 0,
                Discount REAL DEFAULT 0,
                TotalAmount REAL DEFAULT 0,
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
        
        # إدراج بيانات تجريبية
        cursor.execute("SELECT COUNT(*) FROM Products")
        if cursor.fetchone()[0] == 0:
            sample_products = [
                ('قلم جاف أزرق', 'أدوات مكتبية', 1.50, 2.50, 100, 1),
                ('دفتر 100 ورقة', 'أدوات مكتبية', 8.00, 15.00, 50, 1),
                ('كتاب تعليمي', 'كتب', 25.00, 45.00, 20, 1),
                ('طباعة ورقة A4', 'خدمات طباعة', 0.25, 0.50, 0, 1),
            ]
            
            cursor.executemany('''
                INSERT INTO Products (ProductName, Category, PurchasePrice, SalePrice, StockQty, SupplierID)
                VALUES (?, ?, ?, ?, ?, ?)
            ''', sample_products)
            
            # إضافة مورد تجريبي
            cursor.execute('''
                INSERT INTO Suppliers (SupplierName, Phone, Address)
                VALUES ('مكتبة الرياض', '966xxxxxxxxx', 'الرياض، المملكة العربية السعودية')
            ''')
            
            # إضافة عميل تجريبي
            cursor.execute('''
                INSERT INTO Customers (CustomerName, Phone, Address)
                VALUES ('عميل نقدي', '', 'عميل افتراضي للمبيعات النقدية')
            ''')
        
        conn.commit()
        conn.close()
    
    def get_all_products(self):
        """الحصول على جميع المنتجات"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM Products ORDER BY ProductName')
        products = cursor.fetchall()
        conn.close()
        return products
    
    def get_all_customers(self):
        """الحصول على جميع العملاء"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM Customers ORDER BY CustomerName')
        customers = cursor.fetchall()
        conn.close()
        return customers
    
    def add_product(self, name, category, purchase_price, sale_price, stock_qty):
        """إضافة منتج جديد"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        cursor.execute('''
            INSERT INTO Products (ProductName, Category, PurchasePrice, SalePrice, StockQty, SupplierID)
            VALUES (?, ?, ?, ?, ?, 1)
        ''', (name, category, purchase_price, sale_price, stock_qty))
        conn.commit()
        conn.close()
        return True
    
    def create_invoice(self, customer_id, payment_method, items):
        """إنشاء فاتورة جديدة"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # حساب الإجمالي
        subtotal = sum(item['quantity'] * item['unit_price'] for item in items)
        
        # إنشاء رقم فاتورة
        invoice_number = f"INV{datetime.now().strftime('%Y%m%d%H%M%S')}"
        
        # إدراج الفاتورة
        cursor.execute('''
            INSERT INTO Invoices (InvoiceNumber, CustomerID, PaymentMethod, SubTotal, TotalAmount)
            VALUES (?, ?, ?, ?, ?)
        ''', (invoice_number, customer_id, payment_method, subtotal, subtotal))
        
        invoice_id = cursor.lastrowid
        
        # إدراج تفاصيل الفاتورة
        for item in items:
            cursor.execute('''
                INSERT INTO InvoiceDetails (InvoiceID, ProductID, Quantity, UnitPrice, Total)
                VALUES (?, ?, ?, ?, ?)
            ''', (invoice_id, item['product_id'], item['quantity'], item['unit_price'], 
                  item['quantity'] * item['unit_price']))
            
            # تحديث المخزن
            cursor.execute('''
                UPDATE Products SET StockQty = StockQty - ? WHERE ProductID = ?
            ''', (item['quantity'], item['product_id']))
        
        conn.commit()
        conn.close()
        return invoice_id

class MainScreen(MDScreen):
    """الشاشة الرئيسية"""
    
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.name = 'main'
        
        # شريط التطبيق العلوي
        toolbar = MDTopAppBar(
            title="مكتبة ومطبعة كيان",
            elevation=4,
            left_action_items=[["menu", lambda x: self.nav_drawer_open()]],
            right_action_items=[["refresh", lambda x: self.refresh_data()]]
        )
        
        # المحتوى الرئيسي
        main_content = MDBoxLayout(
            orientation='vertical',
            spacing=dp(10),
            adaptive_height=True,
            padding=dp(20)
        )
        
        # بطاقات الإحصائيات
        stats_layout = MDGridLayout(
            cols=2,
            spacing=dp(10),
            adaptive_height=True
        )
        
        # بطاقة المنتجات
        products_card = self.create_stat_card(
            "المنتجات", "0", "package-variant", 
            lambda x: self.go_to_screen('products')
        )
        
        # بطاقة العملاء
        customers_card = self.create_stat_card(
            "العملاء", "0", "account-group", 
            lambda x: self.go_to_screen('customers')
        )
        
        # بطاقة الفواتير
        invoices_card = self.create_stat_card(
            "الفواتير", "0", "file-document", 
            lambda x: self.go_to_screen('invoices')
        )
        
        # بطاقة المبيعات
        sales_card = self.create_stat_card(
            "المبيعات", "0 ريال", "currency-usd", 
            lambda x: self.go_to_screen('reports')
        )
        
        stats_layout.add_widget(products_card)
        stats_layout.add_widget(customers_card)
        stats_layout.add_widget(invoices_card)
        stats_layout.add_widget(sales_card)
        
        # أزرار الإجراءات السريعة
        actions_layout = MDBoxLayout(
            orientation='vertical',
            spacing=dp(10),
            adaptive_height=True
        )
        
        new_invoice_btn = MDRaisedButton(
            text="إنشاء فاتورة جديدة",
            theme_icon_color="Custom",
            icon_color="white",
            md_bg_color="#4CAF50",
            on_release=lambda x: self.go_to_screen('new_invoice')
        )
        
        add_product_btn = MDRaisedButton(
            text="إضافة منتج جديد",
            theme_icon_color="Custom", 
            icon_color="white",
            md_bg_color="#2196F3",
            on_release=lambda x: self.go_to_screen('add_product')
        )
        
        actions_layout.add_widget(new_invoice_btn)
        actions_layout.add_widget(add_product_btn)
        
        main_content.add_widget(stats_layout)
        main_content.add_widget(actions_layout)
        
        # تجميع العناصر
        layout = MDBoxLayout(orientation='vertical')
        layout.add_widget(toolbar)
        layout.add_widget(main_content)
        
        self.add_widget(layout)
    
    def create_stat_card(self, title, value, icon, callback):
        """إنشاء بطاقة إحصائية"""
        card = MDCard(
            orientation='vertical',
            padding=dp(15),
            spacing=dp(10),
            elevation=2,
            radius=[10],
            md_bg_color="#FFFFFF",
            on_release=callback
        )
        
        icon_btn = MDIconButton(
            icon=icon,
            theme_icon_size="Custom",
            icon_size=dp(40),
            theme_icon_color="Custom",
            icon_color="#2196F3"
        )
        
        title_label = Label(
            text=title,
            font_size=dp(16),
            color=(0.2, 0.2, 0.2, 1),
            halign='center'
        )
        
        value_label = Label(
            text=value,
            font_size=dp(20),
            bold=True,
            color=(0.1, 0.1, 0.1, 1),
            halign='center'
        )
        
        card.add_widget(icon_btn)
        card.add_widget(title_label)
        card.add_widget(value_label)
        
        return card
    
    def nav_drawer_open(self):
        """فتح القائمة الجانبية"""
        # سيتم تنفيذها في التطبيق الرئيسي
        pass
    
    def refresh_data(self):
        """تحديث البيانات"""
        # تحديث الإحصائيات
        pass
    
    def go_to_screen(self, screen_name):
        """الانتقال إلى شاشة أخرى"""
        self.manager.current = screen_name

class ProductsScreen(MDScreen):
    """شاشة المنتجات"""
    
    def __init__(self, db_manager, **kwargs):
        super().__init__(**kwargs)
        self.name = 'products'
        self.db_manager = db_manager
        
        # شريط التطبيق
        toolbar = MDTopAppBar(
            title="إدارة المنتجات",
            elevation=4,
            left_action_items=[["arrow-right", lambda x: self.go_back()]],
            right_action_items=[["plus", lambda x: self.add_product()]]
        )
        
        # قائمة المنتجات
        self.products_list = MDList()
        scroll = MDScrollView()
        scroll.add_widget(self.products_list)
        
        # تجميع العناصر
        layout = MDBoxLayout(orientation='vertical')
        layout.add_widget(toolbar)
        layout.add_widget(scroll)
        
        self.add_widget(layout)
        
        # تحميل المنتجات
        self.load_products()
    
    def load_products(self):
        """تحميل قائمة المنتجات"""
        self.products_list.clear_widgets()
        products = self.db_manager.get_all_products()
        
        for product in products:
            item = ThreeLineListItem(
                text=product[1],  # ProductName
                secondary_text=f"الفئة: {product[2]}",  # Category
                tertiary_text=f"السعر: {product[4]} ريال - المخزون: {product[5]}",
                on_release=lambda x, p=product: self.edit_product(p)
            )
            self.products_list.add_widget(item)
    
    def add_product(self):
        """إضافة منتج جديد"""
        self.manager.current = 'add_product'
    
    def edit_product(self, product):
        """تعديل منتج"""
        # سيتم تنفيذها لاحقاً
        pass
    
    def go_back(self):
        """العودة للشاشة الرئيسية"""
        self.manager.current = 'main'

class AddProductScreen(MDScreen):
    """شاشة إضافة منتج"""
    
    def __init__(self, db_manager, **kwargs):
        super().__init__(**kwargs)
        self.name = 'add_product'
        self.db_manager = db_manager
        
        # شريط التطبيق
        toolbar = MDTopAppBar(
            title="إضافة منتج جديد",
            elevation=4,
            left_action_items=[["arrow-right", lambda x: self.go_back()]]
        )
        
        # نموذج إدخال البيانات
        form_layout = MDBoxLayout(
            orientation='vertical',
            spacing=dp(15),
            padding=dp(20),
            adaptive_height=True
        )
        
        # حقول الإدخال
        self.name_field = MDTextField(
            hint_text="اسم المنتج",
            required=True,
            helper_text="أدخل اسم المنتج",
            helper_text_mode="on_focus"
        )
        
        self.category_field = MDTextField(
            hint_text="الفئة",
            text="أدوات مكتبية",
            helper_text="أدوات مكتبية، كتب، خدمات طباعة"
        )
        
        self.purchase_price_field = MDTextField(
            hint_text="سعر الشراء",
            input_filter="float",
            helper_text="بالريال السعودي"
        )
        
        self.sale_price_field = MDTextField(
            hint_text="سعر البيع",
            input_filter="float",
            required=True,
            helper_text="بالريال السعودي"
        )
        
        self.stock_field = MDTextField(
            hint_text="الكمية الأولية",
            input_filter="int",
            text="0",
            helper_text="عدد القطع المتاحة"
        )
        
        # زر الحفظ
        save_btn = MDRaisedButton(
            text="حفظ المنتج",
            md_bg_color="#4CAF50",
            on_release=self.save_product
        )
        
        # إضافة العناصر
        form_layout.add_widget(self.name_field)
        form_layout.add_widget(self.category_field)
        form_layout.add_widget(self.purchase_price_field)
        form_layout.add_widget(self.sale_price_field)
        form_layout.add_widget(self.stock_field)
        form_layout.add_widget(save_btn)
        
        # تجميع العناصر
        scroll = MDScrollView()
        scroll.add_widget(form_layout)
        
        layout = MDBoxLayout(orientation='vertical')
        layout.add_widget(toolbar)
        layout.add_widget(scroll)
        
        self.add_widget(layout)
    
    def save_product(self, instance):
        """حفظ المنتج الجديد"""
        if not self.name_field.text or not self.sale_price_field.text:
            self.show_dialog("خطأ", "يرجى ملء الحقول المطلوبة")
            return
        
        try:
            purchase_price = float(self.purchase_price_field.text or 0)
            sale_price = float(self.sale_price_field.text)
            stock_qty = int(self.stock_field.text or 0)
            
            self.db_manager.add_product(
                self.name_field.text,
                self.category_field.text,
                purchase_price,
                sale_price,
                stock_qty
            )
            
            self.show_dialog("نجح", "تم إضافة المنتج بنجاح", self.go_back)
            
        except ValueError:
            self.show_dialog("خطأ", "يرجى إدخال أرقام صحيحة للأسعار والكمية")
    
    def show_dialog(self, title, text, callback=None):
        """عرض رسالة حوار"""
        dialog = MDDialog(
            title=title,
            text=text,
            buttons=[
                MDFlatButton(
                    text="موافق",
                    on_release=lambda x: (dialog.dismiss(), callback() if callback else None)
                )
            ]
        )
        dialog.open()
    
    def go_back(self):
        """العودة لشاشة المنتجات"""
        # مسح الحقول
        self.name_field.text = ""
        self.category_field.text = "أدوات مكتبية"
        self.purchase_price_field.text = ""
        self.sale_price_field.text = ""
        self.stock_field.text = "0"
        
        self.manager.current = 'products'

class KayanLibraryApp(MDApp):
    """التطبيق الرئيسي"""
    
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.title = "مكتبة ومطبعة كيان"
        self.theme_cls.primary_palette = "Blue"
        self.theme_cls.theme_style = "Light"
        
        # إنشاء مدير قاعدة البيانات
        self.db_manager = DatabaseManager()
    
    def build(self):
        """بناء التطبيق"""
        # إعداد حجم النافذة للاختبار
        Window.size = (360, 640)
        
        # إنشاء مدير الشاشات
        sm = ScreenManager()
        
        # إضافة الشاشات
        sm.add_widget(MainScreen())
        sm.add_widget(ProductsScreen(self.db_manager))
        sm.add_widget(AddProductScreen(self.db_manager))
        
        return sm
    
    def on_start(self):
        """عند بدء التطبيق"""
        pass
    
    def on_pause(self):
        """عند إيقاف التطبيق مؤقتاً"""
        return True
    
    def on_resume(self):
        """عند استئناف التطبيق"""
        pass

if __name__ == '__main__':
    KayanLibraryApp().run()
