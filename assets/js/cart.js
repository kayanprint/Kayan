/**
 * نظام عربة التسوق المتطور - مكتبة ومطبعة كيان
 * إدارة السلة مع localStorage والحسابات التلقائية
 */

// متغيرات عامة للسلة
let cart = JSON.parse(localStorage.getItem('kayanCart')) || [];
let cartTotal = 0;
let cartTax = 0;
let cartShipping = 0;
let cartDiscount = 0;

// إعدادات السلة
const CART_CONFIG = {
  taxRate: 0.14, // 14% ضريبة القيمة المضافة
  freeShippingThreshold: 500, // شحن مجاني للطلبات أكثر من 500 جنيه
  maxQuantity: 10, // أقصى كمية للمنتج الواحد
  currency: 'ج.م',
  storageKey: 'kayanCart'
};

// إضافة منتج للسلة
function addToCart(title, price, image, url, quantity = 1) {
  // التحقق من صحة البيانات
  if (!title || price < 0) {
    showNotification('بيانات المنتج غير صحيحة!', 'error');
    return false;
  }
  
  // البحث عن المنتج في السلة
  const existingItemIndex = cart.findIndex(item => item.title === title);
  
  if (existingItemIndex > -1) {
    // المنتج موجود، زيادة الكمية
    const newQuantity = cart[existingItemIndex].quantity + quantity;
    if (newQuantity > CART_CONFIG.maxQuantity) {
      showNotification(`الحد الأقصى للكمية هو ${CART_CONFIG.maxQuantity}`, 'warning');
      return false;
    }
    cart[existingItemIndex].quantity = newQuantity;
  } else {
    // منتج جديد
    const item = {
      id: Date.now() + Math.random(),
      title: title,
      price: parseFloat(price),
      image: image || 'https://via.placeholder.com/100x100?text=منتج',
      url: url || '#',
      quantity: quantity,
      addedAt: new Date().toISOString()
    };
    cart.push(item);
  }
  
  // حفظ السلة وتحديث الواجهة
  saveCart();
  updateCartUI();
  showNotification('تم إضافة المنتج إلى السلة بنجاح!', 'success');
  
  // إظهار السلة العائمة لثانيتين
  showFloatingCart(2000);
  
  return true;
}

// حذف منتج من السلة
function removeFromCart(itemId) {
  const itemIndex = cart.findIndex(item => item.id === itemId);
  if (itemIndex > -1) {
    const itemTitle = cart[itemIndex].title;
    cart.splice(itemIndex, 1);
    saveCart();
    updateCartUI();
    showNotification(`تم حذف "${itemTitle}" من السلة`, 'info');
  }
}

// تحديث كمية منتج في السلة
function updateCartItemQuantity(itemId, newQuantity) {
  const itemIndex = cart.findIndex(item => item.id === itemId);
  if (itemIndex > -1) {
    if (newQuantity <= 0) {
      removeFromCart(itemId);
      return;
    }
    
    if (newQuantity > CART_CONFIG.maxQuantity) {
      showNotification(`الحد الأقصى للكمية هو ${CART_CONFIG.maxQuantity}`, 'warning');
      return;
    }
    
    cart[itemIndex].quantity = parseInt(newQuantity);
    saveCart();
    updateCartUI();
  }
}

// حفظ السلة في localStorage
function saveCart() {
  localStorage.setItem(CART_CONFIG.storageKey, JSON.stringify(cart));
}

// حساب إجمالي السلة
function calculateCartTotals() {
  const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  
  // حساب الضريبة
  cartTax = subtotal * CART_CONFIG.taxRate;
  
  // حساب الشحن
  cartShipping = subtotal >= CART_CONFIG.freeShippingThreshold ? 0 : getShippingCost();
  
  // المجموع النهائي
  cartTotal = subtotal + cartTax + cartShipping - cartDiscount;
  
  return {
    subtotal: subtotal,
    tax: cartTax,
    shipping: cartShipping,
    discount: cartDiscount,
    total: cartTotal
  };
}

// الحصول على تكلفة الشحن (سيتم تطويرها في نظام الشحن)
function getShippingCost() {
  // تكلفة شحن افتراضية - سيتم تحديثها حسب المحافظة
  return 25; // 25 جنيه
}

// تحديث واجهة السلة
function updateCartUI() {
  updateCartCount();
  updateFloatingCart();
  updateCartTotals();
}

// تحديث عداد السلة
function updateCartCount() {
  const cartCount = document.getElementById('cartCount');
  if (cartCount) {
    const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
    cartCount.textContent = totalItems;
    
    // إضافة تأثير بصري عند التحديث
    cartCount.style.transform = 'scale(1.2)';
    setTimeout(() => {
      cartCount.style.transform = 'scale(1)';
    }, 200);
  }
}

// تحديث السلة العائمة
function updateFloatingCart() {
  const cartItems = document.getElementById('cartItems');
  const cartTotal = document.getElementById('cartTotal');
  
  if (!cartItems || !cartTotal) return;
  
  if (cart.length === 0) {
    cartItems.innerHTML = `
      <div class="empty-cart">
        <p>🛒 السلة فارغة</p>
        <p>ابدأ بإضافة منتجات رائعة!</p>
      </div>
    `;
    cartTotal.textContent = '0';
    return;
  }
  
  let html = '';
  cart.forEach(item => {
    html += createCartItemHTML(item);
  });
  
  cartItems.innerHTML = html;
  
  // تحديث المجاميع
  const totals = calculateCartTotals();
  cartTotal.textContent = totals.total.toFixed(2);
}

// إنشاء HTML لعنصر في السلة
function createCartItemHTML(item) {
  return `
    <div class="cart-item" data-item-id="${item.id}">
      <div class="cart-item-image">
        <img src="${item.image}" alt="${item.title}" onerror="this.src='https://via.placeholder.com/60x60?text=منتج'">
      </div>
      
      <div class="cart-item-details">
        <h5 class="cart-item-title">${item.title}</h5>
        <p class="cart-item-price">${item.price} ${CART_CONFIG.currency}</p>
        
        <div class="cart-item-quantity">
          <button class="quantity-btn" onclick="updateCartItemQuantity(${item.id}, ${item.quantity - 1})">-</button>
          <input type="number" value="${item.quantity}" min="1" max="${CART_CONFIG.maxQuantity}" 
                 onchange="updateCartItemQuantity(${item.id}, this.value)" class="quantity-input">
          <button class="quantity-btn" onclick="updateCartItemQuantity(${item.id}, ${item.quantity + 1})">+</button>
        </div>
      </div>
      
      <div class="cart-item-actions">
        <div class="cart-item-total">${(item.price * item.quantity).toFixed(2)} ${CART_CONFIG.currency}</div>
        <button class="remove-item-btn" onclick="removeFromCart(${item.id})" title="حذف المنتج">
          🗑️
        </button>
      </div>
    </div>
  `;
}

// تحديث مجاميع السلة في الواجهة
function updateCartTotals() {
  const totals = calculateCartTotals();
  
  // تحديث عناصر المجاميع إذا كانت موجودة
  const elements = {
    subtotal: document.getElementById('cartSubtotal'),
    tax: document.getElementById('cartTax'),
    shipping: document.getElementById('cartShipping'),
    discount: document.getElementById('cartDiscount'),
    total: document.getElementById('cartTotal')
  };
  
  if (elements.subtotal) elements.subtotal.textContent = totals.subtotal.toFixed(2);
  if (elements.tax) elements.tax.textContent = totals.tax.toFixed(2);
  if (elements.shipping) elements.shipping.textContent = totals.shipping.toFixed(2);
  if (elements.discount) elements.discount.textContent = totals.discount.toFixed(2);
  if (elements.total) elements.total.textContent = totals.total.toFixed(2);
}

// عرض/إخفاء السلة العائمة
function toggleCart() {
  const floatingCart = document.getElementById('floatingCart');
  if (floatingCart) {
    floatingCart.classList.toggle('show');
    if (floatingCart.classList.contains('show')) {
      updateFloatingCart();
    }
  }
}

// إظهار السلة العائمة لفترة محددة
function showFloatingCart(duration = 0) {
  const floatingCart = document.getElementById('floatingCart');
  if (floatingCart) {
    floatingCart.classList.add('show');
    updateFloatingCart();
    
    if (duration > 0) {
      setTimeout(() => {
        floatingCart.classList.remove('show');
      }, duration);
    }
  }
}

// إفراغ السلة
function clearCart() {
  if (cart.length === 0) {
    showNotification('السلة فارغة بالفعل!', 'info');
    return;
  }
  
  if (confirm('هل أنت متأكد من إفراغ السلة؟')) {
    cart = [];
    saveCart();
    updateCartUI();
    showNotification('تم إفراغ السلة بنجاح', 'info');
  }
}

// إتمام الطلب
function proceedToCheckout() {
  if (cart.length === 0) {
    showNotification('السلة فارغة! يرجى إضافة منتجات أولاً.', 'warning');
    return;
  }
  
  // إخفاء السلة العائمة
  const floatingCart = document.getElementById('floatingCart');
  if (floatingCart) {
    floatingCart.classList.remove('show');
  }
  
  // إظهار نموذج الطلب (سيتم تطويره في المرحلة التالية)
  showCheckoutForm();
}

// إظهار نموذج إتمام الطلب
function showCheckoutForm() {
  // إنشاء نموذج الطلب ديناميكياً
  const checkoutModal = createCheckoutModal();
  document.body.appendChild(checkoutModal);
  
  // إظهار النموذج
  setTimeout(() => {
    checkoutModal.classList.add('show');
  }, 100);
}

// إنشاء نموذج الطلب
function createCheckoutModal() {
  const modal = document.createElement('div');
  modal.className = 'checkout-modal';
  modal.innerHTML = `
    <div class="checkout-content">
      <div class="checkout-header">
        <h3>🛒 إتمام الطلب</h3>
        <button class="close-checkout" onclick="closeCheckoutModal()">&times;</button>
      </div>
      
      <div class="checkout-body">
        <div class="order-summary">
          <h4>ملخص الطلب</h4>
          <div id="checkoutItems"></div>
          <div class="checkout-totals">
            <div class="total-line">
              <span>المجموع الفرعي:</span>
              <span id="checkoutSubtotal">0 ${CART_CONFIG.currency}</span>
            </div>
            <div class="total-line">
              <span>الضريبة (14%):</span>
              <span id="checkoutTax">0 ${CART_CONFIG.currency}</span>
            </div>
            <div class="total-line">
              <span>الشحن:</span>
              <span id="checkoutShipping">0 ${CART_CONFIG.currency}</span>
            </div>
            <div class="total-line total-final">
              <span>المجموع النهائي:</span>
              <span id="checkoutTotal">0 ${CART_CONFIG.currency}</span>
            </div>
          </div>
        </div>
        
        <div class="customer-form">
          <h4>معلومات العميل</h4>
          <form id="checkoutForm">
            <div class="form-group">
              <label>الاسم بالكامل *</label>
              <input type="text" name="customerName" required>
            </div>
            
            <div class="form-group">
              <label>رقم الهاتف *</label>
              <input type="tel" name="customerPhone" required>
            </div>
            
            <div class="form-group">
              <label>البريد الإلكتروني</label>
              <input type="email" name="customerEmail">
            </div>
            
            <div class="form-group">
              <label>العنوان بالتفصيل *</label>
              <textarea name="customerAddress" required rows="3"></textarea>
            </div>
            
            <div class="form-group">
              <label>المحافظة *</label>
              <select name="governorate" required onchange="updateShippingCost(this.value)">
                <option value="">اختر المحافظة</option>
                <option value="cairo">القاهرة</option>
                <option value="giza">الجيزة</option>
                <option value="alexandria">الإسكندرية</option>
                <!-- سيتم إضافة باقي المحافظات -->
              </select>
            </div>
            
            <div class="form-group">
              <label>طريقة الدفع *</label>
              <select name="paymentMethod" required>
                <option value="">اختر طريقة الدفع</option>
                <option value="cod">الدفع عند الاستلام</option>
                <option value="vodafone">فودافون كاش</option>
                <option value="orange">أورانج كاش</option>
                <option value="etisalat">اتصالات كاش</option>
                <option value="bank">تحويل بنكي</option>
                <option value="fawry">فوري (+5 ج.م)</option>
              </select>
            </div>
            
            <div class="form-group">
              <label>ملاحظات إضافية</label>
              <textarea name="orderNotes" rows="2" placeholder="أي ملاحظات خاصة بالطلب..."></textarea>
            </div>
            
            <div class="checkout-actions">
              <button type="button" class="btn-secondary" onclick="closeCheckoutModal()">إلغاء</button>
              <button type="submit" class="btn-primary">تأكيد الطلب</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `;
  
  // تحديث ملخص الطلب
  setTimeout(() => {
    updateCheckoutSummary();
  }, 100);
  
  return modal;
}

// تحديث ملخص الطلب في نموذج الدفع
function updateCheckoutSummary() {
  const checkoutItems = document.getElementById('checkoutItems');
  const totals = calculateCartTotals();
  
  if (checkoutItems) {
    let html = '';
    cart.forEach(item => {
      html += `
        <div class="checkout-item">
          <span class="item-name">${item.title} × ${item.quantity}</span>
          <span class="item-price">${(item.price * item.quantity).toFixed(2)} ${CART_CONFIG.currency}</span>
        </div>
      `;
    });
    checkoutItems.innerHTML = html;
  }
  
  // تحديث المجاميع
  const elements = {
    subtotal: document.getElementById('checkoutSubtotal'),
    tax: document.getElementById('checkoutTax'),
    shipping: document.getElementById('checkoutShipping'),
    total: document.getElementById('checkoutTotal')
  };
  
  if (elements.subtotal) elements.subtotal.textContent = `${totals.subtotal.toFixed(2)} ${CART_CONFIG.currency}`;
  if (elements.tax) elements.tax.textContent = `${totals.tax.toFixed(2)} ${CART_CONFIG.currency}`;
  if (elements.shipping) elements.shipping.textContent = `${totals.shipping.toFixed(2)} ${CART_CONFIG.currency}`;
  if (elements.total) elements.total.textContent = `${totals.total.toFixed(2)} ${CART_CONFIG.currency}`;
}

// إغلاق نموذج الطلب
function closeCheckoutModal() {
  const modal = document.querySelector('.checkout-modal');
  if (modal) {
    modal.classList.remove('show');
    setTimeout(() => {
      modal.remove();
    }, 300);
  }
}

// إظهار الإشعارات
function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.innerHTML = `
    <div class="notification-content">
      <span class="notification-message">${message}</span>
      <button class="notification-close" onclick="this.parentElement.parentElement.remove()">&times;</button>
    </div>
  `;
  
  document.body.appendChild(notification);
  
  // إظهار الإشعار
  setTimeout(() => {
    notification.classList.add('show');
  }, 100);
  
  // إخفاء الإشعار تلقائياً بعد 5 ثوان
  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => {
      if (notification.parentElement) {
        notification.remove();
      }
    }, 300);
  }, 5000);
}

// تهيئة نظام السلة
function initializeCart() {
  // تحديث واجهة السلة عند التحميل
  updateCartUI();
  
  // إضافة مستمعات الأحداث
  document.addEventListener('click', (e) => {
    const floatingCart = document.getElementById('floatingCart');
    const cartIcon = document.querySelector('.cart-icon');
    
    // إغلاق السلة عند النقر خارجها
    if (floatingCart && !floatingCart.contains(e.target) && !cartIcon.contains(e.target)) {
      floatingCart.classList.remove('show');
    }
  });
  
  // حفظ السلة قبل إغلاق الصفحة
  window.addEventListener('beforeunload', () => {
    saveCart();
  });
}

// تشغيل التهيئة عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', initializeCart);
