


import axios from 'axios';
import { formatToShekel } from './helpers';
import updateCartCount from './cartCount';

const S3_BASE_URL = 'https://d3kxrpm9y5cv3a.cloudfront.net';

const api = axios.create({
  baseURL: '/',
  withCredentials: true,
  timeout: 10000,
});

export default class MiniCart {
  constructor() {
    this.cartButton = document.getElementById('topmenucart');
    this.cartDropdown = document.getElementById('cartMenu');
    this.checkoutBtn = document.querySelector('.cart-checkout-btn');
    this.cartData = null;

    if (!this.cartButton || !this.cartDropdown) {
      console.error('Mini cart elements not found.');
      return;
    }

    this.init();
  }

  init() {
    this.cartButton.addEventListener('click', () => this.loadMiniCart());

    this.cartDropdown.addEventListener('click', async (event) => {
      const removeButton = event.target.closest('.cart-item-remove');
      if (removeButton) {
        event.preventDefault();
        event.stopPropagation();
        await this.removeItem(removeButton.dataset.id);
      }
    });

    if (this.checkoutBtn) {
      this.checkoutBtn.addEventListener('click', (event) => {
        event.preventDefault();
        const link = this.checkoutBtn.querySelector('a');
        if (link?.href) {
          window.location.href = link.href;
        }
      });
    }
  }

  async loadMiniCart() {
    this.showLoader();
    try {
      this.cartData = await this.fetchMiniCart();
      this.renderMiniCart(this.cartData);
    } catch (error) {
      console.error('❌ Failed to load mini cart:', error);
      this.renderError();
    }
  }

  async fetchMiniCart() {
    try {
      const response = await api.get('/api/v1/carts/mini-cart');
      if (response.status === 200 && response.data.success) {
        return response.data.cart;
      }
      throw new Error('Invalid response format.');
    } catch (error) {
      console.error('❌ Error fetching mini cart:', error);
      return { items: [], totalPrice: 0 };
    }
  }

  async removeItem(itemId) {
    if (!itemId) return;

    // Optimistic UI: fade out the item immediately
    const itemEl = this.cartDropdown.querySelector(`[data-item-id="${itemId}"]`);
    if (itemEl) {
      itemEl.style.transition = 'opacity 0.25s ease, transform 0.25s ease';
      itemEl.style.opacity = '0';
      itemEl.style.transform = 'translateX(20px)';
    }

    try {
      await api.delete(`/api/v1/carts/item/${itemId}`);
      await updateCartCount();
      this.cartData = await this.fetchMiniCart();

      // Small delay so the fade-out animation completes
      setTimeout(() => this.renderMiniCart(this.cartData), 250);
    } catch (error) {
      console.error(' Failed to remove item from cart:', error);
      // Revert optimistic update
      if (itemEl) {
        itemEl.style.opacity = '1';
        itemEl.style.transform = 'translateX(0)';
      }
    }
  }

  showLoader() {
    this.cartDropdown.innerHTML = `
      <div class="mc-loader">
        <div class="mc-spinner"></div>
      </div>
    `;
    this._setCheckoutBtn(false);
  }

  renderError() {
    this.cartDropdown.innerHTML = `
      <div class="mc-empty">
        <div class="mc-empty-icon">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#c0392b" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
          </svg>
        </div>
        <p class="mc-empty-title">שגיאה בטעינת העגלה</p>
        <button class="mc-retry-btn" onclick="this.closest('.mc-empty').dispatchEvent(new Event('retry'))">נסו שוב</button>
      </div>
    `;

    this.cartDropdown.querySelector('.mc-empty')?.addEventListener('retry', () => this.loadMiniCart());
    this._setCheckoutBtn(false);
  }

  renderMiniCart(cartData) {
    if (!this.cartDropdown) return;

    if (!cartData?.items?.length) {
      this.cartDropdown.innerHTML = `
        <div class="mc-empty">
          <div class="mc-empty-icon">
            <svg width="40" height="40" viewBox="0 0 32 32" fill="none" stroke="#b0b0b0" stroke-width="1.2">
              <path d="M23.8 28h-15.6c-3.3 0-6-2.7-6-6v-.2l.6-16c.1-3.3 2.8-5.8 6-5.8h14.4c3.2 0 5.9 2.5 6 5.8l.6 16c.1 1.6-.5 3.1-1.6 4.3s-2.6 1.9-4.2 1.9c0 0-.1 0-.2 0z"/>
              <path d="M16 12c-3.9 0-7-3.1-7-7M16 12c3.9 0 7-3.1 7-7"/>
            </svg>
          </div>
          <p class="mc-empty-title">העגלה ריקה</p>
          <p class="mc-empty-sub">הוסיפו מוצרים ותתחילו לרכב</p>
      
        </div>
      `;
      this._setCheckoutBtn(false);
      return;
    }

    const itemCount = cartData.items.reduce((sum, item) => sum + item.quantity, 0);

    const cartItemsHTML = cartData.items.map((item, index) => `
      <div class="mc-item" data-item-id="${item.id}" style="animation-delay: ${index * 60}ms">
        <div class="mc-item-img">
          <img src="${S3_BASE_URL}${item.img}" alt="${item.name}" loading="lazy">
        </div>
        <div class="mc-item-info">
          <span class="mc-item-name">${item.name}</span>
          <div class="mc-item-meta">
            ${item.color ? `<span>${item.color.name}</span>` : ''}
            ${item.suspensions ? `<span>שיכוך ${item.suspensions}</span>` : ''}
            <span>כמות: ${item.quantity}</span>
          </div>
          <div class="mc-item-price">
            <span class="mc-price-current">${formatToShekel(item.price)}</span>
            ${item.compareAtPrice && item.compareAtPrice > item.price
              ? `<span class="mc-price-compare">${formatToShekel(item.compareAtPrice)}</span>`
              : ''}
          </div>
        </div>
        <button class="mc-item-remove cart-item-remove" data-id="${item.id}" aria-label="הסר מהעגלה">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>
    `).join('');

    this.cartDropdown.innerHTML = `
      <div class="mc-header">
        <span class="mc-header-title">העגלה שלך</span>
        <span class="mc-header-count">${itemCount} ${itemCount === 1 ? 'פריט' : 'פריטים'}</span>
      </div>
      <div class="mc-items">${cartItemsHTML}</div>
      <div class="mc-footer">
        <div class="mc-total">
          <span>סה״כ</span>
          <span class="mc-total-price">${formatToShekel(cartData.totalPrice)}</span>
        </div>
        <div class="mc-installments">
          <span>או ${formatToShekel(cartData.totalPrice / 36)} × 36 תשלומים</span>
        </div>
      </div>
    `;

    this._setCheckoutBtn(cartData.items.length > 0, cartData.id, cartData.totalPrice);
  }

  _setCheckoutBtn(visible, cartId = null, totalPrice = 0) {
    if (!this.checkoutBtn) return;

    if (visible && cartId) {
      const link = this.checkoutBtn.querySelector('a');
      if (link) {
        link.href = `/checkout/${cartId}`;
        link.dataset.price = totalPrice;
      }
      this.checkoutBtn.style.display = 'block';
    } else {
      this.checkoutBtn.style.display = 'none';
    }
  }
}