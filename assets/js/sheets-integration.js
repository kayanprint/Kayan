/**
 * ربط Google Sheets التلقائي - مكتبة ومطبعة كيان
 * حفظ الطلبات وإدارة البيانات تلقائياً
 */

// إعدادات Google Sheets
const SHEETS_CONFIG = {
  // يجب تحديث هذه القيم بالبيانات الفعلية
  spreadsheetId: 'YOUR_SPREADSHEET_ID', // معرف جدول البيانات
  apiKey: 'YOUR_GOOGLE_SHEETS_API_KEY', // مفتاح API
  range: 'Orders!A:K', // نطاق البيانات
  
  // أعمدة جدول الطلبات
  columns: {
    orderId: 'A',      // رقم الطلب
    timestamp: 'B',    // تاريخ ووقت الطلب
    customerName: 'C', // اسم العميل
    customerPhone: 'D', // رقم الهاتف
    customerEmail: 'E', // البريد الإلكتروني
    customerAddress: 'F', // العنوان
    governorate: 'G',  // المحافظة
    items: 'H',        // المنتجات
    total: 'I',        // المجموع الكلي
    paymentMethod: 'J', // طريقة الدفع
    status: 'K',       // حالة الطلب
    notes: 'L'         // ملاحظات
  },
  
  // حالات الطلب المتاحة
  orderStatuses: [
    'جديد',
    'قيد المراجعة', 
    'تم التأكيد',
    'قيد التجهيز',
    'جاهز للشحن',
    'تم الشحن',
    'تم التسليم',
    'ملغي',
    'مرتجع'
  ]
};

// معالج Google Sheets
class SheetsIntegration {
  constructor() {
    this.isInitialized = false;
    this.retryCount = 0;
    this.maxRetries = 3;
  }
  
  // تهيئة الاتصال مع Google Sheets
  async initialize() {
    try {
      // التحقق من توفر مفتاح API
      if (!SHEETS_CONFIG.apiKey || SHEETS_CONFIG.apiKey === 'YOUR_GOOGLE_SHEETS_API_KEY') {
        console.warn('Google Sheets API key not configured');
        return false;
      }
      
      // التحقق من معرف جدول البيانات
      if (!SHEETS_CONFIG.spreadsheetId || SHEETS_CONFIG.spreadsheetId === 'YOUR_SPREADSHEET_ID') {
        console.warn('Google Sheets spreadsheet ID not configured');
        return false;
      }
      
      // اختبار الاتصال
      const testResult = await this.testConnection();
      if (testResult) {
        this.isInitialized = true;
        console.log('Google Sheets integration initialized successfully');
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Failed to initialize Google Sheets integration:', error);
      return false;
    }
  }
  
  // اختبار الاتصال مع Google Sheets
  async testConnection() {
    try {
      const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEETS_CONFIG.spreadsheetId}?key=${SHEETS_CONFIG.apiKey}`;
      const response = await fetch(url);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Connected to spreadsheet:', data.properties.title);
        return true;
      } else {
        console.error('Failed to connect to Google Sheets:', response.statusText);
        return false;
      }
    } catch (error) {
      console.error('Error testing Google Sheets connection:', error);
      return false;
    }
  }
  
  // حفظ طلب جديد في Google Sheets
  async saveOrder(orderData) {
    try {
      if (!this.isInitialized) {
        const initialized = await this.initialize();
        if (!initialized) {
          throw new Error('Google Sheets not initialized');
        }
      }
      
      // تحضير بيانات الصف
      const rowData = this.prepareOrderRowData(orderData);
      
      // إضافة الصف إلى جدول البيانات
      const result = await this.appendRow(rowData);
      
      if (result.success) {
        console.log('Order saved to Google Sheets:', orderData.orderId);
        return {
          success: true,
          rowNumber: result.rowNumber,
          orderId: orderData.orderId
        };
      } else {
        throw new Error(result.error);
      }
      
    } catch (error) {
      console.error('Error saving order to Google Sheets:', error);
      
      // إعادة المحاولة في حالة الفشل
      if (this.retryCount < this.maxRetries) {
        this.retryCount++;
        console.log(`Retrying... Attempt ${this.retryCount}/${this.maxRetries}`);
        await this.delay(1000 * this.retryCount); // تأخير متزايد
        return this.saveOrder(orderData);
      }
      
      // حفظ محلي في حالة فشل جميع المحاولات
      this.saveOrderLocally(orderData);
      
      return {
        success: false,
        error: error.message,
        savedLocally: true
      };
    }
  }
  
  // تحضير بيانات الصف للحفظ
  prepareOrderRowData(orderData) {
    // تحويل المنتجات إلى نص
    const itemsText = orderData.items.map(item => 
      `${item.title} (${item.quantity}x${item.price} ج.م = ${item.total} ج.م)`
    ).join('\n');
    
    // تحضير البيانات حسب ترتيب الأعمدة
    return [
      orderData.orderId,                           // A: رقم الطلب
      this.formatTimestamp(orderData.timestamp),   // B: التاريخ والوقت
      orderData.customer.name,                     // C: اسم العميل
      orderData.customer.phone,                    // D: رقم الهاتف
      orderData.customer.email || '',              // E: البريد الإلكتروني
      orderData.customer.address,                  // F: العنوان
      orderData.customer.governorate,              // G: المحافظة
      itemsText,                                   // H: المنتجات
      orderData.totals.total,                      // I: المجموع الكلي
      orderData.payment.methodName,                // J: طريقة الدفع
      orderData.status,                            // K: حالة الطلب
      orderData.notes || ''                        // L: ملاحظات
    ];
  }
  
  // تنسيق التاريخ والوقت
  formatTimestamp(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleString('ar-EG', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  }
  
  // إضافة صف جديد إلى جدول البيانات
  async appendRow(rowData) {
    try {
      const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEETS_CONFIG.spreadsheetId}/values/${SHEETS_CONFIG.range}:append`;
      
      const requestBody = {
        range: SHEETS_CONFIG.range,
        majorDimension: 'ROWS',
        values: [rowData]
      };
      
      const response = await fetch(`${url}?valueInputOption=RAW&key=${SHEETS_CONFIG.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });
      
      if (response.ok) {
        const result = await response.json();
        return {
          success: true,
          rowNumber: result.updates.updatedRows,
          range: result.updates.updatedRange
        };
      } else {
        const errorData = await response.json();
        return {
          success: false,
          error: errorData.error?.message || 'Unknown error'
        };
      }
      
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  // قراءة الطلبات من Google Sheets
  async getOrders(limit = 100) {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }
      
      const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEETS_CONFIG.spreadsheetId}/values/${SHEETS_CONFIG.range}?key=${SHEETS_CONFIG.apiKey}`;
      const response = await fetch(url);
      
      if (response.ok) {
        const data = await response.json();
        const rows = data.values || [];
        
        // تخطي الصف الأول (العناوين) وتحويل البيانات
        const orders = rows.slice(1, limit + 1).map((row, index) => ({
          rowNumber: index + 2, // +2 لأن الصف الأول عناوين والفهرس يبدأ من 0
          orderId: row[0] || '',
          timestamp: row[1] || '',
          customerName: row[2] || '',
          customerPhone: row[3] || '',
          customerEmail: row[4] || '',
          customerAddress: row[5] || '',
          governorate: row[6] || '',
          items: row[7] || '',
          total: parseFloat(row[8]) || 0,
          paymentMethod: row[9] || '',
          status: row[10] || 'جديد',
          notes: row[11] || ''
        }));
        
        return {
          success: true,
          orders: orders,
          total: orders.length
        };
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
    } catch (error) {
      console.error('Error fetching orders from Google Sheets:', error);
      return {
        success: false,
        error: error.message,
        orders: []
      };
    }
  }
  
  // تحديث حالة طلب
  async updateOrderStatus(orderId, newStatus, rowNumber = null) {
    try {
      // البحث عن رقم الصف إذا لم يتم توفيره
      if (!rowNumber) {
        const orders = await this.getOrders();
        if (orders.success) {
          const order = orders.orders.find(o => o.orderId === orderId);
          if (order) {
            rowNumber = order.rowNumber;
          } else {
            throw new Error('Order not found');
          }
        } else {
          throw new Error('Failed to fetch orders');
        }
      }
      
      // تحديث الخلية
      const range = `Orders!${SHEETS_CONFIG.columns.status}${rowNumber}`;
      const result = await this.updateCell(range, newStatus);
      
      if (result.success) {
        console.log(`Order ${orderId} status updated to: ${newStatus}`);
        return { success: true, orderId, newStatus };
      } else {
        throw new Error(result.error);
      }
      
    } catch (error) {
      console.error('Error updating order status:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  // تحديث خلية واحدة
  async updateCell(range, value) {
    try {
      const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEETS_CONFIG.spreadsheetId}/values/${range}`;
      
      const requestBody = {
        range: range,
        majorDimension: 'ROWS',
        values: [[value]]
      };
      
      const response = await fetch(`${url}?valueInputOption=RAW&key=${SHEETS_CONFIG.apiKey}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });
      
      if (response.ok) {
        return { success: true };
      } else {
        const errorData = await response.json();
        return {
          success: false,
          error: errorData.error?.message || 'Unknown error'
        };
      }
      
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  // إنشاء تقرير مبيعات
  async generateSalesReport(startDate, endDate) {
    try {
      const orders = await this.getOrders(1000); // جلب آخر 1000 طلب
      
      if (!orders.success) {
        throw new Error('Failed to fetch orders');
      }
      
      // فلترة الطلبات حسب التاريخ
      const filteredOrders = orders.orders.filter(order => {
        const orderDate = new Date(order.timestamp);
        return orderDate >= startDate && orderDate <= endDate;
      });
      
      // حساب الإحصائيات
      const report = {
        period: {
          start: startDate.toLocaleDateString('ar-EG'),
          end: endDate.toLocaleDateString('ar-EG')
        },
        totalOrders: filteredOrders.length,
        totalRevenue: filteredOrders.reduce((sum, order) => sum + order.total, 0),
        averageOrderValue: 0,
        ordersByStatus: {},
        ordersByGovernorate: {},
        topPaymentMethods: {},
        dailySales: {}
      };
      
      // حساب متوسط قيمة الطلب
      if (report.totalOrders > 0) {
        report.averageOrderValue = report.totalRevenue / report.totalOrders;
      }
      
      // تجميع البيانات
      filteredOrders.forEach(order => {
        // حسب الحالة
        report.ordersByStatus[order.status] = (report.ordersByStatus[order.status] || 0) + 1;
        
        // حسب المحافظة
        report.ordersByGovernorate[order.governorate] = (report.ordersByGovernorate[order.governorate] || 0) + 1;
        
        // حسب طريقة الدفع
        report.topPaymentMethods[order.paymentMethod] = (report.topPaymentMethods[order.paymentMethod] || 0) + 1;
        
        // المبيعات اليومية
        const orderDate = new Date(order.timestamp).toLocaleDateString('ar-EG');
        if (!report.dailySales[orderDate]) {
          report.dailySales[orderDate] = { orders: 0, revenue: 0 };
        }
        report.dailySales[orderDate].orders += 1;
        report.dailySales[orderDate].revenue += order.total;
      });
      
      return {
        success: true,
        report: report
      };
      
    } catch (error) {
      console.error('Error generating sales report:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  // حفظ الطلب محلياً في حالة فشل الاتصال
  saveOrderLocally(orderData) {
    try {
      const localOrders = JSON.parse(localStorage.getItem('kayanLocalOrders')) || [];
      localOrders.push({
        ...orderData,
        savedAt: new Date().toISOString(),
        synced: false
      });
      localStorage.setItem('kayanLocalOrders', JSON.stringify(localOrders));
      console.log('Order saved locally:', orderData.orderId);
    } catch (error) {
      console.error('Error saving order locally:', error);
    }
  }
  
  // مزامنة الطلبات المحفوظة محلياً
  async syncLocalOrders() {
    try {
      const localOrders = JSON.parse(localStorage.getItem('kayanLocalOrders')) || [];
      const unsyncedOrders = localOrders.filter(order => !order.synced);
      
      if (unsyncedOrders.length === 0) {
        return { success: true, syncedCount: 0 };
      }
      
      let syncedCount = 0;
      const errors = [];
      
      for (const order of unsyncedOrders) {
        try {
          const result = await this.saveOrder(order);
          if (result.success) {
            // تحديث حالة المزامنة
            order.synced = true;
            order.syncedAt = new Date().toISOString();
            syncedCount++;
          } else {
            errors.push({ orderId: order.orderId, error: result.error });
          }
        } catch (error) {
          errors.push({ orderId: order.orderId, error: error.message });
        }
      }
      
      // حفظ التحديثات
      localStorage.setItem('kayanLocalOrders', JSON.stringify(localOrders));
      
      return {
        success: true,
        syncedCount: syncedCount,
        errors: errors
      };
      
    } catch (error) {
      console.error('Error syncing local orders:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  // تأخير (للإعادة المحاولة)
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// إنشاء مثيل من معالج Google Sheets
const sheetsIntegration = new SheetsIntegration();

// وظيفة عامة لحفظ الطلب (للاستخدام من ملفات أخرى)
async function saveOrderToGoogleSheets(orderData) {
  return await sheetsIntegration.saveOrder(orderData);
}

// وظيفة عامة لجلب الطلبات
async function getOrdersFromGoogleSheets(limit = 100) {
  return await sheetsIntegration.getOrders(limit);
}

// وظيفة عامة لتحديث حالة الطلب
async function updateOrderStatusInSheets(orderId, newStatus) {
  return await sheetsIntegration.updateOrderStatus(orderId, newStatus);
}

// وظيفة عامة لإنشاء تقرير المبيعات
async function generateSalesReportFromSheets(startDate, endDate) {
  return await sheetsIntegration.generateSalesReport(startDate, endDate);
}

// تهيئة تلقائية عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', async () => {
  await sheetsIntegration.initialize();
  
  // مزامنة الطلبات المحلية إذا كان هناك اتصال
  if (navigator.onLine) {
    sheetsIntegration.syncLocalOrders();
  }
});

// مزامنة عند عودة الاتصال
window.addEventListener('online', () => {
  sheetsIntegration.syncLocalOrders();
});

// تصدير للاستخدام في ملفات أخرى
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    SheetsIntegration,
    SHEETS_CONFIG,
    saveOrderToGoogleSheets,
    getOrdersFromGoogleSheets,
    updateOrderStatusInSheets,
    generateSalesReportFromSheets
  };
}
