/**
 * أنظمة الدفع المصرية المتكاملة - مكتبة ومطبعة كيان
 * دعم جميع طرق الدفع المحلية والإلكترونية
 */

// إعدادات أنظمة الدفع
const PAYMENT_CONFIG = {
  // بيانات المحافظ الإلكترونية
  wallets: {
    vodafone: {
      name: 'فودافون كاش',
      number: '01121499017',
      inquiryCode: '*9#',
      fees: 0,
      instructions: 'ادفع للرقم 01121499017 ثم أرسل لنا صورة الإيصال'
    },
    orange: {
      name: 'أورانج كاش',
      number: '01121499017',
      inquiryCode: '*9#',
      fees: 0,
      instructions: 'ادفع للرقم 01121499017 ثم أرسل لنا صورة الإيصال'
    },
    etisalat: {
      name: 'اتصالات كاش',
      number: '01121499017',
      inquiryCode: '*9#',
      fees: 0,
      instructions: 'ادفع للرقم 01121499017 ثم أرسل لنا صورة الإيصال'
    }
  },
  
  // بيانات التحويل البنكي
  bankTransfer: {
    bankName: 'البنك الأهلي المصري',
    accountName: 'مكتبة ومطبعة كيان',
    accountNumber: '1234567890123456',
    iban: 'EG380003000012345678901234567',
    swiftCode: 'NBEAEGCX',
    instructions: 'قم بالتحويل ثم أرسل لنا صورة الإيصال مع رقم الطلب'
  },
  
  // إعدادات فوري
  fawry: {
    merchantCode: 'KAYAN2024',
    fees: 5,
    instructions: 'ادفع في أي فرع فوري باستخدام كود: KAYAN2024'
  },
  
  // الدفع عند الاستلام
  cod: {
    name: 'الدفع عند الاستلام',
    fees: 0,
    availableGovernates: 'all', // متاح لجميع المحافظات
    instructions: 'ستدفع عند استلام الطلب'
  }
};

// معالج طرق الدفع
class PaymentHandler {
  constructor() {
    this.selectedMethod = null;
    this.orderTotal = 0;
    this.paymentFees = 0;
  }
  
  // تهيئة نظام الدفع
  initialize() {
    this.attachEventListeners();
    this.updatePaymentOptions();
  }
  
  // ربط مستمعات الأحداث
  attachEventListeners() {
    // مستمع تغيير طريقة الدفع
    document.addEventListener('change', (e) => {
      if (e.target.name === 'paymentMethod') {
        this.handlePaymentMethodChange(e.target.value);
      }
    });
    
    // مستمع إرسال نموذج الطلب
    document.addEventListener('submit', (e) => {
      if (e.target.id === 'checkoutForm') {
        e.preventDefault();
        this.processOrder(e.target);
      }
    });
  }
  
  // تحديث خيارات الدفع
  updatePaymentOptions() {
    const paymentSelect = document.querySelector('select[name="paymentMethod"]');
    if (!paymentSelect) return;
    
    // إضافة خيارات الدفع
    paymentSelect.innerHTML = `
      <option value="">اختر طريقة الدفع</option>
      <option value="cod">الدفع عند الاستلام (مجاناً)</option>
      <option value="vodafone">فودافون كاش</option>
      <option value="orange">أورانج كاش</option>
      <option value="etisalat">اتصالات كاش</option>
      <option value="bank">تحويل بنكي</option>
      <option value="fawry">فوري (+${PAYMENT_CONFIG.fawry.fees} ج.م)</option>
    `;
  }
  
  // معالج تغيير طريقة الدفع
  handlePaymentMethodChange(method) {
    this.selectedMethod = method;
    this.updatePaymentFees();
    this.showPaymentInstructions(method);
    this.updateOrderTotal();
  }
  
  // تحديث رسوم الدفع
  updatePaymentFees() {
    switch (this.selectedMethod) {
      case 'fawry':
        this.paymentFees = PAYMENT_CONFIG.fawry.fees;
        break;
      default:
        this.paymentFees = 0;
    }
  }
  
  // عرض تعليمات الدفع
  showPaymentInstructions(method) {
    const instructionsContainer = this.getOrCreateInstructionsContainer();
    let instructions = '';
    
    switch (method) {
      case 'cod':
        instructions = this.createCODInstructions();
        break;
      case 'vodafone':
      case 'orange':
      case 'etisalat':
        instructions = this.createWalletInstructions(method);
        break;
      case 'bank':
        instructions = this.createBankInstructions();
        break;
      case 'fawry':
        instructions = this.createFawryInstructions();
        break;
      default:
        instructions = '';
    }
    
    instructionsContainer.innerHTML = instructions;
    instructionsContainer.style.display = instructions ? 'block' : 'none';
  }
  
  // الحصول على أو إنشاء حاوي التعليمات
  getOrCreateInstructionsContainer() {
    let container = document.getElementById('paymentInstructions');
    if (!container) {
      container = document.createElement('div');
      container.id = 'paymentInstructions';
      container.className = 'payment-instructions';
      
      const paymentSelect = document.querySelector('select[name="paymentMethod"]');
      if (paymentSelect && paymentSelect.parentNode) {
        paymentSelect.parentNode.insertBefore(container, paymentSelect.nextSibling);
      }
    }
    return container;
  }
  
  // تعليمات الدفع عند الاستلام
  createCODInstructions() {
    return `
      <div class="payment-method-info cod-info">
        <h4>💰 الدفع عند الاستلام</h4>
        <div class="info-content">
          <p>✅ ستدفع قيمة الطلب عند الاستلام</p>
          <p>📦 متاح لجميع المحافظات</p>
          <p>🚚 بدون رسوم إضافية</p>
          <div class="note">
            <strong>ملاحظة:</strong> يرجى التأكد من توفر المبلغ كاملاً عند الاستلام
          </div>
        </div>
      </div>
    `;
  }
  
  // تعليمات المحافظ الإلكترونية
  createWalletInstructions(walletType) {
    const wallet = PAYMENT_CONFIG.wallets[walletType];
    return `
      <div class="payment-method-info wallet-info">
        <h4>📱 ${wallet.name}</h4>
        <div class="info-content">
          <div class="payment-steps">
            <div class="step">
              <span class="step-number">1</span>
              <div class="step-content">
                <strong>اتصل بـ ${wallet.inquiryCode}</strong>
                <p>للتأكد من رصيدك</p>
              </div>
            </div>
            <div class="step">
              <span class="step-number">2</span>
              <div class="step-content">
                <strong>ادفع للرقم: ${wallet.number}</strong>
                <p>المبلغ: <span id="walletAmount">0</span> ج.م</p>
              </div>
            </div>
            <div class="step">
              <span class="step-number">3</span>
              <div class="step-content">
                <strong>أرسل صورة الإيصال</strong>
                <p>عبر واتساب: ${STORE_CONFIG.phone}</p>
              </div>
            </div>
          </div>
          <div class="note">
            <strong>مهم:</strong> احتفظ برسالة التأكيد وأرسلها لنا
          </div>
        </div>
      </div>
    `;
  }
  
  // تعليمات التحويل البنكي
  createBankInstructions() {
    const bank = PAYMENT_CONFIG.bankTransfer;
    return `
      <div class="payment-method-info bank-info">
        <h4>🏦 التحويل البنكي</h4>
        <div class="info-content">
          <div class="bank-details">
            <div class="detail-row">
              <span class="label">اسم البنك:</span>
              <span class="value">${bank.bankName}</span>
            </div>
            <div class="detail-row">
              <span class="label">اسم الحساب:</span>
              <span class="value">${bank.accountName}</span>
            </div>
            <div class="detail-row">
              <span class="label">رقم الحساب:</span>
              <span class="value copyable" onclick="copyToClipboard('${bank.accountNumber}')">${bank.accountNumber} 📋</span>
            </div>
            <div class="detail-row">
              <span class="label">IBAN:</span>
              <span class="value copyable" onclick="copyToClipboard('${bank.iban}')">${bank.iban} 📋</span>
            </div>
            <div class="detail-row">
              <span class="label">Swift Code:</span>
              <span class="value">${bank.swiftCode}</span>
            </div>
            <div class="detail-row">
              <span class="label">المبلغ:</span>
              <span class="value"><span id="bankAmount">0</span> ج.م</span>
            </div>
          </div>
          <div class="note">
            <strong>بعد التحويل:</strong> أرسل صورة الإيصال مع رقم الطلب عبر واتساب
          </div>
        </div>
      </div>
    `;
  }
  
  // تعليمات فوري
  createFawryInstructions() {
    const fawry = PAYMENT_CONFIG.fawry;
    return `
      <div class="payment-method-info fawry-info">
        <h4>🏪 فوري</h4>
        <div class="info-content">
          <div class="fawry-steps">
            <div class="step">
              <span class="step-number">1</span>
              <div class="step-content">
                <strong>اذهب لأقرب فرع فوري</strong>
                <p>أو ماكينة فوري</p>
              </div>
            </div>
            <div class="step">
              <span class="step-number">2</span>
              <div class="step-content">
                <strong>استخدم الكود: ${fawry.merchantCode}</strong>
                <p>المبلغ: <span id="fawryAmount">0</span> ج.م</p>
              </div>
            </div>
            <div class="step">
              <span class="step-number">3</span>
              <div class="step-content">
                <strong>أرسل صورة الإيصال</strong>
                <p>عبر واتساب مع رقم الطلب</p>
              </div>
            </div>
          </div>
          <div class="fees-notice">
            <strong>رسوم الخدمة:</strong> ${fawry.fees} ج.م (مضافة للمجموع)
          </div>
        </div>
      </div>
    `;
  }
  
  // تحديث المجموع الكلي
  updateOrderTotal() {
    const totals = calculateCartTotals();
    const finalTotal = totals.total + this.paymentFees;
    
    // تحديث المجموع في واجهة الدفع
    const totalElements = document.querySelectorAll('#checkoutTotal');
    totalElements.forEach(el => {
      el.textContent = `${finalTotal.toFixed(2)} ${CART_CONFIG.currency}`;
    });
    
    // تحديث المبالغ في تعليمات الدفع
    const amountElements = document.querySelectorAll('#walletAmount, #bankAmount, #fawryAmount');
    amountElements.forEach(el => {
      el.textContent = finalTotal.toFixed(2);
    });
    
    // إضافة رسوم الدفع إذا كانت موجودة
    if (this.paymentFees > 0) {
      this.showPaymentFees();
    } else {
      this.hidePaymentFees();
    }
  }
  
  // عرض رسوم الدفع
  showPaymentFees() {
    let feesRow = document.getElementById('paymentFeesRow');
    if (!feesRow) {
      feesRow = document.createElement('div');
      feesRow.id = 'paymentFeesRow';
      feesRow.className = 'total-line';
      feesRow.innerHTML = `
        <span>رسوم الدفع:</span>
        <span id="paymentFeesAmount">${this.paymentFees} ${CART_CONFIG.currency}</span>
      `;
      
      const totalsContainer = document.querySelector('.checkout-totals');
      const finalTotalRow = document.querySelector('.total-final');
      if (totalsContainer && finalTotalRow) {
        totalsContainer.insertBefore(feesRow, finalTotalRow);
      }
    } else {
      document.getElementById('paymentFeesAmount').textContent = `${this.paymentFees} ${CART_CONFIG.currency}`;
    }
  }
  
  // إخفاء رسوم الدفع
  hidePaymentFees() {
    const feesRow = document.getElementById('paymentFeesRow');
    if (feesRow) {
      feesRow.remove();
    }
  }
  
  // معالجة الطلب
  async processOrder(form) {
    try {
      // التحقق من صحة البيانات
      if (!this.validateOrderData(form)) {
        return;
      }
      
      // إنشاء بيانات الطلب
      const orderData = this.createOrderData(form);
      
      // إظهار رسالة التحميل
      this.showProcessingMessage();
      
      // حفظ الطلب في Google Sheets
      await this.saveOrderToSheets(orderData);
      
      // إرسال الطلب عبر WhatsApp
      await this.sendOrderToWhatsApp(orderData);
      
      // إظهار رسالة النجاح
      this.showSuccessMessage(orderData);
      
      // إفراغ السلة
      clearCart();
      
      // إغلاق نموذج الطلب
      closeCheckoutModal();
      
    } catch (error) {
      console.error('خطأ في معالجة الطلب:', error);
      this.showErrorMessage('حدث خطأ في معالجة الطلب. يرجى المحاولة مرة أخرى.');
    }
  }
  
  // التحقق من صحة بيانات الطلب
  validateOrderData(form) {
    const formData = new FormData(form);
    
    // التحقق من الحقول المطلوبة
    const requiredFields = ['customerName', 'customerPhone', 'customerAddress', 'governorate', 'paymentMethod'];
    
    for (let field of requiredFields) {
      if (!formData.get(field) || formData.get(field).trim() === '') {
        showNotification(`يرجى ملء حقل ${this.getFieldLabel(field)}`, 'error');
        return false;
      }
    }
    
    // التحقق من رقم الهاتف
    const phone = formData.get('customerPhone');
    if (!this.validatePhoneNumber(phone)) {
      showNotification('يرجى إدخال رقم هاتف صحيح', 'error');
      return false;
    }
    
    // التحقق من وجود منتجات في السلة
    if (cart.length === 0) {
      showNotification('السلة فارغة! يرجى إضافة منتجات أولاً.', 'error');
      return false;
    }
    
    return true;
  }
  
  // التحقق من صحة رقم الهاتف
  validatePhoneNumber(phone) {
    // نمط أرقام الهاتف المصرية
    const phonePattern = /^(01)[0-9]{9}$/;
    return phonePattern.test(phone.replace(/\s+/g, ''));
  }
  
  // الحصول على تسمية الحقل
  getFieldLabel(field) {
    const labels = {
      'customerName': 'الاسم',
      'customerPhone': 'رقم الهاتف',
      'customerAddress': 'العنوان',
      'governorate': 'المحافظة',
      'paymentMethod': 'طريقة الدفع'
    };
    return labels[field] || field;
  }
  
  // إنشاء بيانات الطلب
  createOrderData(form) {
    const formData = new FormData(form);
    const totals = calculateCartTotals();
    const finalTotal = totals.total + this.paymentFees;
    
    return {
      orderId: this.generateOrderId(),
      timestamp: new Date().toISOString(),
      customer: {
        name: formData.get('customerName'),
        phone: formData.get('customerPhone'),
        email: formData.get('customerEmail') || '',
        address: formData.get('customerAddress'),
        governorate: formData.get('governorate')
      },
      items: cart.map(item => ({
        title: item.title,
        price: item.price,
        quantity: item.quantity,
        total: item.price * item.quantity,
        url: item.url
      })),
      totals: {
        subtotal: totals.subtotal,
        tax: totals.tax,
        shipping: totals.shipping,
        paymentFees: this.paymentFees,
        total: finalTotal
      },
      payment: {
        method: this.selectedMethod,
        methodName: this.getPaymentMethodName(this.selectedMethod)
      },
      notes: formData.get('orderNotes') || '',
      status: 'جديد'
    };
  }
  
  // توليد رقم طلب فريد
  generateOrderId() {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `KAYAN-${timestamp}-${random}`;
  }
  
  // الحصول على اسم طريقة الدفع
  getPaymentMethodName(method) {
    const names = {
      'cod': 'الدفع عند الاستلام',
      'vodafone': 'فودافون كاش',
      'orange': 'أورانج كاش',
      'etisalat': 'اتصالات كاش',
      'bank': 'تحويل بنكي',
      'fawry': 'فوري'
    };
    return names[method] || method;
  }
  
  // حفظ الطلب في Google Sheets
  async saveOrderToSheets(orderData) {
    // سيتم تطوير هذه الوظيفة في ملف sheets-integration.js
    if (typeof saveOrderToGoogleSheets === 'function') {
      await saveOrderToGoogleSheets(orderData);
    }
  }
  
  // إرسال الطلب عبر WhatsApp
  async sendOrderToWhatsApp(orderData) {
    // سيتم تطوير هذه الوظيفة في ملف whatsapp-integration.js
    if (typeof sendOrderToWhatsApp === 'function') {
      await sendOrderToWhatsApp(orderData);
    }
  }
  
  // إظهار رسالة المعالجة
  showProcessingMessage() {
    showNotification('جاري معالجة الطلب...', 'info');
  }
  
  // إظهار رسالة النجاح
  showSuccessMessage(orderData) {
    const message = `
      تم إرسال طلبك بنجاح! 🎉
      رقم الطلب: ${orderData.orderId}
      سنتواصل معك قريباً لتأكيد الطلب.
    `;
    showNotification(message, 'success');
  }
  
  // إظهار رسالة خطأ
  showErrorMessage(message) {
    showNotification(message, 'error');
  }
}

// نسخ النص للحافظة
function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(() => {
    showNotification('تم نسخ النص بنجاح!', 'success');
  }).catch(() => {
    // طريقة بديلة للنسخ
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
    showNotification('تم نسخ النص بنجاح!', 'success');
  });
}

// تهيئة نظام الدفع
const paymentHandler = new PaymentHandler();

// تشغيل التهيئة عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
  paymentHandler.initialize();
});
