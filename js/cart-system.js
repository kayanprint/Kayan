// نظام عربة التسوق المتكامل - مكتبة ومطبعة كيان
// Kayan Store Cart System

class KayanCart {
    constructor() {
        this.cart = JSON.parse(localStorage.getItem('kayanCart')) || [];
        this.init();
    }

    init() {
        this.updateCartCount();
        this.bindEvents();
        this.loadCartItems();
    }

    bindEvents() {
        // إغلاق العربة عند النقر على الخلفية
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('overlay')) {
                this.toggleCart();
            }
        });

        // البحث في المنتجات
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchProducts(e.target.value);
            });
        }
    }

    // إضافة منتج للعربة
    addToCart(title, image, url, price = null) {
        // استخراج السعر إذا لم يتم تمريره
        if (!price) {
            price = this.extractPrice(title, url);
        }

        const existingItem = this.cart.find(item => item.title === title);
        
        if (existingItem) {
            existingItem.quantity += 1;
            this.showMessage('تم زيادة الكمية في السلة', 'success');
        } else {
            const newItem = {
                id: Date.now(),
                title: title,
                image: image,
                url: url,
                price: parseInt(price) || 0,
                quantity: 1
            };
            this.cart.push(newItem);
            this.showMessage('تم إضافة المنتج للسلة بنجاح', 'success');
        }

        this.saveCart();
        this.updateCartCount();
        this.loadCartItems();
    }

    // استخراج السعر من المحتوى
    extractPrice(title, url) {
        // محاولة استخراج السعر من العنوان أولاً
        const titlePriceMatch = title.match(/(\d+)\s*جنيه/);
        if (titlePriceMatch) {
            return titlePriceMatch[1];
        }

        // إذا لم يوجد في العنوان، نحاول من المحتوى
        const productCard = document.querySelector(`[data-url="${url}"]`);
        if (productCard) {
            const priceElement = productCard.querySelector('.product-price');
            if (priceElement) {
                const priceMatch = priceElement.textContent.match(/(\d+)/);
                return priceMatch ? priceMatch[1] : '0';
            }
        }

        return '0';
    }

    // حذف منتج من العربة
    removeFromCart(id) {
        this.cart = this.cart.filter(item => item.id !== id);
        this.saveCart();
        this.updateCartCount();
        this.loadCartItems();
        this.showMessage('تم حذف المنتج من السلة', 'success');
    }

    // تحديث كمية المنتج
    updateQuantity(id, quantity) {
        const item = this.cart.find(item => item.id === id);
        if (item) {
            if (quantity <= 0) {
                this.removeFromCart(id);
            } else {
                item.quantity = quantity;
                this.saveCart();
                this.updateCartCount();
                this.loadCartItems();
            }
        }
    }

    // حفظ العربة في localStorage
    saveCart() {
        localStorage.setItem('kayanCart', JSON.stringify(this.cart));
    }

    // تحديث عداد العربة
    updateCartCount() {
        const cartCount = document.getElementById('cartCount');
        const totalItems = this.cart.reduce((sum, item) => sum + item.quantity, 0);
        if (cartCount) {
            cartCount.textContent = totalItems;
            cartCount.style.display = totalItems > 0 ? 'flex' : 'none';
        }
    }

    // تحميل عناصر العربة
    loadCartItems() {
        const cartItemsContainer = document.getElementById('cartItems');
        if (!cartItemsContainer) return;

        if (this.cart.length === 0) {
            cartItemsContainer.innerHTML = `
                <div style="text-align: center; padding: 40px; color: #666;">
                    <div style="font-size: 3rem; margin-bottom: 20px;">🛒</div>
                    <h3>السلة فارغة</h3>
                    <p>لم تقم بإضافة أي منتجات بعد</p>
                </div>
            `;
            this.updateCartTotal();
            return;
        }

        let cartHTML = '';
        this.cart.forEach(item => {
            cartHTML += `
                <div class="cart-item" data-id="${item.id}">
                    <img src="${item.image}" alt="${item.title}" onerror="this.src='https://via.placeholder.com/60x60?text=صورة'">
                    <div class="cart-item-info">
                        <div class="cart-item-title">${item.title}</div>
                        <div class="cart-item-price">${item.price} جنيه</div>
                        <div class="quantity-controls">
                            <button class="qty-btn" onclick="kayanCart.updateQuantity(${item.id}, ${item.quantity - 1})">-</button>
                            <span style="padding: 0 10px; font-weight: bold;">${item.quantity}</span>
                            <button class="qty-btn" onclick="kayanCart.updateQuantity(${item.id}, ${item.quantity + 1})">+</button>
                            <button class="qty-btn" onclick="kayanCart.removeFromCart(${item.id})" style="margin-right: 10px; color: #ff4757;">🗑️</button>
                        </div>
                    </div>
                </div>
            `;
        });

        cartItemsContainer.innerHTML = cartHTML;
        this.updateCartTotal();
    }

    // تحديث إجمالي العربة
    updateCartTotal() {
        const subtotal = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        
        document.getElementById('subtotal').textContent = subtotal + ' جنيه';
        document.getElementById('total').textContent = subtotal + ' جنيه';
        
        // تحديث نص الشحن
        const shippingElement = document.getElementById('shipping');
        if (subtotal >= 500) {
            shippingElement.textContent = 'مجاني';
            shippingElement.style.color = '#28a745';
        } else {
            shippingElement.textContent = 'يحسب عند الطلب';
            shippingElement.style.color = '#666';
        }
    }

    // تبديل عرض العربة
    toggleCart() {
        const cartSidebar = document.getElementById('cartSidebar');
        const overlay = document.getElementById('overlay');
        
        if (cartSidebar && overlay) {
            const isOpen = cartSidebar.classList.contains('open');
            
            if (isOpen) {
                cartSidebar.classList.remove('open');
                overlay.style.display = 'none';
                document.body.style.overflow = 'auto';
            } else {
                cartSidebar.classList.add('open');
                overlay.style.display = 'block';
                document.body.style.overflow = 'hidden';
            }
        }
    }

    // البحث في المنتجات
    searchProducts(query) {
        const products = document.querySelectorAll('.product-card');
        const searchQuery = query.toLowerCase().trim();

        products.forEach(product => {
            const title = product.querySelector('.product-title').textContent.toLowerCase();
            const labels = product.getAttribute('data-labels') || '';
            
            if (title.includes(searchQuery) || labels.toLowerCase().includes(searchQuery)) {
                product.style.display = 'block';
            } else {
                product.style.display = searchQuery === '' ? 'block' : 'none';
            }
        });

        // إظهار رسالة إذا لم توجد نتائج
        const visibleProducts = document.querySelectorAll('.product-card[style*="block"], .product-card:not([style*="none"])');
        if (visibleProducts.length === 0 && searchQuery !== '') {
            this.showNoResultsMessage();
        } else {
            this.hideNoResultsMessage();
        }
    }

    // إظهار رسالة عدم وجود نتائج
    showNoResultsMessage() {
        let noResultsDiv = document.getElementById('noResults');
        if (!noResultsDiv) {
            noResultsDiv = document.createElement('div');
            noResultsDiv.id = 'noResults';
            noResultsDiv.innerHTML = `
                <div style="text-align: center; padding: 40px; color: #666;">
                    <div style="font-size: 3rem; margin-bottom: 20px;">🔍</div>
                    <h3>لا توجد نتائج</h3>
                    <p>لم نجد أي منتجات تطابق بحثك</p>
                </div>
            `;
            document.getElementById('productsGrid').appendChild(noResultsDiv);
        }
    }

    // إخفاء رسالة عدم وجود نتائج
    hideNoResultsMessage() {
        const noResultsDiv = document.getElementById('noResults');
        if (noResultsDiv) {
            noResultsDiv.remove();
        }
    }

    // إظهار رسالة
    showMessage(message, type = 'success') {
        // إزالة الرسائل السابقة
        const existingMessages = document.querySelectorAll('.toast-message');
        existingMessages.forEach(msg => msg.remove());

        const messageDiv = document.createElement('div');
        messageDiv.className = `toast-message ${type}`;
        messageDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#28a745' : '#dc3545'};
            color: white;
            padding: 15px 20px;
            border-radius: 5px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 10000;
            font-weight: bold;
            animation: slideInRight 0.3s ease;
        `;
        messageDiv.textContent = message;

        document.body.appendChild(messageDiv);

        // إزالة الرسالة بعد 3 ثوان
        setTimeout(() => {
            messageDiv.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => messageDiv.remove(), 300);
        }, 3000);
    }

    // الانتقال لصفحة الطلب
    proceedToCheckout() {
        if (this.cart.length === 0) {
            this.showMessage('السلة فارغة! أضف منتجات أولاً', 'error');
            return;
        }

        // حفظ بيانات العربة للطلب
        localStorage.setItem('checkoutCart', JSON.stringify(this.cart));
        
        // إنشاء نموذج الطلب
        this.showCheckoutForm();
    }

    // إظهار نموذج الطلب
    showCheckoutForm() {
        const checkoutHTML = `
            <div id="checkoutModal" style="
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.8);
                z-index: 10000;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 20px;
            ">
                <div style="
                    background: white;
                    border-radius: 10px;
                    width: 100%;
                    max-width: 600px;
                    max-height: 90vh;
                    overflow-y: auto;
                    position: relative;
                ">
                    <div style="
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        color: white;
                        padding: 20px;
                        border-radius: 10px 10px 0 0;
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                    ">
                        <h2>إتمام الطلب</h2>
                        <button onclick="kayanCart.closeCheckout()" style="
                            background: none;
                            border: none;
                            color: white;
                            font-size: 24px;
                            cursor: pointer;
                        ">×</button>
                    </div>
                    
                    <form id="checkoutForm" style="padding: 30px;">
                        <div style="margin-bottom: 20px;">
                            <h3 style="color: #667eea; margin-bottom: 15px;">معلومات العميل</h3>
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px;">
                                <input type="text" name="firstName" placeholder="الاسم الأول" required style="
                                    padding: 12px;
                                    border: 2px solid #ddd;
                                    border-radius: 5px;
                                    font-size: 16px;
                                ">
                                <input type="text" name="lastName" placeholder="اسم العائلة" required style="
                                    padding: 12px;
                                    border: 2px solid #ddd;
                                    border-radius: 5px;
                                    font-size: 16px;
                                ">
                            </div>
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px;">
                                <input type="tel" name="phone" placeholder="رقم الهاتف" required style="
                                    padding: 12px;
                                    border: 2px solid #ddd;
                                    border-radius: 5px;
                                    font-size: 16px;
                                ">
                                <input type="email" name="email" placeholder="البريد الإلكتروني" style="
                                    padding: 12px;
                                    border: 2px solid #ddd;
                                    border-radius: 5px;
                                    font-size: 16px;
                                ">
                            </div>
                        </div>

                        <div style="margin-bottom: 20px;">
                            <h3 style="color: #667eea; margin-bottom: 15px;">عنوان التوصيل</h3>
                            <select name="governorate" required onchange="kayanCart.updateShippingCost(this.value)" style="
                                width: 100%;
                                padding: 12px;
                                border: 2px solid #ddd;
                                border-radius: 5px;
                                font-size: 16px;
                                margin-bottom: 15px;
                            ">
                                <option value="">اختر المحافظة</option>
                                <option value="القاهرة">القاهرة</option>
                                <option value="الجيزة">الجيزة</option>
                                <option value="الإسكندرية">الإسكندرية</option>
                                <option value="الدقهلية">الدقهلية</option>
                                <option value="الشرقية">الشرقية</option>
                                <option value="القليوبية">القليوبية</option>
                                <option value="كفر الشيخ">كفر الشيخ</option>
                                <option value="الغربية">الغربية</option>
                                <option value="المنوفية">المنوفية</option>
                                <option value="البحيرة">البحيرة</option>
                                <option value="بني سويف">بني سويف</option>
                                <option value="الفيوم">الفيوم</option>
                                <option value="المنيا">المنيا</option>
                                <option value="أسيوط">أسيوط</option>
                                <option value="سوهاج">سوهاج</option>
                                <option value="قنا">قنا</option>
                                <option value="الأقصر">الأقصر</option>
                                <option value="أسوان">أسوان</option>
                                <option value="البحر الأحمر">البحر الأحمر</option>
                                <option value="الوادي الجديد">الوادي الجديد</option>
                                <option value="مطروح">مطروح</option>
                                <option value="شمال سيناء">شمال سيناء</option>
                                <option value="جنوب سيناء">جنوب سيناء</option>
                                <option value="بورسعيد">بورسعيد</option>
                                <option value="دمياط">دمياط</option>
                                <option value="الإسماعيلية">الإسماعيلية</option>
                                <option value="السويس">السويس</option>
                            </select>
                            <textarea name="address" placeholder="العنوان بالتفصيل" required style="
                                width: 100%;
                                padding: 12px;
                                border: 2px solid #ddd;
                                border-radius: 5px;
                                font-size: 16px;
                                min-height: 80px;
                                resize: vertical;
                            "></textarea>
                        </div>

                        <div style="margin-bottom: 20px;">
                            <h3 style="color: #667eea; margin-bottom: 15px;">طريقة الدفع</h3>
                            <select name="paymentMethod" required onchange="kayanCart.showPaymentDetails(this.value)" style="
                                width: 100%;
                                padding: 12px;
                                border: 2px solid #ddd;
                                border-radius: 5px;
                                font-size: 16px;
                            ">
                                <option value="">اختر طريقة الدفع</option>
                                <option value="cod">الدفع عند الاستلام</option>
                                <option value="vodafone">فودافون كاش</option>
                                <option value="orange">أورانج كاش</option>
                                <option value="etisalat">اتصالات كاش</option>
                                <option value="fawry">فوري (+5 جنيه رسوم)</option>
                                <option value="bank">التحويل البنكي</option>
                            </select>
                            <div id="paymentDetails" style="margin-top: 15px;"></div>
                        </div>

                        <div style="margin-bottom: 20px;">
                            <h3 style="color: #667eea; margin-bottom: 15px;">ملخص الطلب</h3>
                            <div id="orderSummary" style="
                                background: #f8f9fa;
                                padding: 20px;
                                border-radius: 5px;
                                border: 1px solid #ddd;
                            "></div>
                        </div>

                        <textarea name="notes" placeholder="ملاحظات إضافية (اختياري)" style="
                            width: 100%;
                            padding: 12px;
                            border: 2px solid #ddd;
                            border-radius: 5px;
                            font-size: 16px;
                            min-height: 60px;
                            resize: vertical;
                            margin-bottom: 20px;
                        "></textarea>

                        <button type="submit" style="
                            width: 100%;
                            padding: 15px;
                            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                            color: white;
                            border: none;
                            border-radius: 5px;
                            font-size: 18px;
                            font-weight: bold;
                            cursor: pointer;
                            transition: all 0.3s ease;
                        " onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='translateY(0)'">
                            تأكيد الطلب
                        </button>
                    </form>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', checkoutHTML);
        this.updateOrderSummary();
        
        // ربط نموذج الطلب
        document.getElementById('checkoutForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.submitOrder(e.target);
        });
    }

    // تحديث ملخص الطلب
    updateOrderSummary() {
        const summaryDiv = document.getElementById('orderSummary');
        if (!summaryDiv) return;

        let summaryHTML = '';
        let subtotal = 0;

        this.cart.forEach(item => {
            const itemTotal = item.price * item.quantity;
            subtotal += itemTotal;
            summaryHTML += `
                <div style="display: flex; justify-content: space-between; margin-bottom: 10px; padding-bottom: 10px; border-bottom: 1px solid #eee;">
                    <span>${item.title} × ${item.quantity}</span>
                    <span style="font-weight: bold;">${itemTotal} جنيه</span>
                </div>
            `;
        });

        summaryHTML += `
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px; font-weight: bold;">
                <span>المجموع الفرعي:</span>
                <span>${subtotal} جنيه</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                <span>الشحن:</span>
                <span id="shippingCostDisplay">${subtotal >= 500 ? 'مجاني' : 'يحسب حسب المحافظة'}</span>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 18px; font-weight: bold; color: #667eea; border-top: 2px solid #667eea; padding-top: 10px;">
                <span>المجموع الكلي:</span>
                <span id="finalTotal">${subtotal} جنيه</span>
            </div>
        `;

        summaryDiv.innerHTML = summaryHTML;
    }

    // إغلاق نموذج الطلب
    closeCheckout() {
        const modal = document.getElementById('checkoutModal');
        if (modal) {
            modal.remove();
        }
    }
}

// إنشاء مثيل من نظام العربة
const kayanCart = new KayanCart();

// دوال عامة للاستخدام في القالب
function addToCart(title, image, url) {
    kayanCart.addToCart(title, image, url);
}

function toggleCart() {
    kayanCart.toggleCart();
}

function proceedToCheckout() {
    kayanCart.proceedToCheckout();
}

function searchProducts() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        kayanCart.searchProducts(searchInput.value);
    }
}

// إضافة أنيميشن CSS
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);
