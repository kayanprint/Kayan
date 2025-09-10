// نظام الدفع والشحن المتكامل - مكتبة ومطبعة كيان
// Kayan Payment & Shipping System

// بيانات الشحن للمحافظات المصرية
const SHIPPING_RATES = {
    'القاهرة': 25,
    'الجيزة': 25,
    'الإسكندرية': 35,
    'الدقهلية': 40,
    'الشرقية': 40,
    'القليوبية': 30,
    'كفر الشيخ': 45,
    'الغربية': 40,
    'المنوفية': 35,
    'البحيرة': 45,
    'بني سويف': 50,
    'الفيوم': 55,
    'المنيا': 60,
    'أسيوط': 65,
    'سوهاج': 70,
    'قنا': 75,
    'الأقصر': 80,
    'أسوان': 85,
    'البحر الأحمر': 90,
    'الوادي الجديد': 95,
    'مطروح': 85,
    'شمال سيناء': 90,
    'جنوب سيناء': 95,
    'بورسعيد': 45,
    'دمياط': 45,
    'الإسماعيلية': 50,
    'السويس': 50
};

// بيانات طرق الدفع
const PAYMENT_METHODS = {
    cod: {
        name: 'الدفع عند الاستلام',
        description: 'ادفع عند استلام الطلب',
        fees: 0,
        instructions: 'سيتم تحصيل المبلغ عند التوصيل'
    },
    vodafone: {
        name: 'فودافون كاش',
        description: 'الدفع عبر فودافون كاش',
        fees: 0,
        number: '01121499017',
        instructions: 'احول المبلغ على الرقم أعلاه وأرسل صورة الإيصال'
    },
    orange: {
        name: 'أورانج كاش',
        description: 'الدفع عبر أورانج كاش',
        fees: 0,
        number: '01121499017',
        instructions: 'احول المبلغ على الرقم أعلاه وأرسل صورة الإيصال'
    },
    etisalat: {
        name: 'اتصالات كاش',
        description: 'الدفع عبر اتصالات كاش',
        fees: 0,
        number: '01121499017',
        instructions: 'احول المبلغ على الرقم أعلاه وأرسل صورة الإيصال'
    },
    fawry: {
        name: 'فوري',
        description: 'الدفع عبر فوري',
        fees: 5,
        code: 'KAYAN2024',
        instructions: 'استخدم كود الدفع: KAYAN2024 في أي منفذ فوري'
    },
    bank: {
        name: 'التحويل البنكي',
        description: 'التحويل على الحساب البنكي',
        fees: 0,
        bankDetails: {
            bankName: 'البنك الأهلي المصري',
            accountName: 'مكتبة ومطبعة كيان',
            accountNumber: '1234567890123456',
            iban: 'EG380003000012345678901234'
        },
        instructions: 'احول المبلغ على الحساب أعلاه وأرسل صورة الإيصال'
    }
};

// إضافة الدوال للكلاس الرئيسي
KayanCart.prototype.updateShippingCost = function(governorate) {
    const subtotal = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shippingCost = subtotal >= 500 ? 0 : (SHIPPING_RATES[governorate] || 0);
    
    const shippingDisplay = document.getElementById('shippingCostDisplay');
    const finalTotal = document.getElementById('finalTotal');
    
    if (shippingDisplay && finalTotal) {
        if (shippingCost === 0) {
            shippingDisplay.textContent = 'مجاني';
            shippingDisplay.style.color = '#28a745';
        } else {
            shippingDisplay.textContent = shippingCost + ' جنيه';
            shippingDisplay.style.color = '#666';
        }
        
        finalTotal.textContent = (subtotal + shippingCost) + ' جنيه';
    }
};

KayanCart.prototype.showPaymentDetails = function(paymentMethod) {
    const paymentDetails = document.getElementById('paymentDetails');
    if (!paymentDetails) return;
    
    const method = PAYMENT_METHODS[paymentMethod];
    if (!method) {
        paymentDetails.innerHTML = '';
        return;
    }
    
    let detailsHTML = `
        <div style="
            background: #f8f9fa;
            padding: 20px;
            border-radius: 5px;
            border: 1px solid #ddd;
            margin-top: 15px;
        ">
            <h4 style="color: #667eea; margin-bottom: 15px;">${method.name}</h4>
            <p style="margin-bottom: 10px;">${method.description}</p>
    `;
    
    if (method.fees > 0) {
        detailsHTML += `<p style="color: #dc3545; font-weight: bold;">رسوم إضافية: ${method.fees} جنيه</p>`;
    }
    
    switch (paymentMethod) {
        case 'vodafone':
        case 'orange':
        case 'etisalat':
            detailsHTML += `
                <div style="background: white; padding: 15px; border-radius: 5px; margin: 10px 0;">
                    <p><strong>رقم المحفظة:</strong> ${method.number}</p>
                    <p style="color: #666; font-size: 14px;">${method.instructions}</p>
                </div>
            `;
            break;
            
        case 'fawry':
            detailsHTML += `
                <div style="background: white; padding: 15px; border-radius: 5px; margin: 10px 0;">
                    <p><strong>كود الدفع:</strong> <span style="background: #667eea; color: white; padding: 5px 10px; border-radius: 3px; font-weight: bold;">${method.code}</span></p>
                    <p style="color: #666; font-size: 14px;">${method.instructions}</p>
                </div>
            `;
            break;
            
        case 'bank':
            detailsHTML += `
                <div style="background: white; padding: 15px; border-radius: 5px; margin: 10px 0;">
                    <p><strong>اسم البنك:</strong> ${method.bankDetails.bankName}</p>
                    <p><strong>اسم الحساب:</strong> ${method.bankDetails.accountName}</p>
                    <p><strong>رقم الحساب:</strong> ${method.bankDetails.accountNumber}</p>
                    <p><strong>IBAN:</strong> ${method.bankDetails.iban}</p>
                    <p style="color: #666; font-size: 14px; margin-top: 10px;">${method.instructions}</p>
                </div>
            `;
            break;
            
        case 'cod':
            detailsHTML += `
                <div style="background: #d4edda; padding: 15px; border-radius: 5px; margin: 10px 0; border: 1px solid #c3e6cb;">
                    <p style="color: #155724; margin: 0;"><strong>✅ ${method.instructions}</strong></p>
                </div>
            `;
            break;
    }
    
    detailsHTML += '</div>';
    paymentDetails.innerHTML = detailsHTML;
    
    // تحديث المجموع الكلي مع الرسوم
    this.updateTotalWithFees(method.fees);
};

KayanCart.prototype.updateTotalWithFees = function(paymentFees) {
    const subtotal = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const governorateSelect = document.querySelector('select[name="governorate"]');
    const selectedGovernorate = governorateSelect ? governorateSelect.value : '';
    const shippingCost = subtotal >= 500 ? 0 : (SHIPPING_RATES[selectedGovernorate] || 0);
    
    const finalTotal = document.getElementById('finalTotal');
    if (finalTotal) {
        const total = subtotal + shippingCost + paymentFees;
        finalTotal.textContent = total + ' جنيه';
    }
};

KayanCart.prototype.submitOrder = function(form) {
    const formData = new FormData(form);
    const orderData = {
        customer: {
            firstName: formData.get('firstName'),
            lastName: formData.get('lastName'),
            phone: formData.get('phone'),
            email: formData.get('email')
        },
        shipping: {
            governorate: formData.get('governorate'),
            address: formData.get('address')
        },
        payment: {
            method: formData.get('paymentMethod')
        },
        items: this.cart,
        notes: formData.get('notes'),
        timestamp: new Date().toISOString(),
        orderNumber: 'KY' + Date.now()
    };
    
    // حساب التكاليف
    const subtotal = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shippingCost = subtotal >= 500 ? 0 : (SHIPPING_RATES[orderData.shipping.governorate] || 0);
    const paymentFees = PAYMENT_METHODS[orderData.payment.method]?.fees || 0;
    const total = subtotal + shippingCost + paymentFees;
    
    orderData.costs = {
        subtotal,
        shipping: shippingCost,
        paymentFees,
        total
    };
    
    // إظهار رسالة التحميل
    this.showLoadingMessage();
    
    // إرسال الطلب
    this.sendOrderToGoogleSheets(orderData)
        .then(() => this.sendOrderToWhatsApp(orderData))
        .then(() => {
            this.showOrderSuccess(orderData);
            this.clearCart();
            this.closeCheckout();
        })
        .catch(error => {
            console.error('خطأ في إرسال الطلب:', error);
            this.showMessage('حدث خطأ في إرسال الطلب. يرجى المحاولة مرة أخرى.', 'error');
        })
        .finally(() => {
            this.hideLoadingMessage();
        });
};

KayanCart.prototype.sendOrderToGoogleSheets = function(orderData) {
    return new Promise((resolve, reject) => {
        // هنا يتم إرسال البيانات إلى Google Sheets
        // يمكن استخدام Google Apps Script Web App
        
        const scriptURL = 'https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec';
        
        fetch(scriptURL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(orderData)
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                resolve(data);
            } else {
                reject(new Error(data.error || 'فشل في حفظ الطلب'));
            }
        })
        .catch(error => {
            // في حالة عدم توفر الربط، نحفظ محلياً
            console.warn('لم يتم ربط Google Sheets، سيتم الحفظ محلياً');
            this.saveOrderLocally(orderData);
            resolve({ success: true, local: true });
        });
    });
};

KayanCart.prototype.sendOrderToWhatsApp = function(orderData) {
    return new Promise((resolve) => {
        const message = this.formatWhatsAppMessage(orderData);
        const whatsappURL = `https://wa.me/201121499017?text=${encodeURIComponent(message)}`;
        
        // فتح WhatsApp في نافذة جديدة
        window.open(whatsappURL, '_blank');
        
        resolve();
    });
};

KayanCart.prototype.formatWhatsAppMessage = function(orderData) {
    let message = `🛒 *طلب جديد من مكتبة ومطبعة كيان*\n\n`;
    message += `📋 *رقم الطلب:* ${orderData.orderNumber}\n`;
    message += `📅 *التاريخ:* ${new Date(orderData.timestamp).toLocaleString('ar-EG')}\n\n`;
    
    message += `👤 *بيانات العميل:*\n`;
    message += `الاسم: ${orderData.customer.firstName} ${orderData.customer.lastName}\n`;
    message += `الهاتف: ${orderData.customer.phone}\n`;
    if (orderData.customer.email) {
        message += `البريد: ${orderData.customer.email}\n`;
    }
    message += `\n`;
    
    message += `📍 *عنوان التوصيل:*\n`;
    message += `المحافظة: ${orderData.shipping.governorate}\n`;
    message += `العنوان: ${orderData.shipping.address}\n\n`;
    
    message += `🛍️ *المنتجات:*\n`;
    orderData.items.forEach((item, index) => {
        message += `${index + 1}. ${item.title}\n`;
        message += `   الكمية: ${item.quantity} × ${item.price} جنيه = ${item.quantity * item.price} جنيه\n`;
    });
    message += `\n`;
    
    message += `💰 *التكاليف:*\n`;
    message += `المجموع الفرعي: ${orderData.costs.subtotal} جنيه\n`;
    message += `الشحن: ${orderData.costs.shipping === 0 ? 'مجاني' : orderData.costs.shipping + ' جنيه'}\n`;
    if (orderData.costs.paymentFees > 0) {
        message += `رسوم الدفع: ${orderData.costs.paymentFees} جنيه\n`;
    }
    message += `*المجموع الكلي: ${orderData.costs.total} جنيه*\n\n`;
    
    message += `💳 *طريقة الدفع:* ${PAYMENT_METHODS[orderData.payment.method]?.name}\n\n`;
    
    if (orderData.notes) {
        message += `📝 *ملاحظات:* ${orderData.notes}\n\n`;
    }
    
    message += `✅ يرجى تأكيد استلام الطلب والرد بموعد التوصيل المتوقع.`;
    
    return message;
};

KayanCart.prototype.saveOrderLocally = function(orderData) {
    const orders = JSON.parse(localStorage.getItem('kayanOrders')) || [];
    orders.push(orderData);
    localStorage.setItem('kayanOrders', JSON.stringify(orders));
};

KayanCart.prototype.showOrderSuccess = function(orderData) {
    const successHTML = `
        <div id="orderSuccessModal" style="
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.8);
            z-index: 10001;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        ">
            <div style="
                background: white;
                border-radius: 10px;
                padding: 40px;
                text-align: center;
                max-width: 500px;
                width: 100%;
            ">
                <div style="font-size: 4rem; margin-bottom: 20px;">✅</div>
                <h2 style="color: #28a745; margin-bottom: 20px;">تم إرسال طلبك بنجاح!</h2>
                <p style="font-size: 18px; margin-bottom: 15px;">رقم الطلب: <strong>${orderData.orderNumber}</strong></p>
                <p style="color: #666; margin-bottom: 30px;">
                    سيتم التواصل معك خلال 24 ساعة لتأكيد الطلب وتحديد موعد التوصيل.
                </p>
                <div style="background: #f8f9fa; padding: 20px; border-radius: 5px; margin-bottom: 20px;">
                    <p style="margin: 0; color: #667eea;">
                        📱 تم فتح WhatsApp لإرسال تفاصيل طلبك
                    </p>
                </div>
                <button onclick="document.getElementById('orderSuccessModal').remove()" style="
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    border: none;
                    padding: 15px 30px;
                    border-radius: 5px;
                    font-size: 16px;
                    cursor: pointer;
                ">
                    حسناً
                </button>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', successHTML);
};

KayanCart.prototype.showLoadingMessage = function() {
    const loadingHTML = `
        <div id="loadingModal" style="
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.8);
            z-index: 10002;
            display: flex;
            align-items: center;
            justify-content: center;
        ">
            <div style="
                background: white;
                border-radius: 10px;
                padding: 40px;
                text-align: center;
            ">
                <div class="loading" style="margin-bottom: 20px;"></div>
                <p style="margin: 0; font-size: 18px;">جاري إرسال طلبك...</p>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', loadingHTML);
};

KayanCart.prototype.hideLoadingMessage = function() {
    const loadingModal = document.getElementById('loadingModal');
    if (loadingModal) {
        loadingModal.remove();
    }
};

KayanCart.prototype.clearCart = function() {
    this.cart = [];
    this.saveCart();
    this.updateCartCount();
    this.loadCartItems();
};

// دوال مساعدة للاستخدام العام
function updateShippingCost(governorate) {
    if (window.kayanCart) {
        kayanCart.updateShippingCost(governorate);
    }
}

function showPaymentDetails(paymentMethod) {
    if (window.kayanCart) {
        kayanCart.showPaymentDetails(paymentMethod);
    }
}
