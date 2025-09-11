/**
 * نظام الشحن المتكامل - مكتبة ومطبعة كيان
 * دعم جميع المحافظات المصرية مع حساب التكلفة التلقائي
 */

// بيانات المحافظات المصرية وأسعار الشحن
const SHIPPING_CONFIG = {
  freeShippingThreshold: 500, // شحن مجاني للطلبات أكثر من 500 جنيه
  defaultShippingCost: 25,
  
  // أسعار الشحن لكل محافظة (بالجنيه المصري)
  governorates: {
    'cairo': {
      name: 'القاهرة',
      cost: 15,
      deliveryTime: '1-2 أيام عمل',
      zones: ['مدينة نصر', 'المعادي', 'الزمالك', 'وسط البلد', 'مصر الجديدة', 'الدقي', 'المهندسين']
    },
    'giza': {
      name: 'الجيزة',
      cost: 15,
      deliveryTime: '1-2 أيام عمل',
      zones: ['الهرم', 'فيصل', 'المنيب', 'العجوزة', 'المهندسين', 'الدقي']
    },
    'alexandria': {
      name: 'الإسكندرية',
      cost: 25,
      deliveryTime: '2-3 أيام عمل',
      zones: ['المنتزه', 'العطارين', 'الرمل', 'سيدي جابر', 'سموحة', 'ميامي']
    },
    'qalyubia': {
      name: 'القليوبية',
      cost: 20,
      deliveryTime: '2-3 أيام عمل',
      zones: ['شبرا الخيمة', 'القناطر', 'بنها', 'طوخ', 'كفر شكر']
    },
    'sharqia': {
      name: 'الشرقية',
      cost: 30,
      deliveryTime: '3-4 أيام عمل',
      zones: ['الزقازيق', 'بلبيس', 'مشتول السوق', 'القرين', 'أبو حماد']
    },
    'dakahlia': {
      name: 'الدقهلية',
      cost: 30,
      deliveryTime: '3-4 أيام عمل',
      zones: ['المنصورة', 'طلخا', 'ميت غمر', 'السنبلاوين', 'دكرنس']
    },
    'gharbia': {
      name: 'الغربية',
      cost: 30,
      deliveryTime: '3-4 أيام عمل',
      zones: ['طنطا', 'المحلة الكبرى', 'كفر الزيات', 'زفتى', 'السنطة']
    },
    'kafr_el_sheikh': {
      name: 'كفر الشيخ',
      cost: 35,
      deliveryTime: '3-4 أيام عمل',
      zones: ['كفر الشيخ', 'دسوق', 'فوه', 'مطوبس', 'بيلا']
    },
    'beheira': {
      name: 'البحيرة',
      cost: 30,
      deliveryTime: '3-4 أيام عمل',
      zones: ['دمنهور', 'كوم حمادة', 'إيتاي البارود', 'رشيد', 'أبو المطامير']
    },
    'menoufia': {
      name: 'المنوفية',
      cost: 25,
      deliveryTime: '2-3 أيام عمل',
      zones: ['شبين الكوم', 'منوف', 'سرس الليان', 'أشمون', 'الباجور']
    },
    'damietta': {
      name: 'دمياط',
      cost: 35,
      deliveryTime: '3-4 أيام عمل',
      zones: ['دمياط', 'رأس البر', 'فارسكور', 'الزرقا', 'كفر سعد']
    },
    'port_said': {
      name: 'بورسعيد',
      cost: 35,
      deliveryTime: '3-4 أيام عمل',
      zones: ['بورسعيد', 'بورفؤاد']
    },
    'ismailia': {
      name: 'الإسماعيلية',
      cost: 30,
      deliveryTime: '3-4 أيام عمل',
      zones: ['الإسماعيلية', 'فايد', 'القنطرة شرق', 'القنطرة غرب', 'أبو صوير']
    },
    'suez': {
      name: 'السويس',
      cost: 30,
      deliveryTime: '3-4 أيام عمل',
      zones: ['السويس', 'الأربعين', 'عتاقة']
    },
    'north_sinai': {
      name: 'شمال سيناء',
      cost: 50,
      deliveryTime: '5-7 أيام عمل',
      zones: ['العريش', 'رفح', 'الشيخ زويد', 'بئر العبد']
    },
    'south_sinai': {
      name: 'جنوب سيناء',
      cost: 60,
      deliveryTime: '5-7 أيام عمل',
      zones: ['شرم الشيخ', 'دهب', 'نويبع', 'طور سيناء', 'سانت كاترين']
    },
    'red_sea': {
      name: 'البحر الأحمر',
      cost: 55,
      deliveryTime: '5-7 أيام عمل',
      zones: ['الغردقة', 'سفاجا', 'القصير', 'مرسى علم', 'الشلاتين']
    },
    'fayoum': {
      name: 'الفيوم',
      cost: 30,
      deliveryTime: '3-4 أيام عمل',
      zones: ['الفيوم', 'سنورس', 'طامية', 'إطسا', 'يوسف الصديق']
    },
    'beni_suef': {
      name: 'بني سويف',
      cost: 30,
      deliveryTime: '3-4 أيام عمل',
      zones: ['بني سويف', 'الواسطى', 'ناصر', 'إهناسيا', 'ببا']
    },
    'minya': {
      name: 'المنيا',
      cost: 35,
      deliveryTime: '4-5 أيام عمل',
      zones: ['المنيا', 'ملوي', 'سمالوط', 'بني مزار', 'مطاي']
    },
    'asyut': {
      name: 'أسيوط',
      cost: 40,
      deliveryTime: '4-5 أيام عمل',
      zones: ['أسيوط', 'ديروط', 'القوصية', 'منفلوط', 'أبنوب']
    },
    'sohag': {
      name: 'سوهاج',
      cost: 45,
      deliveryTime: '4-5 أيام عمل',
      zones: ['سوهاج', 'أخميم', 'البلينا', 'المراغة', 'طما']
    },
    'qena': {
      name: 'قنا',
      cost: 45,
      deliveryTime: '4-5 أيام عمل',
      zones: ['قنا', 'قوص', 'نقادة', 'فرشوط', 'الوقف']
    },
    'luxor': {
      name: 'الأقصر',
      cost: 50,
      deliveryTime: '5-6 أيام عمل',
      zones: ['الأقصر', 'إسنا', 'الطود', 'أرمنت', 'القرنة']
    },
    'aswan': {
      name: 'أسوان',
      cost: 55,
      deliveryTime: '5-7 أيام عمل',
      zones: ['أسوان', 'كوم أمبو', 'إدفو', 'نصر النوبة', 'أبو سمبل']
    },
    'new_valley': {
      name: 'الوادي الجديد',
      cost: 60,
      deliveryTime: '6-8 أيام عمل',
      zones: ['الخارجة', 'الداخلة', 'الفرافرة', 'باريس', 'بلاط']
    },
    'matrouh': {
      name: 'مطروح',
      cost: 50,
      deliveryTime: '5-7 أيام عمل',
      zones: ['مرسى مطروح', 'الحمام', 'العلمين', 'سيوة', 'الضبعة']
    }
  }
};

// معالج نظام الشحن
class ShippingHandler {
  constructor() {
    this.selectedGovernorate = null;
    this.shippingCost = 0;
    this.deliveryTime = '';
  }
  
  // تهيئة نظام الشحن
  initialize() {
    this.populateGovernoratesSelect();
    this.attachEventListeners();
  }
  
  // ملء قائمة المحافظات
  populateGovernoratesSelect() {
    const governorateSelect = document.querySelector('select[name="governorate"]');
    if (!governorateSelect) return;
    
    let optionsHTML = '<option value="">اختر المحافظة</option>';
    
    // ترتيب المحافظات حسب التكلفة (الأقل أولاً)
    const sortedGovernorates = Object.entries(SHIPPING_CONFIG.governorates)
      .sort(([,a], [,b]) => a.cost - b.cost);
    
    sortedGovernorates.forEach(([key, governorate]) => {
      const freeShipping = this.isEligibleForFreeShipping() ? ' (شحن مجاني)' : ` (${governorate.cost} ج.م)`;
      optionsHTML += `<option value="${key}">${governorate.name}${freeShipping}</option>`;
    });
    
    governorateSelect.innerHTML = optionsHTML;
  }
  
  // ربط مستمعات الأحداث
  attachEventListeners() {
    // مستمع تغيير المحافظة
    document.addEventListener('change', (e) => {
      if (e.target.name === 'governorate') {
        this.handleGovernorateChange(e.target.value);
      }
    });
    
    // مستمع تحديث السلة (لإعادة حساب الشحن المجاني)
    document.addEventListener('cartUpdated', () => {
      this.updateShippingCost();
      this.populateGovernoratesSelect(); // إعادة ملء القائمة مع تحديث أسعار الشحن المجاني
    });
  }
  
  // معالج تغيير المحافظة
  handleGovernorateChange(governorateKey) {
    this.selectedGovernorate = governorateKey;
    this.updateShippingCost();
    this.showShippingInfo(governorateKey);
    this.updateOrderTotal();
  }
  
  // تحديث تكلفة الشحن
  updateShippingCost() {
    if (!this.selectedGovernorate) {
      this.shippingCost = 0;
      this.deliveryTime = '';
      return;
    }
    
    const governorate = SHIPPING_CONFIG.governorates[this.selectedGovernorate];
    if (!governorate) return;
    
    // التحقق من الشحن المجاني
    if (this.isEligibleForFreeShipping()) {
      this.shippingCost = 0;
      this.deliveryTime = governorate.deliveryTime;
    } else {
      this.shippingCost = governorate.cost;
      this.deliveryTime = governorate.deliveryTime;
    }
  }
  
  // التحقق من الأهلية للشحن المجاني
  isEligibleForFreeShipping() {
    const cartTotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    return cartTotal >= SHIPPING_CONFIG.freeShippingThreshold;
  }
  
  // عرض معلومات الشحن
  showShippingInfo(governorateKey) {
    const governorate = SHIPPING_CONFIG.governorates[governorateKey];
    if (!governorate) return;
    
    const shippingInfoContainer = this.getOrCreateShippingInfoContainer();
    
    const isFreeShipping = this.isEligibleForFreeShipping();
    const shippingCostText = isFreeShipping ? 'مجاني' : `${governorate.cost} ج.م`;
    const freeShippingMessage = isFreeShipping ? 
      '<div class="free-shipping-badge">🎉 تهانينا! حصلت على شحن مجاني</div>' : 
      `<div class="free-shipping-info">💡 احصل على شحن مجاني للطلبات أكثر من ${SHIPPING_CONFIG.freeShippingThreshold} ج.م</div>`;
    
    shippingInfoContainer.innerHTML = `
      <div class="shipping-info">
        <h4>🚚 معلومات الشحن - ${governorate.name}</h4>
        <div class="shipping-details">
          <div class="detail-row">
            <span class="label">تكلفة الشحن:</span>
            <span class="value ${isFreeShipping ? 'free-shipping' : ''}">${shippingCostText}</span>
          </div>
          <div class="detail-row">
            <span class="label">مدة التوصيل:</span>
            <span class="value">${governorate.deliveryTime}</span>
          </div>
          <div class="detail-row">
            <span class="label">المناطق المتاحة:</span>
            <span class="value zones">${governorate.zones.join(' • ')}</span>
          </div>
        </div>
        ${freeShippingMessage}
        <div class="shipping-note">
          <strong>ملاحظة:</strong> أوقات التوصيل تقريبية وقد تختلف حسب الظروف الجوية والمرورية
        </div>
      </div>
    `;
    
    shippingInfoContainer.style.display = 'block';
  }
  
  // الحصول على أو إنشاء حاوي معلومات الشحن
  getOrCreateShippingInfoContainer() {
    let container = document.getElementById('shippingInfo');
    if (!container) {
      container = document.createElement('div');
      container.id = 'shippingInfo';
      container.className = 'shipping-info-container';
      
      const governorateSelect = document.querySelector('select[name="governorate"]');
      if (governorateSelect && governorateSelect.parentNode) {
        governorateSelect.parentNode.insertBefore(container, governorateSelect.nextSibling);
      }
    }
    return container;
  }
  
  // تحديث المجموع الكلي
  updateOrderTotal() {
    // تحديث تكلفة الشحن في حسابات السلة
    if (typeof updateShippingCost === 'function') {
      updateShippingCost(this.shippingCost);
    }
    
    // تحديث عرض تكلفة الشحن
    const shippingElements = document.querySelectorAll('#checkoutShipping');
    shippingElements.forEach(el => {
      if (this.shippingCost === 0) {
        el.textContent = 'مجاني';
        el.classList.add('free-shipping');
      } else {
        el.textContent = `${this.shippingCost} ${CART_CONFIG.currency}`;
        el.classList.remove('free-shipping');
      }
    });
  }
  
  // الحصول على تكلفة الشحن الحالية
  getCurrentShippingCost() {
    return this.shippingCost;
  }
  
  // الحصول على معلومات الشحن للطلب
  getShippingInfo() {
    if (!this.selectedGovernorate) return null;
    
    const governorate = SHIPPING_CONFIG.governorates[this.selectedGovernorate];
    return {
      governorate: governorate.name,
      governorateKey: this.selectedGovernorate,
      cost: this.shippingCost,
      deliveryTime: this.deliveryTime,
      isFreeShipping: this.shippingCost === 0
    };
  }
  
  // البحث عن محافظة بالاسم
  searchGovernorate(searchTerm) {
    const results = [];
    const term = searchTerm.toLowerCase().trim();
    
    Object.entries(SHIPPING_CONFIG.governorates).forEach(([key, governorate]) => {
      // البحث في اسم المحافظة
      if (governorate.name.toLowerCase().includes(term)) {
        results.push({ key, governorate, matchType: 'name' });
        return;
      }
      
      // البحث في المناطق
      const matchingZones = governorate.zones.filter(zone => 
        zone.toLowerCase().includes(term)
      );
      
      if (matchingZones.length > 0) {
        results.push({ 
          key, 
          governorate, 
          matchType: 'zone', 
          matchingZones 
        });
      }
    });
    
    return results;
  }
  
  // حساب تكلفة الشحن لمحافظة معينة
  calculateShippingCost(governorateKey, cartTotal = null) {
    const governorate = SHIPPING_CONFIG.governorates[governorateKey];
    if (!governorate) return SHIPPING_CONFIG.defaultShippingCost;
    
    const total = cartTotal || cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    if (total >= SHIPPING_CONFIG.freeShippingThreshold) {
      return 0; // شحن مجاني
    }
    
    return governorate.cost;
  }
  
  // الحصول على قائمة المحافظات مرتبة حسب التكلفة
  getGovernoratesByShippingCost() {
    return Object.entries(SHIPPING_CONFIG.governorates)
      .map(([key, governorate]) => ({
        key,
        name: governorate.name,
        cost: governorate.cost,
        deliveryTime: governorate.deliveryTime
      }))
      .sort((a, b) => a.cost - b.cost);
  }
  
  // التحقق من توفر الشحن لمحافظة معينة
  isShippingAvailable(governorateKey) {
    return SHIPPING_CONFIG.governorates.hasOwnProperty(governorateKey);
  }
}

// تحديث تكلفة الشحن في نظام السلة
function updateShippingCost(newShippingCost) {
  // تحديث المتغير العام لتكلفة الشحن
  if (typeof cartShipping !== 'undefined') {
    cartShipping = newShippingCost;
  }
  
  // إعادة حساب مجاميع السلة
  if (typeof updateCartTotals === 'function') {
    updateCartTotals();
  }
  
  // تحديث ملخص الطلب في نموذج الدفع
  if (typeof updateCheckoutSummary === 'function') {
    updateCheckoutSummary();
  }
}

// إضافة حدث تحديث السلة
function triggerCartUpdatedEvent() {
  const event = new CustomEvent('cartUpdated');
  document.dispatchEvent(event);
}

// تهيئة نظام الشحن
const shippingHandler = new ShippingHandler();

// تشغيل التهيئة عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
  shippingHandler.initialize();
});

// تصدير الوظائف للاستخدام في ملفات أخرى
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    ShippingHandler,
    SHIPPING_CONFIG,
    updateShippingCost,
    triggerCartUpdatedEvent
  };
}
