// Google Apps Script لمعالجة طلبات مكتبة ومطبعة كيان
// Kayan Store Order Handler

function doPost(e) {
  try {
    // الحصول على البيانات المرسلة
    const data = JSON.parse(e.postData.contents);
    
    // حفظ الطلب في Google Sheets
    const result = saveOrderToSheet(data);
    
    // إرسال إشعار بريد إلكتروني (اختياري)
    sendEmailNotification(data);
    
    return ContentService
      .createTextOutput(JSON.stringify({
        success: true,
        message: 'تم حفظ الطلب بنجاح',
        orderId: result.orderId
      }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    console.error('خطأ في معالجة الطلب:', error);
    
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        error: error.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function saveOrderToSheet(orderData) {
  // معرف جدول البيانات (يجب تغييره)
  const SPREADSHEET_ID = 'YOUR_SPREADSHEET_ID_HERE';
  
  try {
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    
    // إنشاء ورقة الطلبات إذا لم تكن موجودة
    let ordersSheet = spreadsheet.getSheetByName('الطلبات');
    if (!ordersSheet) {
      ordersSheet = spreadsheet.insertSheet('الطلبات');
      setupOrdersSheetHeaders(ordersSheet);
    }
    
    // إضافة الطلب الجديد
    const rowData = [
      orderData.orderNumber,
      new Date(orderData.timestamp),
      orderData.customer.firstName + ' ' + orderData.customer.lastName,
      orderData.customer.phone,
      orderData.customer.email || '',
      orderData.shipping.governorate,
      orderData.shipping.address,
      formatItemsList(orderData.items),
      orderData.costs.subtotal,
      orderData.costs.shipping,
      orderData.costs.paymentFees,
      orderData.costs.total,
      PAYMENT_METHODS_AR[orderData.payment.method] || orderData.payment.method,
      orderData.notes || '',
      'جديد' // حالة الطلب
    ];
    
    ordersSheet.appendRow(rowData);
    
    // تحديث إحصائيات المبيعات
    updateSalesStats(spreadsheet, orderData);
    
    return {
      success: true,
      orderId: orderData.orderNumber
    };
    
  } catch (error) {
    console.error('خطأ في حفظ الطلب:', error);
    throw error;
  }
}

function setupOrdersSheetHeaders(sheet) {
  const headers = [
    'رقم الطلب',
    'التاريخ',
    'اسم العميل',
    'الهاتف',
    'البريد الإلكتروني',
    'المحافظة',
    'العنوان',
    'المنتجات',
    'المجموع الفرعي',
    'الشحن',
    'رسوم الدفع',
    'المجموع الكلي',
    'طريقة الدفع',
    'ملاحظات',
    'حالة الطلب'
  ];
  
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  
  // تنسيق الهيدر
  const headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setBackground('#667eea');
  headerRange.setFontColor('white');
  headerRange.setFontWeight('bold');
  headerRange.setHorizontalAlignment('center');
  
  // تجميد الصف الأول
  sheet.setFrozenRows(1);
  
  // ضبط عرض الأعمدة
  sheet.setColumnWidth(1, 120); // رقم الطلب
  sheet.setColumnWidth(2, 150); // التاريخ
  sheet.setColumnWidth(3, 200); // اسم العميل
  sheet.setColumnWidth(4, 120); // الهاتف
  sheet.setColumnWidth(5, 200); // البريد
  sheet.setColumnWidth(6, 100); // المحافظة
  sheet.setColumnWidth(7, 300); // العنوان
  sheet.setColumnWidth(8, 400); // المنتجات
}

function formatItemsList(items) {
  return items.map(item => 
    `${item.title} (${item.quantity} × ${item.price} جنيه = ${item.quantity * item.price} جنيه)`
  ).join('\n');
}

function updateSalesStats(spreadsheet, orderData) {
  let statsSheet = spreadsheet.getSheetByName('إحصائيات المبيعات');
  if (!statsSheet) {
    statsSheet = spreadsheet.insertSheet('إحصائيات المبيعات');
    setupStatsSheetHeaders(statsSheet);
  }
  
  const today = new Date();
  const dateString = Utilities.formatDate(today, Session.getScriptTimeZone(), 'yyyy-MM-dd');
  
  // البحث عن صف اليوم
  const data = statsSheet.getDataRange().getValues();
  let todayRowIndex = -1;
  
  for (let i = 1; i < data.length; i++) {
    const rowDate = Utilities.formatDate(data[i][0], Session.getScriptTimeZone(), 'yyyy-MM-dd');
    if (rowDate === dateString) {
      todayRowIndex = i + 1;
      break;
    }
  }
  
  if (todayRowIndex === -1) {
    // إضافة صف جديد لليوم
    statsSheet.appendRow([
      today,
      1, // عدد الطلبات
      orderData.costs.total, // إجمالي المبيعات
      orderData.items.reduce((sum, item) => sum + item.quantity, 0) // عدد المنتجات
    ]);
  } else {
    // تحديث الصف الموجود
    const currentOrders = statsSheet.getRange(todayRowIndex, 2).getValue();
    const currentSales = statsSheet.getRange(todayRowIndex, 3).getValue();
    const currentItems = statsSheet.getRange(todayRowIndex, 4).getValue();
    
    statsSheet.getRange(todayRowIndex, 2).setValue(currentOrders + 1);
    statsSheet.getRange(todayRowIndex, 3).setValue(currentSales + orderData.costs.total);
    statsSheet.getRange(todayRowIndex, 4).setValue(currentItems + orderData.items.reduce((sum, item) => sum + item.quantity, 0));
  }
}

function setupStatsSheetHeaders(sheet) {
  const headers = ['التاريخ', 'عدد الطلبات', 'إجمالي المبيعات', 'عدد المنتجات'];
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  
  // تنسيق الهيدر
  const headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setBackground('#28a745');
  headerRange.setFontColor('white');
  headerRange.setFontWeight('bold');
  headerRange.setHorizontalAlignment('center');
  
  sheet.setFrozenRows(1);
}

function sendEmailNotification(orderData) {
  try {
    const subject = `طلب جديد #${orderData.orderNumber} - مكتبة ومطبعة كيان`;
    
    let emailBody = `
      <div style="font-family: Arial, sans-serif; direction: rtl; text-align: right;">
        <h2 style="color: #667eea;">طلب جديد من مكتبة ومطبعة كيان</h2>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <h3>تفاصيل الطلب</h3>
          <p><strong>رقم الطلب:</strong> ${orderData.orderNumber}</p>
          <p><strong>التاريخ:</strong> ${new Date(orderData.timestamp).toLocaleString('ar-EG')}</p>
        </div>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <h3>بيانات العميل</h3>
          <p><strong>الاسم:</strong> ${orderData.customer.firstName} ${orderData.customer.lastName}</p>
          <p><strong>الهاتف:</strong> ${orderData.customer.phone}</p>
          ${orderData.customer.email ? `<p><strong>البريد:</strong> ${orderData.customer.email}</p>` : ''}
        </div>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <h3>عنوان التوصيل</h3>
          <p><strong>المحافظة:</strong> ${orderData.shipping.governorate}</p>
          <p><strong>العنوان:</strong> ${orderData.shipping.address}</p>
        </div>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <h3>المنتجات</h3>
          <ul>
    `;
    
    orderData.items.forEach(item => {
      emailBody += `<li>${item.title} - الكمية: ${item.quantity} × ${item.price} جنيه = ${item.quantity * item.price} جنيه</li>`;
    });
    
    emailBody += `
          </ul>
        </div>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <h3>التكاليف</h3>
          <p><strong>المجموع الفرعي:</strong> ${orderData.costs.subtotal} جنيه</p>
          <p><strong>الشحن:</strong> ${orderData.costs.shipping === 0 ? 'مجاني' : orderData.costs.shipping + ' جنيه'}</p>
          ${orderData.costs.paymentFees > 0 ? `<p><strong>رسوم الدفع:</strong> ${orderData.costs.paymentFees} جنيه</p>` : ''}
          <p style="font-size: 18px; color: #667eea;"><strong>المجموع الكلي: ${orderData.costs.total} جنيه</strong></p>
        </div>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <h3>طريقة الدفع</h3>
          <p>${PAYMENT_METHODS_AR[orderData.payment.method] || orderData.payment.method}</p>
        </div>
        
        ${orderData.notes ? `
        <div style="background: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <h3>ملاحظات</h3>
          <p>${orderData.notes}</p>
        </div>
        ` : ''}
        
        <div style="text-align: center; margin-top: 30px;">
          <p style="color: #666;">يرجى التواصل مع العميل لتأكيد الطلب وتحديد موعد التوصيل</p>
        </div>
      </div>
    `;
    
    // إرسال البريد الإلكتروني
    MailApp.sendEmail({
      to: 'info@kayanprint.com', // يجب تغيير هذا البريد
      subject: subject,
      htmlBody: emailBody
    });
    
  } catch (error) {
    console.error('خطأ في إرسال البريد الإلكتروني:', error);
  }
}

// ترجمة طرق الدفع
const PAYMENT_METHODS_AR = {
  'cod': 'الدفع عند الاستلام',
  'vodafone': 'فودافون كاش',
  'orange': 'أورانج كاش',
  'etisalat': 'اتصالات كاش',
  'fawry': 'فوري',
  'bank': 'التحويل البنكي'
};

// دالة لتحديث حالة الطلب
function updateOrderStatus(orderNumber, newStatus) {
  const SPREADSHEET_ID = 'YOUR_SPREADSHEET_ID_HERE';
  
  try {
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    const ordersSheet = spreadsheet.getSheetByName('الطلبات');
    
    if (!ordersSheet) {
      throw new Error('ورقة الطلبات غير موجودة');
    }
    
    const data = ordersSheet.getDataRange().getValues();
    
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === orderNumber) {
        ordersSheet.getRange(i + 1, 15).setValue(newStatus); // عمود حالة الطلب
        ordersSheet.getRange(i + 1, 15).setBackground(getStatusColor(newStatus));
        return { success: true, message: 'تم تحديث حالة الطلب' };
      }
    }
    
    throw new Error('الطلب غير موجود');
    
  } catch (error) {
    console.error('خطأ في تحديث حالة الطلب:', error);
    return { success: false, error: error.toString() };
  }
}

function getStatusColor(status) {
  const colors = {
    'جديد': '#ffc107',
    'قيد التجهيز': '#17a2b8',
    'تم الشحن': '#fd7e14',
    'مكتمل': '#28a745',
    'ملغي': '#dc3545'
  };
  
  return colors[status] || '#6c757d';
}

// دالة للحصول على تقرير المبيعات
function getSalesReport(startDate, endDate) {
  const SPREADSHEET_ID = 'YOUR_SPREADSHEET_ID_HERE';
  
  try {
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    const ordersSheet = spreadsheet.getSheetByName('الطلبات');
    
    if (!ordersSheet) {
      throw new Error('ورقة الطلبات غير موجودة');
    }
    
    const data = ordersSheet.getDataRange().getValues();
    const report = {
      totalOrders: 0,
      totalSales: 0,
      totalItems: 0,
      ordersByStatus: {},
      ordersByGovernorate: {},
      ordersByPaymentMethod: {}
    };
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    for (let i = 1; i < data.length; i++) {
      const orderDate = new Date(data[i][1]);
      
      if (orderDate >= start && orderDate <= end) {
        report.totalOrders++;
        report.totalSales += data[i][11]; // المجموع الكلي
        
        // حساب عدد المنتجات
        const itemsText = data[i][7];
        const itemsCount = (itemsText.match(/×/g) || []).length;
        report.totalItems += itemsCount;
        
        // تجميع حسب الحالة
        const status = data[i][14];
        report.ordersByStatus[status] = (report.ordersByStatus[status] || 0) + 1;
        
        // تجميع حسب المحافظة
        const governorate = data[i][5];
        report.ordersByGovernorate[governorate] = (report.ordersByGovernorate[governorate] || 0) + 1;
        
        // تجميع حسب طريقة الدفع
        const paymentMethod = data[i][12];
        report.ordersByPaymentMethod[paymentMethod] = (report.ordersByPaymentMethod[paymentMethod] || 0) + 1;
      }
    }
    
    return report;
    
  } catch (error) {
    console.error('خطأ في إنشاء التقرير:', error);
    throw error;
  }
}
