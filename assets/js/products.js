/**
 * نظام إدارة المنتجات - مكتبة ومطبعة كيان
 * تحويل مقالات بلوجر إلى منتجات قابلة للشراء
 */

// استخراج السعر من النص باستخدام regex
function extractPrice(content) {
  // البحث عن أنماط مختلفة للأسعار
  const pricePatterns = [
    /(\d+(?:\.\d{2})?)\s*(?:جنيه|ج\.م|EGP|LE)/gi,
    /(?:السعر|Price):\s*(\d+(?:\.\d{2})?)/gi,
    /(\d+(?:\.\d{2})?)\s*(?:ريال|درهم|دولار)/gi,
    /\$(\d+(?:\.\d{2})?)/g,
    /(\d+(?:\.\d{2})?)\s*(?:pound|dollar)/gi
  ];
  
  for (let pattern of pricePatterns) {
    const match = content.match(pattern);
    if (match) {
      const price = match[0].replace(/[^\d.]/g, '');
      return parseFloat(price) || 0;
    }
  }
  
  return 0; // سعر افتراضي إذا لم يتم العثور على سعر
}

// استخراج معلومات المنتج من مقالة بلوجر
function extractProductInfo(post) {
  const title = post.title || 'منتج بدون عنوان';
  const content = post.content || '';
  const price = extractPrice(content);
  const image = extractFeaturedImage(post);
  const url = post.url || '#';
  const labels = post.labels || [];
  const publishDate = post.published || new Date().toISOString();
  
  // استخراج وصف مختصر (أول 150 حرف من المحتوى)
  const description = content.replace(/<[^>]*>/g, '').substring(0, 150) + '...';
  
  return {
    id: post.id || Date.now(),
    title: title,
    description: description,
    price: price,
    image: image,
    url: url,
    labels: labels,
    publishDate: publishDate,
    inStock: true // افتراضياً المنتج متوفر
  };
}

// استخراج الصورة البارزة من المقالة
function extractFeaturedImage(post) {
  // البحث عن الصورة في المحتوى
  if (post.content) {
    const imgMatch = post.content.match(/<img[^>]+src="([^">]+)"/i);
    if (imgMatch) {
      return imgMatch[1];
    }
  }
  
  // البحث في media$thumbnail إذا كان متوفراً
  if (post.media$thumbnail && post.media$thumbnail.url) {
    return post.media$thumbnail.url;
  }
  
  // صورة افتراضية
  return 'https://via.placeholder.com/300x200?text=مكتبة+كيان';
}

// تحميل المنتجات من Blogger API
async function loadProductsFromBlogger() {
  try {
    // استخدام Blogger API v3 لجلب المقالات
    const blogId = getBlogId(); // يجب تحديد معرف المدونة
    const apiKey = 'YOUR_BLOGGER_API_KEY'; // يجب إضافة مفتاح API
    
    const response = await fetch(`https://www.googleapis.com/blogger/v3/blogs/${blogId}/posts?key=${apiKey}&maxResults=50`);
    const data = await response.json();
    
    if (data.items) {
      const products = data.items.map(post => extractProductInfo(post));
      displayProducts(products);
      return products;
    }
  } catch (error) {
    console.error('خطأ في تحميل المنتجات:', error);
    // في حالة الخطأ، استخدم البيانات التجريبية
    loadSampleProducts();
  }
}

// الحصول على معرف المدونة من URL
function getBlogId() {
  // يمكن استخراجه من window.location أو تحديده يدوياً
  return window.location.hostname.includes('blogspot') ? 
    window.location.hostname.split('.')[0] : 'YOUR_BLOG_ID';
}

// عرض المنتجات في الشبكة
function displayProducts(products) {
  const productsGrid = document.getElementById('productsGrid');
  if (!productsGrid) return;
  
  let html = '';
  
  products.forEach((product, index) => {
    // إضافة إعلان بعد كل 4 منتجات
    if (index > 0 && index % 4 === 0) {
      html += `
        <div class="ad-space" style="grid-column: 1 / -1;">
          <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"></script>
          <ins class="adsbygoogle" 
               data-ad-client="ca-pub-XXXXXXXXXX" 
               data-ad-slot="XXXXXXXXXX" 
               style="display:inline-block;width:728px;height:90px"></ins>
          <script>(adsbygoogle = window.adsbygoogle || []).push({});</script>
        </div>
      `;
    }
    
    html += createProductCard(product);
  });
  
  productsGrid.innerHTML = html;
}

// إنشاء بطاقة منتج
function createProductCard(product) {
  const priceDisplay = product.price > 0 ? `${product.price} ج.م` : 'اتصل للاستفسار';
  const labelsHtml = product.labels.map(label => 
    `<span class="product-label">${label}</span>`
  ).join('');
  
  return `
    <div class="product-card" data-product-id="${product.id}">
      <img class="product-image" src="${product.image}" alt="${product.title}" 
           onerror="this.src='https://via.placeholder.com/300x200?text=مكتبة+كيان'">
      
      <div class="product-info">
        <h3 class="product-title">${product.title}</h3>
        <p class="product-description">${product.description}</p>
        
        <div class="product-labels">
          ${labelsHtml}
        </div>
        
        <div class="product-price">${priceDisplay}</div>
        
        <div class="product-actions">
          <button class="add-to-cart-btn" 
                  onclick="addToCart('${product.title}', ${product.price}, '${product.image}', '${product.url}')"
                  ${product.price <= 0 ? 'disabled' : ''}>
            ${product.price > 0 ? '🛒 إضافة للسلة' : '📞 اتصل للاستفسار'}
          </button>
          
          <button class="view-product-btn" onclick="window.open('${product.url}', '_blank')">
            👁️ عرض التفاصيل
          </button>
        </div>
      </div>
    </div>
  `;
}

// تحميل منتجات تجريبية للاختبار
function loadSampleProducts() {
  const sampleProducts = [
    {
      id: 1,
      title: 'طباعة المستندات الرسمية',
      description: 'خدمة طباعة المستندات الرسمية بجودة عالية وأسعار مناسبة',
      price: 2.50,
      image: 'https://via.placeholder.com/300x200?text=طباعة+المستندات',
      url: '#',
      labels: ['طباعة', 'مستندات'],
      publishDate: new Date().toISOString(),
      inStock: true
    },
    {
      id: 2,
      title: 'تصميم وطباعة البروشورات',
      description: 'تصميم وطباعة البروشورات الإعلانية بأحدث التقنيات',
      price: 15.00,
      image: 'https://via.placeholder.com/300x200?text=البروشورات',
      url: '#',
      labels: ['تصميم', 'طباعة', 'إعلان'],
      publishDate: new Date().toISOString(),
      inStock: true
    },
    {
      id: 3,
      title: 'أدوات مكتبية متنوعة',
      description: 'مجموعة متنوعة من الأدوات المكتبية عالية الجودة',
      price: 25.00,
      image: 'https://via.placeholder.com/300x200?text=أدوات+مكتبية',
      url: '#',
      labels: ['مكتبة', 'أدوات'],
      publishDate: new Date().toISOString(),
      inStock: true
    },
    {
      id: 4,
      title: 'كتب ومراجع تعليمية',
      description: 'مجموعة من الكتب والمراجع التعليمية في مختلف المجالات',
      price: 45.00,
      image: 'https://via.placeholder.com/300x200?text=كتب+تعليمية',
      url: '#',
      labels: ['كتب', 'تعليم'],
      publishDate: new Date().toISOString(),
      inStock: true
    },
    {
      id: 5,
      title: 'خدمة التصوير والسكان',
      description: 'خدمة تصوير المستندات والسكان بجودة عالية',
      price: 1.00,
      image: 'https://via.placeholder.com/300x200?text=تصوير+وسكان',
      url: '#',
      labels: ['تصوير', 'سكان'],
      publishDate: new Date().toISOString(),
      inStock: true
    },
    {
      id: 6,
      title: 'طباعة الصور الفوتوغرافية',
      description: 'طباعة الصور الفوتوغرافية بجودة احترافية وألوان زاهية',
      price: 5.00,
      image: 'https://via.placeholder.com/300x200?text=طباعة+الصور',
      url: '#',
      labels: ['طباعة', 'صور'],
      publishDate: new Date().toISOString(),
      inStock: true
    }
  ];
  
  displayProducts(sampleProducts);
}

// البحث في المنتجات
function searchProducts(query) {
  const allProducts = document.querySelectorAll('.product-card');
  const searchTerm = query.toLowerCase();
  
  allProducts.forEach(card => {
    const title = card.querySelector('.product-title').textContent.toLowerCase();
    const description = card.querySelector('.product-description').textContent.toLowerCase();
    const labels = Array.from(card.querySelectorAll('.product-label'))
      .map(label => label.textContent.toLowerCase()).join(' ');
    
    const isMatch = title.includes(searchTerm) || 
                   description.includes(searchTerm) || 
                   labels.includes(searchTerm);
    
    card.style.display = isMatch ? 'block' : 'none';
  });
}

// فلترة المنتجات حسب التصنيف
function filterByCategory(category) {
  const allProducts = document.querySelectorAll('.product-card');
  
  allProducts.forEach(card => {
    const labels = Array.from(card.querySelectorAll('.product-label'))
      .map(label => label.textContent);
    
    const hasCategory = category === 'all' || labels.includes(category);
    card.style.display = hasCategory ? 'block' : 'none';
  });
}

// ترتيب المنتجات
function sortProducts(sortBy) {
  const productsGrid = document.getElementById('productsGrid');
  const products = Array.from(productsGrid.querySelectorAll('.product-card'));
  
  products.sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        const priceA = parseFloat(a.querySelector('.product-price').textContent.replace(/[^\d.]/g, '')) || 0;
        const priceB = parseFloat(b.querySelector('.product-price').textContent.replace(/[^\d.]/g, '')) || 0;
        return priceA - priceB;
      
      case 'price-high':
        const priceA2 = parseFloat(a.querySelector('.product-price').textContent.replace(/[^\d.]/g, '')) || 0;
        const priceB2 = parseFloat(b.querySelector('.product-price').textContent.replace(/[^\d.]/g, '')) || 0;
        return priceB2 - priceA2;
      
      case 'name':
        const nameA = a.querySelector('.product-title').textContent;
        const nameB = b.querySelector('.product-title').textContent;
        return nameA.localeCompare(nameB, 'ar');
      
      default:
        return 0;
    }
  });
  
  // إعادة ترتيب العناصر في DOM
  products.forEach(product => productsGrid.appendChild(product));
}

// تهيئة نظام المنتجات
function initializeProducts() {
  // تحميل المنتجات
  if (typeof loadProductsFromBlogger === 'function') {
    loadProductsFromBlogger();
  } else {
    loadSampleProducts();
  }
  
  // إضافة مستمعات الأحداث
  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchProducts(e.target.value);
    });
  }
}

// تشغيل التهيئة عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', initializeProducts);
