/**
 * تكامل WhatsApp Business - مكتبة ومطبعة كيان
 * إرسال الطلبات والفواتير تلقائياً عبر واتساب
 */

// إعدادات WhatsApp
const WHATSAPP_CONFIG = {
  businessNumber: '201121499017', // رقم واتساب الأعمال
  apiUrl: 'https://api.whatsapp.com/send', // رابط واتساب ويب
  
  // قوالب الرسائل
  templates: {
    newOrder: {
      title: '🛒 طلب جديد من مكتبة كيان',
      format: 'detailed' // detailed, simple, invoice
    },
    orderConfirmation: {
      title: '✅ تأكيد الطلب',
      format: 'simple'
    },
    statusUpdate: {
      title: '📦 تحديث حالة الطلب',
      format: 'simple'
    },
    invoice: {
      title: '🧾 فاتورة الطلب',
      format: 'invoice'
    }
  },
  
  // إعدادات الإرسال
  settings: {
    autoSend: true, // إرسال تلقائي
    sendToCustomer: true, // إرسال للعميل
    sendToBusiness: true, // إرسال للمتجر
    includeProductLinks: true, // تضمين روابط المنتجات
    useEmojis: true // استخدام الرموز التعبيرية
  }
};

// معالج WhatsApp
class WhatsAppIntegration {
  constructor() {
    this.isAvailable = this.checkAvailability();
  }
  
  // التحقق من توفر WhatsApp
  checkAvailability() {
    // التحقق من دعم المتصفح لفتح الروابط
    return typeof window !== 'undefined' && window.open;
  }
  
  // إرسال طلب جديد عبر WhatsApp
  async sendNewOrder(orderData) {
    try {
      if (!this.isAvailable) {
        throw new Error('WhatsApp not available');
      }
      
      // إنشاء رسالة الطلب
      const message = this.createOrderMessage(orderData);
      
      // إرسال للمتجر
      if (WHATSAPP_CONFIG.settings.sendToBusiness) {
        await this.sendMessage(WHATSAPP_CONFIG.businessNumber, message);
      }
      
      // إرسال تأكيد للعميل
      if (WHATSAPP_CONFIG.settings.sendToCustomer && orderData.customer.phone) {
        const confirmationMessage = this.createConfirmationMessage(orderData);
        await this.sendMessage(orderData.customer.phone, confirmationMessage);
      }
      
      return {
        success: true,
        orderId: orderData.orderId,
        sentToBusiness: WHATSAPP_CONFIG.settings.sendToBusiness,
        sentToCustomer: WHATSAPP_CONFIG.settings.sendToCustomer
      };
      
    } catch (error) {
      console.error('Error sending WhatsApp message:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  // إنشاء رسالة الطلب
  createOrderMessage(orderData) {
    const template = WHATSAPP_CONFIG.templates.newOrder;
    
    switch (template.format) {
      case 'detailed':
        return this.createDetailedOrderMessage(orderData);
      case 'simple':
        return this.createSimpleOrderMessage(orderData);
      case 'invoice':
        return this.createInvoiceMessage(orderData);
      default:
        return this.createDetailedOrderMessage(orderData);
    }
  }
  
  // إنشاء رسالة طلب مفصلة
  createDetailedOrderMessage(orderData) {
    const emojis = WHATSAPP_CONFIG.settings.useEmojis;
    const title = emojis ? '🛒 *طلب جديد من مكتبة ومطبعة كيان*' : '*طلب جديد من مكتبة ومطبعة كيان*';
    
    let message = `${title}\n\n`;
    
    // معلومات الطلب
    message += `${emojis ? '📋' : ''} *رقم الطلب:* ${orderData.orderId}\n`;
    message += `${emojis ? '📅' : ''} *التاريخ:* ${this.formatDate(orderData.timestamp)}\n\n`;
    
    // معلومات العميل
    message += `${emojis ? '👤' : ''} *معلومات العميل:*\n`;
    message += `• الاسم: ${orderData.customer.name}\n`;
    message += `• الهاتف: ${orderData.customer.phone}\n`;
    if (orderData.customer.email) {
      message += `• البريد: ${orderData.customer.email}\n`;
    }
    message += `• العنوان: ${orderData.customer.address}\n`;
    message += `• المحافظة: ${orderData.customer.governorate}\n\n`;
    
    // المنتجات
    message += `${emojis ? '🛍️' : ''} *المنتجات:*\n`;
    orderData.items.forEach((item, index) => {
      message += `${index + 1}. *${item.title}*\n`;
      message += `   الكمية: ${item.quantity}\n`;
      message += `   السعر: ${item.price} ج.م\n`;
      message += `   المجموع: ${item.total} ج.م\n`;
      
      // إضافة رابط المنتج إذا كان متاحاً
      if (WHATSAPP_CONFIG.settings.includeProductLinks && item.url && item.url !== '#') {
        message += `   الرابط: ${item.url}\n`;
      }
      message += '\n';
    });
    
    // المجاميع
    message += `${emojis ? '💰' : ''} *ملخص الطلب:*\n`;
    message += `• المجموع الفرعي: ${orderData.totals.subtotal.toFixed(2)} ج.م\n`;
    if (orderData.totals.tax > 0) {
      message += `• الضريبة: ${orderData.totals.tax.toFixed(2)} ج.م\n`;
    }
    if (orderData.totals.shipping > 0) {
      message += `• الشحن: ${orderData.totals.shipping.toFixed(2)} ج.م\n`;
    } else {
      message += `• الشحن: مجاني ${emojis ? '🎉' : ''}\n`;
    }
    if (orderData.totals.paymentFees > 0) {
      message += `• رسوم الدفع: ${orderData.totals.paymentFees.toFixed(2)} ج.م\n`;
    }
    message += `• *المجموع النهائي: ${orderData.totals.total.toFixed(2)} ج.م*\n\n`;
    
    // طريقة الدفع
    message += `${emojis ? '💳' : ''} *طريقة الدفع:* ${orderData.payment.methodName}\n\n`;
    
    // ملاحظات
    if (orderData.notes) {
      message += `${emojis ? '📝' : ''} *ملاحظات:*\n${orderData.notes}\n\n`;
    }
    
    // معلومات الاتصال
    message += `${emojis ? '📞' : ''} *للاستفسار:*\n`;
    message += `هاتف: ${STORE_CONFIG.phone}\n`;
    message += `إنستجرام: @${STORE_CONFIG.instagram}\n\n`;
    
    message += `${emojis ? '🏪' : ''} *مكتبة ومطبعة كيان لخدمات الطباعة المتكاملة*`;
    
    return message;
  }
  
  // إنشاء رسالة طلب بسيطة
  createSimpleOrderMessage(orderData) {
    const emojis = WHATSAPP_CONFIG.settings.useEmojis;
    
    let message = `${emojis ? '🛒' : ''} *طلب جديد*\n\n`;
    message += `رقم الطلب: ${orderData.orderId}\n`;
    message += `العميل: ${orderData.customer.name}\n`;
    message += `الهاتف: ${orderData.customer.phone}\n`;
    message += `المجموع: ${orderData.totals.total.toFixed(2)} ج.م\n`;
    message += `الدفع: ${orderData.payment.methodName}\n\n`;
    
    message += `المنتجات:\n`;
    orderData.items.forEach((item, index) => {
      message += `${index + 1}. ${item.title} (${item.quantity}x)\n`;
    });
    
    return message;
  }
  
  // إنشاء فاتورة
  createInvoiceMessage(orderData) {
    const emojis = WHATSAPP_CONFIG.settings.useEmojis;
    
    let message = `${emojis ? '🧾' : ''} *فاتورة رقم ${orderData.orderId}*\n\n`;
    
    // معلومات المتجر
    message += `*مكتبة ومطبعة كيان*\n`;
    message += `هاتف: ${STORE_CONFIG.phone}\n`;
    message += `العنوان: ${STORE_CONFIG.address}\n\n`;
    
    // معلومات العميل
    message += `*بيانات العميل:*\n`;
    message += `${orderData.customer.name}\n`;
    message += `${orderData.customer.phone}\n`;
    message += `${orderData.customer.address}\n\n`;
    
    // تاريخ الفاتورة
    message += `*التاريخ:* ${this.formatDate(orderData.timestamp)}\n\n`;
    
    // جدول المنتجات
    message += `*المنتجات:*\n`;
    message += `${'─'.repeat(30)}\n`;
    
    orderData.items.forEach((item, index) => {
      message += `${index + 1}. ${item.title}\n`;
      message += `   ${item.quantity} × ${item.price} = ${item.total} ج.م\n`;
    });
    
    message += `${'─'.repeat(30)}\n`;
    
    // المجاميع
    message += `المجموع الفرعي: ${orderData.totals.subtotal.toFixed(2)} ج.م\n`;
    if (orderData.totals.tax > 0) {
      message += `الضريبة (14%): ${orderData.totals.tax.toFixed(2)} ج.م\n`;
    }
    if (orderData.totals.shipping > 0) {
      message += `الشحن: ${orderData.totals.shipping.toFixed(2)} ج.م\n`;
    }
    if (orderData.totals.paymentFees > 0) {
      message += `رسوم الدفع: ${orderData.totals.paymentFees.toFixed(2)} ج.م\n`;
    }
    
    message += `${'═'.repeat(30)}\n`;
    message += `*المجموع النهائي: ${orderData.totals.total.toFixed(2)} ج.م*\n\n`;
    
    message += `*طريقة الدفع:* ${orderData.payment.methodName}\n\n`;
    
    message += `${emojis ? '🙏' : ''} شكراً لتعاملكم معنا!`;
    
    return message;
  }
  
  // إنشاء رسالة تأكيد للعميل
  createConfirmationMessage(orderData) {
    const emojis = WHATSAPP_CONFIG.settings.useEmojis;
    
    let message = `${emojis ? '✅' : ''} *تم استلام طلبكم بنجاح!*\n\n`;
    
    message += `عزيزي/عزيزتي ${orderData.customer.name}\n\n`;
    
    message += `تم استلام طلبكم رقم: *${orderData.orderId}*\n`;
    message += `بقيمة: *${orderData.totals.total.toFixed(2)} ج.م*\n\n`;
    
    message += `${emojis ? '📦' : ''} سيتم التواصل معكم قريباً لتأكيد الطلب وتحديد موعد التسليم.\n\n`;
    
    // تعليمات الدفع حسب الطريقة المختارة
    message += this.getPaymentInstructions(orderData.payment.method);
    
    message += `${emojis ? '📞' : ''} للاستفسار: ${STORE_CONFIG.phone}\n\n`;
    
    message += `${emojis ? '🙏' : ''} شكراً لثقتكم في مكتبة ومطبعة كيان`;
    
    return message;
  }
  
  // الحصول على تعليمات الدفع
  getPaymentInstructions(paymentMethod) {
    const emojis = WHATSAPP_CONFIG.settings.useEmojis;
    
    switch (paymentMethod) {
      case 'cod':
        return `${emojis ? '💰' : ''} *الدفع عند الاستلام*\nستدفعون قيمة الطلب عند استلامه.\n\n`;
      
      case 'vodafone':
      case 'orange':
      case 'etisalat':
        return `${emojis ? '📱' : ''} *تعليمات الدفع الإلكتروني:*\n` +
               `1. ادفعوا للرقم: ${STORE_CONFIG.phone}\n` +
               `2. أرسلوا صورة الإيصال هنا\n` +
               `3. اذكروا رقم الطلب مع الإيصال\n\n`;
      
      case 'bank':
        return `${emojis ? '🏦' : ''} *تعليمات التحويل البنكي:*\n` +
               `سيتم إرسال بيانات الحساب البنكي قريباً.\n` +
               `يرجى إرسال صورة الإيصال بعد التحويل.\n\n`;
      
      case 'fawry':
        return `${emojis ? '🏪' : ''} *تعليمات الدفع عبر فوري:*\n` +
               `اذهبوا لأقرب فرع فوري واستخدموا الكود: KAYAN2024\n` +
               `أرسلوا صورة الإيصال بعد الدفع.\n\n`;
      
      default:
        return '';
    }
  }
  
  // إرسال تحديث حالة الطلب
  async sendStatusUpdate(orderData, newStatus, customerPhone) {
    try {
      const message = this.createStatusUpdateMessage(orderData, newStatus);
      
      if (customerPhone) {
        await this.sendMessage(customerPhone, message);
        return { success: true, status: newStatus };
      } else {
        throw new Error('Customer phone number not provided');
      }
      
    } catch (error) {
      console.error('Error sending status update:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  // إنشاء رسالة تحديث الحالة
  createStatusUpdateMessage(orderData, newStatus) {
    const emojis = WHATSAPP_CONFIG.settings.useEmojis;
    const statusEmojis = {
      'جديد': '🆕',
      'قيد المراجعة': '👀',
      'تم التأكيد': '✅',
      'قيد التجهيز': '📦',
      'جاهز للشحن': '🚚',
      'تم الشحن': '📫',
      'تم التسليم': '🎉',
      'ملغي': '❌',
      'مرتجع': '↩️'
    };
    
    const statusEmoji = emojis ? (statusEmojis[newStatus] || '📋') : '';
    
    let message = `${statusEmoji} *تحديث حالة الطلب*\n\n`;
    
    message += `عزيزي/عزيزتي ${orderData.customer.name}\n\n`;
    
    message += `طلبكم رقم: *${orderData.orderId}*\n`;
    message += `الحالة الجديدة: *${newStatus}*\n\n`;
    
    // رسائل مخصصة حسب الحالة
    switch (newStatus) {
      case 'تم التأكيد':
        message += `${emojis ? '✅' : ''} تم تأكيد طلبكم وسيتم البدء في التجهيز قريباً.\n\n`;
        break;
      case 'قيد التجهيز':
        message += `${emojis ? '📦' : ''} جاري تجهيز طلبكم الآن.\n\n`;
        break;
      case 'جاهز للشحن':
        message += `${emojis ? '🚚' : ''} طلبكم جاهز للشحن وسيتم إرساله قريباً.\n\n`;
        break;
      case 'تم الشحن':
        message += `${emojis ? '📫' : ''} تم شحن طلبكم وسيصلكم خلال المدة المحددة.\n\n`;
        break;
      case 'تم التسليم':
        message += `${emojis ? '🎉' : ''} تم تسليم طلبكم بنجاح! نشكركم لثقتكم بنا.\n\n`;
        break;
      case 'ملغي':
        message += `${emojis ? '❌' : ''} تم إلغاء طلبكم. للاستفسار يرجى التواصل معنا.\n\n`;
        break;
    }
    
    message += `${emojis ? '📞' : ''} للاستفسار: ${STORE_CONFIG.phone}\n\n`;
    message += `${emojis ? '🏪' : ''} مكتبة ومطبعة كيان`;
    
    return message;
  }
  
  // إرسال رسالة عبر WhatsApp
  async sendMessage(phoneNumber, message) {
    try {
      // تنظيف رقم الهاتف
      const cleanPhone = this.cleanPhoneNumber(phoneNumber);
      
      // إنشاء رابط WhatsApp
      const whatsappUrl = `${WHATSAPP_CONFIG.apiUrl}?phone=${cleanPhone}&text=${encodeURIComponent(message)}`;
      
      // فتح WhatsApp
      if (WHATSAPP_CONFIG.settings.autoSend) {
        window.open(whatsappUrl, '_blank');
      }
      
      return {
        success: true,
        url: whatsappUrl,
        phone: cleanPhone
      };
      
    } catch (error) {
      console.error('Error creating WhatsApp message:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  // تنظيف رقم الهاتف
  cleanPhoneNumber(phone) {
    // إزالة جميع الرموز غير الرقمية
    let cleanPhone = phone.replace(/\D/g, '');
    
    // إضافة كود الدولة إذا لم يكن موجوداً
    if (cleanPhone.startsWith('01')) {
      cleanPhone = '2' + cleanPhone; // إضافة كود مصر
    } else if (!cleanPhone.startsWith('2')) {
      cleanPhone = '2' + cleanPhone;
    }
    
    return cleanPhone;
  }
  
  // تنسيق التاريخ
  formatDate(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
  
  // إنشاء رابط WhatsApp مباشر
  createWhatsAppLink(phoneNumber, message) {
    const cleanPhone = this.cleanPhoneNumber(phoneNumber);
    return `${WHATSAPP_CONFIG.apiUrl}?phone=${cleanPhone}&text=${encodeURIComponent(message)}`;
  }
  
  // إرسال رسالة ترحيب للعملاء الجدد
  async sendWelcomeMessage(customerData) {
    const emojis = WHATSAPP_CONFIG.settings.useEmojis;
    
    let message = `${emojis ? '🎉' : ''} *أهلاً وسهلاً بكم في مكتبة ومطبعة كيان!*\n\n`;
    
    message += `عزيزي/عزيزتي ${customerData.name}\n\n`;
    
    message += `${emojis ? '🏪' : ''} نحن متخصصون في:\n`;
    message += `• خدمات الطباعة المتكاملة\n`;
    message += `• الأدوات المكتبية\n`;
    message += `• الكتب والمراجع\n`;
    message += `• التصميم والطباعة\n\n`;
    
    message += `${emojis ? '🚚' : ''} *شحن مجاني* للطلبات أكثر من 500 ج.م\n\n`;
    
    message += `${emojis ? '📞' : ''} للطلب والاستفسار: ${STORE_CONFIG.phone}\n`;
    message += `${emojis ? '📱' : ''} تابعونا: @${STORE_CONFIG.instagram}\n\n`;
    
    message += `${emojis ? '🙏' : ''} نتطلع لخدمتكم!`;
    
    return await this.sendMessage(customerData.phone, message);
  }
}

// إنشاء مثيل من معالج WhatsApp
const whatsappIntegration = new WhatsAppIntegration();

// وظيفة عامة لإرسال طلب عبر WhatsApp (للاستخدام من ملفات أخرى)
async function sendOrderToWhatsApp(orderData) {
  return await whatsappIntegration.sendNewOrder(orderData);
}

// وظيفة عامة لإرسال تحديث الحالة
async function sendStatusUpdateToWhatsApp(orderData, newStatus, customerPhone) {
  return await whatsappIntegration.sendStatusUpdate(orderData, newStatus, customerPhone);
}

// وظيفة عامة لإرسال رسالة مخصصة
async function sendCustomWhatsAppMessage(phoneNumber, message) {
  return await whatsappIntegration.sendMessage(phoneNumber, message);
}

// وظيفة عامة لإنشاء رابط WhatsApp
function createWhatsAppLink(phoneNumber, message) {
  return whatsappIntegration.createWhatsAppLink(phoneNumber, message);
}

// تصدير للاستخدام في ملفات أخرى
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    WhatsAppIntegration,
    WHATSAPP_CONFIG,
    sendOrderToWhatsApp,
    sendStatusUpdateToWhatsApp,
    sendCustomWhatsAppMessage,
    createWhatsAppLink
  };
}
