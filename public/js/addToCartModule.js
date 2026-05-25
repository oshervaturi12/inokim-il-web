import CartManager from './CartManager';
import { extractFormData, handleSubmitWithButtonControl } from './helpers';
import { showAlert } from './alerts';
import updateCartCount from './cartCount'
import { Modal } from "bootstrap";


export function setupPaletteSelector() {
  const container = document.getElementById('palletGrid');
  const variantInput = document.getElementById('selectedVariantId');
  const variantPalletId = document.getElementById('selectedVariantPalletId');

  if (!container) return;

  container.addEventListener('click', (event) => {
    const btn = event.target.closest('.pick-color');
    if (!btn) return;

    const variantImage = btn.getAttribute('data-variant');
    const variantId = btn.getAttribute('data-design');
    if (variantImage) {
      variantInput.value = variantImage;
    }

    if( variantId) {
      variantPalletId.value = variantId;
    }

  
    container.querySelectorAll('.pick-color').forEach((b) => b.classList.remove('active'));

    btn.classList.add('active');

      const mainImage = document.querySelector('#p-gallery');
      const imgTag = btn.querySelector('img');


      if (mainImage && imgTag) {
        mainImage.innerHTML =  `<img src="${imgTag.src}"> `;
      }

    const modalEl = document.getElementById('palletGridModal');
    if (modalEl) {
      const modalInstance = Modal.getInstance(modalEl) || new Modal(modalEl);
      modalInstance.hide();
    }
  });
}



// export function setupAddToCart() {
//   const addToCartForm = document.getElementById('addToCart');

//   if (!addToCartForm) return;

//   const cartManager = new CartManager();

//   addToCartForm.addEventListener('submit', async (event) => {
//     event.preventDefault();

//     const formData = extractFormData(addToCartForm);
//     console.log(formData)
//     const { prdId: productId, variantId, quantity, colors, palletImg} = formData;

//     if (!productId) {
//       console.warn("⚠️ Missing product ID in add-to-cart form.");
//       return;
//     }

//     // Construct the items array for the request
//     const items = [
//       {
//         variantId: variantId || productId, // If no variantId, use productId for regular products
//         quantity: parseInt(quantity) || 1,
//         colors,
//         palletImg
//       }
//     ];

//     console.log("🛒 Sending Secure Cart Data:", items);

//     await handleSubmitWithButtonControl(
//       addToCartForm,
//       'מוסיף לעגלה...',
//       'הוסף לסל',
//       async () => {
//         await cartManager.addToCart({ items });
//         console.log("✅ Secure Product Added to Cart!");
//         addToCartForm.reset()
//         showAlert('מוצר נוסף בהצלחה!', 4000, 'הוספה לסל', 'success');
//         updateCartCount()
//       }
//     );
//   });
// }


export function setupAddToCart() {
  const addToCartForm = document.getElementById('addToCart');

  if (!addToCartForm) return;

  const cartManager = new CartManager();

  addToCartForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const formData = extractFormData(addToCartForm);
    console.log(formData)
    
    const { prdId: productId, variantId, quantity, colors, palletImg, price, productName, currency } = formData;

    if (!productId) {
      console.warn("⚠️ Missing product ID in add-to-cart form.");
      return;
    }

    // Construct the items array for the request
    const items = [
      {
        variantId: variantId || productId, // If no variantId, use productId for regular products
        quantity: parseInt(quantity) || 1,
        colors,
        palletImg
      }
    ];

    console.log("🛒 Sending Secure Cart Data:", items);

    await handleSubmitWithButtonControl(
      addToCartForm,
      'מוסיף לעגלה...',
      'הוסף לסל',
      async () => {
        await cartManager.addToCart({ items });
        console.log(" Secure Product Added to Cart!");
        
        addToCartForm.reset();
        showAlert('מוצר נוסף בהצלחה!', 4000, 'הוספה לסל', 'success');
        updateCartCount();


        if (typeof fbq === 'function') {
          const itemQty = parseInt(quantity) || 1;
          const itemPrice = parseFloat(price) || 0;
          const itemCurrency = currency || 'ILS';  
          const idToTrack = variantId || productId;

          fbq('track', 'AddToCart', {
            content_ids: [idToTrack],             
            content_name: productName || '',    
            content_type: 'product',            
            value: itemPrice * itemQty,       
            currency: itemCurrency,           
            num_items: itemQty                   
          });
          
          console.log(`📈 Meta Pixel AddToCart fired for ID: ${idToTrack}`);
        }
      }
    );
  });
}


export default function setup() {
  setupAddToCart();

  if (document.getElementById('palletSelection')) {
    setupPaletteSelector();
  }
}