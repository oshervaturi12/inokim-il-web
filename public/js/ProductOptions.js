


import CartManager from './CartManager';
import { formatToShekel } from './helpers';

export default class ProductOptions {
  constructor() {
    this.cartManager = new CartManager();
    this.selectedVariant = null;
    this.selectedSuspension = null;
    this.availability = null;
    this.selectedColor = null;
    this.selectedPrice = 0;
    this.selectedProductId = null;
    this.selectedUpsells = [];
    this.colorTitleElement = document.getElementById('color-title');
    this.suspensionTitleElement = document.getElementById('messageSus');
    this.splideInstance = null; // Track Splide instance
    this.isAddingToCart = false; // Prevent double-clicks

    this.init();
  }

  init() {
    const container = document.getElementById('product-options-container');
    if (!container) {
      console.error("Missing product options container!");
      return;
    }

    container.addEventListener('click', (event) => {
      let element = event.target;
      let closestMatch = null;

      const actions = {
        '.item-model': this.handleModelSelection.bind(this),
        '.color-item': this.handleColorSelection.bind(this),
        '.item-upsale': this.handleUpsellSelection.bind(this),
        '#addToCart': this.handleAddToCart.bind(this),
        '.btn-add-to-cart': this.handleStickyButtonClick.bind(this),
      };

      for (const selector in actions) {
        if (element.closest(selector)) {
          closestMatch = selector;
          element = element.closest(selector);
          break;
        }
      }

      if (closestMatch) {
        actions[closestMatch](element);
      }
    });

    const suspContainer = document.getElementById('suspension-options');
    if (suspContainer) {
      suspContainer.addEventListener('click', (event) => {
        const btn = event.target.closest('.suspension-btn');
        if (!btn) return;
        this.handleSuspensionSelection(btn);
      });
    }

    this.initSplide();
    this.autoSelectFirstVariant();
    this.initStickyButtonVisibility();
  }

  // ──────────────────────────────────────────────
  // FIX #1: Proper Splide initialization & updates
  // ──────────────────────────────────────────────
  initSplide() {
    const splideEl = document.querySelector('#p-gallery .splide');
    if (!splideEl || typeof Splide === 'undefined') return;

    // Destroy existing instance if re-initializing
    if (this.splideInstance) {
      try { this.splideInstance.destroy(); } catch (e) { /* already destroyed */ }
      this.splideInstance = null;
    }

    this.splideInstance = new Splide(splideEl, {
      direction: 'rtl',
      pagination: true,
      arrows: true,
      type: 'slide',
      perPage: 1,
    }).mount();
  }

  // ──────────────────────────────────────────────
  // Update only the FIRST slide with the color image, keep rest of gallery
  // ──────────────────────────────────────────────
  updateGalleryImages() {
    if (!this.selectedColor?.image) return;

    const imageUrl = `https://d3kxrpm9y5cv3a.cloudfront.net${this.selectedColor.image}`;
    const gallery = document.getElementById('p-gallery');
    if (!gallery) return;

    // Target the first REAL slide (not clones) — Splide clones have .splide__slide--clone
    const firstRealSlide = gallery.querySelector('.splide__slide:not(.splide__slide--clone) img');
    if (firstRealSlide) {
      firstRealSlide.src = imageUrl;
      firstRealSlide.alt = this.selectedColor.name || 'Product Image';
    }

    // Also update any clones of the first slide so swiping back shows the right image
    const allFirstClones = gallery.querySelectorAll('.splide__slide--clone img');
    allFirstClones.forEach(img => {
      img.src = imageUrl;
      img.alt = this.selectedColor.name || 'Product Image';
    });

    if (this.splideInstance) {
      this.splideInstance.go(0);
    }
  }

  autoSelectFirstVariant() {
    const variantElements = document.querySelectorAll('.item-model');
    let hasAvailableVariant = false;

    const urlParams = new URLSearchParams(window.location.search);
    const urlProductId = urlParams.get('product_id');

    for (const element of variantElements) {
      const colors = JSON.parse(decodeURIComponent(element.dataset.colors || '[]'));
      const hasInventory = colors.some(color => color.inventoryQty > 0);
      const isUrlMatch = urlProductId && (
        element.dataset.id === urlProductId || colors.some(c => c._id === urlProductId)
      );

      if (hasInventory && (!hasAvailableVariant || isUrlMatch)) {
        // Pass `isAutoSelect = true` to suppress pixel fires on page load
        this.handleModelSelection(element, true);
        element.classList.add('active');
        hasAvailableVariant = true;

        if (isUrlMatch) break;
      }
    }

    if (!hasAvailableVariant) {
      const cartSummary = document.getElementById("cartSummary");
      const stickyButton = document.querySelector(".sticky-bottom");

      this.disableAddToCart("המלאי לא זמין כרגע");
      this.showOutOfStockMessage();

      if (cartSummary) cartSummary.style.display = "none";
      // FIX #7: Also hide sticky button when everything is out of stock
      if (stickyButton) {
        stickyButton.style.display = "none";
      }
    }
  }

  handleSuspensionSelection(btn) {
    document.querySelectorAll('.suspension-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    this.selectedSuspension = btn.dataset.suspension;
    if (this.suspensionTitleElement) {
      this.suspensionTitleElement.textContent = `*שיכוך ${this.selectedSuspension} כלול במחיר`;
    }

    this.updateTotalPrice();
  }

  showOutOfStockMessage() {
    const container = document.getElementById('product-options-container');
    if (!container.querySelector('.out-of-stock-message')) {
      const message = document.createElement('p');
      message.className = 'text-danger text-center mt-3 fw-bold out-of-stock-message';
      message.innerText = 'המוצר אזל מהמלאי';
      container.appendChild(message);
    }
  }

  // ──────────────────────────────────────────────
  // FIX #2: Added `isAutoSelect` param to suppress pixel on page load
  // FIX #3: Consistent price tracking
  // ──────────────────────────────────────────────
  handleModelSelection(element, isAutoSelect = false) {
    if (!element) return;

    document.querySelectorAll('.item-model').forEach(el => el.classList.remove('active'));
    element.classList.add('active');

    this.selectedVariant = element.dataset.submodel;
    this.sku = element.dataset.sku || null;
    this.availability = element.dataset.availability;
    this.selectedProductId = element.dataset.id;
    this.selectedUpsells = [];

    document.querySelectorAll('.item-upsale').forEach(el => el.classList.remove('active'));

    // renderColorOptions auto-selects first color, which sets this.selectedColor
    this.renderColorOptions(element.dataset.colors, isAutoSelect);

    // Color auto-selection updates the gallery
    this.updateGalleryImages();

    this.updateTotalPrice();

    // Only fire pixel & update URL on real user clicks
    if (!isAutoSelect) {
      this.updateURLParams(this.selectedProductId);
      this.fireViewContentPixel();
    }
  }

  // ──────────────────────────────────────────────
  // FIX #2: Separated URL update from pixel firing
  // ──────────────────────────────────────────────
  updateURLParams(productId) {
    if (!productId) return;

    const url = new URL(window.location);
    url.searchParams.set('product_id', productId);
    window.history.replaceState({}, '', url);
  }

  fireViewContentPixel() {
    if (typeof fbq !== 'function') return;

    const productName = `${this.selectedVariant || 'מוצר'} ${this.selectedColor ? this.selectedColor.name : ''}`.trim();
    const currentId = this.sku || this.selectedColor?.id || this.selectedProductId;

    fbq('track', 'ViewContent', {
      content_ids: [currentId],
      content_type: 'product',
      content_name: productName,
      value: this.selectedPrice || 0,
      currency: 'ILS'
    });
  }

  // ──────────────────────────────────────────────
  // FIX #2: renderColorOptions no longer fires pixel or updates URL
  // ──────────────────────────────────────────────
  renderColorOptions(colorsData, isAutoSelect = false) {
    const colorContainer = document.getElementById('color-options');
    if (!colorContainer) return;

    let colors = JSON.parse(decodeURIComponent(colorsData || '[]'));
    colors = colors.filter(color => color.inventoryQty > 0);

    const urlParams = new URLSearchParams(window.location.search);
    const urlProductId = urlParams.get('product_id');

    let targetColorIndex = colors.findIndex(c => c._id === urlProductId);
    if (targetColorIndex === -1) targetColorIndex = 0;

    // FIX #8: Color circles with proper border, hover, and checkmark
    colorContainer.innerHTML = colors.length
      ? colors.map(
          (color, index) => `
            <div class="color-item ${index === targetColorIndex ? 'selected' : ''}"
                 style="background-color: ${color.hex};"
                 data-id="${color._id}"
                 data-name="${color.name}"
                 data-hex="${color.hex}"
                 data-image="${color.image}"
                 data-inventory="${color.inventoryQty}"
                 data-price="${color.price}"
                 data-compare-at-price="${color.compareAtPrice || color.price}"
                 title="${color.name}">
              <span class="color-check"></span>
            </div>`
        ).join('')
      : '<p class="text-muted">אין מלאי זמין כרגע</p>';

    const firstAvailableColor = colors[targetColorIndex];
    if (firstAvailableColor) {
      this.selectedColor = {
        id: firstAvailableColor._id,
        ...firstAvailableColor,
        price: firstAvailableColor.price,
        compareAtPrice: firstAvailableColor.compareAtPrice || null
      };
      this.selectedPrice = this.selectedColor.price;
      if (this.colorTitleElement) {
        this.colorTitleElement.textContent = this.selectedColor.name;
      }
      // Don't fire pixel or update URL here — let the caller decide
    } else {
      this.selectedColor = null;
      this.disableAddToCart("המלאי לא זמין כרגע");
    }
  }

  handleColorSelection(colorItem) {
    if (!colorItem) return;

    const inventoryQty = parseInt(colorItem.dataset.inventory, 10);
    if (inventoryQty <= 0) {
      this.disableAddToCart("המלאי לא זמין כרגע");
      return;
    }

    document.querySelectorAll('.color-item').forEach(c => c.classList.remove('selected'));
    colorItem.classList.add('selected');

    this.selectedColor = {
      id: colorItem.dataset.id || null,
      name: colorItem.dataset.name || 'Unknown Color',
      hex: colorItem.dataset.hex || '#000000',
      image: colorItem.dataset.image,
      inventoryQty,
      price: parseFloat(colorItem.dataset.price) || this.selectedPrice,
      compareAtPrice: parseFloat(colorItem.dataset.compareAtPrice) || null
    };

    this.selectedPrice = this.selectedColor.price;

    if (this.colorTitleElement) {
      this.colorTitleElement.textContent = this.selectedColor.name;
    }

    this.updateGalleryImages();
    this.enableAddToCart();
    this.updateTotalPrice();

    // Update URL and fire pixel on explicit user color selection
    if (this.selectedColor.id) {
      this.updateURLParams(this.selectedColor.id);
      this.fireViewContentPixel();
    }
  }

  disableAddToCart(message) {
    const addToCartButton = document.getElementById('addToCart');
    const stickyButton = document.querySelector('.btn-add-to-cart');
    const priceSection = document.querySelector('.sticky-bottom .price-section');

    if (addToCartButton) addToCartButton.disabled = true;
    if (stickyButton) stickyButton.disabled = true;

    if (priceSection) {
      priceSection.innerHTML = `<span class="text-danger fw-bold">${message}</span>`;
    }
  }

  enableAddToCart() {
    const addToCartButton = document.getElementById('addToCart');
    const stickyButton = document.querySelector('.btn-add-to-cart');
    const priceSection = document.querySelector('.sticky-bottom .price-section');

    if (addToCartButton) addToCartButton.disabled = false;
    if (stickyButton) stickyButton.disabled = false;

    if (priceSection) {
      priceSection.innerHTML = `<span class="price-amount"></span>`;
    }
  }

  // ──────────────────────────────────────────────
  // FIX #5 & #6: Unified loading state on both buttons
  // ──────────────────────────────────────────────
  setCartLoadingState(isLoading) {
    const addToCartButton = document.getElementById('addToCart');
    const stickyButton = document.querySelector('.btn-add-to-cart');

    if (isLoading) {
      if (addToCartButton) {
        addToCartButton.disabled = true;
        addToCartButton.dataset.originalText = addToCartButton.innerText;
        addToCartButton.innerText = 'מעבר לתשלום...';
      }
      if (stickyButton) {
        stickyButton.disabled = true;
        stickyButton.dataset.originalText = stickyButton.innerText;
        stickyButton.innerText = 'מעבר לתשלום...';
      }
    } else {
      if (addToCartButton) {
        addToCartButton.disabled = false;
        addToCartButton.innerText = addToCartButton.dataset.originalText || 'מעבר לתשלום';
      }
      if (stickyButton) {
        stickyButton.disabled = false;
        stickyButton.innerText = stickyButton.dataset.originalText || 'הזמינו עכשיו';
      }
    }
  }

  // ──────────────────────────────────────────────
  // FIX #6: Sticky button now triggers actual checkout (not just scroll)
  // ──────────────────────────────────────────────
  handleStickyButtonClick() {
    // Scroll to summary so user sees what they're buying
    const cartSummary = document.getElementById('cartSummary');
    if (cartSummary) {
      cartSummary.scrollIntoView({ behavior: 'smooth' });
    }

    // Then actually add to cart
    this.handleAddToCart();
  }

  handleUpsellSelection(upsellElement) {
    if (!upsellElement) return;

    const upsellId = upsellElement.dataset.upsellid;
    const upsellPrice = parseFloat(upsellElement.dataset.price) || 0;
    const upsellName = upsellElement.dataset.name;

    if (!upsellId) {
      console.warn("⚠️ Missing Upsell ID.");
      return;
    }

    const existingIndex = this.selectedUpsells.findIndex(
      (upsell) => upsell.variantId === upsellId
    );

    if (existingIndex !== -1) {
      this.selectedUpsells.splice(existingIndex, 1);
      upsellElement.classList.remove("active");
    } else {
      this.selectedUpsells.push({
        variantId: upsellId,
        quantity: 1,
        isUpsell: true,
        price: upsellPrice,
        upsellName
      });
      upsellElement.classList.add("active");
    }

    this.updateTotalPrice();
  }

  updateTotalPrice() {
    const priceElement = document.querySelector('.price-amount');
    const totalPriceElement = document.querySelector('.summary li:first-child span:last-child');
    const installmentPriceElement = document.querySelector('.summary li:last-child span:last-child');
    const etaElement = document.getElementById("eta");
    const summaryList = document.getElementById('upsellList');

    let totalPrice = this.selectedPrice;
    this.selectedUpsells.forEach(upsell => totalPrice += upsell.price);

    if (etaElement) etaElement.innerHTML = `מועד אספקה: ${this.availability}`;

    if (priceElement) priceElement.innerHTML = `${formatToShekel(totalPrice / 36)} / חודש`;
    if (totalPriceElement) totalPriceElement.innerText = formatToShekel(totalPrice);

    if (installmentPriceElement) {
      const installmentPrice = totalPrice / 36;
      installmentPriceElement.innerHTML = `${formatToShekel(installmentPrice)}/ חודש`;
    }

    // FIX #3: Update the active model's displayed price from selectedColor (not stale DOM data)
    const activeModelPriceWrapper = document.querySelector('.item-model.active span:last-child');
    if (activeModelPriceWrapper && this.selectedColor) {
      const price = this.selectedColor.price;
      const compareAt = this.selectedColor.compareAtPrice;

      if (compareAt && compareAt > price) {
        activeModelPriceWrapper.innerHTML = `
          <strike class="me-2">${formatToShekel(compareAt)}</strike>
          <span class="text-success fw-bold">${formatToShekel(price)}</span>
        `;
      } else {
        activeModelPriceWrapper.innerHTML = `
          <span>${formatToShekel(price)}</span>
        `;
      }
    }

    if (this.selectedColor?.image) {
      const imageUrl = `https://d3kxrpm9y5cv3a.cloudfront.net${this.selectedColor.image}`;
      document.querySelectorAll('.product-mobile-img').forEach(container => {
        let img = container.querySelector('img');
        if (!img) {
          img = document.createElement('img');
          img.alt = this.selectedColor.name || 'Product Image';
          container.appendChild(img);
        }
        img.src = imageUrl;
      });
    }

    if (summaryList) {
      summaryList.innerHTML = '';
      if (this.selectedUpsells.length > 0) {
        const heading = document.createElement('h5');
        heading.textContent = 'תוספות';
        heading.classList.add('mt-3');
        summaryList.appendChild(heading);

        this.selectedUpsells.forEach(upsell => {
          const li = document.createElement('li');
          li.className = 'upsell-item d-flex justify-content-between';
          li.innerHTML = `
            <span>${upsell.upsellName}</span>
            <span>${formatToShekel(upsell.price)}</span>
          `;
          summaryList.appendChild(li);
        });
      }
    }
  }

  // ──────────────────────────────────────────────
  // FIX #4: Guard against missing cart ID with user-facing error
  // FIX #5: Unified loading state, prevent double-clicks
  // ──────────────────────────────────────────────
  async handleAddToCart() {
    if (this.isAddingToCart) return; // Prevent double-clicks
    if (!this.selectedProductId) {
      console.warn('⚠️ Please select a product before adding to cart.');
      return;
    }

    this.isAddingToCart = true;
    this.setCartLoadingState(true);

    const cartItems = [{
      variantId: this.selectedProductId,
      suspensions: this.selectedSuspension || "רך",
      quantity: 1,
      ...(this.selectedColor?.id && { colorId: this.selectedColor.id })
    }];

    if (this.selectedUpsells.length > 0) {
      cartItems.push(...this.selectedUpsells);
    }

    // Fire AddToCart pixel once, here (the only place that actually adds to cart)
    this.fireAddToCartPixel();

    try {
      const data = await this.cartManager.addToCart({ items: cartItems });
      const cartId = window.cartToken || data?.cart?._id;

      if (cartId) {
        window.location.href = `/checkout/${cartId}`;
      } else {
        // FIX #4: Show error instead of silent reload
        this.showCartError('אירעה שגיאה ביצירת העגלה. נסה שוב.');
        console.error('No cart ID returned:', data);
      }
    } catch (error) {
      console.error('Error adding product to cart:', error);
      this.showCartError('אירעה שגיאה. בדוק את החיבור ונסה שוב.');
    } finally {
      this.isAddingToCart = false;
      this.setCartLoadingState(false);
    }
  }

  fireAddToCartPixel() {
    if (typeof fbq !== 'function') return;

    const productName = `${this.selectedVariant || 'מוצר'} ${this.selectedColor ? this.selectedColor.name : ''}`.trim();
    const currentId = this.sku || this.selectedColor?.id || this.selectedProductId;

    fbq('track', 'AddToCart', {
      content_ids: [currentId],
      content_type: 'product',
      content_name: productName,
      value: this.selectedPrice || 0,
      currency: 'ILS'
    });
  }

  showCartError(message) {
    const cartSummary = document.getElementById('cartSummary');
    if (!cartSummary) return;

    // Remove previous error if any
    const existing = cartSummary.querySelector('.cart-error-message');
    if (existing) existing.remove();

    const errorEl = document.createElement('p');
    errorEl.className = 'text-danger text-center fw-bold mt-2 cart-error-message';
    errorEl.textContent = message;
    cartSummary.appendChild(errorEl);

    // Auto-remove after 5 seconds
    setTimeout(() => errorEl.remove(), 5000);
  }

  initStickyButtonVisibility() {
    const cartSummary = document.getElementById("cartSummary");
    const stickyButton = document.querySelector(".sticky-bottom");

    if (!cartSummary || !stickyButton) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          stickyButton.style.opacity = entry.isIntersecting ? "0" : "1";
          stickyButton.style.pointerEvents = entry.isIntersecting ? "none" : "auto";
        });
      },
      { threshold: 0.3 }
    );

    observer.observe(cartSummary);
  }
}