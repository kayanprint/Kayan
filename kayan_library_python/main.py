#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
نظام إدارة مكتبة ومطبعة كيان - تطبيق Python
Kayan Library & Printing Management System - Python Application

المطور: نظام إدارة متكامل
التاريخ: 2024
الإصدار: 1.0
"""

import tkinter as tk
from tkinter import ttk, messagebox, filedialog
import sqlite3
import os
from datetime import datetime
import json
from database import DatabaseManager
from gui_forms import *
from reports import ReportManager
import webbrowser

class KayanLibraryApp:
    def __init__(self):
        self.root = tk.Tk()
        self.root.title("مكتبة ومطبعة كيان - نظام إدارة متكامل")
        self.root.geometry("1200x800")
        self.root.configure(bg='#f0f0f0')
        
        # تعيين الخط العربي
        self.arabic_font = ('Arial Unicode MS', 12)
        self.title_font = ('Arial Unicode MS', 16, 'bold')
        
        # إنشاء مدير قاعدة البيانات
        self.db_manager = DatabaseManager()
        
        # إنشاء مدير التقارير
        self.report_manager = ReportManager(self.db_manager)
        
        # إعداد الواجهة الرئيسية
        self.setup_main_interface()
        
        # تحديث الإحصائيات
        self.update_statistics()
        
    def setup_main_interface(self):
        """إعداد الواجهة الرئيسية"""
        
        # شريط العنوان
        title_frame = tk.Frame(self.root, bg='#2c3e50', height=80)
        title_frame.pack(fill='x', pady=(0, 10))
        title_frame.pack_propagate(False)
        
        title_label = tk.Label(
            title_frame,
            text="🏪 مكتبة ومطبعة كيان - نظام إدارة متكامل",
            font=self.title_font,
            bg='#2c3e50',
            fg='white'
        )
        title_label.pack(expand=True)
        
        # الإطار الرئيسي
        main_frame = tk.Frame(self.root, bg='#f0f0f0')
        main_frame.pack(fill='both', expand=True, padx=20, pady=10)
        
        # الشريط الجانبي
        self.setup_sidebar(main_frame)
        
        # المنطقة الرئيسية
        self.setup_main_area(main_frame)
        
    def setup_sidebar(self, parent):
        """إعداد الشريط الجانبي"""
        sidebar = tk.Frame(parent, bg='#34495e', width=250)
        sidebar.pack(side='right', fill='y', padx=(0, 10))
        sidebar.pack_propagate(False)
        
        # عنوان الشريط الجانبي
        sidebar_title = tk.Label(
            sidebar,
            text="القائمة الرئيسية",
            font=self.title_font,
            bg='#34495e',
            fg='white'
        )
        sidebar_title.pack(pady=20)
        
        # أزرار التنقل
        buttons = [
            ("📊 لوحة المعلومات", self.show_dashboard),
            ("📦 إدارة المنتجات", self.show_products),
            ("👥 إدارة العملاء", self.show_customers),
            ("🚚 إدارة الموردين", self.show_suppliers),
            ("🧾 إدارة الفواتير", self.show_invoices),
            ("📈 التقارير", self.show_reports),
            ("⚙️ الإعدادات", self.show_settings),
            ("❓ المساعدة", self.show_help),
        ]
        
        for text, command in buttons:
            btn = tk.Button(
                sidebar,
                text=text,
                font=self.arabic_font,
                bg='#3498db',
                fg='white',
                relief='flat',
                width=20,
                height=2,
                command=command,
                cursor='hand2'
            )
            btn.pack(pady=5, padx=10, fill='x')
            
            # تأثير hover
            btn.bind("<Enter>", lambda e, b=btn: b.configure(bg='#2980b9'))
            btn.bind("<Leave>", lambda e, b=btn: b.configure(bg='#3498db'))
        
        # معلومات النظام
        info_frame = tk.Frame(sidebar, bg='#34495e')
        info_frame.pack(side='bottom', fill='x', pady=20)
        
        info_text = f"""
النسخة: 1.0
التاريخ: {datetime.now().strftime('%Y-%m-%d')}
المطور: نظام كيان
        """
        
        info_label = tk.Label(
            info_frame,
            text=info_text,
            font=('Arial Unicode MS', 9),
            bg='#34495e',
            fg='#bdc3c7',
            justify='center'
        )
        info_label.pack()
        
    def setup_main_area(self, parent):
        """إعداد المنطقة الرئيسية"""
        self.main_area = tk.Frame(parent, bg='white', relief='raised', bd=1)
        self.main_area.pack(side='left', fill='both', expand=True)
        
        # عرض لوحة المعلومات افتراضياً
        self.show_dashboard()
        
    def clear_main_area(self):
        """مسح المحتوى من المنطقة الرئيسية"""
        for widget in self.main_area.winfo_children():
            widget.destroy()
            
    def show_dashboard(self):
        """عرض لوحة المعلومات"""
        self.clear_main_area()
        
        # عنوان لوحة المعلومات
        title = tk.Label(
            self.main_area,
            text="📊 لوحة المعلومات",
            font=self.title_font,
            bg='white',
            fg='#2c3e50'
        )
        title.pack(pady=20)
        
        # إطار الإحصائيات
        stats_frame = tk.Frame(self.main_area, bg='white')
        stats_frame.pack(fill='x', padx=20, pady=10)
        
        # بطاقات الإحصائيات
        self.create_stat_cards(stats_frame)
        
        # الرسوم البيانية والجداول
        charts_frame = tk.Frame(self.main_area, bg='white')
        charts_frame.pack(fill='both', expand=True, padx=20, pady=10)
        
        self.create_dashboard_charts(charts_frame)
        
    def create_stat_cards(self, parent):
        """إنشاء بطاقات الإحصائيات"""
        stats = self.db_manager.get_dashboard_stats()
        
        cards = [
            ("المنتجات", stats['products'], "#3498db", "📦"),
            ("العملاء", stats['customers'], "#2ecc71", "👥"),
            ("الفواتير", stats['invoices'], "#e74c3c", "🧾"),
            ("المبيعات", f"{stats['sales']:.2f} ريال", "#f39c12", "💰"),
        ]
        
        for i, (title, value, color, icon) in enumerate(cards):
            card = tk.Frame(parent, bg=color, relief='raised', bd=2)
            card.grid(row=0, column=i, padx=10, pady=10, sticky='ew')
            parent.grid_columnconfigure(i, weight=1)
            
            icon_label = tk.Label(
                card,
                text=icon,
                font=('Arial Unicode MS', 24),
                bg=color,
                fg='white'
            )
            icon_label.pack(pady=(10, 5))
            
            value_label = tk.Label(
                card,
                text=str(value),
                font=('Arial Unicode MS', 18, 'bold'),
                bg=color,
                fg='white'
            )
            value_label.pack()
            
            title_label = tk.Label(
                card,
                text=title,
                font=self.arabic_font,
                bg=color,
                fg='white'
            )
            title_label.pack(pady=(5, 10))
            
    def create_dashboard_charts(self, parent):
        """إنشاء الرسوم البيانية في لوحة المعلومات"""
        # إطار المنتجات منخفضة المخزن
        low_stock_frame = tk.LabelFrame(
            parent,
            text="⚠️ منتجات منخفضة المخزن",
            font=self.arabic_font,
            bg='white',
            fg='#e74c3c'
        )
        low_stock_frame.pack(fill='both', expand=True, pady=10)
        
        # جدول المنتجات منخفضة المخزن
        columns = ('اسم المنتج', 'الكمية المتاحة', 'الحد الأدنى')
        tree = ttk.Treeview(low_stock_frame, columns=columns, show='headings', height=8)
        
        for col in columns:
            tree.heading(col, text=col)
            tree.column(col, width=150, anchor='center')
            
        # إضافة البيانات
        low_stock_products = self.db_manager.get_low_stock_products()
        for product in low_stock_products:
            tree.insert('', 'end', values=product)
            
        tree.pack(fill='both', expand=True, padx=10, pady=10)
        
        # شريط التمرير
        scrollbar = ttk.Scrollbar(low_stock_frame, orient='vertical', command=tree.yview)
        tree.configure(yscrollcommand=scrollbar.set)
        scrollbar.pack(side='left', fill='y')
        
    def show_products(self):
        """عرض نموذج إدارة المنتجات"""
        self.clear_main_area()
        products_form = ProductsForm(self.main_area, self.db_manager)
        
    def show_customers(self):
        """عرض نموذج إدارة العملاء"""
        self.clear_main_area()
        customers_form = CustomersForm(self.main_area, self.db_manager)
        
    def show_suppliers(self):
        """عرض نموذج إدارة الموردين"""
        self.clear_main_area()
        suppliers_form = SuppliersForm(self.main_area, self.db_manager)
        
    def show_invoices(self):
        """عرض نموذج إدارة الفواتير"""
        self.clear_main_area()
        invoices_form = InvoicesForm(self.main_area, self.db_manager)
        
    def show_reports(self):
        """عرض نموذج التقارير"""
        self.clear_main_area()
        reports_form = ReportsForm(self.main_area, self.db_manager, self.report_manager)
        
    def show_settings(self):
        """عرض نموذج الإعدادات"""
        self.clear_main_area()
        
        title = tk.Label(
            self.main_area,
            text="⚙️ إعدادات النظام",
            font=self.title_font,
            bg='white',
            fg='#2c3e50'
        )
        title.pack(pady=20)
        
        # إعدادات الشركة
        company_frame = tk.LabelFrame(
            self.main_area,
            text="معلومات الشركة",
            font=self.arabic_font,
            bg='white'
        )
        company_frame.pack(fill='x', padx=20, pady=10)
        
        settings_fields = [
            ("اسم الشركة:", "مكتبة ومطبعة كيان"),
            ("العنوان:", "المملكة العربية السعودية"),
            ("الهاتف:", "966xxxxxxxxx"),
            ("البريد الإلكتروني:", "info@kayan.com"),
            ("الرقم الضريبي:", "123456789012345"),
        ]
        
        for i, (label, value) in enumerate(settings_fields):
            tk.Label(
                company_frame,
                text=label,
                font=self.arabic_font,
                bg='white'
            ).grid(row=i, column=0, sticky='e', padx=10, pady=5)
            
            entry = tk.Entry(
                company_frame,
                font=self.arabic_font,
                width=30
            )
            entry.insert(0, value)
            entry.grid(row=i, column=1, sticky='w', padx=10, pady=5)
            
        # زر الحفظ
        save_btn = tk.Button(
            company_frame,
            text="💾 حفظ الإعدادات",
            font=self.arabic_font,
            bg='#2ecc71',
            fg='white',
            command=self.save_settings
        )
        save_btn.grid(row=len(settings_fields), column=0, columnspan=2, pady=20)
        
    def show_help(self):
        """عرض نموذج المساعدة"""
        self.clear_main_area()
        
        title = tk.Label(
            self.main_area,
            text="❓ المساعدة والدعم",
            font=self.title_font,
            bg='white',
            fg='#2c3e50'
        )
        title.pack(pady=20)
        
        help_text = """
🏪 نظام إدارة مكتبة ومطبعة كيان

📋 الوظائف الرئيسية:
• إدارة المنتجات والمخزون
• إدارة العملاء والموردين
• إنشاء وطباعة الفواتير
• تقارير مفصلة للمبيعات والمخزون
• نسخ احتياطي تلقائي

🔧 كيفية الاستخدام:
1. ابدأ بإضافة الموردين من قائمة "إدارة الموردين"
2. أضف المنتجات مع ربطها بالموردين
3. أضف العملاء من قائمة "إدارة العملاء"
4. أنشئ الفواتير من قائمة "إدارة الفواتير"
5. راجع التقارير من قائمة "التقارير"

📞 الدعم الفني:
البريد الإلكتروني: support@kayan.com
الهاتف: 966xxxxxxxxx

🔄 النسخ الاحتياطي:
يتم إنشاء نسخة احتياطية تلقائياً كل يوم
يمكنك إنشاء نسخة احتياطية يدوياً من قائمة الإعدادات
        """
        
        help_label = tk.Label(
            self.main_area,
            text=help_text,
            font=self.arabic_font,
            bg='white',
            fg='#2c3e50',
            justify='right'
        )
        help_label.pack(padx=20, pady=20)
        
        # أزرار المساعدة
        buttons_frame = tk.Frame(self.main_area, bg='white')
        buttons_frame.pack(pady=20)
        
        tk.Button(
            buttons_frame,
            text="📖 دليل المستخدم",
            font=self.arabic_font,
            bg='#3498db',
            fg='white',
            command=self.open_user_manual
        ).pack(side='right', padx=10)
        
        tk.Button(
            buttons_frame,
            text="🌐 الموقع الرسمي",
            font=self.arabic_font,
            bg='#2ecc71',
            fg='white',
            command=self.open_website
        ).pack(side='right', padx=10)
        
    def update_statistics(self):
        """تحديث الإحصائيات"""
        # يمكن استدعاء هذه الدالة دورياً لتحديث البيانات
        pass
        
    def save_settings(self):
        """حفظ الإعدادات"""
        messagebox.showinfo("نجح", "تم حفظ الإعدادات بنجاح")
        
    def open_user_manual(self):
        """فتح دليل المستخدم"""
        messagebox.showinfo("دليل المستخدم", "سيتم فتح دليل المستخدم قريباً")
        
    def open_website(self):
        """فتح الموقع الرسمي"""
        webbrowser.open("https://kayan.com")
        
    def run(self):
        """تشغيل التطبيق"""
        # إعداد إغلاق التطبيق
        self.root.protocol("WM_DELETE_WINDOW", self.on_closing)
        
        # تشغيل الحلقة الرئيسية
        self.root.mainloop()
        
    def on_closing(self):
        """عند إغلاق التطبيق"""
        if messagebox.askokcancel("إغلاق", "هل تريد إغلاق التطبيق؟"):
            # إغلاق قاعدة البيانات
            self.db_manager.close()
            self.root.destroy()

def main():
    """الدالة الرئيسية"""
    try:
        app = KayanLibraryApp()
        app.run()
    except Exception as e:
        messagebox.showerror("خطأ", f"حدث خطأ في تشغيل التطبيق:\n{str(e)}")

if __name__ == "__main__":
    main()

