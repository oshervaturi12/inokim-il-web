import {formatToShekel} from './../helpers'
import { optimizeImageClient } from './optimizeImageClient.js';

export const orderRowRenderer = (order, index) => {
    const paymentStatusBadge = {
      pending: "ממתין",
      paid: "שולם",
      failed: "נכשל",
    }[order.paymentStatus] || " לא ידוע";

    const statusBadge = {
      processing: "בטיפול",
      shipped: "נשלח",
      delivered: "נמסר",
      cancelled: "בוטל",
    }[order.orderStatus] || " לא ידוע";

  
    const shippingMethod = order.shippingMethod === "home_delivery" ? "משלוח לבית" : "איסוף עצמי";
  
    return `
        <tr onclick="window.location.href='/admin/orders/${order._id}'" style="cursor: pointer;">
        <td>${index + 1}</td>
        <td>${order.contactInfo.firstName} ${order.contactInfo.lastName}</td>
        <td>${order.contactInfo.phone}</td>
        <td>${new Date(order.createdAt).toLocaleDateString('he-IL')}</td>
        <td>${formatToShekel(order.totalPrice)}</td>
        <td> <span class="${order.paymentStatus}">${order.paymentType === "paymentPhone" ? "תשלום טלפוני": paymentStatusBadge} </span> </td>
        <td>${shippingMethod}</td>
          <td>${statusBadge}</td>
      </tr>
    `;
  };


  export const redirectRowRenderer = (redirect, index) => `
  <tr>
    <a href="/${redirect._id}"> <td>${index + 1}</td> </a>
    <td>${redirect.from}</td>
    <td>${redirect.to}</td>
    <td>${redirect.isPermanent ? "🔄 קבוע (301)" : "🔃 זמני (302)"}</td>
    <td>
      <a href="/admin/redirects/edit/${redirect._id}" class="btn btn-warning">✏️ ערוך</a>
      <button data-id="${redirect._id}" class="btn btn-danger delete-redirect">🗑️ מחק</button>
    </td>
  </tr>
`;

  
export const userRowRenderer = (user, index) => {
    const roleBadge = {
      customer: "לקוח",
      admin: "מנהל",
      dealer: "סוחר"
    }[user.role] || "⚪ לא מוגדר";
  
    return `
        <tr onclick="window.location.href='/admin/users/${user._id}'" style="cursor: pointer;">
        <a href="/${user._id}"> <td>${index + 1}</td> </a>
        <td>${user.name}</td>
        <td>${user.email}</td>
        <td> פעיל </td>
        <td> ${user.orders.length} </td>
        <td>${roleBadge}</td>
      </tr>
    `;
  };
  

  export const leadRowRenderer = (lead, index) => {
    const typeBadge = {
      contact: "יצירת קשר",
      "test-ride": "נסיעת מבחן",
      business: "עסקים",
      newsletter: "ניוזלטר",
      secondHand: "יד שנייה",
      tradeId: "טרייד אין"
    }[lead.type] || "⚪ לא ידוע";
  
    return `
        <tr onclick="window.location.href='/admin/leads/${lead._id}'" style="cursor: pointer;">
        <a href="/${lead._id}"> <td>${index + 1}</td> </a>
        <td>${lead.fullName}</td>
        <td>${lead.email || "N/A"}</td>
        <td>${lead.phone || "N/A"}</td>
        <td>${typeBadge}</td>
        <td>${new Date(lead.createdAt).toLocaleDateString("he-IL")}</td>
      </tr>
    `;
  };
  


  export const renderCouponRow = (coupon, index) => {
    const discountValue = coupon.type === 'percentage' 
        ? `${coupon.discountValue}%`
        : coupon.type === 'fixed'
        ? `₪${coupon.fixedPrice}`
        : coupon.type === 'buy_x_get_y'
        ? `קנה ${coupon.buyXGetY?.buyQuantity} קבל ${coupon.buyXGetY?.getQuantity}`
        : coupon.type === 'free_shipping'
        ? 'משלוח חינם'
        : coupon.type === 'category_discount'
        ? `הנחה ${coupon.categoryDiscount?.percent}%`
        : 'N/A';

    return `
        <tr onclick="window.location.href='/admin/coupons/${coupon._id}'" style="cursor: pointer;">
          <a href="/${coupon._id}"> <td>${index + 1}</td> </a>
          <td>${coupon.code}</td>
          <td>${coupon.type}</td>
          <td>${discountValue}</td>
          <td>${new Date(coupon.expirationDate).toLocaleDateString("he-IL")}</td>
          <td>${coupon.usedCount} / ${coupon.usageLimit || '∞'}</td>
          <td>
              <span class="badge ${coupon.active ? 'badge-success' : 'badge-danger'}">
                ${coupon.active ? 'פעיל' : 'לא פעיל'}
              </span>
          </td>
       
      </tr>
    `;
};


export function productRowRenderer(product, index) {
  if (product.templateType === "scooter") return "";
  const imageUrl = product.gallery?.length > 0 ? product.gallery[0] : "/img/default-image.png";
  const price = product.price ? product.price : "N/A";
  const category = "אקססוריז/ חלקי חילוף";
  const statusBadge = product.status
      ? `<span class="paid">פעיל</span>`
      : `<span class="failed">לא פעיל</span>`;


  return `
        <tr onclick="window.location.href='/admin/products/${product._id}'" style="cursor: pointer;">
         <a href="/${product._id}"> <td>${index + 1}</td> </a>
          <td><img src="${imageUrl}" alt="${product.name}" class="img-thumbnail" width="50"></td>
          <td>${product.name}</td>
          <td>${ formatToShekel(price)}</td>
          <td>${category}</td>
          <td>${statusBadge}</td>
      </tr>
  `;
}


export function locationRowRenderer(location, index) {
  return `
      <tr onclick="window.location.href='/admin/dealers/${location._id}'" style="cursor: pointer;">
       <a href="/${location._id}"><td>${index + 1}</td> </a>
        <td>${location.name || "ללא שם"}</td>
        <td>${location.contact?.email || "אין אימייל"}</td>
        <td>${location.contact?.phone || "אין טלפון"}</td>
        <td>${location.type || "ללא סוג"}</td>
        <td>${location.address || "ללא כתובת"}</td>
    </tr>
  `;
}

export function supportRowRenderer(video, index) {
  return `
      <tr onclick="window.location.href='/admin/support/${video._id}'" style="cursor: pointer;">
       <a href="/${video._id}"><td>${index + 1}</td> </a>

      <td>
        <div style="display: flex; align-items: center; gap: 8px;">
          ${video.modelName
            ? `<img src="${video.modelImg}" alt="cover" width="40" height="40" style="object-fit: cover; border-radius: 4px;" />`
            : `<div style="width:40px; height:40px; background:#ccc; border-radius:4px;"></div>`}
          <span>${video.modelName || 'ללא כותרת'}</span>
        </div>
      </td>

        
        <td>${video.modelLogoSvg || "אין לוגו"}</td>
        <td>${video.videos.length || "0"}</td>
    </tr>
  `;
}


export function blogRowRenderer(blog, index) {
  return `
    <tr onclick="window.location.href='/admin/blog/${blog._id}'" style="cursor: pointer;">
      <td>${index + 1}</td>
      
      <td>
        <div style="display: flex; align-items: center; gap: 8px;">
      ${
            blog.coverImage
              ? optimizeImageClient(blog.coverImage, "cover")
              : `<div style="width:40px; height:40px; background:#ccc; border-radius:4px;"></div>`
          }
          <span>${blog.title || 'ללא כותרת'}</span>
        </div>
      </td>
      
      <td>${blog.isPublished ? ' פורסם' : 'טיוטה'}</td>
      
      <td>${blog.author?.fullName || blog.author?.name || 'לא ידוע'}</td>
      
      <td>${blog.category?.name || 'ללא קטגוריה'}</td>
      
      <td>${new Date(blog.updatedAt).toLocaleDateString('he-IL')}</td>
    </tr>
  `;
}


export function pageRowRenderer(page, index) {
  return `
    <tr onclick="window.location.href='/admin/pages/${page._id}'" style="cursor: pointer;">
      <td>
        <div style="display: flex; align-items: center; gap: 8px;">
          ${page.featuredImage
            ? `<img src="${page.featuredImage}" alt="cover" width="40" height="40" style="object-fit: cover; border-radius: 4px;" />`
            : `<div style="width:40px; height:40px; background:#ccc; border-radius:4px;"></div>`}
          <span>${page.title || 'ללא כותרת'}</span>
        </div>
      </td>

      <td>
        <code>${page.slug}</code>
      </td>

      <td>
        ${page.description ? page.description.slice(0, 60) + '...' : '—'}
      </td>

      <td>
        ${page.published ? '<span class="text-success">פורסם</span>' : '<span class="text-muted">טיוטה</span>'}
      </td>
    </tr>
  `;
}


export function abRowRenderer(abtest, index) {
  return `
    <tr onclick="window.location.href='/admin/abtest/${abtest._id}'" style="cursor: pointer;">
      <td>${index + 1}</td>

      <td>
        <code>${abtest.key}</code>
      </td>

      <td>
        ${abtest.variants.length || '—'}
      </td>

      <td>
        ${abtest.isActive
          ? '<span class="text-success">פעיל</span>'
          : '<span class="text-muted">כבוי</span>'}
      </td>
    </tr>
  `;
}



export function productCardRenderer(product, index, user = {}, s3path = 'https://d3kxrpm9y5cv3a.cloudfront.net') {
  const imageSrc = (product.gallery && product.gallery.length > 0)
    ? (product.gallery[0].startsWith('http') ? product.gallery[0] : `${s3path}${product.gallery[0]}`)
    : `${s3path}/optimized/no-image-2048-5e88c1b20e087fb7bbe9a3771824e743c244f437e4f8ba93bbf7b11b53f7824c_600x.webp`;

  const price = user?.role === 'dealer' ? product.price * 0.5 : product.price;

  return `
    <div class="col-6 col-md-4 mb-5">
      <a href="/products/${product.slug}" class="prd-item">
        <div class="prd">
          <header>
            <div class="cover">
              <picture>
                <source srcset="${imageSrc}" type="image/webp">
                <img src="${imageSrc}" alt="תמונה של ${product.title}">
              </picture>
            </div>
          </header>
        </div>
      </a>
      <main class="main-prd-info">         
        <h3 class="title">${product.name}</h3>
        <div class="price">${formatToShekel(price)}</div>
      </main>
    </div>
  `;
}

