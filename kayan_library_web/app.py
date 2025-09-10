#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
نظام إدارة مكتبة ومطبعة كيان - واجهة ويب
Kayan Library & Printing Management System - Web Interface
"""

from flask import Flask, render_template, request, redirect, url_for, flash, jsonify
import sqlite3
import os
from datetime import datetime
import json

app = Flask(__name__)
app.secret_key = 'kayan_library_secret_key_2024'

# إعداد قاعدة البيانات
DATABASE = 'database.db'

def init_database():
    """إنشاء قاعدة البيانات والجداول"""
    conn = sqlite3.connect(DATABASE)
    cursor = conn.cursor()
    
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
    
    # جدول المنتجات
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS Products (
            ProductID INTEGER PRIMARY KEY AUTOINCREMENT,
            ProductName TEXT NOT NULL,
            Category TEXT CHECK(Category IN ('أدوات مكتبية', 'كتب', 'خدمات طباعة')),
            PurchasePrice REAL DEFAULT 0,
            SalePrice REAL DEFAULT 0,
            StockQty INTEGER DEFAULT 0,
            SupplierID INTEGER,
            CreatedDate DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (SupplierID) REFERENCES Suppliers(SupplierID)
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
    
    # جدول الفواتير
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS Invoices (
            InvoiceID INTEGER PRIMARY KEY AUTOINCREMENT,
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
            InvoiceID INTEGER,
            ProductID INTEGER,
            Quantity INTEGER DEFAULT 1,
            UnitPrice REAL DEFAULT 0,
            Total REAL DEFAULT 0,
            FOREIGN KEY (InvoiceID) REFERENCES Invoices(InvoiceID),
            FOREIGN KEY (ProductID) REFERENCES Products(ProductID)
        )
    ''')
    
    # جدول حركة المخزن
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS StockTransactions (
            TransactionID INTEGER PRIMARY KEY AUTOINCREMENT,
            ProductID INTEGER,
            TransactionType TEXT CHECK(TransactionType IN ('شراء', 'بيع', 'مرتجع')),
            Quantity INTEGER DEFAULT 0,
            TransactionDate DATETIME DEFAULT CURRENT_TIMESTAMP,
            BalanceAfter INTEGER DEFAULT 0,
            Notes TEXT,
            FOREIGN KEY (ProductID) REFERENCES Products(ProductID)
        )
    ''')
    
    conn.commit()
    conn.close()

def get_db_connection():
    """الحصول على اتصال قاعدة البيانات"""
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    return conn

def update_stock(product_id, transaction_type, quantity):
    """تحديث رصيد المخزن"""
    conn = get_db_connection()
    
    # الحصول على الرصيد الحالي
    current_stock = conn.execute(
        'SELECT StockQty FROM Products WHERE ProductID = ?', (product_id,)
    ).fetchone()
    
    if current_stock:
        current_qty = current_stock['StockQty']
        
        # حساب الرصيد الجديد
        if transaction_type == 'شراء' or transaction_type == 'مرتجع':
            new_qty = current_qty + quantity
        elif transaction_type == 'بيع':
            new_qty = current_qty - quantity
        else:
            new_qty = current_qty
        
        # تحديث رصيد المنتج
        conn.execute(
            'UPDATE Products SET StockQty = ? WHERE ProductID = ?',
            (new_qty, product_id)
        )
        
        # إضافة حركة مخزن
        conn.execute('''
            INSERT INTO StockTransactions (ProductID, TransactionType, Quantity, BalanceAfter)
            VALUES (?, ?, ?, ?)
        ''', (product_id, transaction_type, quantity, new_qty))
        
        conn.commit()
    
    conn.close()

# الصفحة الرئيسية
@app.route('/')
def index():
    # الحصول على الإحصائيات
    stats = get_dashboard_stats()
    
    # الحصول على المنتجات منخفضة المخزون
    low_stock_products = get_low_stock_products()
    
    return render_template('index.html', stats=stats, low_stock_products=low_stock_products)

# إدارة المنتجات
@app.route('/products')
def products():
    conn = get_db_connection()
    products = conn.execute('''
        SELECT p.*, s.SupplierName 
        FROM Products p 
        LEFT JOIN Suppliers s ON p.SupplierID = s.SupplierID
        ORDER BY p.ProductName
    ''').fetchall()
    suppliers = conn.execute('SELECT * FROM Suppliers ORDER BY SupplierName').fetchall()
    conn.close()
    return render_template('products.html', products=products, suppliers=suppliers)

@app.route('/add_product', methods=['POST'])
def add_product():
    name = request.form['name']
    category = request.form['category']
    purchase_price = float(request.form['purchase_price'] or 0)
    sale_price = float(request.form['sale_price'] or 0)
    stock_qty = int(request.form['stock_qty'] or 0)
    supplier_id = request.form['supplier_id'] or None
    
    conn = get_db_connection()
    conn.execute('''
        INSERT INTO Products (ProductName, Category, PurchasePrice, SalePrice, StockQty, SupplierID)
        VALUES (?, ?, ?, ?, ?, ?)
    ''', (name, category, purchase_price, sale_price, stock_qty, supplier_id))
    conn.commit()
    conn.close()
    
    flash('تم إضافة المنتج بنجاح', 'success')
    return redirect(url_for('products'))

# إدارة العملاء
@app.route('/customers')
def customers():
    conn = get_db_connection()
    customers = conn.execute('SELECT * FROM Customers ORDER BY CustomerName').fetchall()
    conn.close()
    return render_template('customers.html', customers=customers)

@app.route('/add_customer', methods=['POST'])
def add_customer():
    name = request.form['name']
    phone = request.form['phone']
    address = request.form['address']
    email = request.form['email']
    
    conn = get_db_connection()
    conn.execute('''
        INSERT INTO Customers (CustomerName, Phone, Address, Email)
        VALUES (?, ?, ?, ?)
    ''', (name, phone, address, email))
    conn.commit()
    conn.close()
    
    flash('تم إضافة العميل بنجاح', 'success')
    return redirect(url_for('customers'))

# إدارة الموردين
@app.route('/suppliers')
def suppliers():
    conn = get_db_connection()
    suppliers = conn.execute('SELECT * FROM Suppliers ORDER BY SupplierName').fetchall()
    conn.close()
    return render_template('suppliers.html', suppliers=suppliers)

@app.route('/add_supplier', methods=['POST'])
def add_supplier():
    name = request.form['name']
    phone = request.form['phone']
    address = request.form['address']
    
    conn = get_db_connection()
    conn.execute('''
        INSERT INTO Suppliers (SupplierName, Phone, Address)
        VALUES (?, ?, ?)
    ''', (name, phone, address))
    conn.commit()
    conn.close()
    
    flash('تم إضافة المورد بنجاح', 'success')
    return redirect(url_for('suppliers'))

# إدارة الفواتير
@app.route('/invoices')
def invoices():
    conn = get_db_connection()
    invoices = conn.execute('''
        SELECT i.*, c.CustomerName 
        FROM Invoices i 
        LEFT JOIN Customers c ON i.CustomerID = c.CustomerID
        ORDER BY i.InvoiceDate DESC
    ''').fetchall()
    conn.close()
    return render_template('invoices.html', invoices=invoices)

@app.route('/new_invoice')
def new_invoice():
    conn = get_db_connection()
    customers = conn.execute('SELECT * FROM Customers ORDER BY CustomerName').fetchall()
    products = conn.execute('SELECT * FROM Products WHERE StockQty > 0 ORDER BY ProductName').fetchall()
    conn.close()
    return render_template('new_invoice.html', customers=customers, products=products)

@app.route('/create_invoice', methods=['POST'])
def create_invoice():
    customer_id = request.form['customer_id'] or None
    payment_method = request.form['payment_method']
    discount = float(request.form['discount'] or 0)
    
    # الحصول على تفاصيل المنتجات من JSON
    invoice_items = json.loads(request.form['invoice_items'])
    
    if not invoice_items:
        flash('يجب إضافة منتج واحد على الأقل للفاتورة', 'error')
        return redirect(url_for('new_invoice'))
    
    conn = get_db_connection()
    
    # حساب الإجمالي
    subtotal = sum(item['total'] for item in invoice_items)
    total_amount = subtotal - discount
    
    # إنشاء الفاتورة
    cursor = conn.execute('''
        INSERT INTO Invoices (CustomerID, PaymentMethod, SubTotal, Discount, TotalAmount)
        VALUES (?, ?, ?, ?, ?)
    ''', (customer_id, payment_method, subtotal, discount, total_amount))
    
    invoice_id = cursor.lastrowid
    
    # إضافة تفاصيل الفاتورة وتحديث المخزن
    for item in invoice_items:
        conn.execute('''
            INSERT INTO InvoiceDetails (InvoiceID, ProductID, Quantity, UnitPrice, Total)
            VALUES (?, ?, ?, ?, ?)
        ''', (invoice_id, item['product_id'], item['quantity'], item['unit_price'], item['total']))
        
        # تحديث المخزن
        update_stock(item['product_id'], 'بيع', item['quantity'])
    
    conn.commit()
    conn.close()
    
    flash(f'تم إنشاء الفاتورة رقم {invoice_id} بنجاح', 'success')
    return redirect(url_for('view_invoice', invoice_id=invoice_id))

@app.route('/invoice/<int:invoice_id>')
def view_invoice(invoice_id):
    conn = get_db_connection()
    
    # بيانات الفاتورة
    invoice = conn.execute('''
        SELECT i.*, c.CustomerName, c.Phone, c.Address
        FROM Invoices i
        LEFT JOIN Customers c ON i.CustomerID = c.CustomerID
        WHERE i.InvoiceID = ?
    ''', (invoice_id,)).fetchone()
    
    # تفاصيل الفاتورة
    details = conn.execute('''
        SELECT id.*, p.ProductName
        FROM InvoiceDetails id
        JOIN Products p ON id.ProductID = p.ProductID
        WHERE id.InvoiceID = ?
    ''', (invoice_id,)).fetchall()
    
    conn.close()
    
    if not invoice:
        flash('الفاتورة غير موجودة', 'error')
        return redirect(url_for('invoices'))
    
    return render_template('view_invoice.html', invoice=invoice, details=details)

# تقارير
@app.route('/reports')
def reports():
    conn = get_db_connection()
    
    # إحصائيات سريعة
    stats = {}
    stats['total_products'] = conn.execute('SELECT COUNT(*) as count FROM Products').fetchone()['count']
    stats['total_customers'] = conn.execute('SELECT COUNT(*) as count FROM Customers').fetchone()['count']
    stats['total_invoices'] = conn.execute('SELECT COUNT(*) as count FROM Invoices').fetchone()['count']
    stats['total_sales'] = conn.execute('SELECT COALESCE(SUM(TotalAmount), 0) as total FROM Invoices').fetchone()['total']
    
    # المنتجات منخفضة المخزن
    low_stock = conn.execute('''
        SELECT ProductName, StockQty 
        FROM Products 
        WHERE StockQty <= 5 
        ORDER BY StockQty
    ''').fetchall()
    
    conn.close()
    return render_template('reports.html', stats=stats, low_stock=low_stock)

# API للحصول على بيانات المنتج
@app.route('/api/product/<int:product_id>')
def get_product(product_id):
    conn = get_db_connection()
    product = conn.execute('SELECT * FROM Products WHERE ProductID = ?', (product_id,)).fetchone()
    conn.close()
    
    if product:
        return jsonify({
            'id': product['ProductID'],
            'name': product['ProductName'],
            'price': product['SalePrice'],
            'stock': product['StockQty']
        })
    return jsonify({'error': 'المنتج غير موجود'}), 404

def get_dashboard_stats():
    """الحصول على إحصائيات لوحة المعلومات"""
    conn = get_db_connection()
    
    stats = {}
    
    try:
        # عدد المنتجات
        stats['products'] = conn.execute('SELECT COUNT(*) as count FROM Products').fetchone()['count']
        
        # عدد العملاء
        stats['customers'] = conn.execute('SELECT COUNT(*) as count FROM Customers').fetchone()['count']
        
        # عدد الفواتير
        stats['invoices'] = conn.execute('SELECT COUNT(*) as count FROM Invoices').fetchone()['count']
        
        # إجمالي المبيعات
        stats['sales'] = conn.execute('SELECT COALESCE(SUM(TotalAmount), 0) as total FROM Invoices').fetchone()['total']
        
    except Exception as e:
        print(f"خطأ في الحصول على الإحصائيات: {e}")
        stats = {'products': 0, 'customers': 0, 'invoices': 0, 'sales': 0}
    
    finally:
        conn.close()
    
    return stats

def get_low_stock_products():
    """الحصول على المنتجات منخفضة المخزون"""
    conn = get_db_connection()
    
    try:
        products = conn.execute('''
            SELECT ProductName as name, StockQty as stock, 5 as min_stock
            FROM Products 
            WHERE StockQty <= 5
            ORDER BY StockQty ASC
            LIMIT 10
        ''').fetchall()
        
        return [dict(product) for product in products]
        
    except Exception as e:
        print(f"خطأ في الحصول على المنتجات منخفضة المخزون: {e}")
        return []
    
    finally:
        conn.close()

# إضافة route للحصول على الإحصائيات عبر AJAX
@app.route('/api/stats')
def api_stats():
    """API للحصول على الإحصائيات"""
    stats = get_dashboard_stats()
    return jsonify(stats)

# إضافة route للحصول على المنتجات منخفضة المخزون
@app.route('/api/low-stock')
def api_low_stock():
    """API للحصول على المنتجات منخفضة المخزون"""
    products = get_low_stock_products()
    return jsonify(products)

# إضافة route لملف manifest.json
@app.route('/manifest.json')
def manifest():
    """إرجاع ملف PWA manifest"""
    return app.send_static_file('manifest.json')

# إضافة route لـ Service Worker
@app.route('/sw.js')
def service_worker():
    """إرجاع ملف Service Worker"""
    response = app.send_static_file('sw.js')
    response.headers['Content-Type'] = 'application/javascript'
    response.headers['Service-Worker-Allowed'] = '/'
    return response

if __name__ == '__main__':
    init_database()
    app.run(debug=True, host='0.0.0.0', port=5000)
